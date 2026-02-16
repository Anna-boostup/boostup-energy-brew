import React from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../../logic/cartState';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const CartModal = ({ isOpen, onClose }) => {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate('/checkout');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-border/50 flex items-center justify-between">
                        <h2 className="text-2xl font-black uppercase italic tracking-tight flex items-center gap-3">
                            <ShoppingBag size={28} className="text-primary" />
                            Váš košík
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-muted rounded-xl transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {cart.length === 0 ? (
                            <div className="text-center py-12">
                                <ShoppingBag size={64} className="mx-auto text-muted-foreground/30 mb-4" />
                                <p className="text-lg text-muted-foreground">Váš košík je prázdný</p>
                                <p className="text-sm text-muted-foreground/70 mt-2">
                                    Přidejte produkty a pokračujte v nákupu
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-4 p-4 bg-secondary/10 rounded-2xl"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-24 h-24 object-cover rounded-xl"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                            <p className="text-accent font-bold text-xl">
                                                {item.price} Kč
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <button
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                    className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-8 text-center font-bold">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors h-fit"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {cart.length > 0 && (
                        <div className="p-6 border-t border-border/50 space-y-4">
                            <div className="flex justify-between items-center text-2xl font-black">
                                <span>Celkem:</span>
                                <span className="text-accent">{cartTotal} Kč</span>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={clearCart}
                                    className="flex-1 py-3 border-2 border-border hover:bg-muted rounded-xl font-bold transition-colors"
                                >
                                    Vyprázdnit košík
                                </button>
                                <button
                                    onClick={handleCheckout}
                                    className="flex-1 py-3 bg-accent hover:bg-accent/90 text-white rounded-xl font-bold transition-colors"
                                >
                                    Pokračovat k pokladně
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CartModal;
