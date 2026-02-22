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
    const [warningQuantity, setWarningQuantity] = useState("0");
    const [minQuantity, setMinQuantity] = useState("0");
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (material) {
            setName(material.name);
            setUnit(material.unit);
            setWarningQuantity((material.warning_quantity ?? 0).toString());
            setMinQuantity(material.min_quantity.toString());
            setNotificationsEnabled(material.notifications_enabled || false);
        } else {
            setName("");
            setUnit("");
            setWarningQuantity("0");
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
                warning_quantity: Number(warningQuantity),
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

                    <div className="border rounded-lg p-3 space-y-3 bg-slate-50">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Úrovně upozornění</p>
                        <div className="grid gap-1.5">
                            <Label htmlFor="warning" className="flex items-center gap-1.5 text-amber-600">
                                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                                Varovná úroveň (žlutá)
                            </Label>
                            <Input
                                id="warning"
                                type="number"
                                min="0"
                                value={warningQuantity}
                                onChange={(e) => setWarningQuantity(e.target.value)}
                            />
                            <p className="text-xs text-slate-400">Zásoby brzy dojdou — připravte objednávku.</p>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="min" className="flex items-center gap-1.5 text-red-600">
                                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                Kritická úroveň (červená)
                            </Label>
                            <Input
                                id="min"
                                type="number"
                                min="0"
                                value={minQuantity}
                                onChange={(e) => setMinQuantity(e.target.value)}
                            />
                            <p className="text-xs text-slate-400">Zásoby jsou téměř vyčerpány — okamžitě doplňte.</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
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
