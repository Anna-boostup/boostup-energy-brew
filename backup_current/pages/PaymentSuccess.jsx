import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [orderDetails, setOrderDetails] = useState(null);
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        // Načíst detaily z URL params
        const paymentId = searchParams.get('paymentId');
        const orderNumber = searchParams.get('orderNumber');
        const amount = searchParams.get('amount');

        if (paymentId && orderNumber && amount) {
            setOrderDetails({
                paymentId,
                orderNumber,
                amount: parseFloat(amount)
            });
        }

        // Countdown and auto-redirect
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl"
            >
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-green-100 rounded-full p-6">
                        <CheckCircle size={80} className="text-green-600" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight text-center mb-4">
                    Platba úspěšná!
                </h1>

                <p className="text-lg text-center text-muted-foreground mb-4">
                    Děkujeme za vaši objednávku. Potvrzení jsme vám zaslali na email.
                </p>

                <p className="text-sm text-center text-muted-foreground/60 mb-8 italic">
                    Budete automaticky přesměrováni na hlavní stránku za <span className="font-bold text-primary">{countdown} sekund</span>...
                </p>

                {/* Order Details */}
                {orderDetails && (
                    <div className="bg-secondary/10 rounded-2xl p-6 mb-8 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Číslo objednávky</span>
                            <span className="font-black text-lg">{orderDetails.orderNumber}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Celková částka</span>
                            <span className="font-black text-lg text-accent">{orderDetails.amount} Kč</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">ID platby</span>
                            <span className="font-mono text-xs">{orderDetails.paymentId}</span>
                        </div>
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-8">
                    <div className="flex gap-3">
                        <Package className="text-blue-600 flex-shrink-0" size={24} />
                        <div>
                            <p className="font-bold text-blue-900 mb-1">Co bude dál?</p>
                            <p className="text-sm text-blue-700">
                                Vaši objednávku připravíme k odeslání do 24 hodin.
                                Sledovací číslo vám zašleme emailem.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105"
                    >
                        <Home size={20} />
                        Zpět na hlavní stránku
                    </button>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                    Máte dotaz? Kontaktujte nás na{' '}
                    <a href="mailto:info@boostup.cz" className="text-primary hover:underline font-bold">
                        info@boostup.cz
                    </a>
                </p>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;
