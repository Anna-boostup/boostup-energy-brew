import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentError = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const errorMessage = searchParams.get('message') || 'Platba nebyla úspěšně dokončena';

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-2xl"
            >
                {/* Error Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 rounded-full p-6">
                        <XCircle size={80} className="text-red-600" />
                    </div>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight text-center mb-4">
                    Platba se nezdařila
                </h1>

                <p className="text-lg text-center text-muted-foreground mb-8">
                    {errorMessage}
                </p>

                {/* Error Details */}
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-8">
                    <p className="font-bold text-red-900 mb-3">Možné příčiny:</p>
                    <ul className="space-y-2 text-sm text-red-700">
                        <li className="flex gap-2">
                            <span>•</span>
                            <span>Nedostatek prostředků na kartě</span>
                        </li>
                        <li className="flex gap-2">
                            <span>•</span>
                            <span>Chybně zadané platební údaje</span>
                        </li>
                        <li className="flex gap-2">
                            <span>•</span>
                            <span>Banka zamítla transakci z bezpečnostních důvodů</span>
                        </li>
                        <li className="flex gap-2">
                            <span>•</span>
                            <span>Technický problém na straně platební brány</span>
                        </li>
                    </ul>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 mb-8">
                    <p className="text-sm text-blue-700">
                        <strong className="text-blue-900">💡 Tip:</strong> Zkontrolujte stav svého účtu
                        nebo kontaktujte svou banku. Vaše objednávka zůstává uložená v košíku.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => navigate('/checkout')}
                        className="flex-1 flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105"
                    >
                        <RefreshCw size={20} />
                        Zkusit znovu
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 flex items-center justify-center gap-2 border-2 border-border hover:bg-muted text-foreground font-bold px-8 py-4 rounded-2xl transition-all"
                    >
                        <ArrowLeft size={20} />
                        Zpět domů
                    </button>
                </div>

                {/* Support */}
                <p className="text-center text-sm text-muted-foreground mt-8">
                    Potřebujete pomoc?{' '}
                    <a href="mailto:info@boostup.cz" className="text-primary hover:underline font-bold">
                        Kontaktujte nás
                    </a>
                </p>
            </motion.div>
        </div>
    );
};

export default PaymentError;
