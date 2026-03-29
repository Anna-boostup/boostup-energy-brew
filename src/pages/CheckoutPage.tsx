// Force redeploy - Final Merged Production Version (Loveble Design + Development Logic)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useCart } from '@/context/CartContext';
import { useInventory, Order } from '@/context/InventoryContext';
import {
  ArrowLeft, ShoppingBag, CreditCard, Truck, CheckCircle,
  Loader2, Package, FileText, ChevronLeft, MapPin,
  Minus, Plus, Trash2, Lock, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import PacketaWidget from '@/components/PacketaWidget';
import { useToast } from '@/hooks/use-toast';
import { StripePaymentModal } from '@/components/stripe/StripePaymentModal';

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
  const hasSubscription = cart.some(item => item.subscriptionInterval);
  const { addOrder, decrementStock, getStock } = useInventory();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Payment States
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);

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

    deliveryMethod: 'personal',
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
        requiredStock.lemon = (requiredStock.lemon || 0) + (item.mixConfiguration.lemon || 0) * item.quantity;
        requiredStock.red = (requiredStock.red || 0) + (item.mixConfiguration.red || 0) * item.quantity;
        requiredStock.silky = (requiredStock.silky || 0) + (item.mixConfiguration.silky || 0) * item.quantity;
      } else if (item.flavor) {
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

      const orderNumber = `BUP${Math.floor(Date.now() / 1000)}`;

      // 2. Decrement Stock
      Object.entries(requiredStock).forEach(([flavor, amount]) => {
        if (amount > 0) decrementStock(flavor, amount);
      });

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
        items: cart.map(item => {
          const finalPrice = item.subscriptionInterval ? item.price * 0.85 : item.price;
          return {
            sku: item.flavorMode === 'mix' ? `mix-${item.pack}` : `${item.flavor}-${item.pack}`,
            name: item.name,
            quantity: item.quantity,
            price: parseFloat(finalPrice.toFixed(2)),
            mixConfiguration: item.mixConfiguration
          };
        }),
        total: cartTotal + shippingCost,
        status: 'pending',
        is_subscription_order: cart.some(item => !!item.subscriptionInterval)
      };

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

      const isSubscription = cart.some(item => item.subscriptionInterval);
      
      // Manual Bank Transfer
      if (formData.paymentMethod === 'transfer_manual') {
        clearCart();
        const finalTotal = cartTotal + shippingCost;
        sendOrderConfirmationEmail(
          formData.email,
          orderNumber,
          `${formData.firstName} ${formData.lastName}`,
          newOrder.items,
          finalTotal
        );
        navigate(`/payment/success?paymentId=TRANSFER-${orderNumber}&orderNumber=${orderNumber}&amount=${finalTotal}&status=pending`);
        return;
      }

      // Stripe (FOR SUBSCRIPTIONS)
      if (isSubscription) {
        setPendingOrder(newOrder);
        setIsRedirecting(true);
        try {
          const stripeRes = await fetch('/api/create-stripe-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderNumber: newOrder.id,
              customerEmail: formData.email,
              total: newOrder.total,
              items: newOrder.items
            }),
          });

          const stripeData = await stripeRes.json();
          if (stripeRes.ok && stripeData.url) {
            window.location.href = stripeData.url;
            return;
          } else {
            throw new Error(stripeData.error || 'Nepodařilo se vytvořit Stripe relaci');
          }
        } catch (stripeError: any) {
          toast({
            title: "Chyba předplatného",
            description: stripeError.message || "Nepodařilo se inicializovat Stripe Checkout.",
            variant: "destructive"
          });
          setIsProcessing(false);
          setIsRedirecting(false);
          return;
        }
      }

      // GoPay (FOR REGULAR CARD/FAST TRANSFER)
      setPendingOrder(newOrder);
      setIsRedirecting(true);
      try {
        const gopayRes = await fetch('/api/create-gopay-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber: newOrder.id,
            customerEmail: formData.email,
            customerName: `${formData.firstName} ${formData.lastName}`.trim(),
            total: newOrder.total,
            items: newOrder.items.map(item => ({
              ...item,
              name: item.name.replace(/[^\x00-\xFF\u0100-\u017F]/g, '').trim()
            }))
          }),
        });

        const gopayData = await gopayRes.json();
        if (gopayRes.ok && gopayData.gw_url) {
          window.location.href = gopayData.gw_url;
          return;
        } else {
          throw new Error(gopayData.error || 'Nepodařilo se vytvořit GoPay platbu');
        }
      } catch (gopayError: any) {
        toast({
          title: "Chyba platby",
          description: gopayError.message || "Nepodařilo se inicializovat platební bránu GoPay.",
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
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary hover:text-primary transition-colors font-bold mb-6 group"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
              <ArrowLeft size={16} />
            </div>
            <span className="uppercase tracking-widest text-[10px] font-black">Zpět k výběru balení</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-foreground leading-none tracking-tighter uppercase">
                DOKONČENÍ <br />
                <span className="text-gradient-energy italic">NÁKUPU</span>
              </h1>
              <p className="text-foreground/60 mt-4 font-medium uppercase tracking-[0.2em] text-[10px]">
                Zabezpečená pokladna / Doručení do 48 hodin
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-card/50 backdrop-blur-sm border border-border p-4 rounded-3xl">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-card bg-secondary flex items-center justify-center text-[10px] font-bold">
                    {i === 1 ? <CheckCircle className="w-5 h-5 text-primary" /> : i}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">Krok 3 ze 3</div>
                <div className="text-xs font-black uppercase tracking-tight">Potvrzení objednávky</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Personal Info */}
              <div className="bg-card rounded-[2.5rem] p-6 sm:p-10 border border-border relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-16 -translate-y-16" />
                
                <div className="flex flex-wrap justify-between items-start gap-4 mb-10">
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-display font-black flex items-center gap-3 uppercase tracking-tight">
                      <Truck className="w-7 h-7 text-primary" />
                      Doprava a kontakt
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest ml-10">Zadejte své doručovací údaje</p>
                  </div>

                  <div className="flex bg-secondary/30 p-1 rounded-2xl border border-border/50 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isCompany: false }))}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!formData.isCompany ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Osobní
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isCompany: true }))}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.isCompany ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      Firemní
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                  {formData.isCompany && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="md:col-span-2 grid md:grid-cols-3 gap-6 p-6 rounded-3xl bg-secondary/20 border border-primary/10 mb-2"
                    >
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">Název společnosti *</label>
                        <input
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Např. BoostUp Energy s.r.o."
                          className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.companyName ? 'border-destructive/50 ring-2 ring-destructive/10' : 'border-border focus:border-primary shadow-sm'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">IČO *</label>
                        <input
                          name="ico"
                          value={formData.ico}
                          onChange={handleChange}
                          placeholder="12345678"
                          className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.ico ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm'}`}
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Jméno *</label>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Jan"
                      className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.firstName ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm hover:border-border/80'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Příjmení *</label>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Novák"
                      className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.lastName ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm hover:border-border/80'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Emailová adresa *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jan.novak@seznam.cz"
                      className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.email ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm hover:border-border/80'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Telefonní kontakt *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.phone ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm hover:border-border/80'}`}
                    />
                  </div>

                  <div className="md:col-span-2 grid grid-cols-6 gap-6">
                    <div className="col-span-4 space-y-2">
                      <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Ulice</label>
                      <input
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="Vodní"
                        className="w-full bg-background/50 border-2 border-border rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold shadow-sm"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Č. popisné *</label>
                      <input
                        name="houseNumber"
                        value={formData.houseNumber}
                        onChange={handleChange}
                        placeholder="12/A"
                        className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.houseNumber ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm'}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Město / Obec *</label>
                    <input
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Praha"
                      className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.city ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Poštovní směrovací č. *</label>
                    <input
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      placeholder="110 00"
                      className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.zip ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm'}`}
                    />
                  </div>
                </div>
              </div>

              {/* 2. Billing Address */}
              <div className="bg-card rounded-[2.5rem] p-6 sm:p-10 border border-border shadow-2xl">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-display font-black flex items-center gap-3 uppercase tracking-tight">
                      <FileText className="w-7 h-7 text-primary" />
                      Fakturační údaje
                    </h2>
                  </div>

                  <div className="flex items-center space-x-3 bg-secondary/30 p-3 rounded-2xl border border-border/50">
                    <Checkbox
                      id="billingSame"
                      checked={billingSameAsDelivery}
                      onCheckedChange={(checked) => setBillingSameAsDelivery(checked as boolean)}
                      className="w-5 h-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="billingSame" className="font-bold cursor-pointer text-xs uppercase tracking-widest">Stejné jako doručovací</Label>
                  </div>
                </div>

                {!billingSameAsDelivery && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 pt-4 border-t border-border/10">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 grid grid-cols-6 gap-6">
                        <div className="col-span-4 space-y-2">
                          <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Ulice</label>
                          <input
                            name="billingStreet"
                            value={formData.billingStreet}
                            onChange={handleChange}
                            className="w-full bg-background/50 border-2 border-border rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold"
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Č.p. *</label>
                          <input
                            name="billingHouseNumber"
                            value={formData.billingHouseNumber}
                            onChange={handleChange}
                            className="w-full bg-background/50 border-2 border-border rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">Město *</label>
                        <input
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleChange}
                          className="w-full bg-background/50 border-2 border-border rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">PSČ *</label>
                        <input
                          name="billingZip"
                          value={formData.billingZip}
                          onChange={handleChange}
                          className="w-full bg-background/50 border-2 border-border rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 3. Delivery Method */}
              <div className="bg-card rounded-[2.5rem] p-6 sm:p-10 border border-border shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-display font-black flex items-center gap-3 uppercase tracking-tight mb-8">
                  <MapPin className="w-7 h-7 text-primary" />
                  Způsob dopravy
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'personal', name: 'Osobní odběr', desc: 'Brno a Praha - Zdarma', icon: <MapPin className="w-5 h-5" /> },
                    { id: 'zasilkovna', name: 'Zásilkovna', desc: 'Přes 5000 výdejních míst', icon: <Box className="w-5 h-5" /> }
                  ].map((method) => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: method.id }))}
                      className={`relative p-6 rounded-[2rem] border-2 text-left transition-all group ${formData.deliveryMethod === method.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background/50 hover:border-primary/30'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${formData.deliveryMethod === method.id ? 'bg-primary text-black' : 'bg-secondary text-primary'}`}>
                          {method.icon || <Package size={24} />}
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight">{method.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{method.desc}</p>
                        </div>
                      </div>
                      {formData.deliveryMethod === method.id && <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-primary" />}
                    </button>
                  ))}
                </div>

                {formData.deliveryMethod === 'zasilkovna' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
                    {!selectedPoint ? (
                      <PacketaWidget 
                        onSelect={(point: any) => { 
                          setSelectedPoint(point); 
                          setFormData(prev => ({ ...prev, packetaPointId: point.id })); 
                        }} 
                      />
                    ) : (
                      <div className="bg-secondary/20 rounded-[2rem] p-6 border-2 border-primary/20 flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-black">
                            <MapPin size={24} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Vybrané výdejní místo</p>
                            <p className="font-black text-lg leading-tight">{selectedPoint.name}</p>
                            <p className="text-xs font-bold text-muted-foreground">{selectedPoint.street}, {selectedPoint.city}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => { setSelectedPoint(null); setFormData(prev => ({ ...prev, packetaPointId: '' })); }}
                          className="rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-destructive/10 hover:text-destructive"
                        >
                          Změnit
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* 4. Payment Method */}
              <div className="bg-card rounded-[2.5rem] p-6 sm:p-10 border border-border shadow-2xl">
                <h2 className="text-2xl md:text-3xl font-display font-black flex items-center gap-3 uppercase tracking-tight mb-8">
                  <CreditCard className="w-7 h-7 text-primary" />
                  Způsob platby
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <PaymentMethodCard 
                      id="card" 
                      name="Platební karta" 
                      sub={hasSubscription ? 'Stripe Checkout' : 'GoPay brána'}
                      active={formData.paymentMethod === 'card'} 
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                      icon={<CreditCard size={24} />}
                    />
                    <PaymentMethodCard 
                      id="transfer_manual" 
                      name="Bankovní převod" 
                      sub="Tradiční proforma"
                      active={formData.paymentMethod === 'transfer_manual'} 
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'transfer_manual' }))}
                      icon={<FileText size={24} />}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <PaymentMethodCard 
                      id="applepay" 
                      name="Apple Pay" 
                      sub="Rychlá platba"
                      active={formData.paymentMethod === 'applepay'} 
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'applepay' }))}
                      icon={<div className="font-black text-lg">ApplePay</div>}
                    />
                    <PaymentMethodCard 
                      id="googlepay" 
                      name="Google Pay" 
                      sub="Rychlá platba"
                      active={formData.paymentMethod === 'googlepay'} 
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'googlepay' }))}
                      icon={<div className="font-black text-lg">GooglePay</div>}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-black text-white rounded-[2.5rem] p-8 sm:p-10 border-4 border-primary shadow-[0_0_50px_-12px_rgba(234,255,0,0.3)] space-y-8 relative overflow-hidden">
               {/* Animated Pulse */}
              <div className="absolute inset-0 bg-primary/5 animate-pulse" />
              
              <div className="relative z-10">
                <h2 className="text-2xl font-display font-black flex items-center gap-3 uppercase italic tracking-tight mb-8 border-b border-white/10 pb-4">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  Shrnutí
                </h2>

                <div className="space-y-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-16 h-16 bg-white/10 rounded-2xl flex-shrink-0 flex items-center justify-center p-2 border border-white/5 group-hover:bg-white/20 transition-all">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).src = getFallbackImage(item); }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="font-black text-xs uppercase leading-tight truncate">{item.name}</p>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{item.quantity}x {item.price} Kč</p>
                      </div>
                      <div className="font-black text-sm self-center text-primary">{item.price * item.quantity} Kč</div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 space-y-4 border-t border-white/10 mt-8">
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 uppercase font-bold text-[10px] tracking-[0.2em]">Balení</span>
                    <span className="font-bold">{cartTotal} Kč</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/40 uppercase font-bold text-[10px] tracking-[0.2em]">Doprava</span>
                    {(() => {
                      const isFreeShipping = cartTotal >= 1500 || cart.some(item => item.pack === 21);
                      const shippingCost = (formData.deliveryMethod === 'zasilkovna' && !isFreeShipping) ? 79 : 0;
                      return <span className={`font-bold ${shippingCost === 0 ? 'text-primary' : ''}`}>{shippingCost === 0 ? 'ZDARMA' : `${shippingCost} Kč`}</span>;
                    })()}
                  </div>
                  
                  <div className="pt-6 border-t-2 border-primary flex justify-between items-end">
                    <div>
                      <span className="font-display font-black text-4xl uppercase italic leading-none block">CELKEM</span>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.3em]">včetně DPH</span>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-display font-black text-primary leading-none">
                        {(() => {
                          const isFreeShipping = cartTotal >= 1500 || cart.some(item => item.pack === 21);
                          const shippingCost = (formData.deliveryMethod === 'zasilkovna' && !isFreeShipping) ? 79 : 0;
                          return cartTotal + shippingCost;
                        })()}
                      </span>
                      <span className="text-lg font-black ml-1 text-primary">Kč</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={isProcessing || cart.length === 0}
                  className="w-full h-20 rounded-[1.5rem] mt-10 bg-primary text-black font-black text-xl uppercase italic shadow-[0_10px_40px_-10px_rgba(234,255,0,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin w-8 h-8" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="leading-none">Závazně objednat</span>
                      <span className="text-[10px] tracking-[0.2em] opacity-60 not-italic mt-1">SSL Zabezpečená platba</span>
                    </div>
                  )}
                </Button>

                <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale hover:opacity-60 hover:grayscale-0 transition-all cursor-default">
                  <Lock size={16} />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Connection</span>
                </div>
              </div>
            </div>
            
            <p className="mt-6 text-[10px] text-center text-muted-foreground leading-relaxed px-4">
              Odesláním objednávky souhlasíte s <a href="/obchodni-podminky" className="underline font-bold">obchodními podmínkami</a> a <a href="/ochrana-osobnich-udaju" className="underline font-bold">zásadami soukromí</a>.
            </p>
          </div>
        </div>
      </div>

      <StripePaymentModal
        clientSecret={clientSecret || ""}
        isOpen={isStripeModalOpen}
        onClose={() => {
          setIsStripeModalOpen(false);
          setIsProcessing(false);
        }}
        orderNumber={pendingOrder?.id || ""}
        amount={pendingOrder?.total || 0}
      />
    </main>
  );
};

// --- Sub-components for better readability ---

const Box = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
  </svg>
);

const PaymentMethodCard = ({ id, name, sub, active, onClick, icon }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative p-6 rounded-[2rem] border-2 text-left transition-all group h-32 flex flex-col justify-between ${active ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background/50 hover:border-primary/30'}`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-primary text-black' : 'bg-secondary text-primary group-hover:bg-primary/20'}`}>
      {icon}
    </div>
    <div className="mt-2">
      <p className="font-black uppercase tracking-tight text-sm leading-tight">{name}</p>
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{sub}</p>
    </div>
    {active && <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-primary" />}
  </button>
);

export default CheckoutPage;
