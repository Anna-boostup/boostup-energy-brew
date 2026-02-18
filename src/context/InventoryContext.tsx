import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type SKU = string;

export interface Order {
    id: string;
    date: string;
    customer: {
        name: string;
        email: string;
    };
    delivery_info?: {
        firstName: string;
        lastName: string;
        phone: string;
        street: string;
        city: string;
        zip: string;
        deliveryMethod: string;
        paymentMethod: string;
        packetaPointId?: string;

        isCompany?: boolean;
        billingSameAsDelivery?: boolean;
        companyName?: string;
        ico?: string;
        dic?: string;
        billingStreet?: string;
        billingCity?: string;
        billingZip?: string;
    };
    items: {
        sku: string;
        name: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    status: 'pending' | 'paid' | 'shipped';
    is_subscription_order?: boolean;
}

export interface StockMovement {
    id: string;
    sku: string;
    type: 'restock' | 'sale' | 'correction';
    amount: number;
    date: string;
    note?: string;
    user?: {
        email: string;
        full_name: string;
    };
}

interface InventoryContextType {
    stock: Record<SKU, number>;
    orders: Order[];
    movements: StockMovement[];
    addMovement: (sku: SKU, amount: number, type: StockMovement['type'], note?: string) => Promise<void>;
    updateStock: (sku: SKU, quantity: number) => void;
    decrementStock: (sku: SKU, amount: number) => Promise<boolean>;
    getStock: (sku: SKU) => number;
    addOrder: (order: Order) => void;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stock, setStock] = useState<Record<SKU, number>>({});
    const [orders, setOrders] = useState<Order[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);

    // 1. Initial Fetch
    useEffect(() => {
        fetchInventory();
        fetchMovements();
        fetchOrders(); // We can migrate orders later, but let's keep it here
    }, []);

    // 2. Realtime Subscriptions
    useEffect(() => {
        const inventorySubscription = supabase
            .channel('inventory_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, (payload) => {
                const { sku, quantity } = payload.new as { sku: string; quantity: number };
                setStock(prev => ({ ...prev, [sku]: quantity }));
            })
            .subscribe();

        const movementsSubscription = supabase
            .channel('movements_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stock_movements' }, (payload) => {
                const newMovement = payload.new as any;
                setMovements(prev => [newMovement, ...prev]);
            })
            .subscribe();

        const ordersSubscription = supabase
            .channel('orders_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setOrders(prev => [payload.new as any, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(inventorySubscription);
            supabase.removeChannel(movementsSubscription);
            supabase.removeChannel(ordersSubscription);
        };
    }, []);

    const fetchInventory = async () => {
        const { data, error } = await supabase.from('inventory').select('*');
        if (error) console.error('Error fetching inventory:', error);
        if (data) {
            const stockMap: Record<SKU, number> = {};
            data.forEach((item: any) => {
                stockMap[item.sku] = item.quantity;
            });
            setStock(stockMap);
        }
    };

    const fetchMovements = async () => {
        const { data, error } = await supabase
            .from('stock_movements')
            .select('*, profiles(email, full_name)')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching movements:', error);
        if (data) {
            const mappedMovements = data.map((m: any) => ({
                ...m,
                date: m.created_at,
                user: m.profiles // Map the joined profile data
            }));
            setMovements(mappedMovements);
        }
    };

    const fetchOrders = async () => {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) console.error('Error fetching orders:', error);
        if (data) {
            const mappedOrders = data.map((o: any) => ({
                ...o,
                date: o.created_at,
                // Ensure customer object is reconstructed from flattened columns if needed
                // But we stored it as columns customer_name, customer_email
                customer: {
                    name: o.customer_name,
                    email: o.customer_email
                }
            }));
            setOrders(mappedOrders);
        }
    };

    const addMovement = async (sku: SKU, amount: number, type: StockMovement['type'], note?: string) => {
        const { error } = await supabase.rpc('handle_stock_movement', {
            p_sku: sku,
            p_type: type,
            p_amount: amount,
            p_note: note
        });

        if (error) {
            console.error("Error adding movement:", error);
            alert("Chyba při aktualizaci skladu: " + error.message);
        }
    };

    // Legacy support
    const updateStock = (sku: SKU, quantity: number) => {
        addMovement(sku, quantity, 'correction', 'Manual override');
    };

    const decrementStock = async (sku: SKU, amount: number) => {
        const currentQty = stock[sku] || 0;
        if (currentQty < amount) return false;

        await addMovement(sku, -amount, 'sale', 'Online Order');
        return true;
    };

    const getStock = (sku: SKU) => {
        return stock[sku] || 0;
    };

    const addOrder = async (order: Order) => {
        // We need to map our frontend Order object to DB columns
        const { error } = await supabase.from('orders').insert({
            id: order.id,
            customer_email: order.customer.email,
            customer_name: order.customer.name,
            total: order.total,
            status: order.status,
            items: order.items,
            delivery_info: order.delivery_info,
            is_subscription_order: order.is_subscription_order || false,
        });

        if (error) {
            console.error('Error adding order:', error);
            alert("Chyba při vytváření objednávky: " + error.message);
        }
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);

        if (error) {
            console.error('Error updating order status:', error);
            alert("Chyba při aktualizaci stavu: " + error.message);
        }
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
