import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART':
            // Create a unique key for comparison including mix config
            const newItemKey = JSON.stringify(action.payload.mixConfiguration || {});

            const existingItemIndex = state.items.findIndex(
                item => item.id === action.payload.id &&
                    item.flavor === action.payload.flavor &&
                    item.pack === action.payload.pack &&
                    JSON.stringify(item.mixConfiguration || {}) === newItemKey
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

    useEffect(() => {
        localStorage.setItem('boostup_cart', JSON.stringify(state.items));
    }, [state.items]);

    const addToCart = (item: CartItem) => {
        dispatch({ type: 'ADD_TO_CART', payload: item });
    };

    const removeFromCart = (id: string) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    };

    const updateQuantity = (id: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const cartTotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = state.items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart: state.items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartTotal,
            cartCount
        }}>
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
