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

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Slevové kódy</h2>
                    <p className="text-muted-foreground">Spravujte slevové kupóny pro své zákazníky.</p>
                </div>

                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-bold shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4" />
                            VYTVOŘIT KÓD
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <form onSubmit={handleAddCode}>
                            <DialogHeader>
                                <DialogTitle>Nový slevový kód</DialogTitle>
                                <DialogDescription>
                                    Vytvořte kód, který zákazníci uplatní v pokladně.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Text kódu (např. LÉTO20)</Label>
                                    <Input
                                        id="code"
                                        placeholder="Zadejte kód..."
                                        value={newCode}
                                        onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                                        className="font-mono font-bold"
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="discount">Sleva v procentech (%)</Label>
                                    <Input
                                        id="discount"
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={newDiscount}
                                        onChange={(e) => setNewDiscount(parseInt(e.target.value))}
                                        required
                                    />
                                </div>
                                <div className="p-3 bg-secondary/30 rounded-lg flex gap-3 text-xs text-muted-foreground">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-primary" />
                                    <p>Tato sleva se nebude sčítat se slevou na předplatné (15%). Systém uplatní pouze jednu z nich.</p>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Vytvořit kód"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border/50 shadow-xl overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <CardTitle className="text-xl">Aktivní a historické kódy</CardTitle>
                    </div>
                    <CardDescription>Přehled všech slevových poukazů v systému.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 gap-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-muted-foreground font-medium">Načítám data...</p>
                        </div>
                    ) : codes.length > 0 ? (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="font-bold">KÓD</TableHead>
                                        <TableHead className="font-bold">SLEVA</TableHead>
                                        <TableHead className="font-bold">STAV</TableHead>
                                        <TableHead className="font-bold">VYTVOŘENO</TableHead>
                                        <TableHead className="text-right font-bold">AKCE</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {codes.map((code) => (
                                        <TableRow key={code.id} className="hover:bg-muted/20 transition-colors">
                                            <TableCell className="font-mono font-black text-lg text-primary">
                                                {code.code}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-lg bg-primary/10 text-primary px-3 py-1 rounded-full inline-block">
                                                    -{code.discount_percent}%
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Switch
                                                        checked={code.is_active}
                                                        onCheckedChange={() => toggleCodeStatus(code.id, code.is_active)}
                                                    />
                                                    <span className={`text-xs font-bold uppercase tracking-widest ${code.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                                                        {code.is_active ? 'Aktivní' : 'Neaktivní'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {new Date(code.created_at).toLocaleDateString('cs-CZ')}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
                                                    onClick={() => deleteCode(code.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
                            <div className="bg-muted p-4 rounded-full">
                                <Sparkles className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">Žádné slevové kódy</p>
                                <p className="text-muted-foreground max-w-xs mx-auto">Zatím jste nevytvořili žádné slevové kódy. Klikněte na tlačítko výše a přidejte první.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default PromoCodes;
