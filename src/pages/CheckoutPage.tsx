// Force redeploy - Final Merged Production Version (Loveble Design + Development Logic)
import React, { useState, useEffect, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useCart } from '@/context/CartContext';
import { useInventory, Order } from '@/context/InventoryContext';
import {
  ArrowLeft, ShoppingBag, CreditCard, Truck, CheckCircle,
  Loader2, Package, FileText, ChevronLeft, MapPin,
  Minus, Plus, Trash2, Lock, Sparkles, AlertCircle, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from '@/components/ui/button';
import PacketaWidget from '@/components/PacketaWidget';
import { useToast } from '@/hooks/use-toast';
import { StripePaymentModal } from '@/components/stripe/StripePaymentModal';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeExpressButtons from '@/components/stripe/StripeExpressButtons';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

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

import { useContent } from '@/context/ContentContext';

const CheckoutPage = () => {
  const { content } = useContent();
  const isSalesEnabled = content.isSalesEnabled !== false;
  const { cart, cartTotal, discountAmount, appliedPromoCode, applyPromoCode, removePromoCode, clearCart } = useCart();
  const hasSubscription = cart.some(item => item.subscriptionInterval);
  const { addOrder, decrementStock, getStock } = useInventory();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [promoInput, setPromoInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);

  // Payment States
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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

    // Immediately pre-fill guaranteed email to prevent UI race conditions
    if (user.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email || '' }));
    }

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
          email: data.email || user.email || prev.email,
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
      'firstName', 'lastName', 'email', 'phone', 'street', 'houseNumber', 'city', 'zip'
    ];

    const fieldLabels: Record<string, string> = {
      firstName: 'Jméno',
      lastName: 'Příjmení',
      email: 'Email',
      phone: 'Telefon',
      houseNumber: 'Číslo popisné',
      city: 'Město',
      zip: 'PSČ',
      street: 'Ulice',
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
        description: `Prosím vyplňte: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }

    // Calculate total required bottles per base flavor
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
          // Stock is tracked at bottle level; multiply packs × pack size
          requiredStock[flavorKey] = (requiredStock[flavorKey] || 0) + item.quantity * (item.pack ?? 1);
        }
      }
    });

    // 1. Stock Check (bottle level per flavor)
    for (const [flavorKey, amount] of Object.entries(requiredStock)) {
      if (amount > 0 && getStock(flavorKey) < amount) {
        toast({
          title: "Chyba objednávky",
          description: `Nedostatek skladových zásob pro příchuť ${flavorKey.toUpperCase()}. Chybí ${(amount - getStock(flavorKey))} ks lahviček.`,
          variant: "destructive"
        });
        return;
      }
    }

    startTransition(() => {
      setIsProcessing(true);
    });
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
      for (const [flavor, amount] of Object.entries(requiredStock)) {
        if (amount > 0) {
          await decrementStock(flavor, amount);
        }
      }

      const isFreeShipping = cartTotal >= 1500 || cart.some(item => item.pack === 21);
      const shippingCost = (formData.deliveryMethod === 'zasilkovna' && !isFreeShipping) ? 79 : 0;

      // 3. Create Order Record
      const newOrder: Order = {
        id: orderNumber,
        date: new Date().toISOString(),
        customer: {
          name: `${formData.firstName || ''} ${formData.lastName || ''}`.trim() || formData.email,
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
        startTransition(() => {
          setIsProcessing(false);
        });
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
            clearCart();
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
          startTransition(() => {
            setIsProcessing(false);
            setIsRedirecting(false);
          });
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
        if (gopayRes.ok && gopayData.gw_url && gopayData.id) {
          // Store GoPay payment ID in the order metadata for sync
          const { supabase } = await import('@/lib/supabase');
          await supabase.from('orders').update({
            delivery_info: {
              ...newOrder.delivery_info,
              gopayPaymentId: gopayData.id
            }
          }).eq('id', newOrder.id);
          
          clearCart();
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
        startTransition(() => {
          setIsProcessing(false);
          setIsRedirecting(false);
        });
      }

    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Technická chyba",
        description: "Při zpracování objednávky došlo k chybě.",
        variant: "destructive"
      });
      startTransition(() => {
        setIsProcessing(false);
      });
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
        <div className="mb-12 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8">
            <button
              onClick={() => navigate('/', { replace: true })}
              className="flex items-center gap-2 text-primary hover:text-primary transition-colors font-bold group"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                <ArrowLeft size={16} />
              </div>
              <span className="uppercase tracking-widest text-[10px] font-black">{content.checkout.backToCart}</span>
            </button>

            <div className="w-px h-4 bg-border hidden sm:block" />

            <button
              onClick={() => {
                clearCart();
                navigate('/', { replace: true });
              }}
              className="flex items-center gap-2 text-destructive hover:scale-105 transition-all font-bold group"
            >
              <X size={14} className="text-destructive" />
              <span className="uppercase tracking-widest text-[10px] font-black">{content.checkout.cancelOrder}</span>
            </button>
          </div>
        </div>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-7xl font-display font-black text-foreground leading-none tracking-tighter uppercase">
                {content.checkout.titleLine1} <br />
                <span className="text-gradient-energy italic pr-4 inline-block pb-2">{content.checkout.titleLine2}</span>
              </h1>
              <p className="text-foreground/60 mt-4 font-medium uppercase tracking-[0.2em] text-[10px]">
                {content.checkout.subTitle}
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
                <div className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">{content.checkout.steps.stepCount}</div>
                <div className="text-xs font-black uppercase tracking-tight">{content.checkout.steps.confirmation}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <div className="lg:col-span-8 space-y-6">
            {/* Express Checkout Section */}
            <Elements stripe={stripePromise}>
              <StripeExpressButtons />
            </Elements>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. Personal Info */}
              <div className="bg-card rounded-[2.5rem] p-6 sm:p-10 border border-border relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full translate-x-16 -translate-y-16" />
                
                <div className="flex flex-wrap justify-between items-start gap-4 mb-10">
                  <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-display font-black flex items-center gap-3 uppercase tracking-tight">
                      <Truck className="w-7 h-7 text-primary" />
                      {content.checkout.personalInfo.title}
                    </h2>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest ml-10">{content.checkout.personalInfo.description}</p>
                  </div>

                  <div className="flex bg-secondary/30 p-1 rounded-2xl border border-border/50 backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isCompany: false }))}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!formData.isCompany ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {content.checkout.personalInfo.mode_personal}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isCompany: true }))}
                      className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.isCompany ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {content.checkout.personalInfo.mode_company}
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                  {formData.isCompany && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="md:col-span-2 grid md:grid-cols-4 gap-6 p-6 rounded-3xl bg-secondary/20 border border-primary/10 mb-2"
                    >
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">{content.checkout.personalInfo.companyName} *</label>
                        <input
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="Např. BoostUp Energy s.r.o."
                          className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.companyName ? 'border-destructive/50 ring-2 ring-destructive/10' : 'border-border focus:border-primary shadow-sm'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">{content.checkout.personalInfo.ico} *</label>
                        <input
                          name="ico"
                          value={formData.ico}
                          onChange={handleChange}
                          placeholder="12345678"
                          className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.ico ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-1">{content.checkout.personalInfo.dic}</label>
                        <input
                          name="dic"
                          value={formData.dic}
                          onChange={handleChange}
                          placeholder="CZ12345678"
                          className="w-full bg-background/50 border-2 border-border rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold shadow-sm"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">{content.checkout.personalInfo.firstName} *</label>
                    <input
                      name="firstName"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Jan"
                      className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.firstName ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm hover:border-border/80'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">{content.checkout.personalInfo.lastName} *</label>
                    <input
                      name="lastName"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Novák"
                      className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.lastName ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm hover:border-border/80'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">{content.checkout.personalInfo.email} *</label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jan.novak@seznam.cz"
                      className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.email ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm hover:border-border/80'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">{content.checkout.personalInfo.phone} *</label>
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
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
                        autoComplete="address-line1"
                        value={formData.street}
                        onChange={handleChange}
                        placeholder="Vodní"
                        className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.street ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm hover:border-border/80'}`}
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">{content.checkout.address.houseNumber} *</label>
                      <input
                        name="houseNumber"
                        autoComplete="address-line2"
                        value={formData.houseNumber}
                        onChange={handleChange}
                        placeholder="12/A"
                        className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.houseNumber ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm'}`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">{content.checkout.address.city} *</label>
                    <input
                      name="city"
                      autoComplete="address-level2"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Praha"
                      className={`w-full bg-background/50 border-2 rounded-2xl px-5 py-4 outline-none transition-all font-bold ${errors.city ? 'border-destructive/50' : 'border-border focus:border-primary shadow-sm'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">{content.checkout.address.zip} *</label>
                    <input
                      name="zip"
                      autoComplete="postal-code"
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
                      {content.checkout.address.title}
                    </h2>
                  </div>

                  <div className="flex items-center space-x-3 bg-secondary/30 p-3 rounded-2xl border border-border/50">
                    <Checkbox
                      id="billingSame"
                      checked={billingSameAsDelivery}
                      onCheckedChange={(checked) => setBillingSameAsDelivery(checked as boolean)}
                      className="w-5 h-5 border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor="billingSame" className="font-bold cursor-pointer text-xs uppercase tracking-widest">{content.checkout.address.billingSame}</Label>
                  </div>
                </div>

                {!billingSameAsDelivery && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-6 pt-4 border-t border-border/10">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2 grid grid-cols-6 gap-6">
                        <div className="col-span-4 space-y-2">
                          <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">{content.checkout.address.street}</label>
                          <input
                            name="billingStreet"
                            value={formData.billingStreet}
                            onChange={handleChange}
                            className="w-full bg-background/50 border-2 border-border rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold"
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">{content.checkout.address.houseNumber} *</label>
                          <input
                            name="billingHouseNumber"
                            value={formData.billingHouseNumber}
                            onChange={handleChange}
                            className="w-full bg-background/50 border-2 border-border rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">{content.checkout.address.city} *</label>
                        <input
                          name="billingCity"
                          value={formData.billingCity}
                          onChange={handleChange}
                          className="w-full bg-background/50 border-2 border-border rounded-2xl px-5 py-4 focus:border-primary outline-none transition-all font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.2em] ml-1">{content.checkout.address.zip} *</label>
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
                  {content.checkout.delivery.title}
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'personal', name: 'Osobní vyzvednutí (Brno)', desc: 'Mendelova univerzita (po předchozí domluvě na e-mailu objednavky@drinkboostup.cz)', icon: <MapPin className="w-5 h-5" /> },
                    { id: 'zasilkovna', name: 'Zásilkovna', desc: 'Přes 5000 výdejních míst', icon: <Box className="w-5 h-5" /> }
                  ].map((method) => (
                    <button
                      key={method.id}
                      data-testid={`checkout-shipping-${method.id}`}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, deliveryMethod: method.id }))}
                      className={`relative p-6 rounded-[2rem] border-2 text-center flex flex-col items-center justify-center transition-all group min-h-[140px] ${formData.deliveryMethod === method.id ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background/50 hover:border-primary/30'}`}
                    >
                      <div className="flex flex-col items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${formData.deliveryMethod === method.id ? 'bg-primary text-black' : 'bg-secondary text-primary'}`}>
                          {method.icon || <Package size={24} />}
                        </div>
                        <div>
                          <p className="font-black uppercase tracking-tight">{method.name}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{method.desc}</p>
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
                        onPointSelected={(point: any) => { 
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
                          <div data-sentry-mask>
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{content.checkout.delivery.pickupPoint}</p>
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
                          {content.checkout.delivery.changePoint}
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
                  {content.checkout.payment.title}
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <PaymentMethodCard 
                      id="card" 
                      name={content.checkout.payment.method_card} 
                      sub={hasSubscription ? 'Stripe Checkout' : content.checkout.payment.method_card_sub}
                      active={formData.paymentMethod === 'card'} 
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
                      icon={<CreditCard size={24} />}
                    />
                    <PaymentMethodCard 
                      id="transfer_manual" 
                      name={content.checkout.payment.method_bank} 
                      sub={content.checkout.payment.method_bank_sub}
                      active={formData.paymentMethod === 'transfer_manual'} 
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'transfer_manual' }))}
                      icon={<FileText size={24} />}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <PaymentMethodCard 
                      id="applepay" 
                      name={content.checkout.payment.method_apple} 
                      sub={content.checkout.payment.method_apple_sub}
                      active={formData.paymentMethod === 'applepay'} 
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'applepay' }))}
                      icon={
                        <svg className="w-6 h-6" viewBox="0 0 384 512" fill="currentColor">
                          <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 48.6-.7 90.4-84.3 103.6-119.3-37-14.8-62.8-49.1-62.7-91.3zM206.5 95.7c21.8-27 38.3-64.4 34.1-100.3-30.8 1.4-71.8 20.8-95 48.4-20.2 23.9-39.1 62-34 98.6 34.1 2.5 69.8-19.6 94.9-46.7z"/>
                        </svg>
                      }
                    />
                    <PaymentMethodCard 
                      id="googlepay" 
                      name={content.checkout.payment.method_google} 
                      sub={content.checkout.payment.method_google_sub}
                      active={formData.paymentMethod === 'googlepay'} 
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'googlepay' }))}
                      icon={
                        <svg className="w-6 h-6" viewBox="0 0 488 512" fill="currentColor">
                          <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                        </svg>
                      }
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="bg-primary text-primary-foreground rounded-[2.5rem] p-8 sm:p-10 border-4 border-black/10 shadow-[0_0_50px_-12px_rgba(61,90,47,0.3)] space-y-8 relative overflow-hidden">
               {/* Animated Pulse */}
              <div className="absolute inset-0 bg-primary/5 animate-pulse" />
              
              <div className="relative z-10">
                <h2 className="text-2xl font-display font-black flex items-center gap-3 uppercase italic tracking-tight mb-8 border-b border-white/10 pb-4">
                  <ShoppingBag className="w-6 h-6 text-primary" />
                  {content.checkout.summaryTitle}
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
                        <p className="font-black text-sm uppercase leading-tight pr-2">{item.name}</p>
                        <p className="text-[11px] text-primary-foreground/70 font-bold uppercase tracking-widest mt-1">{item.quantity}x {item.price} Kč</p>
                      </div>
                      <div className="font-black text-sm self-center text-primary">{item.price * item.quantity} Kč</div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/10 mt-6">
                   {/* Promo code moved to Express section */}
                   {cart.some(item => item.subscriptionInterval) && !appliedPromoCode && (
                    <p className="text-[9px] text-white/40 mt-2 font-bold px-1 italic">
                      Pozn: Slevové kódy nelze kombinovat se slevou na předplatné.
                    </p>
                  )}
                </div>

                <div className="pt-8 space-y-4 border-t border-white/10 mt-8">
                  <div className="flex justify-between items-center opacity-70">
                    <span className="text-white/40 uppercase font-bold text-[10px] tracking-[0.2em]">{content.checkout.summary.subtotal}</span>
                    <span className="font-bold">{(cartTotal + discountAmount).toFixed(2)} Kč</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-primary">
                      <span className="uppercase font-bold text-[10px] tracking-[0.2em]">{content.checkout.summary.discount}</span>
                      <span className="font-bold italic">-{discountAmount.toFixed(2)} Kč</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-white/40 uppercase font-bold text-[10px] tracking-[0.2em]">{content.checkout.summary.shipping}</span>
                    {(() => {
                      const isFreeShipping = cartTotal >= 1500 || cart.some(item => item.pack === 21);
                      const shippingCost = (formData.deliveryMethod === 'zasilkovna' && !isFreeShipping) ? 79 : 0;
                      return <span className={`font-bold ${shippingCost === 0 ? 'text-primary' : ''}`}>{shippingCost === 0 ? content.checkout.delivery.free : `${shippingCost} Kč`}</span>;
                    })()}
                  </div>
                  
                  <div className="pt-6 border-t-2 border-primary-foreground/20 flex justify-between items-end">
                    <div>
                      <span className="font-display font-black text-4xl uppercase italic leading-none block">{content.checkout.summary.totalLabel}</span>
                      <span className="text-[10px] text-primary-foreground/60 font-bold uppercase tracking-[0.3em]">{content.checkout.summary.totalWithVat}</span>
                    </div>
                    <div className="text-right flex items-baseline">
                      <span className="text-4xl font-display font-black leading-none">
                        {(() => {
                          const isFreeShipping = cartTotal >= 1500 || cart.some(item => item.pack === 21);
                          const shippingCost = (formData.deliveryMethod === 'zasilkovna' && !isFreeShipping) ? 79 : 0;
                          return cartTotal + shippingCost;
                        })()}
                      </span>
                      <span className="text-xl font-black ml-2">Kč</span>
                    </div>
                  </div>
                </div>

                <Button
                  data-testid="checkout-submit-btn"
                  onClick={handleSubmit}
                  disabled={isProcessing || cart.length === 0 || !isSalesEnabled}
                  className={`w-full h-20 rounded-[1.5rem] mt-10 font-black text-xl uppercase italic shadow-[0_10px_40px_-5px_rgba(190,242,100,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] group ${
                    !isSalesEnabled ? 'bg-slate-200 text-slate-500 cursor-not-allowed shadow-none' : 'bg-[#bef264] text-black hover:bg-[#a3e635]'
                  }`}
                >
                  {isProcessing ? (
                    <Loader2 className="animate-spin w-8 h-8" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="leading-none">{!isSalesEnabled ? content.checkout.summary.salesDisabled : content.checkout.summary.submitButton}</span>
                      <span className="text-[10px] tracking-[0.2em] opacity-60 not-italic mt-1">
                        {!isSalesEnabled ? content.checkout.summary.salesDisabledSub : content.checkout.summary.submitButtonSub}
                      </span>
                    </div>
                  )}
                </Button>

                {!isSalesEnabled && (
                  <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div className="space-y-1 text-left">
                      <p className="text-sm font-bold text-red-800">{content.checkout.summary.salesDisabledAlert}</p>
                      <p className="text-xs text-red-700">{content.checkout.summary.salesDisabledDesc}</p>
                    </div>
                  </div>
                )}

                <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale hover:opacity-60 hover:grayscale-0 transition-all cursor-default">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Encrypted Connection</span>
                  </div>

                  {/* Express Checkout Section moved to top */}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-12">
              <p className="mt-12 text-[10px] text-center text-muted-foreground leading-relaxed px-4 max-w-2xl mx-auto">
                {content.checkout.summary.legalConsent} <a href="/obchodni-podminky" className="underline font-bold">{content.checkout.summary.terms}</a> a <a href="/ochrana-osobnich-udaju" className="underline font-bold">{content.checkout.summary.privacy}</a>.
              </p>
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
    data-testid={`checkout-payment-${id}`}
    type="button"
    onClick={onClick}
    className={`relative p-6 rounded-[2rem] border-2 text-center transition-all group h-[140px] flex flex-col items-center justify-center gap-3 ${active ? 'border-primary bg-primary/5 ring-4 ring-primary/10' : 'border-border bg-background/50 hover:border-primary/30'}`}
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-primary text-black' : 'bg-secondary text-primary group-hover:bg-primary/20'}`}>
      {icon}
    </div>
    <div>
      <p className="font-black uppercase tracking-tight text-sm leading-tight">{name}</p>
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{sub}</p>
    </div>
    {active && <CheckCircle className="absolute top-4 right-4 w-5 h-5 text-primary" />}
  </button>
);

export default CheckoutPage;
