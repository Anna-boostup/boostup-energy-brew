import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle2, Leaf, Zap, Droplets, ShieldCheck, Beaker } from "lucide-react";
import { motion } from "framer-motion";

export interface IngredientDetails {
    title: string;
    subtitle: string;
    description: string;
    benefits: string[];
    ingredients: string[];
}

interface IngredientDialogProps {
    isOpen: boolean;
    onClose: () => void;
    data: IngredientDetails | null;
    colorClass: string;
}

const IngredientDialog: React.FC<IngredientDialogProps> = ({ isOpen, onClose, data, colorClass }) => {
    if (!data) return null;

    const getIcon = (title: string) => {
        const t = title.toLowerCase();
        if (t.includes('stimulanty')) return <Zap className="w-8 h-8 text-lime" />;        // STIMULACE → lime
        if (t.includes('elektrolyty')) return <Droplets className="w-8 h-8 text-terracotta" />; // ROVNOVÁHA → terracotta/červená
        if (t.includes('adaptogeny')) return <ShieldCheck className="w-8 h-8 text-orange" />;   // ODOLNOST → oranžová
        if (t.includes('vitamíny')) return <Beaker className="w-8 h-8 text-olive" />;           // SOUSTŘEDĚNÍ → olive/temná zelená
        return <Leaf className="w-8 h-8 text-primary" />;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] border-none bg-background/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden rounded-[2.5rem]">
                <div className={`h-32 ${colorClass} relative overflow-hidden flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white/20 backdrop-blur-lg p-4 rounded-3xl relative z-10"
                    >
                        {getIcon(data.title)}
                    </motion.div>

                    {/* Decorative blobs */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-black/10 rounded-full blur-xl" />
                </div>

                <div className="p-8 space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-display font-black tracking-tight text-foreground">
                            {data.title.toUpperCase()}
                        </DialogTitle>
                        <DialogDescription className="text-lg font-bold text-primary italic">
                            {data.subtitle}
                        </DialogDescription>
                    </DialogHeader>

                    <p className="text-muted-foreground leading-relaxed font-medium">
                        {data.description}
                    </p>

                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Klíčové benefity</h4>
                        <div className="grid gap-3">
                            {data.benefits.filter(benefit => benefit.trim() !== "").map((benefit, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-3 bg-secondary/30 p-3 rounded-2xl border border-secondary"
                                >
                                    <CheckCircle2 className="w-5 h-5 text-lime shrink-0" />
                                    <span className="text-sm font-bold">{benefit}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Obsažené látky</h4>
                        <div className="flex flex-wrap gap-2">
                            {data.ingredients.filter(ing => ing.trim() !== "").map((ing, i) => (
                                <span
                                    key={i}
                                    className="px-4 py-2 bg-foreground/5 rounded-full text-xs font-bold border border-foreground/10"
                                >
                                    {ing}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-secondary/20 border-t border-border flex justify-center">
                    <button
                        onClick={onClose}
                        className="text-xs font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors"
                    >
                        Zavřít detail
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default IngredientDialog;
