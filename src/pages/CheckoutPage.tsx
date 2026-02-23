import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useCart } from '@/context/CartContext';
import { useInventory, Order } from '@/context/InventoryContext';
import { ArrowLeft, ShoppingBag, CreditCard, Truck, CheckCircle, Loader2, Package, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import mockPaymentService from '@/services/mockPayment';
import { Button } from '@/components/ui/button';
import PacketaWidget from '@/components/PacketaWidget';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

// ---- Email Helper — calls our Vercel serverless function (avoids CORS) ----
const sendOrderConfirmationEmail = async (
    to: string,
    orderNumber: string,
    customerName: string,
    items: { name: string; quantity: number; price: number }[],
    total: number
) => {
    try {
        await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ to, orderNumber, customerName, items, total })
        });
    } catch (e) {
        console.warn('Email send failed (non-critical):', e);
    }
};

const CheckoutPage = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { addOrder, decrementStock, getStock } = useInventory();
    const { user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState<any>(null);

    // Billing Address State
    const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '+420 ',
        street: '',
        city: '',
        zip: '',
        // Billing fields
        isCompany: false,
        companyName: '',
        ico: '',
        dic: '',
        billingStreet: '',
        billingCity: '',
        billingZip: '',

        deliveryMethod: 'card',
        packetaPointId: '',
        paymentMethod: 'card',
        subMethod: '',
        createAccount: false,
        password: ''
    });

    // Pre-fill data from profile
    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (!error && data) {
                // Parse full name
                const names = (data.full_name || '').split(' ');
                const firstName = names[0] || '';
                const lastName = names.slice(1).join(' ') || '';

                const addr = data.address || {};
                const delivery = addr.delivery || {};
                const billing = addr.billing || {};

                setFormData(prev => ({
                    ...prev,
                    firstName: firstName,
                    lastName: lastName,
                    email: data.email || prev.email,
                    phone: delivery.phone || prev.phone,
                    street: delivery.street || '',
                    city: delivery.city || '',
                    zip: delivery.zip || '',

                    isCompany: billing.isCompany === true,
                    companyName: billing.company || '',
                    ico: billing.ico || '',
                    dic: billing.dic || '',
                    billingStreet: billing.street || '',
                    billingCity: billing.city || '',
                    billingZip: billing.zip || ''
                }));

                if (billing.isSame !== undefined) {
                    setBillingSameAsDelivery(billing.isSame);
                }
            }
        };

        fetchProfile();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Calculate total required ingredients
        const requiredStock: Record<string, number> = { lemon: 0, red: 0, silky: 0 };

        cart.forEach(item => {
            if (item.flavorMode === 'mix' && item.mixConfiguration) {
                // For Mix: Multiply the mix config by the number of packs (quantity)
                requiredStock.lemon = (requiredStock.lemon || 0) + (item.mixConfiguration.lemon || 0) * item.quantity;
                requiredStock.red = (requiredStock.red || 0) + (item.mixConfiguration.red || 0) * item.quantity;
                requiredStock.silky = (requiredStock.silky || 0) + (item.mixConfiguration.silky || 0) * item.quantity;
            } else if (item.flavor) {
                // For Single Flavor: Use specific PACK SKU (e.g. lemon-21)
                const flavorKey = item.flavor.toLowerCase().includes('lemon') ? 'lemon'
                    : item.flavor.toLowerCase().includes('red') ? 'red'
                        : item.flavor.toLowerCase().includes('silky') ? 'silky' : null;

                if (flavorKey) {
                    const sku = `${flavorKey}-${item.pack}`;
                    requiredStock[sku] = (requiredStock[sku] || 0) + item.quantity;
                }
            }
        });

        // 1. Stock Check
        for (const [sku, amount] of Object.entries(requiredStock)) {
            if (amount > 0 && getStock(sku) < amount) {
                toast({
                    title: "Chyba objednávky",
                    description: `Nedostatek skladových zásob pro položku ${sku.toUpperCase()}. Chybí ${(amount - getStock(sku))} ks.`,
                    variant: "destructive"
                });
                return;
            }
        }

        setIsProcessing(true);
        let currentUser = user;

        try {
            // 2. Optional Account Creation
            if (formData.createAccount && !user) {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password as string,
                    options: {
                        data: {
                            full_name: `${formData.firstName} ${formData.lastName}`,
                            account_type: formData.isCompany ? 'company' : 'personal',
                        },
                    },
                });

                if (authError) throw authError;

                if (authData.user) {
                    currentUser = authData.user;
                    // Create profile record
                    const profileData = {
                        id: authData.user.id,
                        email: formData.email,
                        full_name: `${formData.firstName} ${formData.lastName}`,
                        account_type: formData.isCompany ? 'company' : 'personal',
                        address: {
                            delivery: {
                                phone: formData.phone,
                                street: formData.street,
                                city: formData.city,
                                zip: formData.zip,
                            },
                        }
                    };

                    await supabase.from("profiles").upsert(profileData);

                    toast({
                        title: "Účet vytvořen",
                        description: "Váš účet byl úspěšně vytvořen a objednávka pokračuje.",
                    });
                }
            }

            const orderNumber = `ORD-${Date.now()}`;

            // 2. Decrement Stock
            Object.entries(requiredStock).forEach(([flavor, amount]) => {
                if (amount > 0) decrementStock(flavor, amount);
            });

            // 3. Create Order Record
            const newOrder: Order = {
                id: orderNumber,
                date: new Date().toISOString(),
                customer: {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                },
                delivery_info: {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: formData.phone,
                    street: formData.street,
                    city: formData.city,
                    zip: formData.zip,
                    // Add Billing Info to delivery_info or separate field? 
                    // The DB schema has delivery_info JSONB. I'll add billing fields there.
                    billingSameAsDelivery: billingSameAsDelivery,
                    isCompany: formData.isCompany,
                    companyName: formData.companyName,
                    ico: formData.ico,
                    dic: formData.dic,
                    billingStreet: billingSameAsDelivery ? formData.street : formData.billingStreet,
                    billingCity: billingSameAsDelivery ? formData.city : formData.billingCity,
                    billingZip: billingSameAsDelivery ? formData.zip : formData.billingZip,

                    deliveryMethod: formData.deliveryMethod,
                    paymentMethod: formData.paymentMethod,
                    packetaPointId: formData.packetaPointId,
                },
                items: cart.map(item => ({
                    // Keep detailed info for record
                    sku: item.flavorMode === 'mix' ? `mix-${item.pack}` : `${item.flavor}-${item.pack}`,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                })),
                total: cartTotal + (formData.deliveryMethod === 'zasilkovna' ? 79 : 0),
                status: 'paid', // Initial status, maybe should be pending if payment fails/is transfer
                is_subscription_order: cart.some(item => !!item.subscriptionInterval)
            };

            // Adjust initial status based on payment method
            if (formData.paymentMethod === 'transfer_fast' || formData.paymentMethod === 'transfer_manual') {
                newOrder.status = 'pending';
            }

            // 3.5 Create Packeta Shipment if applicable
            if (formData.deliveryMethod === 'zasilkovna' && formData.packetaPointId) {
                try {
                    const packetaRes = await fetch('/api/create-packeta-packet', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            orderNumber,
                            firstName: formData.firstName,
                            lastName: formData.lastName,
                            email: formData.email,
                            phone: formData.phone,
                            packetaPointId: formData.packetaPointId,
                            total: newOrder.total
                        })
                    });

                    const packetaData = await packetaRes.json();
                    if (packetaRes.ok && packetaData.barcode) {
                        newOrder.packeta_barcode = packetaData.barcode;
                        newOrder.packeta_packet_id = packetaData.packetId;
                    } else {
                        console.error('Packeta creation failed:', packetaData.error);
                    }
                } catch (e) {
                    console.error('Packeta API call failed:', e);
                }
            }

            const orderSaved = await addOrder(newOrder);

            if (!orderSaved) {
                toast({
                    title: "Chyba",
                    description: "Nepodařilo se uložit objednávku. Zkuste to prosím znovu.",
                    variant: "destructive"
                });
                setIsProcessing(false);
                return;
            }

            const paymentResult = await mockPaymentService.createPayment({
                orderNumber: orderNumber,
                total: cartTotal,
                items: cart,
                customer: formData
            });

            if (paymentResult.success) {
                // Create subscription records if any
                const subscriptionItems = cart.filter(item => !!item.subscriptionInterval);
                if (subscriptionItems.length > 0 && currentUser) {
                    const subsToInsert = subscriptionItems.map(item => ({
                        user_id: currentUser.id,
                        status: 'active',
                        interval: item.subscriptionInterval,
                        product_handle: item.flavorMode === 'mix' ? 'mix-pack' : `${item.flavor}-pack`,
                        quantity: item.quantity,
                        next_delivery_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                    }));

                    await supabase.from('subscriptions').insert(subsToInsert);
                }

                clearCart();
                const totalWithShipping = cartTotal + (formData.deliveryMethod === 'zasilkovna' ? 79 : 0);
                const isBankTransfer = formData.paymentMethod === 'transfer_fast' || formData.paymentMethod === 'transfer_manual';

                // Send order confirmation email (non-blocking)
                sendOrderConfirmationEmail(
                    formData.email,
                    orderNumber,
                    `${formData.firstName} ${formData.lastName}`,
                    newOrder.items,
                    totalWithShipping
                );

                navigate(`/payment/success?paymentId=${paymentResult.paymentId}&orderNumber=${orderNumber}&amount=${totalWithShipping}${isBankTransfer ? '&status=pending' : ''}`);
            } else {
                navigate(`/payment/error?message=${encodeURIComponent(paymentResult.message)}`);
            }
        } catch (error) {
            console.error('Payment error:', error);
            navigate('/payment/error?message=Technická%20chyba%20při%20zpracování%20platby');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            const filteredValue = value.replace(/[^\d+\s]/g, '');
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-secondary/30 py-6 sm:py-12">
            <div className="container mx-auto px-4">
                <div className="mb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-primary hover:text-primary transition-colors font-bold mb-6"
                    >
                        <ArrowLeft size={20} />
                        Zpět k výběru
                    </button>
                    <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground">
                        DOKONČENÍ <span className="text-gradient-energy italic">NÁKUPU</span>
                    </h1>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 lg:gap-12">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2 space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Personal Info */}
                            <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border shadow-sm">
                                <div className="flex flex-wrap justify-between items-start gap-2 mb-6 sm:mb-8">
                                    <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                                        <Truck className="w-6 h-6 text-primary" />
                                        Doprava a kontakt
                                    </h2>

                                    <div className="flex bg-secondary/30 p-1 rounded-2xl border border-border/50">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isCompany: false }))}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${!formData.isCompany ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            Fyzická osoba
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isCompany: true }))}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.isCompany ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                                        >
                                            Firma
                                        </button>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                    {formData.isCompany && (
                                        <div className="sm:col-span-2 space-y-4 animate-in fade-in slide-in-from-top-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-muted-foreground ml-1 text-primary">NÁZEV FIRMY *</label>
                                                <input
                                                    name="companyName"
                                                    value={formData.companyName}
                                                    onChange={handleChange}
                                                    required={formData.isCompany}
                                                    placeholder="Např. BoostUp s.r.o."
                                                    className="w-full bg-background border-2 border-primary/30 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <label htmlFor="ico" className="text-sm font-bold text-muted-foreground ml-1">IČO *</label>
                                                    <input
                                                        id="ico"
                                                        name="ico"
                                                        value={formData.ico}
                                                        onChange={handleChange}
                                                        required={formData.isCompany}
                                                        placeholder="12345678"
                                                        className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="dic" className="text-sm font-bold text-muted-foreground ml-1">DIČ</label>
                                                    <input
                                                        id="dic"
                                                        name="dic"
                                                        value={formData.dic}
                                                        onChange={handleChange}
                                                        placeholder="CZ..."
                                                        className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label htmlFor="firstName" className="text-sm font-bold text-muted-foreground ml-1 uppercase">Jméno *</label>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Jan"
                                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="lastName" className="text-sm font-bold text-muted-foreground ml-1 uppercase">Příjmení *</label>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Novák"
                                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-sm font-bold text-muted-foreground ml-1">EMAIL *</label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="jan.novak@email.cz"
                                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="text-sm font-bold text-muted-foreground ml-1">TELEFON *</label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="+420 000 000 000"
                                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                        />
                                        <p className="text-[10px] text-muted-foreground italic ml-1">Včetně předvolby (např. +420)</p>
                                    </div>
                                    <div className="sm:col-span-2 space-y-2">
                                        <label htmlFor="street" className="text-sm font-bold text-muted-foreground ml-1 uppercase">Ulice a číslo popisné *</label>
                                        <input
                                            id="street"
                                            name="street"
                                            value={formData.street}
                                            onChange={handleChange}
                                            required
                                            placeholder="Lidická 123"
                                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="city" className="text-sm font-bold text-muted-foreground ml-1 uppercase">Město *</label>
                                        <input
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            placeholder="Brno"
                                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="zip" className="text-sm font-bold text-muted-foreground ml-1">PSČ *</label>
                                        <input
                                            id="zip"
                                            name="zip"
                                            value={formData.zip}
                                            onChange={handleChange}
                                            required
                                            placeholder="602 00"
                                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                        />
                                    </div>

                                    {!user && (
                                        <div className="sm:col-span-2 space-y-4 pt-4 border-t border-border/50">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="createAccount"
                                                    checked={formData.createAccount}
                                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, createAccount: checked as boolean }))}
                                                />
                                                <Label htmlFor="createAccount" className="font-bold cursor-pointer text-sm">Chci si vytvořit účet pro příští nákupy</Label>
                                            </div>

                                            {formData.createAccount && (
                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                    <label htmlFor="password" className="text-sm font-bold text-muted-foreground ml-1">HESLO *</label>
                                                    <input
                                                        id="password"
                                                        type="password"
                                                        name="password"
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        required={formData.createAccount}
                                                        placeholder="Minimálně 6 znaků"
                                                        className="w-full bg-background border-2 border-primary/30 rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Billing Address Section */}
                            <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border shadow-sm">
                                <div className="flex flex-wrap justify-between items-start gap-2 mb-4 sm:mb-6">
                                    <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                                        <FileText className="w-6 h-6 text-primary" />
                                        Fakturační údaje
                                    </h2>

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="billingSame"
                                            checked={billingSameAsDelivery}
                                            onCheckedChange={(checked) => setBillingSameAsDelivery(checked as boolean)}
                                        />
                                        <Label htmlFor="billingSame" className="font-bold cursor-pointer">Stejné jako doručovací</Label>
                                    </div>
                                </div>

                                {!billingSameAsDelivery && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                            {/* Company Fields */}
                                            {formData.isCompany && (
                                                <>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label htmlFor="billingCompanyName" className="text-sm font-bold text-muted-foreground ml-1">NÁZEV FIRMY</label>
                                                        <input
                                                            id="billingCompanyName"
                                                            name="companyName"
                                                            value={formData.companyName}
                                                            onChange={handleChange}
                                                            placeholder="Název firmy"
                                                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label htmlFor="billingDic" className="text-sm font-bold text-muted-foreground ml-1">DIČ (VOLITELNÉ)</label>
                                                        <input
                                                            id="billingDic"
                                                            name="dic"
                                                            value={formData.dic}
                                                            onChange={handleChange}
                                                            placeholder="CZ..."
                                                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* Personal Fields (ICO option) */}
                                            {!formData.isCompany && (
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm font-bold text-muted-foreground ml-1">IČO (VOLITELNÉ)</label>
                                                    <input
                                                        name="ico"
                                                        value={formData.ico}
                                                        onChange={handleChange}
                                                        placeholder="Pro podnikající fyzické osoby"
                                                        className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                    />
                                                </div>
                                            )}

                                            <div className="sm:col-span-2 space-y-2 pt-2 border-t">
                                                <label htmlFor="billingStreet" className="text-sm font-bold text-muted-foreground ml-1">ULICE A ČÍSLO POPISNÉ (FAKTURAČNÍ)</label>
                                                <input
                                                    id="billingStreet"
                                                    name="billingStreet"
                                                    value={formData.billingStreet}
                                                    onChange={handleChange}
                                                    required={!billingSameAsDelivery}
                                                    placeholder="Lidická 123"
                                                    className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="billingCity" className="text-sm font-bold text-muted-foreground ml-1">MĚSTO (FAKTURAČNÍ)</label>
                                                <input
                                                    id="billingCity"
                                                    name="billingCity"
                                                    value={formData.billingCity}
                                                    onChange={handleChange}
                                                    required={!billingSameAsDelivery}
                                                    placeholder="Brno"
                                                    className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="billingZip" className="text-sm font-bold text-muted-foreground ml-1">PSČ (FAKTURAČNÍ)</label>
                                                <input
                                                    id="billingZip"
                                                    name="billingZip"
                                                    value={formData.billingZip}
                                                    onChange={handleChange}
                                                    required={!billingSameAsDelivery}
                                                    placeholder="602 00"
                                                    className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {billingSameAsDelivery && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                                            {/* Company Fields */}
                                            {formData.isCompany && (
                                                <>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label htmlFor="billingCompanyName2" className="text-sm font-bold text-muted-foreground ml-1">NÁZEV FIRMY</label>
                                                        <input
                                                            id="billingCompanyName2"
                                                            name="companyName"
                                                            value={formData.companyName}
                                                            onChange={handleChange}
                                                            placeholder="Např. BoostUp s.r.o."
                                                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                        />
                                                    </div>
                                                    <div className="space-y-2 md:col-span-2">
                                                        <label htmlFor="billingDic2" className="text-sm font-bold text-muted-foreground ml-1">DIČ (VOLITELNÉ)</label>
                                                        <input
                                                            id="billingDic2"
                                                            name="dic"
                                                            value={formData.dic}
                                                            onChange={handleChange}
                                                            placeholder="CZ..."
                                                            className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                        />
                                                    </div>
                                                </>
                                            )}

                                            {/* Personal Fields (ICO option) */}
                                            {!formData.isCompany && (
                                                <div className="space-y-2 md:col-span-2">
                                                    <label htmlFor="billingIco2" className="text-sm font-bold text-muted-foreground ml-1">IČO (VOLITELNÉ)</label>
                                                    <input
                                                        id="billingIco2"
                                                        name="ico"
                                                        value={formData.ico}
                                                        onChange={handleChange}
                                                        placeholder="Pro podnikající fyzické osoby"
                                                        className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Shipping Method */}
                            <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border shadow-sm">
                                <h2 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-3 mb-6 sm:mb-8">
                                    <Package className="w-6 h-6 text-primary" />
                                    Způsob dopravy
                                </h2>

                                <div className="space-y-4">
                                    <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${formData.deliveryMethod === 'zasilkovna' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                id="deliveryZasilkovna"
                                                type="radio"
                                                name="deliveryMethod"
                                                value="zasilkovna"
                                                checked={formData.deliveryMethod === 'zasilkovna'}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <div className="flex-1">
                                                <div className="font-bold flex justify-between">
                                                    <span>Zásilkovna - Výdejní místo</span>
                                                    <span>79 Kč</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Doručení na vybrané výdejní místo v ČR/SR</p>
                                            </div>
                                        </div>

                                        {formData.deliveryMethod === 'zasilkovna' && (
                                            <div className="mt-4 pl-7 space-y-3">
                                                {!selectedPoint ? (
                                                    <PacketaWidget
                                                        onPointSelected={(point) => {
                                                            console.log("Selected point:", point);
                                                            setSelectedPoint(point);
                                                            setFormData(prev => ({ ...prev, packetaPointId: point.id }));
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="bg-background rounded-lg p-3 border border-border flex justify-between items-center group">
                                                        <div>
                                                            <div className="font-bold text-sm">Zvolené místo:</div>
                                                            <div className="text-primary font-bold">{selectedPoint.name}</div>
                                                            <div className="text-xs text-muted-foreground">{selectedPoint.street}, {selectedPoint.city}</div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-muted-foreground hover:text-destructive"
                                                            onClick={() => { setSelectedPoint(null); setFormData(prev => ({ ...prev, packetaPointId: '' })); }}
                                                        >
                                                            Změnit
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border shadow-sm">
                                <h2 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-3 mb-6 sm:mb-8">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                    Způsob platby
                                </h2>

                                <div className="space-y-4">
                                    {/* Wallets */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'applepay' }))}
                                            className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all h-32 justify-center shadow-sm hover:shadow-md ${formData.paymentMethod === 'applepay' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
                                        >
                                            <div className="h-10 w-auto flex items-center justify-center">
                                                <svg viewBox="0 0 50 20" className="h-full w-auto" fill="currentColor">
                                                    <path d="M7.749 14.89c-.212 1.487-1.134 2.74-2.618 3.13-1.42.373-2.94-.46-3.468-1.89-1.393-3.77-.333-8.204 2.454-10.218 1.41-1.018 3.235-.918 4.542.235.215.193.447.45.658.74v-1.72c0-1.218-.162-1.577-.692-1.577-.552 0-.693.364-.693 1.577v3.52c0 .918-.184 1.258-.65 1.492a5.57 5.57 0 0 1-2.006.185c-.99-.12-1.865-.916-2.073-1.914-.196-1.127.262-2.22 1.15-2.69 1.455-.77 3.22-.32 4.148 1.056.223.332.48.56.685.655v1.07zm-4.398-2.227c-.996.157-1.872 1.053-2.063 2.185-.2 1.146.262 2.27 1.15 2.74 1.256.666 3.03.322 3.868-1.045a4.01 4.01 0 0 0 .548-1.87c.01-.84-.33-1.48-.992-1.84a4.136 4.136 0 0 0-2.51-.17zm32.067 5.17c.808.15 1.905.485 2.502.808 3.193 1.782 6.088 1.6 8.636-.554 1.325-1.11 1.88-2.315 1.88-4.98v-3.03c0-1.4-.19-1.815-.81-1.815-.77 0-.974.417-.974 1.848v2.964c0 2.768-.5 3.36-2.652 4.58-1.063.6-3.058.97-5.385.63-2.277-.334-4.364-1.2-4.364-3.144V7.5c0-1.4-.187-1.817-.81-1.817-.77 0-.974.417-.974 1.848v5.524a10.43 10.43 0 0 1-2.38 5.672c-1.408 1.898-3.324 2.184-5.3 1.527-.473-.157-1.503-.685-1.503-1.805s1.03-1.648 1.503-1.49c1.976.657 3.843.085 4.966-2.56.242-.572.35-.99.35-1.874v-5.41c0-1.4-.187-1.817-.81-1.817-.77 0-.974.417-.974 1.848V13.5c0 1.17-.375 1.57-1.323 1.87-1.04.332-1.78.332-2.73 0a1.868 1.868 0 0 0 .553-1.32V7.5c0-1.4-.188-1.817-.81-1.817-.774 0-.977.417-.977 1.848V12c-.086 2.05-1.272 5.034-3.69 5.034a2.9 2.9 0 0 1-1.698-.543v1.65c.42.228 1.488.423 2.074-.016 1.104-.842 1.62-.976 2.374-2.2H20.6v.933c0 .416.14.544.59.544 1.764 0 2.368-.614 2.368-2.31V9.5c0-1.4-.187-1.81-.81-1.81-.77 0-.974.417-.974 1.848v5.1a18.067 18.067 0 0 0 5.483-3.07m-17.76-1.513c-.02-.857-.333-1.53-.993-1.92-2.113-1.26-4.524-.265-5.5 2.174-.112.28-.21.565-.295.84v-2.1c0-1.4-.187-1.81-.81-1.81-.77 0-.974.417-.974 1.848v10.5c0 .416.11.544.58.544s.58-.12.58-.54V12.15a13.3 13.3 0 0 1 2.946-4.634c.947-.63 2.016-.27 2.016.914v9.07c0 .416.113.544.585.544.47 0 .584-.13.584-.544v-5.632zm-12.2-6.52c0-.4.187-.81.692-.81.547 0 .693.41.693 1.57V12c0 2.22-.647 3.514-3.52 3.514-1.385 0-2.34-.69-2.34-1.877 0-.99.646-1.577 1.848-1.577h2.82c.338 0 .5-.164.5-.49V7.17zM11.69 4.3c-1.124 0-2.028.904-2.028 2.028S10.566 8.356 11.69 8.356 13.718 7.452 13.718 6.328 12.814 4.3 11.69 4.3" />
                                                </svg>
                                            </div>
                                            <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50">Apple Pay</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'googlepay' }))}
                                            className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all h-32 justify-center shadow-sm hover:shadow-md ${formData.paymentMethod === 'googlepay' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
                                        >
                                            <div className="h-10 flex items-center justify-center">
                                                <svg width="60" height="24" viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                    <path d="M37.5 12h-2v8h2v-3.5c0-1.5 1-2.5 2.5-2.5.5 0 .8.1 1.1.2l.7-1.9c-.3-.2-.7-.3-1.3-.3-1.5 0-2.5 1-3 2.5V12zm14.5 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7.5-6h-2l-2.5 5.5-2.5-5.5h-2l3.5 7.5-.5 1c-.3.7-.8 1-1.5 1-.3 0-.6-.1-.8-.2l-.4 1.7c.4.2.9.3 1.5.3 2 0 3.2-1.2 4-3l4.7-9.3zM45 12.3c-.5-.2-1.1-.3-1.7-.3-2.5 0-4.3 1.8-4.3 4s1.8 4 4.3 4c.6 0 1.2-.1 1.7-.3v-2c-.5.2-1 .3-1.5.3-1.5 0-2.5-1-2.5-2s1-2 2.5-2c.5 0 1 .1 1.5.3v-2z" fill="currentColor" />
                                                </svg>
                                            </div>
                                            <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50">Google Pay</span>
                                        </button>
                                    </div>

                                    {/* Card */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                                        className={`w-full p-6 rounded-3xl border-2 flex items-center gap-6 transition-all h-28 shadow-sm hover:shadow-md ${formData.paymentMethod === 'card' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
                                    >
                                        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-primary shrink-0">
                                            <CreditCard size={32} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex justify-between items-center pr-2">
                                                <p className="font-black text-lg">Platební karta</p>
                                                <div className="flex gap-3">
                                                    {/* Visa */}
                                                    <svg viewBox="0 0 480 480" className="w-12 h-8">
                                                        <path fill="#004595" d="M192.5,334L171.3,195.8h-35c-2.7,0-5.1,1.5-6.3,3.9L80,334h38.6l7.7-21.2h47.1l4.4,21.2H192.5z M134.1,281.3l15-41.2c0.3-0.9,0.5-1.4,1.1-2.9l8.6,44.1H134.1z M301.7,334l22.3-138.2h-36.5l-22.3,138.2H301.7z M396.6,195.8c-11.7,0-20.7,3.3-25.7,8.2c-5,4.9-7.5,12-7.5,20.6c0,23.3,32,25.8,32,37.3c0,3.6-3.2,7.5-10.1,7.5c-8.9,0-15.6-4.1-15.6-4.1l-2.6,15.6c0,0,7.2,4.1,17.7,4.1c11.5,0,20.3-3.3,25.4-8.2c5.1-4.9,7.6-11.8,7.6-20.1C419.8,211.9,387.8,208.7,387.8,198.6c0-3.6,3.6-7.2,8.9-7.2c7.6,0,13.1,3,13.1,3l2.8-15.1C412.6,199.3,405.4,195.8,396.6,195.8z M261.2,195.8l-37.1,95c-1.1,2.8-5,3.6-7.2,1.3l-24.6-96.3h-38.3l37,138.2h36.6l64.2-138.2H261.2z" />
                                                    </svg>
                                                    {/* Mastercard */}
                                                    <svg viewBox="0 0 48 32" className="w-12 h-8">
                                                        <rect width="48" height="32" rx="4" fill="white" />
                                                        <circle cx="18" cy="16" r="12" fill="#EB001B" />
                                                        <circle cx="30" cy="16" r="12" fill="#F79E1B" />
                                                        <path d="M24 6.7a11.9 11.9 0 0 0 0 18.6 11.9 11.9 0 0 0 0-18.6z" fill="#FF5F00" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">Visa, Mastercard, Google Pay, Apple Pay</p>
                                        </div>
                                    </button>

                                    {/* Fast Bank Transfer */}
                                    <div className={`p-6 rounded-3xl border-2 transition-all shadow-sm ${formData.paymentMethod === 'transfer_fast' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background hover:border-primary/50'}`}>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'transfer_fast' }))}
                                            className="w-full flex items-center gap-6 mb-6 group"
                                        >
                                            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-primary italic font-black text-xl shadow-inner group-hover:scale-110 transition-transform">⚡</div>
                                            <div className="flex-1 text-left">
                                                <p className="font-black text-lg">Rychlá bankovní platba</p>
                                                <p className="text-sm text-muted-foreground font-medium">Okamžitý převod přes vaše bankovnictví</p>
                                            </div>
                                        </button>

                                        {formData.paymentMethod === 'transfer_fast' && (
                                            <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 animate-in fade-in zoom-in-95 duration-300">
                                                {[
                                                    { id: 'csas', name: 'Spořitelna', domain: 'csas.cz' },
                                                    { id: 'kb', name: 'KB', domain: 'kb.cz' },
                                                    { id: 'csob', name: 'ČSOB', domain: 'csob.cz' },
                                                    { id: 'airbank', name: 'Air Bank', domain: 'airbank.cz' },
                                                    { id: 'fio', name: 'Fio', domain: 'fio.cz' },
                                                    { id: 'raiffeisen', name: 'RB', domain: 'rb.cz' },
                                                    { id: 'moneta', name: 'Moneta', domain: 'moneta.cz' },
                                                    { id: 'mbank', name: 'mBank', domain: 'mbank.cz' }
                                                ].map(bank => (
                                                    <button
                                                        key={bank.id}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, subMethod: bank.id }))}
                                                        className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all aspect-square justify-center shadow-sm ${formData.subMethod === bank.id ? 'border-primary bg-primary/20 ring-2 ring-primary/20 scale-105' : 'border-border bg-white hover:border-primary/50'}`}
                                                    >
                                                        <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm overflow-hidden p-1">
                                                            <img src={`https://www.google.com/s2/favicons?domain=${bank.domain}&sz=128`} alt={bank.name} className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-tight truncate w-full text-center text-foreground">{bank.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Manual Bank Transfer (QR Code) */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'transfer_manual', subMethod: '' }))}
                                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all ${formData.paymentMethod === 'transfer_manual' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
                                    >
                                        <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-primary italic font-black text-xs">QR</div>
                                        <div className="flex-1 text-left">
                                            <p className="font-bold">Bankovní převod - QR kód</p>
                                            <p className="text-xs text-muted-foreground">Zobrazení údajů a QR kódu po dokončení</p>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-border shadow-md lg:sticky lg:top-24 space-y-6">
                            <h2 className="text-xl font-display font-bold flex items-center gap-3">
                                <ShoppingBag className="w-5 h-5 text-primary" />
                                Shrnutí objednávky
                            </h2>

                            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-white rounded-xl border border-border/50 flex flex-shrink-0 items-center justify-center p-1">
                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-xs truncate">{item.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{item.quantity}x {item.price} Kč</p>
                                        </div>
                                        <div className="font-bold text-xs shrink-0">{item.price * item.quantity} Kč</div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-6 border-t border-border space-y-3">
                                {/* Discount Code Field */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground ml-1 uppercase">Slevový kód</label>
                                    <div className="flex gap-2">
                                        <input
                                            id="discountCode"
                                            placeholder="Vložte kód"
                                            className="flex-1 bg-background border-2 border-border rounded-xl px-3 py-2 text-sm focus:border-primary outline-none transition-all"
                                        />
                                        <Button variant="outline" size="sm" type="button" className="rounded-xl font-bold">
                                            Použít
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between text-sm pt-2">
                                    <span className="text-muted-foreground uppercase font-bold text-[10px]">Mezisoučet</span>
                                    <span className="font-bold">{cartTotal} Kč</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground uppercase font-bold text-[10px]">Doprava</span>
                                    <span className="text-lime font-bold">ZDARMA</span>
                                </div>
                                <div className="pt-4 mt-2 border-t-2 border-primary flex justify-between items-end">
                                    <span className="font-display font-bold text-xl uppercase italic">Celkem</span>
                                    <span className="text-3xl font-display font-bold text-gradient-energy leading-none">{cartTotal} Kč</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={isProcessing || cart.length === 0}
                                size="xl"
                                className="w-full rounded-2xl h-16 font-bold shadow-button animate-energy-pulse text-lg"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="animate-spin w-6 h-6" />
                                        <span>Zpracování...</span>
                                    </div>
                                ) : (
                                    <span>Závazně objednat</span>
                                )}
                            </Button>

                            <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                                Kliknutím na tlačítko souhlasíte s <a href="/obchodni-podminky" className="underline hover:text-primary">obchodními podmínkami</a>,{' '}
                                <a href="/ochrana-osobnich-udaju" className="underline hover:text-primary">zpracováním osobních údajů</a> a{' '}
                                <a href="/podminky-opakovane-platby" className="underline hover:text-primary">podmínkami opakované platby</a>.

                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
