import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useManufacture, ManufactureMaterial } from "@/context/ManufactureContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    material: ManufactureMaterial | null;
}

export const ManufactureEditDialog = ({ isOpen, onClose, material }: Props) => {
    const { addMaterial, updateMaterial } = useManufacture();
    const { toast } = useToast();
    const [name, setName] = useState("");
    const [unit, setUnit] = useState("");
    const [minQuantity, setMinQuantity] = useState("0");
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (material) {
            setName(material.name);
            setUnit(material.unit);
            setMinQuantity(material.min_quantity.toString());
            setNotificationsEnabled(material.notifications_enabled || false);
        } else {
            setName("");
            setUnit("");
            setMinQuantity("0");
            setNotificationsEnabled(false);
        }
    }, [material, isOpen]);

    const handleSave = async () => {
        if (!name || !unit) return;

        setLoading(true);
        try {
            const data = {
                name,
                unit,
                min_quantity: Number(minQuantity),
                notifications_enabled: notificationsEnabled
            };

            if (material) {
                await updateMaterial(material.id, data);
            } else {
                await addMaterial(data);
            }

            toast({
                title: "Uloženo",
                description: `Surovina/materiál ${name} byl uložen.`,
            });
            onClose();
        } catch (error) {
            toast({
                title: "Chyba",
                description: "Nepodařilo se uložit položku.",
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
                    <DialogTitle>{material ? `Upravit: ${material.name}` : "Přidat novou surovinu/materiál"}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Název položky</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="např. Lahvičky 500ml"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="unit">Měrná jednotka</Label>
                        <Input
                            id="unit"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            placeholder="ks, kg, l, atd."
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="min">Minimální stav pro upozornění</Label>
                        <Input
                            id="min"
                            type="number"
                            value={minQuantity}
                            onChange={(e) => setMinQuantity(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="notifications"
                            checked={notificationsEnabled}
                            onCheckedChange={(checked) => setNotificationsEnabled(!!checked)}
                        />
                        <Label
                            htmlFor="notifications"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Zapnout upozornění na nízký stav
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Zrušit
                    </Button>
                    <Button onClick={handleSave} disabled={loading || !name || !unit}>
                        {loading ? "Ukládám..." : "Uložit změny"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
