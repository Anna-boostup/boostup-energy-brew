import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useManufacture } from "@/context/ManufactureContext";

// Types
export interface Supplier {
    id: string;
    name: string;
    email: string | null;
    contact_person: string | null;
    notes: string | null;
    created_at: string;
}

export interface MaterialAlias {
    id: string;
    supplier_id: string;
    material_id: string;
    alias_name: string;
    created_at: string;
}

export interface ParsedItem {
    name: string;
    quantity: number;
    unit: string;
    mapped_material_id: string | null; // null if we couldn't auto-map
}

export interface Invoice {
    id: string;
    supplier_id: string | null;
    invoice_number: string | null;
    file_url: string | null;
    status: 'pending' | 'processed' | 'error' | 'rejected';
    parsed_data: ParsedItem[] | null;
    error_message: string | null;
    created_at: string;
    processed_at: string | null;
}

// Context
interface InvoiceContextType {
    suppliers: Supplier[];
    aliases: MaterialAlias[];
    invoices: Invoice[];
    loading: boolean;
    
    // Suppliers
    fetchSuppliers: () => Promise<void>;
    addSupplier: (supplier: Partial<Supplier>) => Promise<boolean>;
    updateSupplier: (id: string, updates: Partial<Supplier>) => Promise<boolean>;
    deleteSupplier: (id: string) => Promise<boolean>;
    
    // Aliases
    fetchAliases: () => Promise<void>;
    addAlias: (alias: Partial<MaterialAlias>) => Promise<boolean>;
    deleteAlias: (id: string) => Promise<boolean>;
    
    // Invoices
    fetchInvoices: () => Promise<void>;
    uploadAndParseInvoice: (file: File) => Promise<boolean>;
    updateInvoiceStatus: (id: string, status: Invoice['status'], mappedData?: ParsedItem[]) => Promise<boolean>;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { toast } = useToast();
    const { fetchMaterials } = useManufacture();
    
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [aliases, setAliases] = useState<MaterialAlias[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);

    // Load Data
    useEffect(() => {
        fetchSuppliers();
        fetchAliases();
        fetchInvoices();
    }, []);

    const fetchSuppliers = async () => {
        const { data, error } = await supabase.from('suppliers').select('*').order('name');
        if (error) {
            console.error("Error fetching suppliers:", error);
            return;
        }
        setSuppliers(data || []);
    };

    const addSupplier = async (supplier: Partial<Supplier>) => {
        const { error } = await supabase.from('suppliers').insert(supplier);
        if (error) {
            console.error("Error adding supplier:", error);
            return false;
        }
        await fetchSuppliers();
        return true;
    };

    const updateSupplier = async (id: string, updates: Partial<Supplier>) => {
        const { error } = await supabase.from('suppliers').update(updates).eq('id', id);
        if (error) {
            console.error("Error updating supplier:", error);
            return false;
        }
        await fetchSuppliers();
        return true;
    };

    const deleteSupplier = async (id: string) => {
        const { error } = await supabase.from('suppliers').delete().eq('id', id);
        if (error) {
            console.error("Error deleting supplier:", error);
            return false;
        }
        await fetchSuppliers();
        return true;
    };

    const fetchAliases = async () => {
        const { data, error } = await supabase.from('material_aliases').select('*');
        if (error) {
            console.error("Error fetching aliases:", error);
            return;
        }
        setAliases(data || []);
    };

    const addAlias = async (alias: Partial<MaterialAlias>) => {
        const { error } = await supabase.from('material_aliases').insert(alias);
        if (error) {
            console.error("Error adding alias:", error);
            return false;
        }
        await fetchAliases();
        return true;
    };

    const deleteAlias = async (id: string) => {
        const { error } = await supabase.from('material_aliases').delete().eq('id', id);
        if (error) {
            console.error("Error deleting alias:", error);
            return false;
        }
        await fetchAliases();
        return true;
    };

