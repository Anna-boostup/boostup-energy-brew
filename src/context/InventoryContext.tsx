import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export type SKU = string;

export interface Product {
    sku: string;
    name: string;
    quantity: number;
    price: number;
    image_url?: string;
    description?: string;
    ingredients?: string;
    tooltip?: string;
    is_on_sale?: boolean;
}

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
        houseNumber: string;
        deliveryMethod: string;
        paymentMethod: string;
        packetaPointId?: string;

        isCompany?: boolean;
        billingSameAsDelivery?: boolean;
        companyName?: string;
        ico?: string;
        dic?: string;
        billingStreet?: string;
        billingHouseNumber?: string;
        billingCity?: string;
        billingZip?: string;
    };
    items: {
        sku: string;
        name: string;
        quantity: number;
        price: number;
        mixConfiguration?: {
            lemon: number;
            red: number;
            silky: number;
        };
    }[];
    total: number;
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'cancelled';
    is_subscription_order?: boolean;
    packeta_barcode?: string;
    packeta_packet_id?: string;
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
    products: Product[];
    orders: Order[];
    movements: StockMovement[];
    addMovement: (sku: SKU, amount: number, type: StockMovement['type'], note?: string) => Promise<void>;
    updateStock: (sku: SKU, quantity: number) => void;
    decrementStock: (sku: SKU, amount: number) => Promise<boolean>;
    getStock: (sku: SKU) => number;
    addOrder: (order: Order) => Promise<boolean>;
    updateOrderStatus: (orderId: string, status: Order['status']) => void;
    updateProduct: (sku: string, updates: Partial<Product>) => Promise<void>;
    updateOrderPacketaInfo: (orderId: string, barcode: string, packetId: string) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stock, setStock] = useState<Record<SKU, number>>({});
    const [products, setProducts] = useState<Product[]>([]);
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
                const updatedItem = payload.new as Product;
                setStock(prev => ({ ...prev, [updatedItem.sku]: updatedItem.quantity }));
                setProducts(prev => {
                    const exists = prev.find(p => p.sku === updatedItem.sku);
                    if (exists) {
                        return prev.map(p => p.sku === updatedItem.sku ? updatedItem : p);
                    }
                    return [...prev, updatedItem];
                });
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
                    const newOrder = payload.new as any;
                    setOrders(prev => [newOrder, ...prev]);

                    // Trigger browser notification for new orders
                    if (typeof window !== 'undefined' && Notification.permission === 'granted') {
                        const amount = newOrder.total;
                        const customer = newOrder.customer_name || 'Zákazník';
                        
                        new Notification('Nová objednávka! ⚡', {
                            body: `Částka: ${amount} Kč | Od: ${customer}`,
                            icon: '/logo.png' // Use site logo if available
                        });

                        // Play a subtle notification sound if possible
                        try {
                            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                            audio.play().catch(() => {/* ignore play restrictions */});
                        } catch (e) {}
                    }
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
            const productsList: Product[] = [];
            data.forEach((item: any) => {
                stockMap[item.sku] = item.quantity;
                productsList.push(item);
            });
            setStock(stockMap);
            setProducts(productsList);
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
                customer: {
                    name: o.customer_name,
                    email: o.customer_email
                },
                packeta_barcode: o.packeta_barcode,
                packeta_packet_id: o.packeta_packet_id,
            }));
            setOrders(mappedOrders);
        }
    };

    const addMovement = async (sku: SKU, amount: number, type: StockMovement['type'], note?: string) => {
        console.log(`[Inventory] Starting movement update: ${sku}, amount: ${amount}, type: ${type}`);

        // 1. Zkusíme profesionální cestu přes RPC
        const { error: rpcError } = await supabase.rpc('handle_stock_movement', {
            p_sku: sku,
            p_type: type,
            p_amount: amount,
            p_note: note
        });

        if (!rpcError) {
            console.log(`[Inventory] RPC success for ${sku}`);
            // OKAMŽITÁ AKTUALIZACE LOKÁLNÍHO STAVU (Optimistický update)
            setStock(prev => ({ ...prev, [sku]: (prev[sku] || 0) + amount }));
            setProducts(prev => prev.map(p => p.sku === sku ? { ...p, quantity: (p.quantity || 0) + amount } : p));
            return;
        }

        console.warn("[Inventory] RPC failed, trying direct fallback:", rpcError);

        // 2. FALLBACK: Přímý update tabulky inventory
        const currentQty = stock[sku] || 0;
        const newQty = currentQty + amount;

        const { error: updateError } = await supabase
            .from('inventory')
            .update({ quantity: newQty })
            .eq('sku', sku);

        if (updateError) {
            console.error("[Inventory] Direct update failed:", updateError);
            alert(`Sklad nelze aktualizovat. Chyba: ${updateError.message} (${updateError.code})`);
            return;
        }

        console.log(`[Inventory] Direct update success for ${sku}`);
        // OKAMŽITÁ AKTUALIZACE LOKÁLNÍHO STAVU
        setStock(prev => ({ ...prev, [sku]: newQty }));
        setProducts(prev => prev.map(p => p.sku === sku ? { ...p, quantity: newQty } : p));

        // 3. Volitelný zápis historie
        try {
            await supabase.from('stock_movements').insert({
                sku, type, amount, note: note || "Manual fallback",
                user_id: (await supabase.auth.getUser()).data.user?.id
            });
        } catch (e) {
            console.log("[Inventory] History log skipped.");
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
            packeta_barcode: order.packeta_barcode || null,
            packeta_packet_id: order.packeta_packet_id || null,
        });

        if (error) {
            console.error('Error adding order:', error);
            return false;
        }
        return true;
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);

        if (error) {
            console.error('Error updating order status:', error);
            alert("Chyba při aktualizaci stavu: " + error.message);
        } else {
            // Local state is updated via Realtime channel, but we can do it manually for immediate feedback
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
        }
    };

    const updateProduct = async (sku: string, updates: Partial<Product>) => {
        const { error } = await supabase
            .from('inventory')
            .update(updates)
            .eq('sku', sku);

        if (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    };

    const updateOrderPacketaInfo = async (orderId: string, barcode: string, packetId: string) => {
        const { error } = await supabase
            .from('orders')
            .update({
                packeta_barcode: barcode,
                packeta_packet_id: packetId
            })
            .eq('id', orderId);

        if (error) {
            console.error('Error updating packeta info:', error);
            throw error;
        }

        // Local state is updated via Realtime channel, but we can do it manually for immediate feedback
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, packeta_barcode: barcode, packeta_packet_id: packetId } : o));
    };

    return (
        <InventoryContext.Provider value={{
            stock,
            products,
            orders,
            movements,
            addMovement,
            updateStock,
            decrementStock,
            getStock,
            addOrder,
            updateOrderStatus,
            updateProduct,
            updateOrderPacketaInfo
        }}>
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
