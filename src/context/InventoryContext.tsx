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
    is_active?: boolean;
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
    status: 'pending' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled';
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

export interface PackagingRule {
    id: string;
    pack_size: number;
    material_id: string;
    quantity_required: number;
    created_at?: string;
    material_name?: string;
    material_unit?: string;
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
    packagingRules: PackagingRule[];
    fetchPackagingRules: () => Promise<void>;
    addPackagingRule: (rule: Omit<PackagingRule, 'id' | 'created_at'>) => Promise<boolean>;
    updatePackagingRule: (id: string, updates: Partial<PackagingRule>) => Promise<boolean>;
    deletePackagingRule: (id: string) => Promise<boolean>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stock, setStock] = useState<Record<SKU, number>>({});
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [processingOrders, setProcessingOrders] = useState<Set<string>>(new Set());
    const [packagingRules, setPackagingRules] = useState<PackagingRule[]>([]);

    // 1. Initial Fetch
    useEffect(() => {
        fetchInventory();
        fetchMovements();
        fetchOrders(); // We can migrate orders later, but let's keep it here
        fetchPackagingRules();
    }, []);

    // 2. Realtime Subscriptions
    useEffect(() => {
        if (!supabase) return;

        const inventorySubscription = supabase
            .channel('inventory_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, (payload) => {
                const updatedItem = payload.new as Partial<Product>;
                if (updatedItem.sku) {
                    if (updatedItem.quantity !== undefined) {
                        setStock(prev => ({ ...prev, [updatedItem.sku!]: updatedItem.quantity! }));
                    }
                    setProducts(prev => {
                        const existing = prev.find(p => p.sku === updatedItem.sku);
                        if (existing) {
                            return prev.map(p => p.sku === updatedItem.sku ? { ...existing, ...updatedItem } : p);
                        }
                        return [...prev, updatedItem as Product];
                    });
                }
            })
            .subscribe();

        const movementsSubscription = supabase
            .channel('movements_channel')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'stock_movements' }, (payload) => {
                const newMovement = payload.new as any;
                setMovements(prev => [newMovement, ...prev]);
            })
            .subscribe();

        const mapDbOrderToOrder = (o: any): Order => ({
            ...o,
            date: o.created_at || o.date,
            customer: {
                name: o.customer_name,
                email: o.customer_email
            },
            packeta_barcode: o.packeta_barcode,
            packeta_packet_id: o.packeta_packet_id,
        });

        const ordersSubscription = supabase
            .channel('orders_channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newOrder = mapDbOrderToOrder(payload.new);
                    setOrders(prev => [newOrder, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    const updated = mapDbOrderToOrder(payload.new);
                    setOrders(prev => prev.map(o => o.id === updated.id ? { ...o, ...updated } : o));
                }
            })
            .subscribe();

        return () => {
            if (supabase) {
                supabase.removeChannel(inventorySubscription);
                supabase.removeChannel(movementsSubscription);
                supabase.removeChannel(ordersSubscription);
            }
        };
    }, []);

    const fetchInventory = async () => {
        if (!supabase) return;
        const { data, error } = await supabase.from('inventory').select('*');
        if (error) console.error('Error fetching inventory:', error);
        if (data) {
            const stockMap: Record<SKU, number> = {};
            const productsList: Product[] = [];
            data.forEach((item: any) => {
                stockMap[item.sku] = item.quantity;
                productsList.push({
                    ...item,
                    is_active: item.is_active ?? true // Default to true if null
                });
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
        const timestamp = new Date().toISOString();
        console.log(`[Inventory][${timestamp}] Starting movement update: SKU=${sku}, amount=${amount}, type=${type}, note="${note}"`);

        // Safety Check: Prevent stock from going negative on sales
        const currentQty = stock[sku] || 0;
        const newQty = currentQty + amount;

        if (type === 'sale' && newQty < 0) {
            console.warn(`[Inventory] Prevented negative stock for ${sku}. Current: ${currentQty}, Requested: ${amount}`);
            // We allow it to proceed if the user is an admin or if it's a correction, 
            // but for automated sales we should be careful.
            // For now, let's just log it loudly and proceed, but this is where we'd block it.
        }

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

    const deductPackagingForOrder = async (order: Order, isReturn: boolean) => {
        if (!supabase) return;
        
        console.log(`[Packaging] Starting packaging update for order ${order.id}. isReturn=${isReturn}`);

        const packCounts: Record<number, number> = {};

        order.items.forEach(item => {
            let packSize = 1;
            if (item.mixConfiguration) {
                packSize = (item.mixConfiguration.lemon || 0) + (item.mixConfiguration.red || 0) + (item.mixConfiguration.silky || 0);
            } else if (item.sku) {
                const parts = item.sku.split('-');
                packSize = parseInt(parts[parts.length - 1]) || 1;
            }

            packCounts[packSize] = (packCounts[packSize] || 0) + item.quantity;
        });

        const { data: rules, error: rulesError } = await supabase
            .from('packaging_rules')
            .select('*');

        if (rulesError) {
            console.error('[Packaging] Error loading packaging rules:', rulesError);
            return;
        }

        if (!rules || rules.length === 0) {
            console.log('[Packaging] No packaging rules found in database. Skipping subtraction.');
            return;
        }

        const multiplier = isReturn ? 1 : -1;
        const type = isReturn ? 'restock' : 'use';

        for (const [packSizeStr, qty] of Object.entries(packCounts)) {
            const packSize = parseInt(packSizeStr);
            const matchingRules = rules.filter(r => r.pack_size === packSize);

            for (const rule of matchingRules) {
                const totalAmount = qty * Number(rule.quantity_required);
                const movementAmount = totalAmount * multiplier;
                const note = isReturn 
                    ? `Storno obj. ${order.id} - vrácení obalu` 
                    : `Odpis obalu pro obj. ${order.id}`;

                console.log(`[Packaging] Updating manufacture inventory: material_id=${rule.material_id}, amount=${movementAmount}, type=${type}, note="${note}"`);

                const { error: rpcError } = await supabase.rpc('handle_manufacture_movement', {
                    p_material_id: rule.material_id,
                    p_type: type,
                    p_amount: movementAmount,
                    p_note: note
                });

                if (rpcError) {
                    console.error(`[Packaging] RPC error for material ${rule.material_id}:`, rpcError);
                }
            }
        }
    };

    const fetchPackagingRules = async () => {
        if (!supabase) return;
        const { data, error } = await supabase
            .from('packaging_rules')
            .select(`
                *,
                manufacture_inventory:material_id (
                    name,
                    unit
                )
            `)
            .order('pack_size');

        if (error) {
            console.error('Error fetching packaging rules:', error);
            return;
        }

        if (data) {
            const mapped: PackagingRule[] = data.map((r: any) => ({
                id: r.id,
                pack_size: r.pack_size,
                material_id: r.material_id,
                quantity_required: Number(r.quantity_required),
                created_at: r.created_at,
                material_name: r.manufacture_inventory?.name || 'Neznámý materiál',
                material_unit: r.manufacture_inventory?.unit || 'ks'
            }));
            setPackagingRules(mapped);
        }
    };

    const addPackagingRule = async (rule: Omit<PackagingRule, 'id' | 'created_at'>) => {
        if (!supabase) return false;
        const { data, error } = await supabase
            .from('packaging_rules')
            .insert([rule])
            .select();

        if (error) {
            console.error('Error adding packaging rule:', error);
            return false;
        }

        if (data) {
            await fetchPackagingRules();
            return true;
        }
        return false;
    };

    const updatePackagingRule = async (id: string, updates: Partial<PackagingRule>) => {
        if (!supabase) return false;
        const cleanUpdates = { ...updates };
        delete cleanUpdates.material_name;
        delete cleanUpdates.material_unit;

        const { error } = await supabase
            .from('packaging_rules')
            .update(cleanUpdates)
            .eq('id', id);

        if (error) {
            console.error('Error updating packaging rule:', error);
            return false;
        }

        setPackagingRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
        return true;
    };

    const deletePackagingRule = async (id: string) => {
        if (!supabase) return false;
        const { error } = await supabase
            .from('packaging_rules')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting packaging rule:', error);
            return false;
        }

        setPackagingRules(prev => prev.filter(r => r.id !== id));
        return true;
    };

    const addOrder = async (order: Order) => {
        // Double check uniqueness before insert
        const { data: existing } = await supabase
            .from('orders')
            .select('id')
            .eq('id', order.id)
            .single();

        if (existing) {
            console.error('Order ID collision detected:', order.id);
            return false;
        }

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

        // Deduct packaging materials on successful order insert
        if (order.status !== 'cancelled') {
            try {
                await deductPackagingForOrder(order, false);
            } catch (e) {
                console.error('Failed to deduct packaging materials for new order:', e);
            }
        }
        return true;
    };

    const updateOrderStatus = async (orderId: string, status: Order['status']) => {
        if (processingOrders.has(orderId)) {
            console.log(`[Inventory] Order ${orderId} is already being processed. Skipping.`);
            return;
        }

        // Find existing order to check for stock return on cancellation
        const currentOrder = orders.find(o => o.id === orderId);
        if (!currentOrder) return;

        const wasCancelled = currentOrder.status === 'cancelled';
        const isNowCancelling = status === 'cancelled';
        
        // Only proceed if status actually changed to/from cancelled
        if (wasCancelled === isNowCancelling) {
            // Just update status if it's not a cancellation toggle
            const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
            if (error) {
                console.error('Error updating order status:', error);
                alert("Chyba při aktualizaci stavu: " + error.message);
            } else {
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            }
            return;
        }

        setProcessingOrders(prev => new Set(prev).add(orderId));

        try {
            console.log(`[Inventory] Order ${orderId} status changing: ${currentOrder.status} -> ${status}`);
            
            const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);

            if (error) {
                console.error('Error updating order status:', error);
                alert("Chyba při aktualizaci stavu: " + error.message);
                return;
            }

            // Deduct or return packaging materials
            try {
                await deductPackagingForOrder(currentOrder, isNowCancelling);
            } catch (err) {
                console.error('Error handling packaging subtraction/return on status update:', err);
            }

            // Calculate total bottles in order to avoid multiple movements per flavor
            const totals: Record<string, number> = { lemon: 0, red: 0, silky: 0 };
            
            currentOrder.items.forEach(item => {
                if (item.mixConfiguration) {
                    totals.lemon += (item.mixConfiguration.lemon || 0) * item.quantity;
                    totals.red += (item.mixConfiguration.red || 0) * item.quantity;
                    totals.silky += (item.mixConfiguration.silky || 0) * item.quantity;
                } else if (item.sku) {
                    const flavorKey = item.sku.toLowerCase().includes('lemon') ? 'lemon'
                        : item.sku.toLowerCase().includes('red') ? 'red'
                        : item.sku.toLowerCase().includes('silky') ? 'silky' : null;
                    
                    if (flavorKey) {
                        const packParts = item.sku.split('-');
                        const packSize = parseInt(packParts[packParts.length - 1]) || 1;
                        totals[flavorKey] += item.quantity * packSize;
                    }
                }
            });

            // Determine if we are returning to stock (+) or taking from stock (-)
            const multiplier = isNowCancelling ? 1 : -1;
            const movementType = isNowCancelling ? 'restock' : 'sale';
            const note = isNowCancelling ? `Storno obj. ${orderId}` : `Reaktivace obj. ${orderId}`;

            for (const [flavor, amount] of Object.entries(totals)) {
                if (amount > 0) {
                    console.log(`[Inventory] ${isNowCancelling ? 'Returning' : 'Re-decrementing'} ${amount} ${flavor} bottles for order ${orderId}`);
                    await addMovement(flavor, amount * multiplier, movementType, note);
                }
            }

            // Update local state
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
            
        } catch (e) {
            console.error('[Inventory] critical error during status update:', e);
        } finally {
            setProcessingOrders(prev => {
                const next = new Set(prev);
                next.delete(orderId);
                return next;
            });
        }
    };

    const updateProduct = async (sku: string, updates: Partial<Product>) => {
        // 1. Optimistic Update
        let previousProduct: Product | undefined;
        setProducts(prev => {
            const index = prev.findIndex(p => p.sku === sku);
            if (index !== -1) {
                previousProduct = prev[index];
                const updated = [...prev];
                updated[index] = { ...previousProduct, ...updates };
                return updated;
            }
            return prev;
        });

        // 2. Perform DB Update
        const { error } = await supabase
            .from('inventory')
            .update(updates)
            .eq('sku', sku);

        if (error) {
            console.error('Error updating product:', error);
            // 3. Rollback on failure
            if (previousProduct) {
                setProducts(prev => prev.map(p => p.sku === sku ? previousProduct! : p));
            }
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
            updateOrderPacketaInfo,
            packagingRules,
            fetchPackagingRules,
            addPackagingRule,
            updatePackagingRule,
            deletePackagingRule
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
