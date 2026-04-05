import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInventory, SKU } from "@/context/InventoryContext";
import { Plus } from "lucide-react";
import { FLAVORS } from "@/config/product-data";

interface RestockDialogProps {
    isOpen: boolean;
    onClose: () => void;
    sku: SKU | null;
    currentStock: number;
}

export const RestockDialog = ({ isOpen, onClose, sku, currentStock }: RestockDialogProps) => {
    const { addMovement } = useInventory();
    const [bottles, setBottles] = useState<string>("10");
    const [note, setNote] = useState("");

    // Derive the base flavor SKU (e.g. "lemon-3" → "lemon")
    const baseFlavor = sku ? sku.split('-')[0] : null;
    const flavorConfig = FLAVORS.find(f => f.id === baseFlavor);
    const flavorDisplayName = flavorConfig?.name ?? baseFlavor ?? '';

    const bottleCount = parseInt(bottles) || 0;
    const newTotal = currentStock + bottleCount;

    const packs3  = Math.floor(newTotal / 3);
    const packs12 = Math.floor(newTotal / 12);
    const packs21 = Math.floor(newTotal / 21);

    const handleRestock = () => {
        if (!baseFlavor) return;
        const qty = parseInt(bottles);
        if (isNaN(qty) || qty <= 0) return;

        addMovement(baseFlavor as SKU, qty, 'restock', note || "Naskladnění lahviček");
        resetAndClose();
    };

    const resetAndClose = () => {
        setBottles("10");
        setNote("");
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle>Naskladnit: {flavorDisplayName}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Aktuální počet lahviček</Label>
                        <div className="col-span-3 font-bold">{currentStock} ks</div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bottles" className="text-right">
                            Počet lahviček k naskladnění
                        </Label>
                        <Input
                            id="bottles"
                            type="number"
                            min="1"
                            value={bottles}
                            onChange={(e) => setBottles(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    {bottleCount > 0 && (
                        <div className="col-span-4 rounded-md border bg-muted/40 p-3 space-y-1">
                            <p className="text-sm font-semibold text-foreground/70 mb-2">
                                Po naskladnění ({newTotal} lahviček) vychází na:
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <span className="inline-flex items-center gap-1 rounded-full bg-background border px-3 py-1 text-sm font-medium">
                                    📦 {packs3}× balení po 3
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-background border px-3 py-1 text-sm font-medium">
                                    📦 {packs12}× balení po 12
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-background border px-3 py-1 text-sm font-medium">
                                    📦 {packs21}× balení po 21
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="note" className="text-right">
                            Poznámka
                        </Label>
                        <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Např. Dodávka od výrobce #123"
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={resetAndClose}>Zrušit</Button>
                    <Button onClick={handleRestock} className="bg-green-600 hover:bg-green-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Naskladnit
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
