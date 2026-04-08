import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home, ShoppingBag, CreditCard, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentInstructions from '@/components/PaymentInstructions';
import { useCart } from '@/context/CartContext';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const [searchParams] = useSearchParams();
    const stripeStatus = searchParams.get('redirect_status');
    const urlStatus = searchParams.get('status');
    // If Stripe explicitly returns 'succeeded', we consider it success, same as manual urlStatus
    const status = stripeStatus === 'succeeded' ? 'success' : stripeStatus || urlStatus || 'success';
    const isPending = status === 'pending' || status === 'requires_action' || status === 'requires_payment_method';
    const [countdown, setCountdown] = useState(isPending ? 120 : 10);

    const orderNumber = searchParams.get('orderNumber') || 'BUP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const amount = searchParams.get('amount') || '0';

    useEffect(() => {
        // Clear cart on success
        clearCart();

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

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
                            ) : (
                                <>DĚKUJEME ZA <span className="text-gradient-energy">OBJEDNÁVKU</span></>
                            )}
                        </h1>
                        <p className="text-lg text-foreground/80 max-w-md mx-auto">
                            {isPending
                                ? "Vaše objednávka byla přijata. Prosíme o provedení platby podle pokynů níže."
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary/20 rounded-2xl p-6 border border-border/50">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Číslo objednávky</p>
                            <p className="text-xl font-display font-bold">#{orderNumber}</p>
                        </div>
                        <div className="bg-secondary/20 rounded-2xl p-6 border border-border/50">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Celková částka</p>
                            <p className="text-xl font-display font-bold text-primary">{amount} Kč</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 flex items-center justify-center gap-3">
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                            <p className="text-sm font-bold">
                                {isPending
                                    ? `Tato stránka se zavře za ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                                    : `Automatické přesměrování za ${countdown} sekund`}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                                onClick={() => navigate('/')}
                                variant="outline"
                                className="flex-1 rounded-2xl h-14 font-bold border-2"
                            >
                                <Home className="w-4 h-4 mr-2" />
                                Domů
                            </Button>
                            <Button
                                onClick={() => navigate('/')}
                                className="flex-1 rounded-2xl h-14 font-bold shadow-button animate-energy-pulse"
                            >
                                Další nákup
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </main>
    );
};

export default PaymentSuccess;
