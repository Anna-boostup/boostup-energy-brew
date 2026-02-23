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
                                        className={`w-full p-6 rounded-3xl border-2 flex items-center gap-6 transition-all h-28 shadow-sm hover:shadow-md ${formData.paymentMethod === 'card' ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
                                    >
                                        <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                                            <CreditCard size={32} />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <div className="flex justify-between items-center pr-2">
                                                <p className="font-black text-lg">Platební karta</p>
                                                <div className="flex gap-4">
                                                    {/* Visa */}
                                                    <svg width="40" height="24" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M12.924 1.15H10.16L8.436 10.375H11.2L12.924 1.15ZM21.9 1.15C21.036 1.15 20.364 1.4 19.98 2.3L16.2 11.275H19.08L19.656 9.6125H22.98L23.292 11.275H25.92L23.58 1.15H21.9ZM20.196 8.0125L21.36 4.7L22.02 8.0125H20.196ZM6.396 1.15L3.636 9.175L3.336 7.625C2.796 5.8 1.476 3.9625 0 3.0875L2.556 12.5625H5.436L9.756 1.15H6.396Z" fill="#1A1F71" />
                                                        <path d="M12.552 1.15H15.156L13.884 10.375C13.884 10.375 13.56 12.3875 16.512 12.3875H17.484V14.6125C17.484 14.6125 15.696 15 14.484 15C11.532 15 11.196 12.875 11.196 12.875L12.552 1.15Z" fill="#F7B600" />
                                                    </svg>
                                                    {/* Mastercard */}
                                                    <svg width="40" height="24" viewBox="0 0 24 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="7.5" cy="7.5" r="7.5" fill="#EB001B" />
                                                        <circle cx="16.5" cy="7.5" r="7.5" fill="#F79E1B" />
                                                        <path d="M12 2.625C10.125 3.9375 9 6.0625 9 8.4375C9 10.8125 10.125 12.9375 12 14.25C13.875 12.9375 15 10.8125 15 8.4375C15 6.0625 13.875 3.9375 12 2.625Z" fill="#FF5F00" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground font-medium mt-1">Visa, Mastercard, Apple Pay, Google Pay</p>
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
