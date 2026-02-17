
import React, { createContext, useContext, useState, useEffect } from "react";

export type SKU = string;

export interface Order {
    id: string;
    date: string;
    customer: {
        name: string;
        email: string;
    };
    items: {
        sku: string;
        name: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    status: 'pending' | 'paid' | 'shipped';
}

export interface StockMovement {
    id: string;
    sku: string;
    type: 'restock' | 'sale' | 'correction';
    amount: number;
    date: string;
    note?: string;
}

interface InventoryContextType {
    stock: Record<SKU, number>;
    orders: Order[];
    movements: StockMovement[];
    addMovement: (sku: SKU, amount: number, type: StockMovement['type'], note?: string) => void;
    updateStock: (sku: SKU, quantity: number) => void; // Deprecated but kept for compatibility
    decrementStock: (sku: SKU, amount: number) => boolean;
    getStock: (sku: SKU) => number;
    addOrder: (order: Order) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Initial mock stock data (Hybrid System)
const INITIAL_STOCK: Record<SKU, number> = {
    // Single Bottles (for Mixes)
    "lemon": 200,
    "red": 200,
    "silky": 200,

    // Pre-packed SKUs (for Single Packs)
    "lemon-3": 50, "lemon-12": 30, "lemon-21": 15,
    "red-3": 50, "red-12": 30, "red-21": 20,
    "silky-3": 50, "silky-12": 30, "silky-21": 20,
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stock, setStock] = useState<Record<SKU, number>>(() => {
        const saved = localStorage.getItem("inventory_stock");
        return saved ? { ...INITIAL_STOCK, ...JSON.parse(saved) } : INITIAL_STOCK;
    });

    const [orders, setOrders] = useState<Order[]>(() => {
        const saved = localStorage.getItem("inventory_orders");
        return saved ? JSON.parse(saved) : [];
    });

    const [movements, setMovements] = useState<StockMovement[]>(() => {
        const saved = localStorage.getItem("inventory_movements");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("inventory_stock", JSON.stringify(stock));
    }, [stock]);

    useEffect(() => {
        localStorage.setItem("inventory_orders", JSON.stringify(orders));
    }, [orders]);

    useEffect(() => {
        localStorage.setItem("inventory_movements", JSON.stringify(movements));
    }, [movements]);

    const addMovement = (sku: SKU, amount: number, type: StockMovement['type'], note?: string) => {
        const movement: StockMovement = {
            id: Math.random().toString(36).substr(2, 9),
            sku,
            type,
            amount,
            date: new Date().toISOString(),
            note
        };

        setMovements(prev => [movement, ...prev]);

        setStock(prev => {
            const current = prev[sku] || 0;
            let newAmount = current;

            if (type === 'correction') {
                newAmount = amount;
            } else {
                // For restock (positive amount) and sale (negative amount passed logic? or handled here?)
                // Usually restock is +amount, sale is -amount.
                // Let's assume 'amount' passed is the delta.
                newAmount = current + amount;
            }

            return { ...prev, [sku]: Math.max(0, newAmount) };
        });
    };

    // Legacy support - wraps addMovement as correction
    const updateStock = (sku: SKU, quantity: number) => {
        addMovement(sku, quantity, 'correction', 'Manual update via legacy edit');
    };

    const decrementStock = (sku: SKU, amount: number) => {
        if ((stock[sku] || 0) < amount) return false;
        addMovement(sku, -amount, 'sale', 'E-shop purchase');
        return true;
    };

    const getStock = (sku: SKU) => {
        return stock[sku] || 0;
    };

    const addOrder = (order: Order) => {
        setOrders((prev) => [order, ...prev]);
    };

    const updateOrderStatus = (orderId: string, status: Order['status']) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    };

    return (
        <InventoryContext.Provider value={{ stock, orders, movements, addMovement, updateStock, decrementStock, getStock, addOrder, updateOrderStatus }}>
            {children}
        </InventoryContext.Provider>
    );
};

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error("useInventory must be used within an InventoryProvider");
    }
    return context;
};
