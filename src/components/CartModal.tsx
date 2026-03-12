import React from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart, CartItem } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';

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

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartItemRow = React.memo(({ item, updateQuantity, removeFromCart }: {
    item: CartItem;
    updateQuantity: (id: string, q: number) => void;
    removeFromCart: (id: string) => void;
}) => (
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

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/checkout');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 w-full max-w-md bg-background/95 backdrop-blur-xl shadow-2xl z-[101] flex flex-col border-l border-white/20 h-[100dvh] rounded-l-[2.5rem]"
                    >
                        {/* Header */}
                        <div className="p-8 flex items-center justify-between flex-shrink-0">
                            <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-3">
                                <ShoppingBag className="w-6 h-6 text-primary" />
                                Váš košík
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-secondary rounded-full transition-colors"
                                aria-label="Zavřít košík"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="overflow-y-auto p-6 space-y-6 flex-grow">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center">
                                        <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold">Váš košík je prázdný</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Přidejte si nějakou energii do košíku.
                                        </p>
                                    </div>
                                    <Button onClick={onClose} variant="outline" className="mt-4">
                                        Pokračovat v nákupu
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <CartItemRow
                                            key={item.id}
                                            item={item}
                                            updateQuantity={updateQuantity}
                                            removeFromCart={removeFromCart}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <div className="p-6 border-t border-border bg-card space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center">
                                        <span className="text-muted-foreground font-medium">Celkem k úhradě:</span>
                                        <span className="text-3xl font-display font-bold text-gradient-energy">
                                            {cartTotal} Kč
                                        </span>
                                    </div>
                                    {cart.some(item => item.pack === 21) || cartTotal >= 1500 ? (
                                        <div className="flex justify-end">
                                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider animate-pulse">
                                                Doprava zdarma aktivována!
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end">
                                            <span className="text-[10px] text-muted-foreground">
                                                Doprava zdarma při nákupu nad 1500 Kč nebo balení 21ks.
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <Button
                                        onClick={clearCart}
                                        variant="outline"
                                        className="rounded-2xl h-14 font-bold border-2"
                                    >
                                        Vyprázdnit
                                    </Button>
                                    <Button
                                        onClick={handleCheckout}
                                        className="rounded-2xl h-14 font-bold shadow-button animate-energy-pulse"
                                    >
                                        K pokladně
                                    </Button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartModal;