    const fetchInvoices = async () => {
        const { data, error } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Error fetching invoices:", error);
            return;
        }
        setInvoices(data || []);
    };

    // Helper: Convert File to Base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const encoded = reader.result as string;
                // Remove data prefix
                const base64 = encoded.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    const extractTextFromPdf = async (file: File): Promise<string> => {
        try {
            const pdfjsLib = await import('pdfjs-dist');
            // In Vite, to use the worker, we can do this:
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
            
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(" ");
                fullText += pageText + "\n";
            }
            return fullText;
        } catch (e) {
            console.error("PDF Extraction error:", e);
            throw new Error("Nepodařilo se přečíst text z PDF faktury.");
        }
    };

    const uploadAndParseInvoice = async (file: File) => {
        setLoading(true);
        try {
            // 1. Upload to Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `invoices/${fileName}`;

            const { error: uploadError } = await supabase.storage.from('invoices').upload(filePath, file);
            let fileUrl = "";
            if (!uploadError) {
                const { data } = supabase.storage.from('invoices').getPublicUrl(filePath);
                fileUrl = data.publicUrl;
            }

            const isPdf = file.type === 'application/pdf';
            const mimeType = file.type;

            const payload: any = {};
            if (isPdf) {
                payload.text = await extractTextFromPdf(file);
            } else {
                const base64File = await fileToBase64(file);
                // remove data:image/png;base64, prefix if fileToBase64 returns it
                const base64Content = base64File.includes('base64,') ? base64File.split('base64,')[1] : base64File;
                payload.image_base64 = base64Content;
                payload.mime_type = mimeType;
            }

            const { data, error } = await supabase.functions.invoke('parse-invoice', {
                body: payload
            });

            if (error) {
                console.error("Parse invoice error:", error);
                throw new Error("Chyba při komunikaci s parse-invoice edge function.");
            }

            if (data.error) {
                console.error("Parse invoice error data:", data.error);
                throw new Error("Chyba zpracování faktury na serveru.");
            }
            
            // Parse JSON (edge function already returns parsed items array or handles the parse)
            let parsedItems = data.items || [];
            
            if (parsedItems.length === 0 && Array.isArray(data)) {
                parsedItems = data;
            }

            // 4. Map items based on material_aliases
            // We fetch the current aliases just to be sure
            const currentAliases = [...aliases];
            
            const mappedItems: ParsedItem[] = parsedItems.map((item: any) => {
                const foundAlias = currentAliases.find(a => a.alias_name.toLowerCase() === item.name?.toLowerCase());
                return {
                    name: item.name || "Neznámá položka",
                    quantity: parseFloat(item.quantity) || 0,
                    unit: item.unit || "ks",
                    mapped_material_id: foundAlias ? foundAlias.material_id : null
                };
            });

            // 5. Save to database as pending invoice
            const { error: dbError } = await supabase.from('invoices').insert({
                file_url: fileUrl,
                status: 'pending',
                parsed_data: mappedItems
            });

            if (dbError) throw dbError;

            toast({
                title: "Faktura úspěšně přečtena",
                description: `Bylo nalezeno ${mappedItems.length} položek. Zkontrolujte je a potvrďte naskladnění.`
            });

            await fetchInvoices();
            return true;
        } catch (error: any) {
            console.error("Invoice parsing error:", error);
            toast({
                title: "Chyba při zpracování",
                description: error.message || "Nepodařilo se zpracovat fakturu.",
                variant: "destructive"
            });
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateInvoiceStatus = async (id: string, status: Invoice['status'], mappedData?: ParsedItem[]) => {
        const updateData: any = { status };
        if (status === 'processed') {
            updateData.processed_at = new Date().toISOString();
        }
        if (mappedData) {
            updateData.parsed_data = mappedData;
        }

        const { error } = await supabase.from('invoices').update(updateData).eq('id', id);
        if (error) {
            console.error("Error updating invoice status:", error);
            return false;
        }
        await fetchInvoices();
        
        if (status === 'processed') {
            toast({
                title: "Faktura zpracována",
                description: "Suroviny byly přidány do systému (po napojení na naskladnění).",
            });
            // We will hook this to actual restock function later
        }

        return true;
    };

    return (
        <InvoiceContext.Provider value={{
            suppliers, aliases, invoices, loading,
            fetchSuppliers, addSupplier, updateSupplier, deleteSupplier,
            fetchAliases, addAlias, deleteAlias,
            fetchInvoices, uploadAndParseInvoice, updateInvoiceStatus
        }}>
            {children}
        </InvoiceContext.Provider>
    );
};

export const useInvoice = () => {
    const context = useContext(InvoiceContext);
    if (!context) throw new Error("useInvoice must be used within an InvoiceProvider");
    return context;
};
