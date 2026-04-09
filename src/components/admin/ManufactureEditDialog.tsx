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
    const { content } = useContent();
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
                title: content.admin.inventory.manufacture.dialogs.edit.success,
                description: content.admin.inventory.manufacture.dialogs.edit.successDesc.replace('{name}', name),
            });
            onClose();
        } catch (error) {
            toast({
                title: content.admin.inventory.manufacture.dialogs.edit.error,
                description: content.admin.inventory.manufacture.dialogs.edit.errorDesc,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!content) return null;
    const t = content.admin.inventory.manufacture.dialogs.edit;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{material ? t.titleEdit.replace('{name}', material.name) : t.titleAdd}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">{t.nameLabel}</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder={t.namePlaceholder}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="unit">{t.unitLabel}</Label>
                        <Input
                            id="unit"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            placeholder={t.unitPlaceholder}
                        />
                    </div>

                    <div className="border rounded-lg p-3 space-y-3 bg-background">
                        <p className="text-xs font-semibold text-olive/50 uppercase tracking-wide">{t.levelsTitle}</p>
                        <div className="grid gap-1.5">
                            <Label htmlFor="warning" className="flex items-center gap-1.5 text-amber-600">
                                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                                {t.warningLabel}
                            </Label>
                            <Input
                                id="warning"
                                type="number"
                                min="0"
                                value={warningQuantity}
                                onChange={(e) => setWarningQuantity(e.target.value)}
                            />
                            <p className="text-xs text-olive/40">{t.warningDesc}</p>
                        </div>
                        <div className="grid gap-1.5">
                            <Label htmlFor="min" className="flex items-center gap-1.5 text-red-600">
                                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                {t.criticalLabel}
                            </Label>
                            <Input
                                id="min"
                                type="number"
                                min="0"
                                value={minQuantity}
                                onChange={(e) => setMinQuantity(e.target.value)}
                            />
                            <p className="text-xs text-olive/40">{t.criticalDesc}</p>
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
                            {t.notificationsLabel}
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        {content.admin.orders.cancel}
                    </Button>
                    <Button onClick={handleSave} disabled={loading || !name || !unit}>
                        {loading ? t.savingBtn : t.saveBtn}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
