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
    const { content, contentCZ, contentEN, refreshContent } = useContent();
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
            toast.error(`${content?.promoCodes?.notifications?.loadError || "Error"}: ${error.message}`);
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

            toast.success(content?.promoCodes?.notifications?.createSuccess || "Created");
            setIsAddOpen(false);
            setNewCode("");
            setNewDiscount(10);
            fetchCodes();
        } catch (error: any) {
            console.error("Error adding promo code:", error);
            toast.error(`${content?.promoCodes?.notifications?.createError || "Error"}: ${error.message}`);
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
            toast.success(!currentStatus ? (content?.promoCodes?.notifications?.activated || "Activated") : (content?.promoCodes?.notifications?.deactivated || "Deactivated"));
        } catch (error: any) {
            console.error("Error toggling promo code:", error);
            toast.error(content?.promoCodes?.notifications?.toggleError || "Error");
        }
    };

    const deleteCode = async (id: string) => {
        if (!window.confirm(content?.promoCodes?.deleteConfirm || "Are you sure?")) return;

        try {
            const { error } = await supabase
                .from('promo_codes')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setCodes(codes.filter(c => c.id !== id));
            toast.success(content?.promoCodes?.notifications?.deleteSuccess || "Deleted");
        } catch (error: any) {
            console.error("Error deleting promo code:", error);
            toast.error(content?.promoCodes?.notifications?.deleteError || "Error");
        }
    };

    const [popupSaving, setPopupSaving] = useState(false);
    
    const handleTogglePopup = async (visible: boolean) => {
        try {
            setPopupSaving(true);
            const newCz = { ...contentCZ, hero: { ...contentCZ?.hero, showDiscountPopup: visible } };
            const newEn = { ...contentEN, hero: { ...contentEN?.hero, showDiscountPopup: visible } };
            await updateSiteContent(newCz, 'main');
            await updateSiteContent(newEn, 'en');
            await refreshContent();
            toast.success(visible ? (content?.promoCodes?.notifications?.popupOn || "Popup ON") : (content?.promoCodes?.notifications?.popupOff || "Popup OFF"));
        } catch (error) {
            toast.error(content?.promoCodes?.notifications?.popupError || "Error");
        } finally {
            setPopupSaving(false);
        }
    };

    const handleCodeChange = async (newCodeValue: string) => {
        try {
            setPopupSaving(true);
            const newCz = { ...contentCZ, hero: { ...contentCZ?.hero, discountCode: newCodeValue } };
            const newEn = { ...contentEN, hero: { ...contentEN?.hero, discountCode: newCodeValue } };
            await updateSiteContent(newCz, 'main');
            await updateSiteContent(newEn, 'en');
            await refreshContent();
            toast.success((content?.promoCodes?.notifications?.popupCodeChanged || "Code changed").replace('{code}', newCodeValue));
        } catch (error) {
            toast.error(content?.promoCodes?.notifications?.popupCodeError || "Error");
        } finally {
            setPopupSaving(false);
        }
    };

    return (
        <div className="space-y-8 sm:space-y-12 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-10 flex-wrap">
                <div className="space-y-2 sm:space-y-3">
                    <h2 data-testid="admin-page-title" className="text-3xl sm:text-5xl font-black tracking-tighter text-olive-dark font-display uppercase italic leading-none">{content?.promoCodes?.title || "Promo Codes"}</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        <p className="text-olive-dark/70 font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px] leading-none">{content?.promoCodes?.description}</p>
                    </div>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 sm:h-14 px-6 sm:px-8 bg-olive-dark hover:bg-black text-white gap-3 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-olive-dark/10 transition-transform hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto">
                            <Plus className="h-5 w-5" />
                            {content?.promoCodes?.createButton || "Create"}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] sm:max-w-[450px] rounded-[2rem] sm:rounded-[2.5rem] border-none shadow-2xl p-6 sm:p-10">
                        <form onSubmit={handleAddCode} className="space-y-8">
                            <DialogHeader className="space-y-2">
                                <DialogTitle className="text-xl sm:text-2xl font-black text-olive-dark font-display uppercase italic tracking-tight">{content?.promoCodes?.newPromoTitle || "New Promo Code"}</DialogTitle>
                                <DialogDescription className="text-olive-dark/70 font-black text-[10px] uppercase tracking-widest">
                                    {content?.promoCodes?.newPromoDesc}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-[10px] font-black uppercase tracking-widest text-olive-dark pl-1">{content?.promoCodes?.codeLabel || "Code"}</Label>
                                    <Input
                                        id="code"
                                        placeholder={content?.promoCodes?.codePlaceholder || "DISCOUNT10"}
                                        value={newCode}
                                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                                        className="h-14 rounded-2xl border-background font-mono font-black text-xl tracking-widest uppercase focus-visible:ring-primary focus-visible:border-primary shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="discount" className="text-[10px] font-black uppercase tracking-widest text-olive-dark pl-1">{content?.promoCodes?.discountLabel || "Discount"}</Label>
                                    <div className="relative">
                                        <Input
                                            id="discount"
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={newDiscount}
                                            onChange={(e) => setNewDiscount(parseInt(e.target.value))}
                                            className="h-14 rounded-2xl border-background font-display font-black text-xl focus-visible:ring-primary focus-visible:border-primary shadow-sm pr-12"
                                            required
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-olive-dark">%</span>
                                    </div>
                                </div>
                                <div className="p-4 bg-admin-canvas border border-olive-dark/10 rounded-2xl flex gap-3 text-[11px] font-bold text-olive-dark leading-relaxed italic">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-olive-dark mt-0.5" />
                                    <p>{content?.promoCodes?.discountNote}</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting} className="w-full h-14 bg-olive-dark hover:bg-black text-white font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-olive-dark/10">
                                    {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : (content?.promoCodes?.createButton || "Create")}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="mb-10 border-none shadow-2xl rounded-[2.5rem] bg-admin-canvas shadow-olive/10 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
                <CardHeader className="bg-olive-dark border-b border-olive/10 p-8 sm:p-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/20 rounded-xl">
                            <Gift className="w-6 h-6 text-primary" />
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-black text-white font-display uppercase italic">{content?.promoCodes?.popupSection?.title || "Promotion Popup"}</CardTitle>
                    </div>
                    <CardDescription className="text-white/60 font-bold text-[10px] sm:text-xs uppercase tracking-widest leading-relaxed">
                        {content?.promoCodes?.popupSection?.description}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-8 sm:p-10 space-y-8 sm:space-y-10 group">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 sm:p-8 bg-admin-canvas/40 rounded-[2rem] sm:rounded-[2.5rem] border border-white/60 shadow-inner group">
                        <div className={`p-4 rounded-2xl sm:rounded-3xl transition-all duration-500 ${contentCZ?.hero?.showDiscountPopup ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-admin-canvas'}`}>
                            {contentCZ?.hero?.showDiscountPopup ? <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-olive-dark" /> : <EyeOff className="h-6 w-6 sm:h-8 sm:w-8 text-olive-dark" />}
                        </div>
                        <div className="flex-1">
                            <Label className="cursor-pointer font-black text-lg sm:text-xl text-olive-dark mb-1 block font-display leading-tight uppercase italic" htmlFor="toggle-popup">
                                {content?.promoCodes?.popupSection?.toggleLabel || "Toggle Popup"}
                            </Label>
                            <p className="text-[10px] sm:text-sm font-black text-olive-dark/70 uppercase tracking-widest">
                                {content?.promoCodes?.popupSection?.toggleDesc}
                            </p>
                        </div>
                        <Switch
                            id="toggle-popup"
                            checked={!!contentCZ?.hero?.showDiscountPopup}
                            onCheckedChange={handleTogglePopup}
                            disabled={popupSaving}
                            className="h-7 w-12 sm:h-8 sm:w-14 data-[state=checked]:bg-primary"
                        />
                    </div>
                    
                    {contentCZ?.hero?.showDiscountPopup && (
                        <div className="p-8 border-2 border-dashed border-primary/20 rounded-[2.5rem] bg-cream/50animate-in zoom-in-95 duration-500 flex flex-col sm:flex-row gap-8 items-center">
                            <div className="grid gap-3 w-full sm:max-w-md">
                                <Label htmlFor="popup-discount-code" className="text-[10px] font-black uppercase tracking-[0.2em] text-olive-dark pl-1">{content?.promoCodes?.popupSection?.codeLabel || "Code"}</Label>
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
                                        placeholder={content?.promoCodes?.codePlaceholder || "CODE"}
                                        className="h-16 pl-6 rounded-2xl border-none bg-admin-canvas font-mono font-black text-2xl tracking-[0.4em] text-olive-dark shadow-xl shadow-admin-canvas/50 focus-visible:ring-primary"
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
                                <p className="text-xs font-black text-olive-dark uppercase tracking-widest leading-relaxed">
                                    {content?.promoCodes?.popupSection?.helpText}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-admin-canvas shadow-olive/10 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                <CardHeader className="bg-olive-dark p-8 sm:p-10 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-white/10 rounded-xl">
                            <Sparkles className="w-5 h-5 text-lime" />
                        </div>
                        <CardTitle className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight italic">{content?.promoCodes?.listSection?.title || "Code List"}</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-24 gap-6">
                            <Loader2 data-testid="admin-loader" className="h-12 w-12 animate-spin text-olive-dark" />
                            <p className="text-olive-dark font-black uppercase text-xs tracking-widest">{content?.promoCodes?.syncing || "Syncing..."}</p>
                        </div>
                    ) : codes.length > 0 ? (
                        <div className="w-full">
                            {/* Desktop View */}
                            <div className="hidden lg:block overflow-x-auto">
                                <Table>
                                    <TableHeader className="bg-admin-canvas/60 border-b border-olive/8">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-4 px-10">{content?.promoCodes?.listSection?.table?.code || "Code"}</TableHead>
                                            <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-4">{content?.promoCodes?.listSection?.table?.discount || "Discount"}</TableHead>
                                            <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-4">{content?.promoCodes?.listSection?.table?.status || "Status"}</TableHead>
                                            <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-4">{content?.promoCodes?.listSection?.table?.created || "Created"}</TableHead>
                                            <TableHead className="text-right font-black text-olive-dark uppercase text-[9px] tracking-widest py-4 px-10">{content?.promoCodes?.listSection?.table?.actions || "Actions"}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {codes.map((code) => (
                                            <TableRow key={code.id} className="hover:bg-admin-canvas transition-colors border-b border-olive/8 group">
                                                <TableCell className="py-8 px-10">
                                                    <div className="font-mono font-black text-2xl text-olive-dark tracking-[0.2em] uppercase">
                                                        {code.code}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="inline-flex items-center justify-center px-4 py-2 rounded-2xl bg-lime/10 text-olive-dark font-black text-xl font-display shadow-sm">
                                                        -{code.discount_percent}%
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-4">
                                                        <Switch
                                                            checked={code.is_active}
                                                            onCheckedChange={() => toggleCodeStatus(code.id, code.is_active)}
                                                            className="data-[state=checked]:bg-lime h-7 w-12"
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${code.is_active ? 'text-lime-dark' : 'text-olive-dark/60'}`}>
                                                                {code.is_active ? (content?.promoCodes?.statusActive || "Active") : (content?.promoCodes?.statusPaused || "Paused")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-[11px] font-black uppercase tracking-tighter text-olive-dark/80">
                                                        {new Date(code.created_at).toLocaleDateString(content?.lang || 'en', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right px-10">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-12 w-12 rounded-2xl text-olive-dark hover:text-red-500 hover:bg-red-500/10 transition-all sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0"
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

                            {/* Mobile View */}
                            <div className="lg:hidden p-6 space-y-4">
                                {codes.map((code) => (
                                    <div key={code.id} className="p-6 bg-admin-canvas/40 border border-olive/5 rounded-3xl space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="font-mono font-black text-xl text-olive-dark tracking-widest uppercase italic">
                                                {code.code}
                                            </div>
                                            <div className="px-3 py-1.5 rounded-xl bg-lime text-olive-dark font-black text-xs font-display">
                                                -{code.discount_percent}%
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-olive/5">
                                            <div className="flex items-center gap-3">
                                                <Switch
                                                    checked={code.is_active}
                                                    onCheckedChange={() => toggleCodeStatus(code.id, code.is_active)}
                                                    className="data-[state=checked]:bg-lime"
                                                />
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${code.is_active ? 'text-lime-dark border-b border-lime' : 'text-olive-dark/60'}`}>
                                                    {code.is_active ? (content?.promoCodes?.statusActive || "Active") : (content?.promoCodes?.statusPaused || "Paused")}
                                                </span>
                                            </div>
                                            
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-10 w-10 rounded-xl text-red-500 bg-red-50"
                                                onClick={() => deleteCode(code.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 px-10 gap-6 text-center">
                            <div className="p-8 rounded-[2.5rem] bg-cream/50text-olive-dark">
                                <Sparkles className="h-16 w-16" />
                            </div>
                            <div className="space-y-2">
                                <p className="font-black text-2xl text-olive-dark font-display">{content?.promoCodes?.listSection?.empty || "No codes found"}</p>
                                <p className="text-olive-dark font-bold uppercase text-[10px] tracking-widest max-w-xs mx-auto">{content?.promoCodes?.listSection?.emptyDesc}</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PromoCodes;
