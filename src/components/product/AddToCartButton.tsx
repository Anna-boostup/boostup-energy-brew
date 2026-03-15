import React from "react";
import { Button } from "../ui/button";
import { ShoppingBag, Sparkles } from "lucide-react";

interface AddToCartButtonProps {
    isValid: boolean | null;
    isOutOfStock: boolean;
    price: number;
    onAddToCart: () => void;
}

const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    isValid,
    isOutOfStock,
    price,
    onAddToCart
}) => {
    if (!isValid) {
        return (
            <Button
                variant="outline"
                disabled
                className="flex-1 h-full min-h-[76px] px-8 rounded-3xl border-2 border-dashed border-border text-muted-foreground font-medium text-sm bg-secondary/20"
            >
                Dokončete výběr pro nákup
            </Button>
        );
    }

    return (
        <Button
            variant="hero"
            onClick={onAddToCart}
            className={`flex-1 h-full min-h-[76px] px-6 py-2 border-2 border-transparent group animate-energy-pulse transition-all duration-300 rounded-3xl whitespace-normal leading-tight text-center ${isOutOfStock
                ? "opacity-50 grayscale cursor-not-allowed"
                : "hover:scale-105"
                }`}
            disabled={isOutOfStock}
        >
            <div className="flex flex-col items-center justify-center gap-0.5">
                <div className="flex items-center gap-2 font-display text-xl font-black italic tracking-tight">
                    <ShoppingBag className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    {isOutOfStock ? "VYPRODÁNO" : "PŘIDAT DO KOŠÍKU"}
                </div>
                {!isOutOfStock && (
                    <div className="flex items-center gap-2 text-[10px] font-bold opacity-90 tracking-widest uppercase">
                        <span>Celkem {price} Kč</span>
                        <Sparkles className="w-3 h-3 text-lime" />
                    </div>
                )}
            </div>
        </Button>
    );
};

export default AddToCartButton;
