import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useCart } from '@/context/CartContext';
import { useInventory, Order } from '@/context/InventoryContext';
import {
    ArrowLeft, ShoppingBag, CreditCard, Truck, CheckCircle,
    Loader2, Package, FileText, ChevronLeft, MapPin,
    Minus, Plus, Trash2, Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import bottleLemon from "@/assets/bottle-lemon.webp";
import bottleRed from "@/assets/bottle-red.webp";
import bottleSilky from "@/assets/bottle-silky.webp";
const bottlesHero = "/hero-vse.webp";

const getFallbackImage = (item: any) => {
    if (item.flavorMode === 'mix') return bottlesHero;
    const name = (item.name || "").toLowerCase();
    if (name.includes('lemon')) return bottleLemon;
    if (name.includes('red')) return bottleRed;
    if (name.includes('silky')) return bottleSilky;
    return bottlesHero;
};

// ---- Email Helper — calls our Vercel serverless function (avoids CORS) ----
const sendOrderConfirmationEmail = async (
    to: string,
    orderNumber: string,
    customerName: string,
    items: { name: string; quantity: number; price: number; mixConfiguration?: any }[],
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

    // Payment States
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [pendingOrder, setPendingOrder] = useState<Order | null>(null);

    // Billing Address State
    const [billingSameAsDelivery, setBillingSameAsDelivery] = useState(true);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '+420 ',
        street: '',
        houseNumber: '',
        city: '',
        zip: '',
        // Billing fields
        isCompany: false,
        companyName: '',
        ico: '',
        dic: '',
        billingStreet: '',
        billingHouseNumber: '',
        billingCity: '',
        billingZip: '',

        deliveryMethod: 'card',
        packetaPointId: '',
        paymentMethod: '',
        subMethod: '',
        createAccount: false,
        password: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

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
                    houseNumber: delivery.houseNumber || '',
                    city: delivery.city || '',
                    zip: delivery.zip || '',

                    isCompany: billing.isCompany === true,
                    companyName: billing.company || '',
                    ico: billing.ico || '',
                    dic: billing.dic || '',
                    billingStreet: billing.street || '',
                    billingHouseNumber: billing.houseNumber || '',
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

        // 0. Field Validation
        const requiredFields: (keyof typeof formData)[] = [
            'firstName', 'lastName', 'email', 'phone', 'houseNumber', 'city', 'zip'
        ];

        const fieldLabels: Record<string, string> = {
            firstName: 'Jméno',
            lastName: 'Příjmení',
            email: 'Email',
            phone: 'Telefon',
            houseNumber: 'Číslo popisné',
            city: 'Město',
            zip: 'PSČ',
            paymentMethod: 'Způsob platby'
        };

        const missingFields: string[] = [];
        const newErrors: Record<string, string> = {};

        requiredFields.forEach(field => {
            const value = formData[field];
            if (field === 'phone') {
                // Check if phone has more than just the prefix
                if (!value || value.toString().trim() === '+420') {
                    const msg = `Pole ${fieldLabels[field]} je povinné`;
                    missingFields.push(fieldLabels[field]);
                    newErrors[field] = msg;
                }
            } else if (!value) {
                const msg = `Pole ${fieldLabels[field]} je povinné`;
                missingFields.push(fieldLabels[field]);
                newErrors[field] = msg;
            }
        });

        if (!billingSameAsDelivery) {
            if (!formData.billingHouseNumber) {
                newErrors.billingHouseNumber = 'Povinné pole';
                missingFields.push('Fakturační číslo popisné');
            }
            if (!formData.billingCity) {
                newErrors.billingCity = 'Povinné pole';
                missingFields.push('Fakturační město');
            }
            if (!formData.billingZip) {
                newErrors.billingZip = 'Povinné pole';
                missingFields.push('Fakturační PSČ');
            }
        }

        if (formData.isCompany) {
            if (!formData.companyName) {
                newErrors.companyName = 'Povinné pole';
                missingFields.push('Název firmy');
            }
            if (!formData.ico) {
                newErrors.ico = 'Povinné pole';
                missingFields.push('IČO');
            }
        }

        if (!formData.paymentMethod) {
            newErrors.paymentMethod = 'Prosím vyberte způsob platby';
            missingFields.push(fieldLabels.paymentMethod);
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            toast({
                title: "Chybějící údaje",
                description: `Prosím opravte chyby ve formuláři.`,
                variant: "destructive"
            });
            return;
        }

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

            // Calculate shipping cost
            const isFreeShipping = cartTotal >= 1500 || cart.some(item => item.pack === 21);
            const shippingCost = (formData.deliveryMethod === 'zasilkovna' && !isFreeShipping) ? 79 : 0;

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
                    houseNumber: formData.houseNumber,
                    // Add Billing Info
                    billingSameAsDelivery: billingSameAsDelivery,
                    isCompany: formData.isCompany,
                    companyName: formData.companyName,
                    ico: formData.ico,
                    dic: formData.dic,
                    billingStreet: billingSameAsDelivery ? formData.street : formData.billingStreet,
                    billingHouseNumber: billingSameAsDelivery ? formData.houseNumber : formData.billingHouseNumber,
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
                    price: item.price,
                    mixConfiguration: item.mixConfiguration
                })),
                total: cartTotal + shippingCost,
                status: 'pending', // Initial status, will be updated by Stripe webhook or admin manually for transfer
                is_subscription_order: cart.some(item => !!item.subscriptionInterval)
            };

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

            // --- Stripe Payment Logic ---
            if (formData.paymentMethod === 'transfer_manual') {
                // For manual transfer, we don't go to gateway
                clearCart();
                const isFreeShipping = cartTotal >= 1500 || cart.some(item => item.pack === 21);
                const shippingCost = (formData.deliveryMethod === 'zasilkovna' && !isFreeShipping) ? 79 : 0;
                const totalWithShipping = cartTotal + shippingCost;
                sendOrderConfirmationEmail(
                    formData.email,
                    orderNumber,
                    `${formData.firstName} ${formData.lastName}`,
                    newOrder.items,
                    totalWithShipping
                );
                navigate(`/payment/success?paymentId=TRANSFER-${orderNumber}&orderNumber=${orderNumber}&amount=${totalWithShipping}&status=pending`);
                return;
            }

            // For other methods (card), initialize Stripe Checkout via our Vercel Serverless Function
            setPendingOrder(newOrder);
            setIsRedirecting(true);
            
            try {
                const stripeRes = await fetch('/api/create-stripe-session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderNumber: newOrder.id,
                        customerEmail: formData.email,
                        items: newOrder.items,
                        total: newOrder.total,
                    }),
                });

                const stripeData = await stripeRes.json();

                if (stripeRes.ok && stripeData.url) {
                    // Redirect to Stripe Checkout
                    window.location.href = stripeData.url;
                    return; // Stop here, user leaves the page
                } else {
                    throw new Error(stripeData.error || 'Nepodařilo se vygenerovat platební odkaz');
                }
            } catch (stripeError: any) {
                console.error('Stripe initialization error:', stripeError);
                toast({
                    title: "Chyba platby",
                    description: stripeError.message || "Nepodařilo se inicializovat platební bránu.",
                    variant: "destructive"
                });
                setIsProcessing(false);
                setIsRedirecting(false);
            }

        } catch (error) {
            console.error('Checkout error:', error);
            toast({
                title: "Technická chyba",
                description: "Při zpracování objednávky došlo k chybě.",
                variant: "destructive"
            });
            setIsProcessing(false);
            setIsRedirecting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Clear error when user changes the field
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        if (name === 'phone') {
            const filteredValue = value.replace(/[^\d+\s]/g, '');
            setFormData(prev => ({ ...prev, [name]: filteredValue }));
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <main className="min-h-screen bg-secondary/30 py-6 sm:py-12">
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
                                                <label className="text-[10px] font-bold text-muted-foreground ml-1 text-primary uppercase tracking-wider">Název firmy *</label>
                                                <input
                                                    name="companyName"
                                                    value={formData.companyName}
                                                    onChange={handleChange}
                                                    required={formData.isCompany}
                                                    placeholder="Např. BoostUp s.r.o."
                                                    className={`w-full bg-background border-2 rounded-xl px-4 py-3 outline-none transition-all ${errors.companyName ? 'border-destructive' : 'border-primary/30 focus:border-primary'}`}
                                                />
                                                {errors.companyName && <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.companyName}</p>}
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <label htmlFor="ico" className="text-[10px] font-bold text-foreground/90 ml-1 uppercase tracking-wider">Ičo *</label>
                                                    <input
                                                        id="ico"
                                                        name="ico"
                                                        value={formData.ico}
                                                        onChange={handleChange}
                                                        required={formData.isCompany}
                                                        placeholder="12345678"
                                                        className={`w-full bg-background border-2 rounded-xl px-4 py-3 outline-none transition-all ${errors.ico ? 'border-destructive' : 'border-border focus:border-primary'}`}
                                                    />
                                                    {errors.ico && <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.ico}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="dic" className="text-sm font-bold text-foreground/90 ml-1">DIČ</label>
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
                                        <label htmlFor="firstName" className="text-[10px] font-bold text-foreground/90 ml-1 uppercase tracking-wider">Jméno *</label>
                                        <input
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Jan"
                                            className={`w-full bg-background border-2 rounded-xl px-4 py-3 outline-none transition-all ${errors.firstName ? 'border-destructive' : 'border-border focus:border-primary'}`}
                                        />
                                        {errors.firstName && <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.firstName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="lastName" className="text-[10px] font-bold text-foreground/90 ml-1 uppercase tracking-wider">Příjmení *</label>
                                        <input
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            placeholder="Novák"
                                            className={`w-full bg-background border-2 rounded-xl px-4 py-3 outline-none transition-all ${errors.lastName ? 'border-destructive' : 'border-border focus:border-primary'}`}
                                        />
                                        {errors.lastName && <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.lastName}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="email" className="text-[10px] font-bold text-foreground/90 ml-1 uppercase tracking-wider">Email *</label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="jan.novak@email.cz"
                                            className={`w-full bg-background border-2 rounded-xl px-4 py-3 outline-none transition-all ${errors.email ? 'border-destructive' : 'border-border focus:border-primary'}`}
                                        />
                                        {errors.email && <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.email}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="phone" className="text-[10px] font-bold text-foreground/90 ml-1 uppercase tracking-wider">Telefon *</label>
                                        <input
                                            id="phone"
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            placeholder="+420 000 000 000"
                                            className={`w-full bg-background border-2 rounded-xl px-4 py-3 outline-none transition-all ${errors.phone ? 'border-destructive' : 'border-border focus:border-primary'}`}
                                        />
                                        {errors.phone && <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.phone}</p>}
                                        <p className="text-[10px] text-muted-foreground italic ml-1">Včetně předvolby (např. +420)</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:col-span-2">
                                        <div className="sm:col-span-2 space-y-2">
                                            <label htmlFor="street" className="text-sm font-bold text-foreground/70 ml-1 uppercase">Ulice</label>
                                            <input
                                                id="street"
                                                name="street"
                                                value={formData.street}
                                                onChange={handleChange}
                                                placeholder="Lidická"
                                                className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="houseNumber" className="text-sm font-bold text-foreground/70 ml-1 uppercase">Č. popisné *</label>
                                            <input
                                                id="houseNumber"
                                                name="houseNumber"
                                                value={formData.houseNumber}
                                                onChange={handleChange}
                                                required
                                                placeholder="123"
                                                className={`w-full bg-background border-2 rounded-xl px-4 py-3 outline-none transition-all ${errors.houseNumber ? 'border-destructive' : 'border-border focus:border-primary'}`}
                                            />
                                            {errors.houseNumber && <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.houseNumber}</p>}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="city" className="text-sm font-bold text-foreground/70 ml-1 uppercase">Město *</label>
                                        <input
                                            id="city"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                            placeholder="Brno"
                                            className={`w-full bg-background border-2 rounded-xl px-4 py-3 outline-none transition-all ${errors.city ? 'border-destructive' : 'border-border focus:border-primary'}`}
                                        />
                                        {errors.city && <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.city}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="zip" className="text-[10px] font-bold text-foreground/90 ml-1 uppercase tracking-wider">Psč *</label>
                                        <input
                                            id="zip"
                                            name="zip"
                                            value={formData.zip}
                                            onChange={handleChange}
                                            required
                                            placeholder="602 00"
                                            className={`w-full bg-background border-2 rounded-xl px-4 py-3 outline-none transition-all ${errors.zip ? 'border-destructive' : 'border-border focus:border-primary'}`}
                                        />
                                        {errors.zip && <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.zip}</p>}
                                    </div>

                                    {!user && (
                                        <div className="sm:col-span-2 space-y-4 pt-4 border-t border-border/50">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="createAccount"
                                                    checked={formData.createAccount}
                                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, createAccount: checked as boolean }))}
                                                    aria-label="Vytvořit účet pro příští nákupy"
                                                />
                                                <Label htmlFor="createAccount" className="font-bold cursor-pointer text-sm">Chci si vytvořit účet pro příští nákupy</Label>
                                            </div>

                                            {formData.createAccount && (
                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                                    <label htmlFor="password" className="text-sm font-bold text-foreground/70 ml-1">HESLO *</label>
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
                                            aria-label="Fakturační údaje stejné jako doručovací"
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
                                                        <label htmlFor="billingCompanyName" className="text-sm font-bold text-foreground/90 ml-1">NÁZEV FIRMY</label>
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
                                                        <label htmlFor="billingDic" className="text-sm font-bold text-foreground/90 ml-1">DIČ (VOLITELNÉ)</label>
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
                                                    <label className="text-sm font-bold text-foreground/90 ml-1">IČO (VOLITELNÉ)</label>
                                                    <input
                                                        name="ico"
                                                        value={formData.ico}
                                                        onChange={handleChange}
                                                        placeholder="Pro podnikající fyzické osoby"
                                                        className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                    />
                                                </div>
                                            )}

                                            <div className="grid grid-cols-3 gap-4 sm:col-span-2 pt-2 border-t">
                                                <div className="col-span-2 space-y-2">
                                                    <label htmlFor="billingStreet" className="text-sm font-bold text-foreground/90 ml-1 uppercase">ULICE (FAKTURAČNÍ)</label>
                                                    <input
                                                        id="billingStreet"
                                                        name="billingStreet"
                                                        value={formData.billingStreet}
                                                        onChange={handleChange}
                                                        placeholder="Lidická"
                                                        className="w-full bg-background border-2 border-border rounded-xl px-4 py-3 focus:border-primary outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="billingHouseNumber" className="text-sm font-bold text-foreground/90 ml-1 uppercase">Č. POPISNÉ *</label>
                                                    <input
                                                        id="billingHouseNumber"
                                                        name="billingHouseNumber"
                                                        value={formData.billingHouseNumber}
                                                        onChange={handleChange}
                                                        required={!billingSameAsDelivery}
                                                        placeholder="123"
                                                        className={`w-full bg-background border-2 rounded-xl px-4 py-3 outline-none transition-all ${errors.billingHouseNumber ? 'border-destructive' : 'border-border focus:border-primary'}`}
                                                    />
                                                    {errors.billingHouseNumber && <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.billingHouseNumber}</p>}
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="billingCity" className="text-sm font-bold text-foreground/90 ml-1">MĚSTO (FAKTURAČNÍ) *</label>
                                                <input
                                                    id="billingCity"
                                                    name="billingCity"
                                                    value={formData.billingCity}
                                                    onChange={handleChange}
                                                    required={!billingSameAsDelivery}
                                                    placeholder="Brno"
                                                    className={`w-full bg-background border-2 rounded-xl px-4 py-3 outline-none transition-all ${errors.billingCity ? 'border-destructive' : 'border-border focus:border-primary'}`}
                                                />
                                                {errors.billingCity && <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.billingCity}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="billingZip" className="text-sm font-bold text-foreground/90 ml-1">PSČ (FAKTURAČNÍ) *</label>
                                                <input
                                                    id="billingZip"
                                                    name="billingZip"
                                                    value={formData.billingZip}
                                                    onChange={handleChange}
                                                    required={!billingSameAsDelivery}
                                                    placeholder="602 00"
                                                    className={`w-full bg-background border-2 rounded-xl px-4 py-3 outline-none transition-all ${errors.billingZip ? 'border-destructive' : 'border-border focus:border-primary'}`}
                                                />
                                                {errors.billingZip && <p className="text-destructive text-[10px] font-bold mt-1 ml-1">{errors.billingZip}</p>}
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
                                                        <label htmlFor="billingCompanyName2" className="text-sm font-bold text-foreground/90 ml-1">NÁZEV FIRMY</label>
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
                                                        <label htmlFor="billingDic2" className="text-sm font-bold text-foreground/90 ml-1">DIČ (VOLITELNÉ)</label>
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
                                                    <label htmlFor="billingIco2" className="text-sm font-bold text-foreground/90 ml-1">IČO (VOLITELNÉ)</label>
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
                                    <label className={`block border-2 rounded-xl p-4 cursor-pointer transition-all ${formData.deliveryMethod === 'personal' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                id="deliveryPersonal"
                                                type="radio"
                                                name="deliveryMethod"
                                                value="personal"
                                                checked={formData.deliveryMethod === 'personal'}
                                                onChange={handleChange}
                                                className="w-4 h-4 text-primary"
                                            />
                                            <div className="flex-1">
                                                <div className="font-bold flex justify-between">
                                                    <span>Osobní vyzvednutí</span>
                                                    <span>0 Kč</span>
                                                </div>
                                                <p className="text-sm text-muted-foreground">Po předchozí domluvě na e-mailu objednavky@drinkboostup.cz</p>
                                            </div>
                                        </div>
                                    </label>

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
                                <h2 className="text-xl sm:text-2xl font-display font-bold flex items-center gap-3 mb-4 sm:mb-6">
                                    <CreditCard className="w-6 h-6 text-primary" />
                                    Způsob platby
                                </h2>

                                {errors.paymentMethod && <p className="text-destructive text-sm font-bold mb-4 animate-in fade-in slide-in-from-top-1">{errors.paymentMethod}</p>}

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
                                            <span className="font-bold text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80">Apple Pay</span>
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
                                            <span className="font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground/80">Google Pay</span>
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
                                                            <svg viewBox="0 0 133 70" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-2">
                                                                <path d="m 92.4,0 c 0.9,0 1.8,0.4 2.4,1 0.7,0.7 1,1.5 1,2.5 0,1 -0.3,1.8 -1,2.5 -0.7,0.7 -1.5,1 -2.5,1 -1,0 -1.8,-0.3 -2.5,-1 -0.7,-0.7 -1,-1.5 -1,-2.5 0,-1 0.3,-1.8 1,-2.5 0.9,-0.6 1.7,-1 2.6,-1 l 0,0 z m 11.6,14.1 0,-2.2 c 0,-2 -1.7,-3.7 -3.7,-3.7 l -15.7,0 c -2,0 -3.7,1.7 -3.7,3.7 l 0,8.1 17.5,0 0,1.2 -17.5,0 0,2.2 c 0,2 1.7,3.7 3.7,3.7 l 15.7,0 c 2,0 3.7,-1.7 3.7,-3.7 l 0,-8.1 -17.5,0 0,-1.2 17.5,0 z" fill="#ED1C24" />
                                                                <path d="m 8.1,8.1 c 3.9,0 5.2,0.7 5.2,2.3 l 0,1.8 -5.2,0 c -2.6,0 -3.2,1.1 -3.2,5.5 0,4.3 0.6,5.5 3.2,5.5 l 5.2,0 0,1.8 c 0,1.6 -1.3,2.3 -5.2,2.3 C 2.9,27.3 0,24.4 0,17.7 0,10.9 2.8,8.1 8.1,8.1 Z M 7.4,7.2 C 7,7.2 6.8,7.1 6.5,6.7 L 4.1,3.6 C 4,3.5 4,3.3 4,3.2 l 1.8,0 c 0.4,0 0.5,0.1 0.9,0.4 L 8,4.8 9.2,3.7 C 9.6,3.3 9.8,3.3 10.1,3.3 l 1.9,0 c 0,0.1 0,0.3 -0.1,0.4 l -2.4,3 C 9.2,7.1 9,7.2 8.6,7.2 l -1.2,0 z m 7.4,2.7 c 0,-1.1 0.5,-1.7 1.6,-1.7 l 10.4,0 0,2.3 c 0,1.1 -0.6,1.7 -1.7,1.7 l -5.6,0 0,3.4 6.2,0 0,3.8 -6.2,0 0,3.7 7.4,0 0,2.3 c 0,1.1 -0.6,1.7 -1.7,1.7 l -8.8,0 c -1.1,0 -1.6,-0.6 -1.6,-1.7 l 0,-15.5 z m 20,-1.8 c 3.9,0 6,0.4 6,2.3 l 0,1.9 -5.4,0 c -1.4,0 -1.9,0.4 -1.9,1.2 0,2.3 8.2,1.8 8.2,8.2 0,3 -1.7,5.7 -7.1,5.7 -3.5,0 -6.2,-0.6 -6.2,-2.3 l 0,-1.9 6.4,0 c 1.3,0 1.9,-0.4 1.9,-1.3 0,-2.5 -8.2,-2 -8.2,-8.6 0,-2.9 1.9,-5.2 6.3,-5.2 z m 13.7,8.8 4.7,-7.8 c 0.4,-0.8 0.7,-0.9 1.3,-0.9 l 4.5,0 C 59,8.5 58.9,8.7 58.8,9 l -5.4,8.3 5.7,9 c 0.1,0.2 0.3,0.5 0.3,0.8 l -4.4,0 c -0.9,0 -1.2,-0.1 -1.7,-0.9 l -4.9,-7.8 0,8.6 -4.7,0 0,-17.1 c 0,-1.1 0.5,-1.7 1.6,-1.7 l 3.1,0 0,8.7 z M 70,8.2 c 0.8,0 1.2,0.1 1.4,0.8 l 4.4,17.5 c 0.1,0.3 0.1,0.5 0.1,0.7 l -3.9,0 c -0.8,0 -1,-0.1 -1.2,-0.7 l -0.9,-3.8 -4.4,0 -0.9,3.8 c -0.1,0.7 -0.4,0.7 -1.2,0.7 l -3.8,0 c 0,-0.2 0,-0.4 0.1,-0.7 L 64.1,9 c 0.2,-0.7 0.6,-0.8 1.4,-0.8 l 4.5,0 z m -3.8,10.9 2.9,0 -1.4,-6.1 -0.1,0 -1.4,6.1 z m 3,-12.3 c -0.4,0.4 -0.6,0.4 -0.9,0.4 l -1.8,0 c 0,-0.1 0,-0.3 0.1,-0.4 L 69,3.7 c 0.3,-0.4 0.5,-0.5 0.9,-0.5 l 1.8,0 c 0.2,0 0.3,0.1 0.3,0.2 0,0.1 -0.1,0.2 -0.3,0.5 L 69.2,6.8 Z" fill="#004787" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'kb',
                                                        name: 'KB',
                                                        icon: (
                                                            <svg viewBox="0 0 1097.393 430.513" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-2">
                                                                <rect fill="#E3233D" width="430.518" height="219.575" />
                                                                <rect y="215.269" width="430.518" height="215.244" fill="#000000" />
                                                                <rect x="75.234" y="202.178" fill="#FFFFFF" width="280.088" height="26.187" />
                                                                <polygon points="560.547,344.438 560.547,87.549 608.154,87.549 608.154,207.422 737.295,87.549 795.859,87.549 662.949,211.196 801.338,344.438 737.295,344.438 608.154,219.771 608.154,344.438" fill="#000000" />
                                                                <path d="M1061.768,211.196c22.607,11.641,35.625,33.213,35.625,57.891 c0,42.48-30.82,75.352-89.746,75.352H837.412V87.539h169.209c47.275,0,81.514,28.77,81.514,72.28 C1088.135,182.08,1078.545,198.179,1061.768,211.196 M1009.365,193.379c21.572,0,31.504-15.068,31.504-31.157 c0-17.813-11.309-32.202-34.248-32.202H884.678v63.359H1009.365z M1048.066,269.087c0-21.582-11.309-33.223-35.625-33.223H884.678 v66.094h121.943C1035.049,301.958,1048.066,289.634,1048.066,269.087" fill="#000000" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'csob',
                                                        name: 'ČSOB',
                                                        icon: (
                                                            <svg viewBox="0 0 100 79" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-2">
                                                                <path fill="#003366" d="L23.689,59.631c0,6.121,5.022,7.174,8.69,7.941c1.98,0.416,3.545,0.744,3.545,1.684 c0,0.984-1.902,1.334-3.684,1.334c-2.704,0-5.575-0.566-7.877-1.555l-0.441-0.191v6.953l0.243,0.059 c3.379,0.801,6.272,1.143,9.676,1.143c3.503,0,11.652-0.814,11.652-8.361c0-6.105-5.054-7.105-8.744-7.836 c-1.951-0.387-3.492-0.691-3.492-1.582c0-1.115,1.778-1.264,3.518-1.264c2.298,0,4.647,0.408,6.794,1.184l0.425,0.152V52.43 l-0.251-0.053c-2.534-0.535-5.292-0.832-7.768-0.832C27.823,51.545,23.689,54.266,23.689,59.631z M46.227,64.271 c0,8.207,4.694,12.727,13.22,12.727c8.589,0,13.319-4.52,13.319-12.727c0-8.088-4.854-12.727-13.319-12.727 C51.045,51.545,46.227,56.184,46.227,64.271z M56.195,64.271c0-4.191,1.094-6.316,3.251-6.316c2.919,0,3.311,3.607,3.351,6.322 c-0.039,3.049-0.334,6.313-3.351,6.313C57.259,70.59,56.195,68.523,56.195,64.271z M74.652,51.959h-0.316v24.627h13.819 c5.135,0,9.886-0.846,9.886-6.986c0-2.213-1.667-4.707-4.497-5.545c2.757-1.016,4.064-2.896,4.064-5.867 c0-4.018-2.955-6.229-8.319-6.229H74.652z M85.455,66.721c2.114,0,3.018,0.635,3.018,2.123c0,2.002-2.361,2.158-3.085,2.158 c0,0-1.543,0-2.017,0c0-0.516,0-3.766,0-4.281C83.849,66.721,85.455,66.721,85.455,66.721z M85.488,57.129 c1.825,0,2.751,0.68,2.751,2.021c0,1.641-1.604,1.986-2.951,1.986c0,0-1.45,0-1.917,0c0-0.51,0-3.498,0-4.008 C83.851,57.129,85.488,57.129,85.488,57.129z M9.253,47.57l-2.784,2.557l0.207,0.176c0.072,0.063,1.631,1.365,4.172,2.059 c-5.584,1.654-8.889,5.914-8.889,11.566c0,8.016,5.433,12.996,14.179,12.996c2.879,0,5.679-0.744,6.469-0.973l0.175-0.051v-6.885 l-0.323,0.115c-1.744,0.625-3.254,0.914-4.754,0.914c-3.836,0-6.126-2.234-6.126-5.98c0-3.561,2.463-5.773,6.427-5.773 c1.5,0,2.997,0.424,4.392,0.883l0.317,0.104v-6.859l-0.672-0.127c-1.2-0.225-2.209-0.41-3.279-0.529 c1.932-0.857,3.212-2.025,3.843-2.703l0.183-0.197l-1.069-0.811l-0.149,0.162c-0.02,0.023-2.017,2.164-5.721,2.127 c-3.931-0.039-6.224-2.719-6.246-2.746l-0.163-0.195L9.253,47.57z" />
                                                                <path fill="#0099CC" d="M34.215,18.182c0-8.935,7.244-16.179,16.18-16.179s16.18,7.244,16.18,16.179 s-7.244,16.179-16.18,16.179S34.215,27.117,34.215,18.182z M62.328,31.271c-3.083,3.342-8.519,6.685-15.493,6.685 c-5.411,0-10.07-2.104-13.034-4.441c-17.664,1.854-30.8,4.481-30.8,4.481v7.153l93.616-0.01l0.009-14.748 C96.626,30.391,80.652,30.292,62.328,31.271z" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'airbank',
                                                        name: 'Air Bank',
                                                        icon: (
                                                            <svg viewBox="0 0 140 56" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-2">
                                                                <path fill="#000" d="M5.73 14.56a2.79 2.79 0 0 0 2.88 2.88 3.37 3.37 0 0 0 2.52-1.16c1-1.28 1.12-2.84 1.12-5-3.8-.32-6.52.88-6.52 3.28zm7.26 6.24a15.73 15.73 0 0 1-.19-2.76 6.72 6.72 0 0 1-6 3.24c-2.92 0-4.24-.84-5-1.6a6.26 6.26 0 0 1-1.76-4.44 6.72 6.72 0 0 1 4.28-6.28c2.49-1.12 6-1.12 8-1.12a7.88 7.88 0 0 0-.28-2.68A2.74 2.74 0 0 0 9.4 3.48 2.7 2.7 0 0 0 7.16 4.6a3 3 0 0 0-.44 1.8H.92A5.65 5.65 0 0 1 3.2 1.64 10.55 10.55 0 0 1 9.32 0c1.68 0 5.2.28 7.2 2.6a8 8 0 0 1 1.4 5v8.12a24.44 24.44 0 0 0 .39 5.12h-5.28l-.04-.04zM21.77.52h5.92V20.8h-5.92V.52zm15.4 3.88L37.05.52h-5.56c.12 1.16.28 4.08.28 5v15.29h5.96v-10c0-2.52.36-5.6 6.36-5V.49c-4.8-.24-6.12 2.2-6.88 3.92l-.04-.01zM64.4 20.62a6.82 6.82 0 0 0-5.72 2.72v-8.86h-5.95v26.63h5.72c.12-1.24.16-2.11.2-2.75a6.57 6.57 0 0 0 6.08 3.15c4 0 8.44-2.64 8.44-10.2 0-6.8-3.88-10.68-8.8-10.68l.03-.01zm-1.35 16.89c-2.68 0-4.64-2.16-4.64-6.67 0-1.25 0-6.12 4.37-6.12s4.36 5.22 4.36 6.78c0 1 0 6-4.08 6l-.01.01zm29.96-9.6a8 8 0 0 0-1.4-5c-2-2.32-5.52-2.6-7.2-2.6a10.55 10.55 0 0 0-6.12 1.64 5.65 5.65 0 0 0-2.28 4.76h5.8a3 3 0 0 1 .44-1.8 2.7 2.7 0 0 1 2.24-1.12 2.74 2.74 0 0 1 2.64 1.68c.246.87.34 1.777.28 2.68-2 0-5.52 0-8 1.12a6.72 6.72 0 0 0-4.28 6.28 6.26 6.26 0 0 0 1.76 4.44c.8.76 2.12 1.6 5 1.6a6.73 6.73 0 0 0 6-3.24c-.03.923.024 1.847.16 2.76h5.31a24.39 24.39 0 0 1-.39-5.12l.04-8.08zm-6.72 8.72a3.35 3.35 0 0 1-2.52 1.16 2.79 2.79 0 0 1-2.88-2.88c0-2.4 2.72-3.6 6.52-3.28 0 2.16-.08 3.72-1.12 5zm29.05-12.49c-.52-1.4-2.2-3.8-6.16-3.8a7 7 0 0 0-6.57 3.52l-.16-3h-5.72c.12 1.4.12 3.6.12 3.68v16.57h6V29.44a5.55 5.55 0 0 1 .72-3.08 3.68 3.68 0 0 1 3.08-1.56 3.07 3.07 0 0 1 2.88 1.72 4.76 4.76 0 0 1 .32 2.2v12.39h6V30.18c0-3.76-.12-4.8-.56-6l.05-.04z" />
                                                                <path fill="#9C3" d="M51.12.51L29.85 41.08h6.16L57.28.51h-6.16" />
                                                                <path fill="#000" d="M138.44 20.82h-6.69l-6.09 8.4V14.4h-5.88v26.71h5.88V30.1l6.25 11.01h7l-7.37-11.52 6.9-8.77" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'fio',
                                                        name: 'Fio',
                                                        icon: (
                                                            <svg viewBox="0 0 205 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-2">
                                                                <polygon fill="#00408A" points="53.1,70 4.8,53.4 52.9,36.8" />
                                                                <polygon fill="#00408A" points="99.9,20.6 153,2.2 153,104.5 99.7,86.1 142.2,71.5 142.2,35.1" />
                                                                <polygon fill="#00408A" points="41.4,67.9 41.4,106.7 97.8,87.1 154.2,67.9 197.1,53.8 154.2,39.9 97.9,20.3 41.3,0.9 41.3,39.9" />
                                                                <polygon fill="#00408A" points="238.5,26.4 279.6,26.4 279.6,37.7 253.7,37.7 253.7,47.8 270.7,47.8 270.7,58.9 253.7,58.9 253.7,80.3 238.5,80.3" />
                                                                <path fill="#00408A" d="M283.6,42.3h13.2v38h-13.2V42.3z M283.6,26.4h13.2v10.9h-13.2V26.4z" />
                                                                <path fill="#00408A" d="M306.7,42.3h13.2v38h-13.2V42.3z M306.7,26.4h13.2v10.9h-13.2V26.4z" />
                                                                <path fill="#00408A" d="M344.8,42.3c0-4.1,3.4-7.5,7.6-7.5s7.6,3.4,7.6,7.5v22.8c0,4.1-3.4,7.5-7.6,7.5s-7.6-3.4-7.6-7.5V42.3z M353.6,42.3c0-1.4-0.5-2.5-1.2-2.5s-1.2,1.1-1.2,2.5v22.8c0,1.4,0.5,2.5,1.2,2.5s1.2-1.1,1.2-2.5V42.3z" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'raiffeisen',
                                                        name: 'RB',
                                                        icon: (
                                                            <svg viewBox="-8 -3 69 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-2">
                                                                <rect fill="#fee600" width="52.9" height="52.9" transform="translate(0,2.5)" />
                                                                <path fill="#000" d="m 26.4,35.3 15.9,15.9 6.2,-6.2 -15.9,-15.9 3.1,-3.1 v -6.2 l 2.2,-2.2 v 5.1 l 2.2,2.1 7.8,-7.8 2.1,2.1 a 13.92,13.92 0 0 0 -4.1,-9.5 6.7,6.7 0 0 0 -9.7,-0.3 l -7.5,7.5 1.9,1.9 -4.1,4.1 -4.1,-4.1 1.9,-1.9 -7.5,-7.5 a 6.62,6.62 0 0 0 -9.7,0.3 13.66,13.66 0 0 0 -4,9.5 l 2,-2.1 7.8,7.8 2.2,-2.2 v -5.1 l 2.2,2.2 v 6.2 l 3.1,3.1 -16,15.8 6.2,6.2 z" />
                                                                <path d="M71.79 5.19a9 9 0 0 0-0.89 0H61.69V28.9h6.1V19.8l5.89 9.1h6.01l-7.5-9.7a6.21 6.21 0 0 0 3.9-2.39 6.68 6.68 0 0 0 1.29-4.3 6.64 6.64 0 0 0-2.39-5.5 9 9 0 0 0-5-1.8z" fill="#000000" />
                                                                <path d="M102.5 5.19h-6.1v23.71h12.5c4.8 0 8.5-3.3 8.5-7.9 0-4.1-3.2-6.5-7.1-6.5h-7.8V5.19zm6.4 12.31h-6.4v-8.12h6.4c2.5 0 3.8 1.4 3.8 4.1 0 2.7-1.3 4.02-3.8 4.02z" fill="#000000" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'moneta',
                                                        name: 'Moneta',
                                                        icon: (
                                                            <svg viewBox="5 0 95 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-2">
                                                                <path fill="#EF4036" d="m15.9 26.3 14 13.5-14 13.5v-27zm43.2-14.7-24.6 23.8-24.4-23.6v56.1l24.3-23.5 4.7-4.4 14-13.5v27l-9.4-9-4.5 4.4 20.3 19.6v-56.8z" />
                                                                <path fill="#140757" d="M120 20h10v40h-10zM150 20h10l20 30V20h10v40h-10l-20-30v30h-10z" />
                                                            </svg>
                                                        )
                                                    },
                                                    {
                                                        id: 'mbank',
                                                        name: 'mBank',
                                                        icon: (
                                                            <svg viewBox="0 0 128 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full p-2">
                                                                <path fill="#AE0000" d="M71.68 0h22.398v48H71.68z" />
                                                                <path fill="#FF8600" d="M37.105 0h34.574v48H37.105z" />
                                                                <path fill="#0065B1" d="M94.084 0h2.56v48h-2.56z" />
                                                                <path fill="#E90A0A" d="M0 0h33.266v48H0z" />
                                                                <path fill="#008F20" d="M96.64 0H128v48H96.64z" />
                                                                <path fill="#FFFFFF" d="M39.755 25.247v8.673h-4.393v-8c0-2.45-1.1-3.577-2.873-3.577-1.971 0-3.351 1.268-3.351 3.971v7.6h-4.393v-8c0-2.45-1.041-3.577-2.872-3.577-1.944 0-3.323 1.268-3.323 3.971v7.6h-4.393V22.149h-1.69V18.77h5.21l.225 2.338a6.02 6.02 0 0 1 5.21-2.563 5.66 5.66 0 0 1 4.988 2.478 6.81 6.81 0 0 1 5.463-2.478c3.6 0 6.2 2.084 6.2 6.7" />
                                                                <path fill="#FFFFFF" d="M125.1 33.91h-4.98l-4.28-6.56h-2.02v6.56h-4.39v-20.9h4.39v10.98h2.02l4.05-5.23h4.9l-5.15 6.64z" />
                                                            </svg>
                                                        )
                                                    }
                                                ].map(bank => (
                                                    <button
                                                        key={bank.id}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, subMethod: bank.id }))}
                                                        className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all aspect-square justify-center shadow-sm overflow-hidden ${formData.subMethod === bank.id ? 'border-primary bg-primary/20 ring-4 ring-primary/20 scale-105' : 'border-border bg-white hover:border-primary/40 hover:scale-[1.02]'}`}
                                                    >
                                                        <div className="flex-1 w-full flex items-center justify-center p-0.5 min-h-0">
                                                            {bank.icon}
                                                        </div>
                                                        <span className="text-[9px] font-bold uppercase tracking-wider truncate w-full text-center text-foreground/70 pb-1">{bank.name}</span>
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
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-full h-full object-contain"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = getFallbackImage(item);
                                                }}
                                            />
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
                                    {(() => {
                                        const isFreeShipping = cartTotal >= 1500 || cart.some(item => item.pack === 21);
                                        return isFreeShipping ? (
                                            <span className="text-lime font-bold uppercase">ZDARMA</span>
                                        ) : (
                                            <span className="font-bold">79 Kč</span>
                                        );
                                    })()}
                                </div>
                                <div className="pt-4 mt-2 border-t-2 border-primary flex justify-between items-end">
                                    <span className="font-display font-bold text-xl uppercase italic">Celkem</span>
                                    <span className="font-bold">
                                        {(() => {
                                            const isFreeShipping = cartTotal >= 1500 || cart.some(item => item.pack === 21);
                                            const shippingCost = (formData.deliveryMethod === 'zasilkovna' && !isFreeShipping) ? 79 : 0;
                                            return cartTotal + shippingCost;
                                        })()} Kč
                                    </span>
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

            {/* Redirection Overlay */}
            {isRedirecting && (
                <div className="fixed inset-0 z-[150] bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
                    <div className="max-w-md w-full space-y-8">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse-glow" />
                            <div className="bg-white p-6 rounded-[2rem] shadow-2xl relative">
                                <CreditCard className="w-16 h-16 mx-auto text-primary" />
                                <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden mt-6">
                                    <motion.div
                                        className="h-full bg-primary"
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 2.2, ease: "easeInOut" }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Ověřování spojení...</h2>
                            <p className="text-muted-foreground font-medium">Přesměrováváme vás na zabezpečenou platební bránu Stripe.</p>
                        </div>
                        <div className="flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                            <Lock size={12} /> SSL ENCRYPTED CONNECTION
                        </div>
                    </div>
                </div>
            )}

            )}
        </main>
    );
};

export default CheckoutPage;
