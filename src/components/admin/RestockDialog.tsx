import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInventory, SKU } from "@/context/InventoryContext";
import { Plus } from "lucide-react";

interface RestockDialogProps {
    isOpen: boolean;
    onClose: () => void;
    sku: SKU | null;
    currentStock: number;
}

export const RestockDialog = ({ isOpen, onClose, sku, currentStock }: RestockDialogProps) => {
    const { addMovement } = useInventory();
    const [amount, setAmount] = useState<string>("10");
    const [note, setNote] = useState("");

    const handleRestock = () => {
        if (!sku) return;
        const qty = parseInt(amount);
        if (isNaN(qty) || qty <= 0) return;

        addMovement(sku, qty, 'restock', note || "Manual restock");
        resetAndClose();
    };

    const resetAndClose = () => {
        setAmount("10");
        setNote("");
        onClose();
    };

    if (!sku) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Naskladnit: {sku}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Současný stav</Label>
                        <div className="col-span-3 font-bold">{currentStock} ks</div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Množství
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
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
