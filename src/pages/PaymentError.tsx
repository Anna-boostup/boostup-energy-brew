import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, RefreshCw, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PaymentError = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const errorMessage = searchParams.get('message') || 'Při zpracování platby došlo k neočekávané chybě.';

    return (
        <main className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-card border border-border rounded-[40px] p-8 md:p-12 max-w-xl w-full text-center shadow-2xl"
            >
                <div className="space-y-8">
                    <div className="w-24 h-24 bg-destructive/10 rounded-full flex items-center justify-center mx-auto text-destructive">
                        <AlertCircle className="w-12 h-12" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
                            PLATBA <span className="text-destructive">NEPROŠLA</span>
                        </h1>
                        <div className="p-4 bg-destructive/5 rounded-2xl border border-destructive/10 text-destructive-foreground">
                            <p className="font-medium">{errorMessage}</p>
                        </div>
                    </div>

                    <p className="text-foreground/80">
                        Zkuste to prosím znovu nebo zvolte jinou platební metodu. Pokud se problém opakuje, kontaktujte naši podporu.
                    </p>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => navigate('/checkout')}
                            size="xl"
                            className="rounded-2xl h-16 font-bold shadow-button bg-destructive hover:bg-destructive/90 text-white"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Zkusit znovu
                        </Button>
                        <Button
                            onClick={() => navigate('/')}
                            variant="outline"
                            size="xl"
                            className="rounded-2xl h-16 font-bold border-2"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Zpět na hlavní stránku
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-foreground/70 flex items-center justify-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" />
                            Kontaktovat podporu
                        </Button>
                    </div>
                </div>
            </motion.div>
        </main>
    );
};

export default PaymentError;
