import { useContent } from "@/context/ContentContext";

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
    const { content } = useContent();
    const isSalesEnabled = content.isSalesEnabled !== false;

    if (!isSalesEnabled) {
        return (
            <Button
                variant="outline"
                disabled
                className="flex-1 h-full min-h-[76px] px-8 rounded-3xl border-2 border-slate-200 text-slate-400 font-bold text-sm bg-slate-50 flex flex-col gap-1 uppercase"
            >
                <ShoppingBag className="w-5 h-5 opacity-30" />
                Prodej dočasně pozastaven
            </Button>
        );
    }

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
            onClick={onAddToCart}
            className={`flex-1 h-full min-h-[76px] px-6 py-2 border-2 transition-all duration-300 rounded-3xl whitespace-normal leading-tight text-center ${isOutOfStock
                ? "bg-slate-100 border-slate-200 text-slate-400 grayscale cursor-not-allowed"
                : "bg-slate-900 border-slate-800 text-lime hover:bg-black hover:scale-105 shadow-2xl shadow-lime/20 hover:shadow-lime/40 animate-energy-pulse"
                }`}
            disabled={isOutOfStock}
        >
            <div className="flex flex-col items-center justify-center gap-0.5">
                <div className="flex items-center gap-2 font-display text-xl font-black italic tracking-tight">
                    <ShoppingBag className={`w-5 h-5 group-hover:rotate-12 transition-transform ${isOutOfStock ? "" : "text-lime"}`} />
                    <span className={isOutOfStock ? "" : "text-lime"}>
                        {isOutOfStock ? "VYPRODÁNO" : "PŘIDAT DO KOŠÍKU"}
                    </span>
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
