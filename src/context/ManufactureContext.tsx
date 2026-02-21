import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface ManufactureMaterial {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    min_quantity: number;
    notifications_enabled: boolean;
    created_at: string;
}

export interface ManufactureMovement {
    id: string;
    material_id: string;
    type: 'restock' | 'use' | 'correction';
    amount: number;
    note?: string;
    user?: {
        email: string;
        full_name: string;
    };
    created_at: string;
}

interface ManufactureContextType {
    materials: ManufactureMaterial[];
    movements: ManufactureMovement[];
    loading: boolean;
    fetchMaterials: () => Promise<void>;
    addMovement: (materialId: string, amount: number, type: ManufactureMovement['type'], note?: string) => Promise<void>;
    addMaterial: (material: Omit<ManufactureMaterial, 'id' | 'created_at' | 'quantity'>) => Promise<void>;
    updateMaterial: (id: string, updates: Partial<ManufactureMaterial>) => Promise<void>;
}

const ManufactureContext = createContext<ManufactureContextType | undefined>(undefined);

export const ManufactureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [materials, setMaterials] = useState<ManufactureMaterial[]>([]);
    const [movements, setMovements] = useState<ManufactureMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const alertTriggered = useRef(false);

    useEffect(() => {
        fetchMaterials();
        fetchMovements();
    }, []);

    useEffect(() => {
        if (!loading && materials.length > 0 && !alertTriggered.current) {
            const lowStockItems = materials.filter(m => m.notifications_enabled && m.quantity <= m.min_quantity);
            if (lowStockItems.length > 0) {
                toast({
                    title: "⚠️ Nízký stav zásob ve výrobě",
                    description: `Následující položky docházejí: ${lowStockItems.map(m => m.name).join(", ")}.`,
                    variant: "destructive",
                    duration: 10000,
                });
                alertTriggered.current = true;
            }
        }
    }, [loading, materials, toast]);

    const fetchMaterials = async () => {
        const { data, error } = await supabase
            .from('manufacture_inventory')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching materials:', error);
        } else {
            setMaterials(data || []);
        }
        setLoading(false);
    };

    const fetchMovements = async () => {
        const { data, error } = await supabase
            .from('manufacture_movements')
            .select('*, profiles(email, full_name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching movements:', error);
        } else {
            setMovements(data.map((m: any) => ({
                ...m,
                user: m.profiles
            })) || []);
        }
    };

    const addMovement = async (materialId: string, amount: number, type: ManufactureMovement['type'], note?: string) => {
        const { error } = await supabase.rpc('handle_manufacture_movement', {
            p_material_id: materialId,
            p_type: type,
            p_amount: amount,
            p_note: note
        });

        if (error) {
            console.error('Error logging movement:', error);
            throw error;
        }

        // Optimistic UI update
        setMaterials(prev => prev.map(m =>
            m.id === materialId ? { ...m, quantity: Number(m.quantity) + amount } : m
        ));
        fetchMovements();
    };

    const addMaterial = async (material: Omit<ManufactureMaterial, 'id' | 'created_at' | 'quantity'>) => {
        const { data, error } = await supabase
            .from('manufacture_inventory')
            .insert([material])
            .select();

        if (error) {
            console.error('Error adding material:', error);
            throw error;
        }

        if (data) {
            setMaterials(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
        }
    };

    const updateMaterial = async (id: string, updates: Partial<ManufactureMaterial>) => {
        const { error } = await supabase
            .from('manufacture_inventory')
            .update(updates)
            .eq('id', id);

        if (error) {
            console.error('Error updating material:', error);
            throw error;
        }

        setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    };

    return (
        <ManufactureContext.Provider value={{
            materials,
            movements,
            loading,
            fetchMaterials,
            addMovement,
            addMaterial,
            updateMaterial
        }}>
            {children}
        </ManufactureContext.Provider>
    );
};

export const useManufacture = () => {
    const context = useContext(ManufactureContext);
    if (!context) {
        throw new Error("useManufacture must be used within a ManufactureProvider");
    }
    return context;
};
