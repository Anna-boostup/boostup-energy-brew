import React, { createContext, useContext, useReducer, useEffect, ReactNode, useMemo, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    flavor?: string;
    pack?: number;
    flavorMode?: 'single' | 'mix';
    image?: string;
    mixConfiguration?: {
        lemon: number;
        red: number;
        silky: number;
    };
    subscriptionInterval?: 'monthly' | 'bimonthly';
}

interface CartState {
    items: CartItem[];
}

type CartAction =
    | { type: 'ADD_TO_CART'; payload: CartItem }
    | { type: 'REMOVE_FROM_CART'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
    | { type: 'CLEAR_CART' };

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    discountAmount: number;
    appliedPromoCode: { code: string; discount: number } | null;
    applyPromoCode: (code: string) => Promise<boolean>;
    removePromoCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART':
            // Create a unique key for comparison including mix config AND subscription
            const newItemKey = JSON.stringify({
                mix: action.payload.mixConfiguration || {},
                sub: action.payload.subscriptionInterval || null
            });

            const existingItemIndex = state.items.findIndex(
                item => item.id === action.payload.id &&
                    item.flavor === action.payload.flavor &&
                    item.pack === action.payload.pack &&
                    JSON.stringify({
                        mix: item.mixConfiguration || {},
                        sub: item.subscriptionInterval || null
                    }) === newItemKey
            );
            if (existingItemIndex > -1) {
                const newItems = [...state.items];
                newItems[existingItemIndex].quantity += action.payload.quantity;
                return { ...state, items: newItems };
            }
            return { ...state, items: [...state.items, action.payload] };

        case 'REMOVE_FROM_CART':
            return { ...state, items: state.items.filter(item => item.id !== action.payload) };

        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
                )
            };

        case 'CLEAR_CART':
            return { ...state, items: [] };

        default:
            return state;
    }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, { items: [] }, (initial) => {
        const localData = localStorage.getItem('boostup_cart');
        return localData ? { items: JSON.parse(localData) } : initial;
    });

    const [appliedPromoCode, setAppliedPromoCode] = useState<{ code: string; discount: number } | null>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            localStorage.setItem('boostup_cart', JSON.stringify(state.items));
        }, 500); // Debounce storage updates
        return () => clearTimeout(timeoutId);
    }, [state.items]);

    // Load promo code from session storage if exists
    useEffect(() => {
        const savedCode = sessionStorage.getItem('boostup_promo');
        if (savedCode) {
            setAppliedPromoCode(JSON.parse(savedCode));
        }
    }, []);

    const addToCart = useCallback((item: CartItem) => {
        dispatch({ type: 'ADD_TO_CART', payload: item });
    }, []);

    const removeFromCart = useCallback((id: string) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }, []);

    const clearCart = useCallback(() => {
        dispatch({ type: 'CLEAR_CART' });
    }, []);

    const applyPromoCode = async (code: string) => {
        try {
            if (!supabase) {
                console.error('CartContext: Supabase client not initialized. Cannot apply promo code.');
                return false;
            }

            const { data, error } = await supabase
                .from('promo_codes')
                .select('*')
                .eq('code', code.toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !data) {
                toast.error('Neplatný nebo neaktivní slevový kód');
                return false;
            }

            const promo = { code: data.code, discount: data.discount_percent };
            setAppliedPromoCode(promo);
            sessionStorage.setItem('boostup_promo', JSON.stringify(promo));
            toast.success(`Sleva ${data.discount_percent}% byla uplatněna`);
            return true;
        } catch (err) {
            console.error('Error applying promo code:', err);
            return false;
        }
    };

    const removePromoCode = () => {
        setAppliedPromoCode(null);
        sessionStorage.removeItem('boostup_promo');
        toast.info('Slevový kód byl odebrán');
    };

    const { cartTotal, discountAmount } = useMemo(() => {
        let total = 0;
        let discount = 0;

        state.items.forEach(item => {
            const itemBaseTotal = item.price * item.quantity;
            let discountMultiplier = 1;
            
            if (item.subscriptionInterval) {
                discountMultiplier = 0.90;
            } else if (appliedPromoCode) {
                discountMultiplier = (100 - appliedPromoCode.discount) / 100;
            }

            const discountedPrice = item.subscriptionInterval ? Math.round(item.price * discountMultiplier) : item.price * discountMultiplier;
            total += discountedPrice * item.quantity;
            discount += (item.price - discountedPrice) * item.quantity;
        });

        return { 
            cartTotal: parseFloat(total.toFixed(2)), 
            discountAmount: parseFloat(discount.toFixed(2)) 
        };
    }, [state.items, appliedPromoCode]);

    const cartCount = useMemo(() => {
        return state.items.reduce((count, item) => count + item.quantity, 0)
    }, [state.items]);

    const value = useMemo(() => ({
        cart: state.items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        discountAmount,
        appliedPromoCode,
        applyPromoCode,
        removePromoCode
    }), [state.items, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, discountAmount, appliedPromoCode]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
