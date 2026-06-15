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
    openaiKey: string;
    setOpenaiKey: (key: string) => void;
    
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
    const [openaiKey, setOpenaiKeyState] = useState<string>("");

    // Load API Key from localStorage
    useEffect(() => {
        const storedKey = localStorage.getItem("boostup_openai_key");
        if (storedKey) setOpenaiKeyState(storedKey);
        
        fetchSuppliers();
        fetchAliases();
        fetchInvoices();
    }, []);

    const setOpenaiKey = (key: string) => {
        localStorage.setItem("boostup_openai_key", key);
        setOpenaiKeyState(key);
    };

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
                let encoded = reader.result as string;
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
        if (!openaiKey) {
            toast({
                title: "Chybí API Klíč",
                description: "Pro čtení faktur musíte v nastavení vložit OpenAI API klíč.",
                variant: "destructive"
            });
            return false;
        }

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

            let messages: any[] = [
                {
                    "role": "system",
                    "content": "Jsi asistent pro vytěžování dat z faktur. Tvým úkolem je najít na faktuře seznam položek (surovin, materiálů), jejich množství a měrné jednotky. Vrať čistě JSON pole s objekty typu: { \"name\": \"název suroviny\", \"quantity\": číslo, \"unit\": \"kg/ks/l...\" }. Nepiš žádný text kolem, pouze platný JSON. Objekt může mít obalovou vlastnost 'items', ve které bude to pole."
                }
            ];

            if (isPdf) {
                const text = await extractTextFromPdf(file);
                messages.push({
                    "role": "user",
                    "content": `Extrahuj položky z následujícího textu faktury:\n\n${text}`
                });
            } else {
                const base64File = await fileToBase64(file);
                messages.push({
                    "role": "user",
                    "content": [
                        { "type": "text", "text": "Extrahuj položky z této faktury:" },
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": `data:${mimeType};base64,${base64File}`
                            }
                        }
                    ]
                });
            }

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${openaiKey}`
                },
                body: JSON.stringify({
                    model: isPdf ? "gpt-4o-mini" : "gpt-4o",
                    messages: messages,
                    temperature: 0.1,
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                throw new Error("Chyba při komunikaci s OpenAI API. Zkontrolujte API klíč.");
            }

            const result = await response.json();
            const content = result.choices[0].message.content;
            
            // Parse JSON
            let parsedItems = [];
            try {
                const parsed = JSON.parse(content);
                // Handle different structures
                if (Array.isArray(parsed)) {
                    parsedItems = parsed;
                } else if (parsed.items && Array.isArray(parsed.items)) {
                    parsedItems = parsed.items;
                } else {
                    // Try to find any array inside the object
                    const possibleArray = Object.values(parsed).find(Array.isArray);
                    if (possibleArray) {
                        parsedItems = possibleArray;
                    } else {
                        parsedItems = [parsed];
                    }
                }
            } catch (e) {
                throw new Error("AI nevrátila validní data.");
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
            suppliers, aliases, invoices, loading, openaiKey, setOpenaiKey,
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
