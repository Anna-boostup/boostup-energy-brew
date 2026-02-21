import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useManufacture, ManufactureMaterial } from "@/context/ManufactureContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    material: ManufactureMaterial | null;
}

export const ManufactureRestockDialog = ({ isOpen, onClose, material }: Props) => {
    const { addMovement } = useManufacture();
    const { toast } = useToast();
    const [amount, setAmount] = useState<string>("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAction = async (type: 'restock' | 'use' | 'correction') => {
        if (!material || !amount || isNaN(Number(amount))) return;

        setLoading(true);
        try {
            const numAmount = Number(amount);
            const finalAmount = type === 'use' ? -numAmount : numAmount;

            await addMovement(material.id, finalAmount, type, note);

            toast({
                title: "Úspěšně uloženo",
                description: `Zásoba položky ${material.name} byla upravena.`,
            });
            onClose();
            setAmount("");
            setNote("");
        } catch (error) {
            toast({
                title: "Chyba",
                description: "Nepodařilo se aktualizovat stav skladu.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Upravit stav: {material?.name}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Množství ({material?.unit})</Label>
                        <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Zadejte množství..."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="note">Poznámka (volitelné)</Label>
                        <Textarea
                            id="note"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Důvod změny..."
                        />
                    </div>
                </div>
                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="destructive"
                        onClick={() => handleAction('use')}
                        disabled={loading || !amount}
                        className="flex-1"
                    >
                        Spotřebovat (-)
                    </Button>
                    <Button
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 flex-1"
                        onClick={() => handleAction('restock')}
                        disabled={loading || !amount}
                    >
                        Naskladnit (+)
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
