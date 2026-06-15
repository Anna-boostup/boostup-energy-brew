import { useState } from "react";
import { useInvoice, ParsedItem } from "@/context/InvoiceContext";
import { useManufacture } from "@/context/ManufactureContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Settings, Users, Check, X, Link, Trash2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Invoices() {
    const { 
        invoices, suppliers, aliases, openaiKey, setOpenaiKey, loading,
        uploadAndParseInvoice, updateInvoiceStatus, addSupplier, deleteSupplier,
        addAlias, deleteAlias
    } = useInvoice();
    const { materials } = useManufacture();
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState("upload");
    const [apiKeyInput, setApiKeyInput] = useState(openaiKey);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // New Supplier State
    const [newSupplierName, setNewSupplierName] = useState("");
    const [newSupplierEmail, setNewSupplierEmail] = useState("");

    // New Alias State
    const [selectedSupplierId, setSelectedSupplierId] = useState("");
    const [selectedMaterialId, setSelectedMaterialId] = useState("");
    const [newAliasName, setNewAliasName] = useState("");

    // Review Invoice State
    const [reviewingInvoice, setReviewingInvoice] = useState<any | null>(null);
    const [mappedItems, setMappedItems] = useState<ParsedItem[]>([]);

    const handleUpload = async () => {
        if (!selectedFile) return;
        const success = await uploadAndParseInvoice(selectedFile);
        if (success) {
            setSelectedFile(null);
            setActiveTab("list");
        }
    };

    const handleSaveKey = () => {
        setOpenaiKey(apiKeyInput);
        toast({ title: "API Klíč uložen" });
    };

    const handleAddSupplier = async () => {
        if (!newSupplierName) return;
        const success = await addSupplier({ name: newSupplierName, email: newSupplierEmail });
        if (success) {
            setNewSupplierName("");
            setNewSupplierEmail("");
            toast({ title: "Dodavatel přidán" });
        }
    };

    const handleAddAlias = async () => {
        if (!selectedSupplierId || !selectedMaterialId || !newAliasName) return;
        const success = await addAlias({
            supplier_id: selectedSupplierId,
            material_id: selectedMaterialId,
            alias_name: newAliasName
        });
        if (success) {
            setNewAliasName("");
            toast({ title: "Párování přidáno" });
        }
    };

    const handleReviewInvoice = (inv: any) => {
        setReviewingInvoice(inv);
        setMappedItems(inv.parsed_data || []);
    };

    const handleConfirmRestock = async () => {
        if (!reviewingInvoice) return;
        
        // Ensure all mapped_material_id are selected
        const unmapped = mappedItems.filter(i => !i.mapped_material_id);
        if (unmapped.length > 0) {
            toast({
                title: "Chybí párování",
                description: "Některé položky z faktury nejsou napárované na interní suroviny.",
                variant: "destructive"
            });
            return;
        }

        const success = await updateInvoiceStatus(reviewingInvoice.id, 'processed', mappedItems);
        if (success) {
            setReviewingInvoice(null);
            setMappedItems([]);
        }
    };

    const handleRejectInvoice = async () => {
        if (!reviewingInvoice) return;
        await updateInvoiceStatus(reviewingInvoice.id, 'rejected');
        setReviewingInvoice(null);
        setMappedItems([]);
    };

    const [invoiceMailbox, setInvoiceMailbox] = useState<string | null>(null);

    // Fetch invoice mailbox
    useState(() => {
        const fetchMailbox = async () => {
            const { supabase } = await import('@/lib/supabase');
            const { data } = await supabase.from('mailboxes').select('email_address').eq('purpose', 'invoices').single();
            if (data) setInvoiceMailbox(data.email_address);
        };
        fetchMailbox();
    });

    return (
        <div className="space-y-12 pb-32 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex items-start gap-4 sm:gap-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-[1.8rem] sm:rounded-[2.2rem] bg-olive-dark flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-lime/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-white relative z-10" />
                    </div>
                    <div className="space-y-1 sm:space-y-2">
                        <h1 className="text-3xl sm:text-5xl font-black text-olive-dark tracking-tighter font-display uppercase italic leading-none">
                            Faktury
                        </h1>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                            <p className="text-olive-dark/70 font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px]">
                                Automatické naskladnění z faktur
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-12">
                <TabsList className="bg-olive-dark/5 p-1.5 rounded-2xl inline-flex border border-olive-dark/5 shadow-inner flex-wrap">
                    <TabsTrigger value="upload" className="rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-olive-dark data-[state=active]:text-white text-olive-dark/60 transition-all gap-2">
                        <Upload className="w-3.5 h-3.5" /> Nahrát Fakturu
                    </TabsTrigger>
                    <TabsTrigger value="list" className="rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-olive-dark data-[state=active]:text-white text-olive-dark/60 transition-all gap-2">
                        <FileText className="w-3.5 h-3.5" /> Seznam faktur
                    </TabsTrigger>
                    <TabsTrigger value="suppliers" className="rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-olive-dark data-[state=active]:text-white text-olive-dark/60 transition-all gap-2">
                        <Users className="w-3.5 h-3.5" /> Dodavatelé & Párování
                    </TabsTrigger>
                    <TabsTrigger value="settings" className="rounded-xl px-6 py-3 text-[10px] font-black uppercase tracking-wider data-[state=active]:bg-olive-dark data-[state=active]:text-white text-olive-dark/60 transition-all gap-2">
                        <Settings className="w-3.5 h-3.5" /> Nastavení AI
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-6">
                    <div className="glass-card rounded-[3.5rem] p-12 max-w-2xl mx-auto text-center space-y-8 border-2 border-dashed border-olive/20 hover:border-lime transition-all relative">
                        <div className="absolute top-6 right-8">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={async () => {
                                    const { supabase } = await import('@/lib/supabase');
                                    toast({ title: 'Spouštím kontrolu...', description: 'Stahuji nové zprávy z emailu.' });
                                    try {
                                        await supabase.functions.invoke('sync-emails');
                                        toast({ title: 'Hotovo', description: 'Nové faktury byly staženy.' });
                                        setTimeout(() => window.location.reload(), 1000);
                                    } catch (e: any) {
                                        toast({ title: 'Chyba', description: e.message, variant: 'destructive' });
                                    }
                                }}
                                className="rounded-xl bg-white/50 text-[10px] font-black uppercase"
                            >
                                Zkontrolovat email
                            </Button>
                        </div>
                        <div className="w-24 h-24 bg-olive-dark/5 rounded-[2.5rem] flex items-center justify-center mx-auto">
                            <Upload className="w-10 h-10 text-olive-dark/40" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black font-display uppercase italic text-olive-dark">Nahrát fakturu (PDF/Obrázek)</h2>
                            <p className="text-xs text-olive-dark/60 uppercase tracking-widest font-black max-w-md mx-auto">
                                Nahrajte přijatou fakturu nebo ji zašlete na e-mail:
                                {invoiceMailbox ? (
                                    <span className="block mt-2 text-sm text-primary bg-primary/10 py-1.5 px-3 rounded-lg border border-primary/20">{invoiceMailbox}</span>
                                ) : (
                                    <span className="block mt-2 text-xs italic opacity-70">Schránka pro faktury není nastavena v sekci Systém -&gt; Schránky</span>
                                )}
                            </p>
                        </div>
                        
                        <div className="flex flex-col items-center gap-4">
                            <Input 
                                type="file" 
                                accept="application/pdf,image/png,image/jpeg"
                                className="max-w-xs cursor-pointer file:cursor-pointer"
                                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            />
                            <Button 
                                onClick={handleUpload}
                                disabled={!selectedFile || loading || !openaiKey}
                                className="h-14 px-10 bg-lime text-olive-dark hover:bg-lime/80 font-black uppercase tracking-widest rounded-2xl w-full max-w-xs"
                            >
                                {loading ? "Zpracovávám (10-30s)..." : "Zpracovat přes AI"}
                            </Button>
                            {!openaiKey && (
                                <p className="text-red-500 text-xs font-bold mt-2">Před nahráním nastavte OpenAI API klíč v Nastavení AI.</p>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="list" className="space-y-6">
                    {reviewingInvoice ? (
                        <div className="glass-card rounded-[3.5rem] p-8 space-y-8">
                            <div className="flex justify-between items-center border-b border-olive/10 pb-6">
                                <div>
                                    <h2 className="text-2xl font-black font-display uppercase italic text-olive-dark">Revize naskladnění</h2>
                                    <p className="text-xs text-olive-dark/60 uppercase tracking-widest font-black mt-2">Zkontrolujte, jak AI přečetla fakturu</p>
                                </div>
                                <Button variant="outline" onClick={() => setReviewingInvoice(null)}>Zpět</Button>
                            </div>

                            <div className="space-y-4">
                                {mappedItems.map((item, idx) => (
                                    <div key={idx} className="flex flex-col sm:flex-row gap-6 items-center p-6 bg-white/40 rounded-2xl border border-white">
                                        <div className="flex-1 space-y-1">
                                            <p className="text-[10px] text-olive-dark/50 uppercase tracking-widest font-black">Nalezeno na faktuře</p>
                                            <p className="font-bold text-lg text-olive-dark">{item.name}</p>
                                            <p className="text-2xl font-black font-display italic text-olive-dark">{item.quantity} <span className="text-sm">{item.unit}</span></p>
                                        </div>
                                        <ArrowRight className="text-olive-dark/20 w-8 h-8 hidden sm:block" />
                                        <div className="flex-1 space-y-2 w-full">
                                            <Label className="text-[10px] text-olive-dark/50 uppercase tracking-widest font-black">Spárovat se surovinou</Label>
                                            <Select 
                                                value={item.mapped_material_id || ""}
                                                onValueChange={(val) => {
                                                    const newItems = [...mappedItems];
                                                    newItems[idx].mapped_material_id = val;
                                                    setMappedItems(newItems);
                                                }}
                                            >
                                                <SelectTrigger className="bg-white">
                                                    <SelectValue placeholder="Vyberte surovinu..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {materials.map(m => (
                                                        <SelectItem key={m.id} value={m.id}>{m.name} ({m.unit})</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end gap-4 pt-6 border-t border-olive/10">
                                <Button onClick={handleRejectInvoice} variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-50">Zamítnout</Button>
                                <Button onClick={handleConfirmRestock} className="bg-lime text-olive-dark font-black hover:bg-lime/80">Potvrdit a naskladnit</Button>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card rounded-[3.5rem] overflow-hidden border border-white/40 shadow-2xl">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-olive/10 bg-olive-dark">
                                        <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Datum</th>
                                        <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Položek</th>
                                        <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.3em] text-white/80">Stav</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-olive/5">
                                    {invoices.map(inv => (
                                        <tr key={inv.id} className="hover:bg-white/40 transition-colors">
                                            <td className="px-10 py-6">
                                                <p className="font-bold text-olive-dark">{new Date(inv.created_at).toLocaleDateString()}</p>
                                                {inv.file_url && (
                                                    <a href={inv.file_url} target="_blank" rel="noreferrer" className="text-xs text-olive hover:underline flex items-center gap-1 mt-1">
                                                        <Link className="w-3 h-3" /> Originál
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-10 py-6">
                                                <p className="font-black text-xl font-display italic text-olive-dark">{inv.parsed_data?.length || 0}</p>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                {inv.status === 'pending' ? (
                                                    <Button size="sm" className="bg-lime text-olive-dark font-black hover:bg-lime/80" onClick={() => handleReviewInvoice(inv)}>
                                                        Ke kontrole
                                                    </Button>
                                                ) : inv.status === 'processed' ? (
                                                    <span className="text-green-600 font-bold flex items-center justify-end gap-1"><Check className="w-4 h-4" /> Naskladněno</span>
                                                ) : (
                                                    <span className="text-red-500 font-bold flex items-center justify-end gap-1"><X className="w-4 h-4" /> Zamítnuto</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {invoices.length === 0 && (
                                        <tr><td colSpan={3} className="text-center py-10 text-olive-dark/50 font-bold">Zatím žádné faktury.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="suppliers" className="space-y-10">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
                            <h3 className="text-xl font-black font-display uppercase italic text-olive-dark">Nový dodavatel</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Název dodavatele</Label>
                                    <Input value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} placeholder="Např. BioMatcha s.r.o." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email (volitelné)</Label>
                                    <Input value={newSupplierEmail} onChange={e => setNewSupplierEmail(e.target.value)} placeholder="fakturace@biomatcha.cz" />
                                </div>
                                <Button onClick={handleAddSupplier} className="w-full bg-olive-dark text-white hover:bg-black font-black uppercase tracking-widest rounded-xl">
                                    Přidat dodavatele
                                </Button>
                            </div>
                            
                            <div className="mt-8 pt-8 border-t border-olive/10 space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-olive-dark/60">Seznam dodavatelů</h4>
                                {suppliers.map(s => (
                                    <div key={s.id} className="flex justify-between items-center p-3 bg-white/50 rounded-xl">
                                        <div>
                                            <p className="font-bold text-sm text-olive-dark">{s.name}</p>
                                            <p className="text-xs text-olive-dark/60">{s.email}</p>
                                        </div>
                                        <Button size="icon" variant="ghost" onClick={() => deleteSupplier(s.id)} className="text-red-500 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card rounded-[2.5rem] p-8 space-y-6">
                            <h3 className="text-xl font-black font-display uppercase italic text-olive-dark">Párování názvů (Aliasy)</h3>
                            <p className="text-xs text-olive-dark/60 mb-4">Naučte systém, že např. "Kyselina citronová 5kg" z faktury je interně surovina "Citric Acid". Systém si to zapamatuje.</p>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Dodavatel</Label>
                                    <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Vyberte dodavatele" /></SelectTrigger>
                                        <SelectContent>
                                            {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Název přesně tak, jak je na faktuře</Label>
                                    <Input value={newAliasName} onChange={e => setNewAliasName(e.target.value)} placeholder="Např. Matcha Premium 5kg" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Naše interní surovina</Label>
                                    <Select value={selectedMaterialId} onValueChange={setSelectedMaterialId}>
                                        <SelectTrigger className="bg-white"><SelectValue placeholder="Vyberte surovinu" /></SelectTrigger>
                                        <SelectContent>
                                            {materials.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button onClick={handleAddAlias} className="w-full bg-lime text-olive-dark hover:bg-lime/80 font-black uppercase tracking-widest rounded-xl">
                                    Přidat párování
                                </Button>
                            </div>

                            <div className="mt-8 pt-8 border-t border-olive/10 space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-olive-dark/60">Aktivní párování</h4>
                                {aliases.map(a => {
                                    const supplier = suppliers.find(s => s.id === a.supplier_id);
                                    const material = materials.find(m => m.id === a.material_id);
                                    return (
                                        <div key={a.id} className="flex flex-col gap-1 p-3 bg-white/50 rounded-xl">
                                            <div className="flex justify-between">
                                                <p className="font-bold text-sm text-olive-dark">"{a.alias_name}"</p>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500" onClick={() => deleteAlias(a.id)}><Trash2 className="w-3 h-3"/></Button>
                                            </div>
                                            <p className="text-[10px] text-olive-dark/60 uppercase tracking-widest">
                                                {supplier?.name || "Neznámý dodavatel"} <ArrowRight className="inline w-3 h-3 mx-1" /> {material?.name}
                                            </p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    <div className="glass-card rounded-[3.5rem] p-12 max-w-2xl mx-auto space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black font-display uppercase italic text-olive-dark flex items-center gap-3">
                                <Settings className="w-6 h-6 text-lime" />
                                Nastavení AI Integrace
                            </h2>
                            <p className="text-sm text-olive-dark/60 font-bold">
                                Pro čtení faktur využíváme modely OpenAI (GPT-4o). Vložte prosím svůj API klíč. Z bezpečnostních důvodů je uložen pouze ve vašem lokálním prohlížeči a nikam jinam se neposílá (ani do databáze).
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            <Label htmlFor="api_key">OpenAI API Klíč (sk-proj-...)</Label>
                            <Input 
                                id="api_key"
                                type="password" 
                                value={apiKeyInput}
                                onChange={e => setApiKeyInput(e.target.value)}
                                placeholder="sk-..."
                                className="font-mono bg-white"
                            />
                            <Button onClick={handleSaveKey} className="w-full bg-olive-dark text-white hover:bg-black font-black uppercase tracking-widest rounded-xl">
                                Uložit API klíč do prohlížeče
                            </Button>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
