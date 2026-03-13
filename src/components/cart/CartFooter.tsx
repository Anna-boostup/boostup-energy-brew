import React from 'react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/context/CartContext';

interface CartFooterProps {
    cartTotal: number;
    cartItems: CartItem[];
    clearCart: () => void;
    handleCheckout: () => void;
}

export const CartFooter: React.FC<CartFooterProps> = ({ 
    cartTotal, 
    cartItems, 
    clearCart, 
    handleCheckout 
}) => {
    const isFreeShipping = cartItems.some(item => item.pack === 21) || cartTotal >= 1500;

    return (
        <div className="p-6 border-t border-border bg-card space-y-4">
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Celkem k úhradě:</span>
                    <span className="text-3xl font-display font-bold text-gradient-energy">
                        {cartTotal} Kč
                    </span>
                </div>
                {isFreeShipping ? (
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
    );
};
