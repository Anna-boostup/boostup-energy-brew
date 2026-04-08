import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useContent } from "@/context/ContentContext";
import { updateSiteContent } from "@/lib/cms";
import { Eye, EyeOff, Gift } from "lucide-react";

interface PromoCode {
    id: string;
    code: string;
    discount_percent: number;
    is_active: boolean;
    created_at: string;
}

const PromoCodes = () => {
    const [codes, setCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New code form state
    const [newCode, setNewCode] = useState("");
    const [newDiscount, setNewDiscount] = useState(10);

    const fetchCodes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('promo_codes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCodes(data || []);
        } catch (error: any) {
            console.error("Error fetching promo codes:", error);
            toast.error("Nepodařilo se načíst slevové kódy: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCodes();
    }, []);

    const handleAddCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCode.trim()) return;

        try {
            setIsSubmitting(true);
            const { error } = await supabase
                .from('promo_codes')
                .insert([{ 
                    code: newCode.trim().toUpperCase(), 
                    discount_percent: newDiscount,
                    is_active: true 
                }]);

            if (error) throw error;

            toast.success("Slevový kód byl úspěšně vytvořen");
            setIsAddOpen(false);
            setNewCode("");
            setNewDiscount(10);
            fetchCodes();
        } catch (error: any) {
            console.error("Error adding promo code:", error);
            toast.error("Nepodařilo se vytvořit kód: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleCodeStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('promo_codes')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            
            setCodes(codes.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
            toast.success(`Kód byl ${!currentStatus ? 'aktivován' : 'deaktivován'}`);
        } catch (error: any) {
            console.error("Error toggling promo code:", error);
            toast.error("Chyba při změně stavu kódu");
        }
    };

    const deleteCode = async (id: string) => {
        if (!window.confirm("Opravdu chcete tento slevový kód smazat?")) return;

        try {
            const { error } = await supabase
                .from('promo_codes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setCodes(codes.filter(c => c.id !== id));
            toast.success("Kód byl smazán");
        } catch (error: any) {
            console.error("Error deleting promo code:", error);
            toast.error("Chyba při mazání kódu");
        }
    };

    const { contentCZ, contentEN, refreshContent } = useContent();
    const [popupSaving, setPopupSaving] = useState(false);
    
    const handleTogglePopup = async (visible: boolean) => {
        try {
            setPopupSaving(true);
            const newCz = { ...contentCZ, hero: { ...contentCZ.hero, showDiscountPopup: visible } };
            const newEn = { ...contentEN, hero: { ...contentEN.hero, showDiscountPopup: visible } };
            await updateSiteContent(newCz, 'main');
            await updateSiteContent(newEn, 'en');
            await refreshContent();
            toast.success(`Pop-up byl ${visible ? 'zapnut' : 'vypnut'}`);
        } catch (error) {
            toast.error('Chyba při změně pop-upu');
        } finally {
            setPopupSaving(false);
        }
    };

    const handleCodeChange = async (newCodeValue: string) => {
        try {
            setPopupSaving(true);
            const newCz = { ...contentCZ, hero: { ...contentCZ.hero, discountCode: newCodeValue } };
            const newEn = { ...contentEN, hero: { ...contentEN.hero, discountCode: newCodeValue } };
            await updateSiteContent(newCz, 'main');
            await updateSiteContent(newEn, 'en');
            await refreshContent();
            toast.success(`Kód pop-upu změněn na ${newCodeValue}`);
        } catch (error) {
            toast.error('Chyba při změně kódu');
        } finally {
            setPopupSaving(false);
        }
    };

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 flex-wrap">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 font-display uppercase">Slevové kódy</h2>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Správa marketingových kampaní a slev.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-14 px-8 bg-slate-900 hover:bg-black text-primary gap-3 font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-900/10 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                            <Plus className="h-5 w-5" />
                            Vytvořit nový kód
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-none shadow-2xl p-8">
                        <form onSubmit={handleAddCode} className="space-y-8">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black text-slate-900 font-display">Nový slevový kód</DialogTitle>
                                <DialogDescription className="text-slate-400 font-medium">
                                    Definujte parametry slevy, kterou zákazníci uplatní v košíku.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Unikátní kód (např. BOOST20)</Label>
                                    <Input
                                        id="code"
                                        placeholder="Zadejte text..."
                                        value={newCode}
                                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                                        className="h-14 rounded-2xl border-slate-200 font-mono font-black text-xl tracking-widest uppercase focus-visible:ring-primary focus-visible:border-primary shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discount" className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Výše slevy v %</Label>
                                    <div className="relative">
                                        <Input
                                            id="discount"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={newDiscount}
                                            onChange={(e) => setNewDiscount(parseInt(e.target.value))}
                                            className="h-14 rounded-2xl border-slate-200 font-display font-black text-xl focus-visible:ring-primary focus-visible:border-primary shadow-sm pr-12"
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-slate-300">%</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 text-[11px] font-bold text-slate-500 leading-relaxed border border-slate-100 italic">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-slate-400 mt-0.5" />
                                    <p>Sleva se nesčítá se slevou na předplatné (15%). Systém automaticky vybere výhodnější variantu.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-slate-900 hover:bg-black text-primary font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-900/10">
                                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Vytvořit kód"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="mb-10 border border-white/40 shadow-sm rounded-[3rem] bg-white/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
                <CardHeader className="bg-slate-900 border-b border-slate-800 py-10 px-12">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <Gift className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-black text-white font-display">Uvítací Pop-up</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400 font-medium text-sm">
                        Automatické okno s nabídkou slevy pro nové návštěvníky webu.
                    </CardDescription>
                </CardHeader>
                <CardContent className="py-12 px-12 space-y-10 group">
                    <div className="flex items-center gap-6 p-8 bg-white/40 rounded-[2.5rem] border border-white/60 shadow-inner group">
                        <div className={`p-4 rounded-3xl transition-all duration-500 ${contentCZ?.hero?.showDiscountPopup ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-100'}`}>
                            {contentCZ?.hero?.showDiscountPopup ? <Eye className="h-8 w-8 text-slate-900" /> : <EyeOff className="h-8 w-8 text-slate-400" />}
                        </div>
                        <div className="flex-1">
                            <Label className="cursor-pointer font-black text-xl text-slate-900 mb-1 block font-display leading-tight" htmlFor="toggle-popup">
                                Aktivovat pop-up na webu
                            </Label>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                Zobrazit nabídku slevového kódu po vstupu na stránku.
                            </p>
                        </div>
                        <Switch
                            id="toggle-popup"
                            checked={!!contentCZ?.hero?.showDiscountPopup}
                            onCheckedChange={handleTogglePopup}
                            disabled={popupSaving}
                            className="h-8 w-14 data-[state=checked]:bg-primary"
                        />
                    </div>
                    
                    {contentCZ?.hero?.showDiscountPopup && (
                        <div className="p-8 border-2 border-dashed border-primary/20 rounded-[2.5rem] bg-slate-50 animate-in zoom-in-95 duration-500 flex flex-col sm:flex-row gap-8 items-center">
                            <div className="grid gap-3 w-full sm:max-w-md">
                                <Label htmlFor="popup-discount-code" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Vložený slevový kód</Label>
                                <div className="relative group/input">
                                    <Input
                                        id="popup-discount-code"
                                        defaultValue={contentCZ?.hero?.discountCode || ''}
                                        onBlur={(e) => {
                                            const val = e.target.value.toUpperCase();
                                            if (val !== contentCZ?.hero?.discountCode) {
                                                handleCodeChange(val);
                                            }
                                        }}
                                        placeholder="NAPŘ. BOOST10"
                                        className="h-16 pl-6 rounded-2xl border-none bg-white font-mono font-black text-2xl tracking-[0.4em] text-slate-900 shadow-xl shadow-slate-200/50 focus-visible:ring-primary"
                                        disabled={popupSaving}
                                    />
                                    {popupSaving && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-2">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                                    Tento kód musí být vytvořen v seznamu níže jako <span className="text-primary-dark">AKTIVNÍ</span>, aby byl funkční v objednávce.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border border-white/40 shadow-sm rounded-[3rem] bg-white/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 py-10 px-12 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-slate-900 rounded-2xl">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-900 font-display uppercase tracking-tight">Kódy v systému</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-24 gap-6">
                            <Loader2 className="h-12 w-12 animate-spin text-slate-400" />
                            <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Synchronizace s databází...</p>
                        </div>
                    ) : codes.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-slate-50 border-b border-slate-100">
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-6 px-12">Referenční kód / Identita</TableHead>
                                        <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-6">Výše slevy</TableHead>
                                        <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-6">Stav kampaně</TableHead>
                                        <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-6">Vytvořeno</TableHead>
                                        <TableHead className="text-right font-black text-slate-900 uppercase text-[10px] tracking-widest py-6 px-12">Akce</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {codes.map((code) => (
                                        <TableRow key={code.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 group">
                                            <TableCell className="py-8 px-12">
                                                <div className="font-mono font-black text-2xl text-slate-900 tracking-[0.2em] uppercase">
                                                    {code.code}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-primary/10 text-primary-dark font-black text-xl font-display shadow-sm">
                                                    -{code.discount_percent}%
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <Switch
                                                        checked={code.is_active}
                                                        onCheckedChange={() => toggleCodeStatus(code.id, code.is_active)}
                                                        className="data-[state=checked]:bg-primary h-7 w-12"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${code.is_active ? 'text-primary' : 'text-slate-400'}`}>
                                                            {code.is_active ? 'AKTIVNÍ' : 'PAUZA'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-[11px] font-black uppercase tracking-tighter text-slate-400">
                                                    {new Date(code.created_at).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right px-12">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-12 w-12 rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                                                    onClick={() => deleteCode(code.id)}
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 px-10 gap-6 text-center">
                            <div className="p-8 rounded-[2.5rem] bg-slate-50 text-slate-200">
                                <Sparkles className="h-16 w-16" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-black text-2xl text-slate-900 font-display">Žádné slevové kódy</p>
                                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest max-w-xs mx-auto">Vytvořte první slevovou kampaň pomocí tlačítka výše.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PromoCodes;
