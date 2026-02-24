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
                                            className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all h-32 justify-center shadow-sm hover:shadow-md ${formData.paymentMethod === 'applepay' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
                                        >
                                            <div className="flex items-center gap-0.5 mb-1">
                                                <svg viewBox="0 0 50 50" className="w-8 h-8" fill="currentColor">
                                                    <path d="M33.7,21.5c0-4.1,3.4-6.1,3.5-6.2c-2-2.9-5-3.3-6.1-3.3c-2.6-0.3-5,1.5-6.3,1.5c-1.3,0-3.3-1.5-5.5-1.5 c-2.9,0-5.5,1.7-7,4.3c-3,5.2-0.8,12.8,2.1,17.1c1.5,2.1,3.2,4.5,5.5,4.4c2.2-0.1,3.1-1.4,5.8-1.4c2.6,0,3.5,1.4,5.8,1.3 c2.4-0.1,3.9-2.1,5.3-4.3c1.7-2.4,2.4-4.8,2.4-4.9C37.7,28.8,33.7,27.3,33.7,21.5z M30,10.1c1.2-1.4,2-3.4,1.8-5.3 c-1.7,0.1-3.7,1.1-4.9,2.5c-1.1,1.2-2,3.3-1.8,5.1C26.9,12.5,28.8,11.5,30,10.1z" />
                                                </svg>
                                                <span className="text-2xl font-black tracking-tighter">Pay</span>
                                            </div>
                                            <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground/50">Apple Pay</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'googlepay' }))}
                                            className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-2 transition-all h-32 justify-center shadow-sm hover:shadow-md ${formData.paymentMethod === 'googlepay' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <svg width="32" height="32" viewBox="0 0 24 24">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                </svg>
                                                <span className="text-2xl font-black tracking-tighter">Pay</span>
                                            </div>
                                            <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">Google Pay</span>
                                        </button>
                                    </div>
                                    {/* Card */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                                        className={`w-full p-6 rounded-3xl border-2 flex items-center gap-6 transition-all h-32 shadow-sm hover:shadow-md group ${formData.paymentMethod === 'card' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
                                    >
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${formData.paymentMethod === 'card' ? 'bg-primary shadow-lg scale-110' : 'bg-secondary'}`}>
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <rect x="2" y="5" width="20" height="14" rx="3" className={`${formData.paymentMethod === 'card' ? 'fill-white/20' : 'fill-primary/10'}`} />
                                                <path d="M2 9H22" stroke="currentColor" strokeWidth="2" className={`${formData.paymentMethod === 'card' ? 'text-white' : 'text-primary'}`} />
                                                <rect x="5" y="13" width="4" height="2" rx="0.5" className={`${formData.paymentMethod === 'card' ? 'fill-white' : 'fill-primary'}`} />
                                            </svg>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex justify-between items-center pr-2">
                                                <p className="font-black text-lg">Kartou online</p>
                                                <div className="flex gap-4 items-center scale-110 sm:scale-125 origin-right pr-2">
                                                    {/* Visa - Official 2021+ High Fidelity */}
                                                    <svg width="48" height="16" viewBox="0 0 1000 324.68" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="m651.19.5c-70.93,0-134.32,36.77-134.32,104.69,0,77.9,112.42,83.28,112.42,122.42,0,16.48-18.88,31.23-51.14,31.23-45.77,0-79.98-20.61-79.98-20.61l-14.64,68.55s39.41,17.41,91.73,17.41c77.55,0,138.58-38.57,138.58-107.66,0-82.32-112.89-87.54-112.89-123.86,0-12.91,15.5-27.05,47.66-27.05,36.29,0,65.89,14.99,65.89,14.99l14.33-66.2S696.61.5,651.18.5h0ZM2.22,5.5L.5,15.49s29.84,5.46,56.72,16.36c34.61,12.49,37.07,19.77,42.9,42.35l63.51,244.83h85.14L379.93,5.5h-84.94l-84.28,213.17-34.39-180.7c-3.15-20.68-19.13-32.48-38.68-32.48,0,0-135.41,0-135.41,0Zm411.87,0l-66.63,313.53h81L494.85,5.5h-80.76Zm451.76,0c-19.53,0-29.88,10.46-37.47,28.73l-118.67,284.8h84.94l16.43-47.47h103.48l9.99,47.47h74.95L934.12,5.5h-68.27Zm11.05,84.71l25.18,117.65h-67.45l42.28-117.65h0Z" fill="#1434cb" />
                                                    </svg>
                                                    {/* Mastercard - Official 2016+ High Fidelity */}
                                                    <svg width="34" height="26" viewBox="0 0 999.2 776" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M382,309c0-98.7,46.4-186.3,117.6-242.9 C447.2,24.9,381.1,0,309,0C138.2,0,0,138.2,0,309s138.2,309,309,309c72.1,0,138.2-24.9,190.6-66.1C428.3,496.1,382,407.7,382,309z" fill="#EB001B" />
                                                        <path d="M999.2,309c0,170.8-138.2,309-309,309 c-72.1,0-138.2-24.9-190.6-66.1c72.1-56.7,117.6-144.2,117.6-242.9S570.8,122.7,499.6,66.1C551.9,24.9,618,0,690.1,0 C861,0,999.2,139.1,999.2,309z" fill="#F79E1B" />
                                                        <rect x="364" y="66.1" width="270.4" height="485.8" fill="#FF5A00" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">Visa, Mastercard, Maestro</p>
                                        </div>
                                    </button>

                                    {/* Fast Bank Transfer */}
                                    <div className={`rounded-3xl border-2 transition-all shadow-sm ${formData.paymentMethod === 'transfer_fast' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background hover:border-primary/50'}`}>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'transfer_fast' }))}
                                            className="w-full flex items-center gap-6 p-6 group h-32"
                                        >
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${formData.paymentMethod === 'transfer_fast' ? 'bg-primary shadow-lg scale-110' : 'bg-secondary'}`}>
                                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${formData.paymentMethod === 'transfer_fast' ? 'text-white' : 'text-primary'}`}>
                                                    <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                    <path d="M5 10V18" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M9 10V18" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M15 10V18" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M19 10V18" stroke="currentColor" strokeWidth="2" />
                                                    <path d="M12 3L2 10H22L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="font-black text-lg">Okamžitá platba bankou</p>
                                                <p className="text-sm text-muted-foreground font-medium">Převod přes platební bránu</p>
                                            </div>
                                        </button>

                                        {formData.paymentMethod === 'transfer_fast' && (
                                            <div className="p-6 pt-0 grid grid-cols-4 sm:grid-cols-4 gap-3 animate-in fade-in zoom-in-95 duration-300">
                                                {[
                                                    {
                                                        id: 'csas',
                                                        name: 'Spořitelna',
                                                        icon: (
                                                            <svg viewBox="0 0 133 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-110">
                                                                <path d="m 92.4,0 c 0.9,0 1.8,0.4 2.4,1 0.7,0.7 1,1.5 1,2.5 0,1 -0.3,1.8 -1,2.5 -0.7,0.7 -1.5,1 -2.5,1 -1,0 -1.8,-0.3 -2.5,-1 -0.7,-0.7 -1,-1.5 -1,-2.5 0,-1 0.3,-1.8 1,-2.5 0.9,-0.6 1.7,-1 2.6,-1 l 0,0 z m 11.6,14.1 0,-2.2 c 0,-2 -1.7,-3.7 -3.7,-3.7 l -15.7,0 c -2,0 -3.7,1.7 -3.7,3.7 l 0,8.1 17.5,0 0,1.2 -17.5,0 0,2.2 c 0,2 1.7,3.7 3.7,3.7 l 15.7,0 c 2,0 3.7,-1.7 3.7,-3.7 l 0,-8.1 -17.5,0 0,-1.2 17.5,0 z" fill="#ED1C24" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'kb',
                                                        name: 'KB',
                                                        icon: (
                                                            <svg viewBox="0 0 430 430" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-110">
                                                                <rect fill="#E3233D" width="430" height="215" />
                                                                <rect y="215" width="430" height="215" fill="#1A1A1A" />
                                                                <rect x="75" y="202" fill="#FFFFFF" width="280" height="26" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'csob',
                                                        name: 'ČSOB',
                                                        icon: (
                                                            <svg viewBox="0 0 100 79" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-125">
                                                                <path d="M34.215,18.182c0-8.935,7.244-16.179,16.18-16.179s16.18,7.244,16.18,16.179s-7.244,16.179-16.18,16.179S34.215,27.117,34.215,18.182z M62.328,31.271c-3.083,3.342-8.519,6.685-15.493,6.685c-5.411,0-10.07-2.104-13.034-4.441c-17.664,1.854-30.8,4.481-30.8,4.481v7.153l93.616-0.01l0.009-14.748C96.626,30.391,80.652,30.292,62.328,31.271z" fill="#004787" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'airbank',
                                                        name: 'Air Bank',
                                                        icon: (
                                                            <svg viewBox="0 0 88 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-150">
                                                                <path d="M 31.742,0.323 18.525,25.534 h 3.828 L 35.571,0.323 h -3.828" fill="#99cc33" />
                                                                <path d="M 3.536,9.054 a 1.733,1.733 0 0 0 1.789,1.789 2.094,2.094 0 0 0 1.566,-0.720 c 0.621,-0.795 0.696,-1.764 0.696,-3.107 -2.361,-0.198 -4.051,0.546 -4.051,2.038 z m 4.511,3.877 a 9.775,9.775 0 0 1 -0.118,-1.715 4.176,4.176 0 0 1 -3.728,2.013 c -1.814,0 -2.634,-0.522 -3.107,-0.994 A 3.89,3.89 0 0 1 0,9.476 4.176,4.176 0 0 1 2.66,5.574 c 1.547,-0.696 3.728,-0.696 4.971,-0.696 a 4.896,4.896 0 0 0 -0.174,-1.665 1.702,1.702 0 0 0 -1.640,-1.044 1.677,1.677 0 0 0 -1.392,0.696 1.864,1.864 0 0 0 -0.273,1.118 H 0.547 a 3.511,3.511 0 0 1 1.416,-2.958 6.556,6.556 0 0 1 3.803,-1.019 c 1.044,0 3.231,0.174 4.474,1.615 a 4.971,4.971 0 0 1 0.87,3.107 v 5.046 a 15.187,15.187 0 0 0 0.242,3.181 H 8.072 Z M 13.504,0.329 h 3.678 V 12.931 h -3.678 z" fill="#000000" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'fio',
                                                        name: 'Fio',
                                                        icon: (
                                                            <svg viewBox="0 0 153 105" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-125">
                                                                <path d="M53.1,70 4.8,53.4 52.9,36.8" fill="#F7E106" />
                                                                <path d="M99.9,20.6 153,2.2 153,104.5 99.7,86.1 142.2,71.5 142.2,35.1" fill="#004787" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'raiffeisen',
                                                        name: 'RB',
                                                        icon: (
                                                            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-125">
                                                                <rect width="120" height="120" fill="#FEE000" rx="12" />
                                                                <path d="M99.4 0 L0 120.3 L120.2 120.4 L120.2 0 Z" fill="none" />
                                                                <path d="m 20,40 h 80 v 10 h -80 z" fill="#000000" />
                                                                <path d="m 40,20 v 80 h 10 v -80 z" fill="#000000" />
                                                                <path d="m 70,20 v 80 h 10 v -80 z" fill="#000000" />
                                                                <path d="m 20,70 h 80 v 10 h -80 z" fill="#000000" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'moneta',
                                                        name: 'Moneta',
                                                        icon: (
                                                            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-150">
                                                                <path d="m15.907 26.36 14.005 13.503-14.001 13.503v-27.006zm43.273-14.77-24.699 23.842-24.482-23.632v56.126l24.343-23.565 4.7137-4.4984 14.001-13.503v27.006l-9.4274-9.0736-4.5753 4.433 20.337 19.693v-56.828z" fill="#EF4036" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'mbank',
                                                        name: 'mBank',
                                                        icon: (
                                                            <svg viewBox="0 0 128 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-110">
                                                                <rect width="34" height="48" fill="#37105" />
                                                                <rect x="34" width="34" height="48" fill="#F79E1B" />
                                                                <rect x="68" width="32" height="48" fill="#EB001B" />
                                                                <rect x="100" width="28" height="48" fill="#99CC33" />
                                                            </svg>
                                                        )
                                                    }
                                                ].map(bank => (
                                                    <button
                                                        key={bank.id}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, subMethod: bank.id }))}
                                                        className={`p-1.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all aspect-square justify-center shadow-sm overflow-hidden ${formData.subMethod === bank.id ? 'border-primary bg-primary/20 ring-2 ring-primary/20 scale-105' : 'border-border bg-white hover:border-primary/50'}`}
                                                    >
                                                        <div className="w-full h-12 flex items-center justify-center p-1">
                                                            {bank.icon}
                                                        </div>
                                                        <span className="text-[8px] font-black uppercase tracking-tight truncate w-full text-center text-foreground/80 mt-auto">{bank.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Manual Bank Transfer (Proforma) */}
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'transfer_manual', subMethod: '' }))}
                                        className={`w-full p-6 rounded-3xl border-2 flex items-center gap-6 transition-all h-32 shadow-sm hover:shadow-md group ${formData.paymentMethod === 'transfer_manual' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
                                    >
                                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${formData.paymentMethod === 'transfer_manual' ? 'bg-primary shadow-lg scale-110' : 'bg-secondary'}`}>
                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${formData.paymentMethod === 'transfer_manual' ? 'text-white' : 'text-primary'}`}>
                                                <path d="M3 3H9V9H3V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                                <path d="M15 3H21V9H15V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                                <path d="M3 15H9V21H3V15Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                                                <path d="M15 15H21V21H15V15Z" stroke="currentColor" strokeWidth="1" />
                                                <path d="M18 18H18.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                                <path d="M12 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 4" />
                                                <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 4" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-black text-lg">Bankovní převod (Proforma)</p>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">Platební údaje a QR kód po dokončení</p>
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
