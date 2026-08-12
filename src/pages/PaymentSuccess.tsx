import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home, ShoppingBag, CreditCard, Clock, RefreshCw, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentInstructions from '@/components/PaymentInstructions';
import { useCart } from '@/context/CartContext';
import { track } from '@vercel/analytics';
import { useCookieConsent } from '@/context/CookieContext';
import { useSubscriptionDiscount } from '@/hooks/useSubscriptionDiscount';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const { consent } = useCookieConsent();
    const [searchParams] = useSearchParams();
    const stripeStatus = searchParams.get('redirect_status');
    const urlStatus = searchParams.get('status');
    // If Stripe explicitly returns 'succeeded', we consider it success, same as manual urlStatus
    const status = stripeStatus === 'succeeded' ? 'success' : stripeStatus || urlStatus || 'success';
    const isPending = status === 'pending' || status === 'requires_action' || status === 'requires_payment_method';
    const orderNumber = searchParams.get('orderNumber') || 'BUP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const amount = searchParams.get('amount') || '0';
    const isSubscription = searchParams.get('sub') === '1';
    const { pct: subDiscountPct } = useSubscriptionDiscount();
    const { profile } = useAuth();

    // Cíl tlačítka „Moje předplatné" podle role / typu účtu.
    // Host bez účtu (null) žádnou správu předplatného nemá → tlačítko skryjeme.
    const subscriptionsPath = !profile
        ? null
        : profile.role === 'admin'
            ? '/admin/profile?tab=subscriptions'
            : profile.account_type === 'company'
                ? '/company-account/subscriptions'
                : '/account/subscriptions';

    // U dokončeného předplatného NEODPOČÍTÁVÁME ani nepřesměrováváme — uživatel si má
    // v klidu přečíst další kroky. Odpočet běží jen u běžných objednávek a čekajících plateb.
    const autoRedirect = !isSubscription;
    const [countdown, setCountdown] = useState(isPending ? 120 : 30);
    const [cancelled, setCancelled] = useState(false);
    const { toast } = useToast();
    const [activationEmail, setActivationEmail] = useState('');
    const [activationBusy, setActivationBusy] = useState(false);
    const [activationSent, setActivationSent] = useState(false);

    // Host bez účtu: pošleme mu na e-mail aktivační (magic) odkaz -> po kliknutí je přihlášený a účet vznikne.
    const sendActivation = async () => {
        const email = activationEmail.trim();
        if (!email) return;
        setActivationBusy(true);
        try {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: `${origin}/account/subscriptions` },
            });
            if (error) throw error;
            setActivationSent(true);
        } catch (e: any) {
            toast({ title: 'Nepodařilo se odeslat', description: e?.message || 'Zkuste to prosím znovu.', variant: 'destructive' });
        } finally {
            setActivationBusy(false);
        }
    };

    // Vyčištění košíku + měření konverze (jednorázově po načtení stránky)
    useEffect(() => {
        clearCart();

        if (!isPending) {
            const hasBeenTracked = sessionStorage.getItem(`tracked_${orderNumber}`);
            if (!hasBeenTracked) {
                const numericAmount = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;

                // Vercel Analytics
                track('purchase', { order_id: orderNumber, value: numericAmount, currency: 'CZK' });

                // Google Analytics 4
                if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'purchase', {
                        transaction_id: orderNumber,
                        value: numericAmount,
                        currency: 'CZK',
                        items: [],
                    });
                }

                // Meta Pixel (Facebook)
                if (consent?.marketing && typeof window !== 'undefined' && (window as any).fbq) {
                    (window as any).fbq('track', 'Purchase', {
                        value: numericAmount,
                        currency: 'CZK',
                        content_type: 'product',
                        content_ids: [orderNumber],
                    });
                    console.log('[Meta Pixel] Purchase tracked:', orderNumber, numericAmount);
                }
                sessionStorage.setItem(`tracked_${orderNumber}`, 'true');
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderNumber, amount, isPending]);

    // Jakmile uživatel se stránkou začne pracovat (klik, klávesa, scroll, dotyk),
    // automatické přesměrování zrušíme, ať ho nevytrhne z rozečtené stránky.
    useEffect(() => {
        if (!autoRedirect) return;
        const cancel = () => setCancelled(true);
        const opts: AddEventListenerOptions = { passive: true, once: true };
        window.addEventListener('pointerdown', cancel, opts);
        window.addEventListener('keydown', cancel, opts);
        window.addEventListener('wheel', cancel, opts);
        window.addEventListener('touchstart', cancel, opts);
        return () => {
            window.removeEventListener('pointerdown', cancel);
            window.removeEventListener('keydown', cancel);
            window.removeEventListener('wheel', cancel);
            window.removeEventListener('touchstart', cancel);
        };
    }, [autoRedirect]);

    // Odpočet — jen u běžných objednávek / čekajících plateb a dokud ho uživatel nezruší.
    useEffect(() => {
        if (!autoRedirect || cancelled) return;
        const timer = setInterval(() => {
            setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [autoRedirect, cancelled]);

    // Přesměrování až po dojetí odpočtu (žádný side-effect uvnitř setState).
    useEffect(() => {
        if (autoRedirect && !cancelled && countdown === 0) {
            navigate('/');
        }
    }, [autoRedirect, cancelled, countdown, navigate]);

    return (
        <main className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20 }}
                className="bg-card border border-border rounded-[40px] p-8 md:p-12 max-w-2xl w-full text-center shadow-2xl relative overflow-hidden"
            >
                {/* Success burst effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10" />

                <div className="space-y-8">
                    <div className="relative inline-block">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className={`w-24 h-24 ${isPending ? 'bg-orange' : 'bg-primary'} rounded-full flex items-center justify-center shadow-lg`}
                        >
                            {isPending ? (
                                <Clock className="w-12 h-12 text-white" />
                            ) : (
                                <CheckCircle className="w-12 h-12 text-primary-foreground" />
                            )}
                        </motion.div>
                        {!isPending && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-lime rounded-full border-4 border-card flex items-center justify-center"
                            >
                                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                            </motion.div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight">
                            {isPending ? (
                                <>ČEKÁME NA <span className="text-gradient-energy">PLATBU</span></>
                            ) : isSubscription ? (
                                <>DĚKUJEME ZA <span className="text-gradient-energy">PŘEDPLATNÉ</span></>
                            ) : (
                                <>DĚKUJEME ZA <span className="text-gradient-energy">OBJEDNÁVKU</span></>
                            )}
                        </h1>
                        <p className="text-lg text-foreground/80 max-w-md mx-auto">
                            {isPending
                                ? "Vaše objednávka byla přijata. Prosíme o provedení platby podle pokynů níže."
                                : isSubscription
                                    ? `Vaše první zásilka je na cestě. Další pak dostanete automaticky a pravidelně — se slevou ${subDiscountPct} % u každé objednávky.`
                                    : "Vaše platba byla úspěšně přijata. Potvrzení jsme vám právě odeslali na email."
                            }
                        </p>
                    </div>

                    {isPending && (
                        <PaymentInstructions
                            orderNumber={orderNumber}
                            amount={parseInt(amount)}
                        />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left sm:text-center">
                        <div className="bg-secondary/20 rounded-2xl p-6 border border-border/50 overflow-hidden" data-sentry-mask>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Číslo objednávky</p>
                            <p className="text-lg sm:text-xl font-display font-bold break-all">#{orderNumber}</p>
                        </div>
                        <div className="bg-secondary/20 rounded-2xl p-6 border border-border/50 overflow-hidden" data-sentry-mask>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{isSubscription ? 'Částka za zásilku' : 'Celková částka'}</p>
                            <p className="text-lg sm:text-xl font-display font-bold text-primary break-all">{amount} Kč</p>
                        </div>
                    </div>

                    {isSubscription && !isPending && (
                        <div className="text-left bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-2">
                            <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                                <RefreshCw className="w-4 h-4" /> Pravidelné předplatné
                            </div>
                            <p className="text-sm text-foreground/80">
                                Platbu i dopravu strháváme před každou zásilkou. Termín, dopravu i množství upravíte jednou za kalendářní měsíc (nejpozději 5 dní před odesláním), nebo předplatné kdykoli zrušíte ke konci období.
                            </p>
                        </div>
                    )}

                    {isSubscription && !isPending && !profile && (
                        <div className="text-left bg-secondary/30 border border-border rounded-2xl p-5 space-y-3">
                            <div className="flex items-center gap-2 text-foreground font-black uppercase text-xs tracking-widest">
                                <UserPlus className="w-4 h-4 text-primary" /> Spravujte předplatné online
                            </div>
                            <p className="text-sm text-foreground/70">
                                Se založeným účtem si termín, dopravu i množství upravíte sami a předplatné můžete kdykoli pozastavit. Pošleme vám aktivační odkaz na e-mail.
                            </p>
                            {activationSent ? (
                                <p className="text-sm font-bold text-primary">
                                    Aktivační odkaz jsme poslali na {activationEmail}. Zkontrolujte e-mail a dokončete založení účtu.
                                </p>
                            ) : (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="email"
                                        value={activationEmail}
                                        onChange={(e) => setActivationEmail(e.target.value)}
                                        placeholder="vas@email.cz"
                                        className="flex-1 bg-background border-2 border-border rounded-xl px-4 py-3 font-bold outline-none focus:border-primary"
                                    />
                                    <Button onClick={sendActivation} disabled={activationBusy || !activationEmail} className="rounded-xl h-auto py-3 px-5 font-bold">
                                        {activationBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aktivovat účet'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-6">
                        {(isPending || (autoRedirect && !cancelled)) && (
                            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-center gap-3">
                                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                <p className="text-sm font-bold">
                                    {isPending
                                        ? `Tato stránka se zavře za ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                                        : `Automatické přesměrování za ${countdown} sekund`}
                                </p>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={() => navigate('/')}
                                variant="outline"
                                className="flex-1 rounded-2xl h-14 font-bold border-2"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Domů
                            </Button>
                            {isSubscription ? (
                                subscriptionsPath && (
                                    <Button
                                        onClick={() => navigate(subscriptionsPath)}
                                        className="flex-1 rounded-2xl h-14 font-bold shadow-button animate-energy-pulse"
                                    >
                                        Moje předplatné
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )
                            ) : (
                                <Button
                                    onClick={() => navigate('/')}
                                    className="flex-1 rounded-2xl h-14 font-bold shadow-button animate-energy-pulse"
                                >
                                    Další nákup
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    );
};

export default PaymentSuccess;
