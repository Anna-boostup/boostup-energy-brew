import React from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { CartItemRow } from './cart/CartItemRow';
import { EmptyCart } from './cart/EmptyCart';
import { CartFooter } from './cart/CartFooter';
import { UpsellWidget } from './cart/UpsellWidget';

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
}

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
                                <EmptyCart onClose={onClose} />
                            ) : (
                                <div className="flex flex-col">
                                    <AnimatePresence initial={false}>
                                        {cart.map((item) => (
                                            <motion.div
                                                key={item.cartItemId || item.id}
                                                initial={{ opacity: 0, height: 0, scale: 0.95, marginBottom: 0 }}
                                                animate={{ opacity: 1, height: 'auto', scale: 1, marginBottom: 16 }}
                                                exit={{ opacity: 0, height: 0, scale: 0.9, marginBottom: 0, overflow: 'hidden' }}
                                                transition={{ duration: 0.25, ease: "easeOut" }}
                                            >
                                                <CartItemRow
                                                    item={item}
                                                    updateQuantity={updateQuantity}
                                                    removeFromCart={removeFromCart}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                    <UpsellWidget />
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {cart.length > 0 && (
                            <CartFooter 
                                cartTotal={cartTotal}
                                cartItems={cart}
                                clearCart={clearCart}
                                handleCheckout={handleCheckout}
                            />
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartModal;
