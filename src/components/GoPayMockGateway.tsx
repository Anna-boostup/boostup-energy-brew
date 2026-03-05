import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, X, CreditCard, Lock, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface GoPayMockGatewayProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (paymentId: string) => void;
    onError: (message: string) => void;
    onCancel: () => void;
    orderData: {
        orderNumber: string;
        amount: number;
        items: any[];
        customer: any;
    };
    paymentId: string;
}

const GoPayMockGateway: React.FC<GoPayMockGatewayProps> = ({
    isOpen,
    onClose,
    onSuccess,
    onError,
    onCancel,
    orderData,
    paymentId
}) => {
    const [step, setStep] = useState<'info' | 'processing' | 'result'>('info');
    const [result, setResult] = useState<'success' | 'error' | null>(null);

    useEffect(() => {
        if (!isOpen) {
            setStep('info');
            setResult(null);
        }
    }, [isOpen]);

    const handlePay = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('result');
            setResult('success');
            setTimeout(() => {
                onSuccess(paymentId);
            }, 1500);
        }, 2000);
    };

    const handleFail = () => {
        setStep('processing');
        setTimeout(() => {
            setStep('result');
            setResult('error');
            setTimeout(() => {
                onError("Platba byla zamítnuta bankou (Simulovaná chyba)");
            }, 2000);
        }, 1500);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="bg-white w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
                >
                    {/* GoPay Header */}
                    <div className="bg-[#f0f0f0] p-6 flex items-center justify-between border-b">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-xl shadow-sm">
                                <svg viewBox="0 0 100 30" className="h-6 w-auto">
                                    <path d="M15 5h10v20h-10z" fill="#ec1c24" />
                                    <text x="30" y="22" className="font-bold text-xl" fill="#333">GoPay</text>
                                </svg>
                            </div>
                            <div className="h-4 w-[1px] bg-gray-300"></div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Testovací prostředí</span>
                        </div>
                        <button
                            onClick={onCancel}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            aria-label="Zrušit platbu a zavřít bránu"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    <div className="p-8 flex-grow">
                        {step === 'info' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Platební brána</h2>
                                        <p className="text-gray-500 text-sm mt-1">BoostUp Energy | Obj. {orderData.orderNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-gray-900">{orderData.amount} Kč</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase">Včetně DPH</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4">
                                    <div className="bg-blue-500 p-2 rounded-lg h-fit text-white">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-blue-900">Vybraná metoda: Kartou online</p>
                                        <p className="text-blue-700 text-sm">Simulujeme reálnou interakci s bránou GoPay pro účely testování.</p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Button
                                        onClick={handlePay}
                                        className="w-full h-14 bg-[#ec1c24] hover:bg-[#d0191f] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                                    >
                                        Zaplatit {orderData.amount} Kč
                                    </Button>
                                    <Button
                                        onClick={handleFail}
                                        variant="outline"
                                        className="w-full h-14 border-2 border-gray-200 text-gray-400 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                                    >
                                        Simulovat zamítnutí
                                    </Button>
                                    <p className="text-center text-[10px] text-gray-400 uppercase font-bold tracking-widest pt-2 flex items-center justify-center gap-2">
                                        <Lock size={12} /> Zabezpečený přenos dat
                                    </p>
                                </div>
                            </div>
                        )}

                        {step === 'processing' && (
                            <div className="flex flex-col items-center justify-center py-12 space-y-6">
                                <Loader2 className="w-16 h-16 text-[#ec1c24] animate-spin" />
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-gray-900">Probíhá ověření platby</h3>
                                    <p className="text-gray-500 mt-2">Komunikujeme s vaší bankou...</p>
                                </div>
                            </div>
                        )}

                        {step === 'result' && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center justify-center py-12 space-y-6"
                            >
                                {result === 'success' ? (
                                    <>
                                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white">
                                            <CheckCircle2 className="w-12 h-12" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold text-gray-900">Platba byla úspěšná</h3>
                                            <p className="text-gray-500 mt-2">Přesměrováváme vás zpět do e-shopu...</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white">
                                            <AlertCircle className="w-12 h-12" />
                                        </div>
                                        <div className="text-center">
                                            <h3 className="text-xl font-bold text-gray-900">Platba selhala</h3>
                                            <p className="text-gray-500 mt-2">Bankovní transakce byla zamítnuta.</p>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </div>

                    {/* Footer Info */}
                    <div className="bg-gray-50 p-6 flex justify-center items-center gap-6 border-t mt-auto">
                        <div className="flex items-center gap-1.5 opacity-40 grayscale">
                            <svg className="h-4 w-auto" viewBox="0 0 100 30" fill="currentColor"><path d="M10 20 C 10 10, 40 10, 40 20" /></svg>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Verified by Visa</span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-40 grayscale">
                            <span className="text-[10px] font-bold uppercase tracking-tighter text-red-500">Mastercard</span>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">ID Check</span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-60">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-900">PCI-DSS Compliant</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default GoPayMockGateway;
