
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

interface InventoryContextType {
    stock: Record<SKU, number>;
    orders: Order[];
    updateStock: (sku: SKU, quantity: number) => void;
    decrementStock: (sku: SKU, amount: number) => boolean;
    getStock: (sku: SKU) => number;
    addOrder: (order: Order) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Initial mock stock data (Tracking individual units/bottles)
const INITIAL_STOCK: Record<SKU, number> = {
    "lemon": 200, // Total bottles/shots
    "red": 200,
    "silky": 200,
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stock, setStock] = useState<Record<SKU, number>>(() => {
        const saved = localStorage.getItem("inventory_stock");
        return saved ? JSON.parse(saved) : INITIAL_STOCK;
    });

    const [orders, setOrders] = useState<Order[]>(() => {
        const saved = localStorage.getItem("inventory_orders");
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem("inventory_stock", JSON.stringify(stock));
    }, [stock]);

    useEffect(() => {
        localStorage.setItem("inventory_orders", JSON.stringify(orders));
    }, [orders]);

    const updateStock = (sku: SKU, quantity: number) => {
        setStock((prev) => ({
            ...prev,
            [sku]: quantity,
        }));
    };

    const decrementStock = (sku: SKU, amount: number) => {
        if ((stock[sku] || 0) < amount) return false;
        setStock((prev) => ({
            ...prev,
            [sku]: prev[sku] - amount,
        }));
        return true;
    };

    const getStock = (sku: SKU) => {
        return stock[sku] || 0;
    };

    const addOrder = (order: Order) => {
        setOrders((prev) => [order, ...prev]);
    };

    return (
        <InventoryContext.Provider value={{ stock, orders, updateStock, decrementStock, getStock, addOrder }}>
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
