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
                                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all h-24 justify-center ${formData.paymentMethod === 'applepay' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
                                        >
                                            <div className="h-8 w-auto flex items-center justify-center">
                                                <svg viewBox="0 0 42 17" className="h-full w-auto">
                                                    <path d="M5.564 12.63c-.15 1.05-.8 1.933-1.854 2.21-1.01.275-2.09-.324-2.457-1.334-.374-1.025.074-2.227 1.01-2.73 1.012-.533 2.193-.2 2.834.735.152.22.317.373.467.435v.684zm-3.08-1.57c-.703.11-1.32.744-1.464 1.543-.142.793.18 1.57.818 1.9.64.332 1.488.163 2.05-.41.385-.395.59-1.045.59-1.92 0-.25-.015-.473-.042-.656-.63-.496-1.3-.544-1.95-.457zm22.463 3.65c.57.106 1.343.344 1.764.57 2.25 1.258 4.29 1.13 6.096-.388.932-.782 1.324-1.636 1.324-3.52v-2.14c0-.987-.134-1.282-.57-1.282-.544 0-.687.295-.687 1.305v2.09c0 1.953-.353 2.37-1.87 3.23-.746.422-2.152.684-3.793.444-1.6-.235-3.076-.848-3.076-2.22 0-1.895 2.15-2.285 4.885-3.056 2.196-.618 3.86-1.125 3.86-2.905 0-1.983-1.643-2.956-4.1-2.956-2.314 0-4.04 1.066-4.04 2.19 0 .5.166.8.528.8.442 0 .59-.3.59-1.012 0-.46.52-.767 1.104-.767 1.144 0 1.83.6 1.83 1.626 0 1.282-.6 1.486-2.378 1.99-2.822.793-4.887 1.39-4.887 3.32 0 1.93 1.364 2.5 3.536 2.68zm2.497-5.065c-2.457.65-3.513.882-3.513 1.977 0 .493.593 1.05 1.71 1.05a8.773 8.773 0 0 0 3.016-.86c1.11-.632 1.373-.918 1.373-1.666 0-.825-.633-1.025-2.586-1.5zm11.332 5.28c1.396 0 2.254-.882 2.254-1.897 0-1.054-.86-1.93-2.254-1.93-1.394 0-2.245.876-2.245 1.93 0 1.015.85 1.897 2.245 1.897zm0-1.218c-.808 0-1.013-.438-1.013-.711 0-.256.242-.712 1.013-.712.784 0 1.006.44 1.006.712 0 .285-.205.711-1.006.711zm-5.73 1.218a2.126 2.126 0 0 0 1.764-1.04v.852c0 .283.08.385.405.385.344 0 .416-.1.416-.397V9.52c0-.285-.08-.398-.416-.398-.323 0-.405.113-.405.398v.67a1.996 1.996 0 0 0-1.78-.89c-1.393 0-2.245.895-2.245 1.935 0 1.022.852 1.897 2.26 1.897zm.05-1.218c-.896 0-1.047-.432-1.047-.704 0-.27.151-.72 1.047-.72.887 0 1.033.45 1.033.72 0 .272-.146.704-1.033.704zm-14.8-1.516V7.48c0-.987-.134-1.282-.57-1.282-.544 0-.687.295-.687 1.305v3.834c0 .825-.264 1.107-.932 1.32-.57.177-.96.223-1.425.132v.566c.338.152.886.152 1.4-.047 1.5-.544 2.214-1.238 2.214-3zm1.144 2.735c.32 0 .402-.113.402-.4V9.52c0-.285-.082-.398-.418-.398-.325 0-.403.113-.403.398v3.476c0 .287.08.4.42.4zm-.016-5.83c.328 0 .545-.235.545-.568a.56.56 0 0 0-.545-.57c-.322 0-.545.244-.545.57s.223.568.545.568zM5.98 5.75c-.32 0-.62-.112-.892-.303.582-.44.957-1.12.957-1.888 0-1.353-1.135-2.433-2.522-2.408-1.133.023-2.096.84-2.33 1.932A2.432 2.432 0 0 0 1.53 5.48c.18.066.368.1.558.102a.4.4 0 0 1 .4.4l-.066 3.535c-.01.378.07.487.42.487.315 0 .41-.1.41-.39V6.014c0-.236.192-.428.428-.428h2.3c.362 0 .438-.113.438-.418 0-.306-.07-.418-.438-.418z" fill="currentColor" />
                                                </svg>
                                            </div>
                                            <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground/60">Apple Pay</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'googlepay' }))}
                                            className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all h-24 justify-center ${formData.paymentMethod === 'googlepay' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
                                        >
                                            <div className="h-8 flex items-center justify-center">
                                                <svg width="42" height="17" viewBox="0 0 42 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5.564 12.63c-.15 1.05-.8 1.933-1.854 2.21-1.01.275-2.09-.324-2.457-1.334-.374-1.025.074-2.227 1.01-2.73 1.012-.533 2.193-.2 2.834.735.152.22.317.373.467.435v.684zm-3.08-1.57c-.703.11-1.32.744-1.464 1.543-.142.793.18 1.57.818 1.9.64.332 1.488.163 2.05-.41.385-.395.59-1.045.59-1.92 0-.25-.015-.473-.042-.656-.63-.496-1.3-.544-1.95-.457z" fill="currentColor" />
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                </svg>
                                            </div>
                                            <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground/60">Google Pay</span>
                                        </button>
                                    </div>

                                    {/* Card */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                                        className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 transition-all h-24 ${formData.paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
                                    >
                                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-primary shrink-0">
                                            <CreditCard size={24} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-extrabold text-base">Platební karta</p>
                                            <div className="flex gap-2 mt-1">
                                                {/* Visa */}
                                                <svg viewBox="0 0 24 24" className="w-8 h-5 text-slate-400 group-hover:text-primary transition-colors">
                                                    <path fill="currentColor" d="M1 4h22v16H1z" opacity=".1" />
                                                    <path fill="#1A1F71" d="M3.3 8L2.4 13.9H4.1L5 8H3.3zm5.7 0L7.4 11.7l-.2-1.2h-.1l-.4-1.9-.3-.6H4.2l.1.5h1.2l1.3 4.9h1.7L10.7 8H9zm4.2 0l-1.3 5.9h1.6l1.3-5.9h-1.6zm5.8 1.9c-.3-.2-.8-.3-1.4-.3-1.6 0-2.3 1-2.3 1.9 0 1.1 1.2 1.3 1.2 2.1 0 .3-.3.6-.9.6-.8 0-1.3-.4-1.3-.4l-.1.9c.3.2.9.4 1.5.4 1.7 0 2.4-.9 2.4-2 0-1.2-1.2-1.4-1.2-2.1 0-.3.3-.5.8-.5.7 0 1 .3 1 .3l.3-1z" />
                                                    <path fill="#F7B600" d="M3.2 8L2.8 10.3c.7-.4 2.1-.8 3.3-.8L3.2 8z" />
                                                </svg>
                                                {/* Mastercard */}
                                                <svg viewBox="0 0 24 24" className="w-8 h-5">
                                                    <circle cx="9" cy="12" r="6" fill="#EB001B" opacity=".8" />
                                                    <circle cx="15" cy="12" r="6" fill="#F79E1B" opacity=".8" />
                                                </svg>
                                                {/* Maestro */}
                                                <svg viewBox="0 0 24 24" className="w-8 h-5">
                                                    <circle cx="9" cy="12" r="6" fill="#0061A8" opacity=".8" />
                                                    <circle cx="15" cy="12" r="6" fill="#ED1C2E" opacity=".8" />
                                                    <path fill="#FFFFFF" d="M12 7.7a6 6 0 0 0 0 8.6 6 6 0 0 0 0-8.6z" opacity=".5" />
                                                </svg>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Fast Bank Transfer */}
                                    <div className={`p-4 rounded-2xl border-2 transition-all ${formData.paymentMethod === 'transfer_fast' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'transfer_fast' }))}
                                            className="w-full flex items-center gap-4 mb-4"
                                        >
                                            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center text-primary italic font-black text-xs">⚡</div>
                                            <div className="flex-1 text-left">
                                                <p className="font-bold">Rychlá bankovní platba</p>
                                                <p className="text-xs text-muted-foreground">Okamžitý převod přes vaše bankovnictví</p>
                                            </div>
                                        </button>

                                        {formData.paymentMethod === 'transfer_fast' && (
                                            <div className="grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-top-2">
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
                                                        className={`p-2 rounded-lg border-2 flex flex-col items-center gap-1 transition-all ${formData.subMethod === bank.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                                                    >
                                                        <img src={`https://www.google.com/s2/favicons?domain=${bank.domain}&sz=128`} alt={bank.name} className="w-8 h-8 object-contain" />
                                                        <span className="text-[8px] font-bold uppercase truncate w-full text-center">{bank.name}</span>
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
