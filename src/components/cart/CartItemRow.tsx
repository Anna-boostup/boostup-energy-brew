import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem } from '@/context/CartContext';

// Image Fallbacks
import bottleLemon from "@/assets/bottle-lemon.webp";
import bottleRed from "@/assets/bottle-red.webp";
import bottleSilky from "@/assets/bottle-silky.webp";
import bottlesHero from "@/assets/hero-vse.webp";

const getFallbackImage = (item: CartItem) => {
    if (item.flavorMode === 'mix') return bottlesHero;
    const name = (item.name || "").toLowerCase();
    if (name.includes('lemon')) return bottleLemon;
    if (name.includes('red')) return bottleRed;
    if (name.includes('silky')) return bottleSilky;
    return bottlesHero;
};

interface CartItemRowProps {
    item: CartItem;
    updateQuantity: (id: string, q: number) => void;
    removeFromCart: (id: string) => void;
}

export const CartItemRow = React.memo(({ item, updateQuantity, removeFromCart }: CartItemRowProps) => (
    <div className="flex gap-4 p-4 bg-white rounded-2xl border border-border/50 group shadow-sm">
        <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 border border-border/30">
            <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = getFallbackImage(item);
                }}
            />
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm truncate">{item.name}</h3>
            {item.mixConfiguration && (
                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    {item.mixConfiguration.lemon > 0 && <div>Lemon: {item.mixConfiguration.lemon}x</div>}
                    {item.mixConfiguration.red > 0 && <div>Red: {item.mixConfiguration.red}x</div>}
                    {item.mixConfiguration.silky > 0 && <div>Silky: {item.mixConfiguration.silky}x</div>}
                </div>
            )}
            <p className="text-primary font-bold mt-1">
                {item.price} Kč
            </p>
            <div className="flex items-center gap-3 mt-3">
                <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                    aria-label="Snížit množství"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm min-w-[1.5rem] text-center">
                    {item.quantity}
                </span>
                <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
                    aria-label="Zvýšit množství"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
        <button
            onClick={() => removeFromCart(item.id)}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            aria-label="Odebrat z košíku"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    </div>
));

CartItemRow.displayName = 'CartItemRow';
