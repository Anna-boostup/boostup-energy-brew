import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInventory, SKU } from "@/context/InventoryContext";
import { Plus, Minus, AlertCircle } from "lucide-react";
import { FLAVORS, FlavorType } from "@/config/product-data";

const BASE_FLAVOR_IDS = FLAVORS.map(f => f.id);
const isValidFlavor = (value: string): value is FlavorType =>
    BASE_FLAVOR_IDS.includes(value as FlavorType);
interface RestockDialogProps {
    isOpen: boolean;
    onClose: () => void;
    sku: SKU | null;
    currentStock: number;
    initialMode?: "in" | "out";
}

export const RestockDialog = ({ isOpen, onClose, sku, currentStock, initialMode = "in" }: RestockDialogProps) => {
    const { addMovement } = useInventory();
    const [bottles, setBottles] = useState<string>("10");
    const [note, setNote] = useState("");
    const [mode, setMode] = useState<"in" | "out">(initialMode);

    // Update mode when initialMode changes or dialog opens
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
        }
    }, [isOpen, initialMode]);

    // Derive the base flavor SKU (e.g. "lemon-3" → "lemon")
    const baseFlavor = sku ? sku.split('-')[0] : null;
    const flavorConfig = FLAVORS.find(f => f.id === baseFlavor);
    const flavorDisplayName = flavorConfig?.name ?? baseFlavor ?? '';

    const inputCount = parseInt(bottles) || 0;
    const bottleCount = mode === "in" ? inputCount : -inputCount;
    const newTotal = currentStock + bottleCount;

    const packs3  = Math.floor(Math.max(0, newTotal) / 3);
    const packs12 = Math.floor(Math.max(0, newTotal) / 12);
    const packs21 = Math.floor(Math.max(0, newTotal) / 21);

    const handleMovement = () => {
        if (!baseFlavor || !isValidFlavor(baseFlavor)) return;
        const qty = parseInt(bottles);
        if (isNaN(qty) || qty <= 0) return;

        const finalQty = mode === "in" ? qty : -qty;
        const type = mode === "in" ? 'restock' : 'correction';
        const defaultNote = mode === "in" ? "Naskladnění lahviček" : "Odkladnění / Korekce zásob";

        addMovement(baseFlavor as SKU, finalQty, type, note || defaultNote);
        resetAndClose();
    };

    const resetAndClose = () => {
        setBottles("10");
        setNote("");
        setMode("in");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {mode === "in" ? <Plus className="w-5 h-5 text-green-600" /> : <Minus className="w-5 h-5 text-red-600" />}
                        {mode === "in" ? "Naskladnit" : "Odkladnit"}: {flavorDisplayName}
                    </DialogTitle>
                </DialogHeader>

                <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="in" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700">Naskladnění</TabsTrigger>
                        <TabsTrigger value="out" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">Odkladnění</TabsTrigger>
                    </TabsList>

                    <div className="grid gap-4 py-6">
                        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30 border border-border/50">
                            <Label className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Aktuální stav</Label>
                            <div className="font-bold text-lg">{currentStock} ks</div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bottles" className="text-sm font-semibold">
                                {mode === "in" ? "Počet lahviček k naskladnění" : "Počet lahviček k odkladnění"}
                            </Label>
                            <Input
                                id="bottles"
                                type="number"
                                min="1"
                                value={bottles}
                                onChange={(e) => setBottles(e.target.value)}
                                className={`text-lg font-bold ${mode === 'out' ? 'focus-visible:ring-red-500' : 'focus-visible:ring-green-500'}`}
                            />
                        </div>

                        {inputCount > 0 && (
                            <div className={`rounded-xl border p-4 space-y-2 transition-colors ${mode === 'in' ? 'bg-green-50/50 border-green-100' : 'bg-red-50/50 border-red-100'}`}>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-60">
                                    Předpokládaný stav: <span className="text-base text-foreground ml-1">{newTotal} ks</span>
                                </p>
                                <div className="grid grid-cols-3 gap-2 pt-1">
                                    <div className="bg-background/80 rounded-lg p-2 text-center border shadow-sm">
                                        <div className="text-[10px] font-bold opacity-40 uppercase">3x</div>
                                        <div className="text-sm font-black">{packs3}×</div>
                                    </div>
                                    <div className="bg-background/80 rounded-lg p-2 text-center border shadow-sm">
                                        <div className="text-[10px] font-bold opacity-40 uppercase">12x</div>
                                        <div className="text-sm font-black">{packs12}×</div>
                                    </div>
                                    <div className="bg-background/80 rounded-lg p-2 text-center border shadow-sm">
                                        <div className="text-[10px] font-bold opacity-40 uppercase">21x</div>
                                        <div className="text-sm font-black">{packs21}×</div>
                                    </div>
                                </div>
                                {mode === 'out' && newTotal < 0 && (
                                    <p className="text-[10px] text-red-600 font-bold flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Pozor: Stav bude záporný!
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="note" className="text-sm font-semibold">Poznámka</Label>
                            <Textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder={mode === "in" ? "Např. Dodávka od výrobce #123" : "Např. Likvidace poškozených kusů"}
                                className="text-sm resize-none"
                                rows={2}
                            />
                        </div>
                    </div>
                </Tabs>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={resetAndClose} className="flex-1">Zrušit</Button>
                    <Button 
                        onClick={handleMovement} 
                        className={`flex-1 font-bold ${mode === "in" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
                    >
                        {mode === "in" ? <Plus className="mr-2 h-4 w-4" /> : <Minus className="mr-2 h-4 w-4" />}
                        {mode === "in" ? "Naskladnit" : "Odkladnit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
