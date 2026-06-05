import { useState, useEffect } from "react";
import { useContent } from "@/context/ContentContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventory, PackagingRule } from "@/context/InventoryContext";
import { useManufacture } from "@/context/ManufactureContext";
import { useToast } from "@/hooks/use-toast";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    rule: PackagingRule | null;
}

export const PackagingRuleDialog = ({ isOpen, onClose, rule }: Props) => {
    const { content } = useContent();
    const { addPackagingRule, updatePackagingRule } = useInventory();
    const { materials } = useManufacture();
    const { toast } = useToast();

    const [packSizeOption, setPackSizeOption] = useState<string>("3");
    const [customPackSize, setCustomPackSize] = useState<string>("");
    const [materialId, setMaterialId] = useState<string>("");
    const [quantityRequired, setQuantityRequired] = useState<string>("1");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (rule) {
            const sizeStr = rule.pack_size.toString();
            if (["1", "3", "12", "21"].includes(sizeStr)) {
                setPackSizeOption(sizeStr);
                setCustomPackSize("");
            } else {
                setPackSizeOption("custom");
                setCustomPackSize(sizeStr);
            }
            setMaterialId(rule.material_id);
            setQuantityRequired(rule.quantity_required.toString());
        } else {
            setPackSizeOption("3");
            setCustomPackSize("");
            if (materials.length > 0) {
                setMaterialId(materials[0].id);
            } else {
                setMaterialId("");
            }
            setQuantityRequired("1");
        }
    }, [rule, isOpen, materials]);

    const handleSave = async () => {
        const size = packSizeOption === "custom" ? parseInt(customPackSize) : parseInt(packSizeOption);
        if (isNaN(size) || size <= 0) {
            toast({
                title: "Chyba",
                description: "Zadejte platnou velikost balení (počet lahví).",
                variant: "destructive",
            });
            return;
        }

        if (!materialId) {
            toast({
                title: "Chyba",
                description: "Vyberte obalový materiál ze skladu.",
                variant: "destructive",
            });
            return;
        }

        const qty = parseFloat(quantityRequired);
        if (isNaN(qty) || qty <= 0) {
            toast({
                title: "Chyba",
                description: "Množství musí být větší než 0.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);
        try {
            const data = {
                pack_size: size,
                material_id: materialId,
                quantity_required: qty
            };

            let success = false;
            if (rule) {
                success = await updatePackagingRule(rule.id, data);
            } else {
                success = await addPackagingRule(data);
            }

            if (success) {
                toast({
                    title: "Pravidlo uloženo",
                    description: `Pravidlo pro balení po ${size} ks bylo úspěšně uloženo.`,
                });
                onClose();
            } else {
                throw new Error("Chyba při ukládání do databáze.");
            }
        } catch (error: any) {
            toast({
                title: "Chyba při ukládání",
                description: error.message || "Nepodařilo se uložit pravidlo obalu.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const isCustom = packSizeOption === "custom";

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {rule ? `Upravit pravidlo obalu` : `Nové pravidlo obalu`}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    {/* Pack Size Selection */}
                    <div className="grid gap-2">
                        <Label htmlFor="pack-size">Velikost balení (počet lahviček)</Label>
                        <Select
                            value={packSizeOption}
                            onValueChange={(val) => {
                                setPackSizeOption(val);
                                if (val !== "custom") setCustomPackSize("");
                            }}
                        >
                            <SelectTrigger id="pack-size">
                                <SelectValue placeholder="Vyberte velikost" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border shadow-md rounded-md">
                                <SelectItem value="1">1 ks (Jednotlivé lahvičky)</SelectItem>
                                <SelectItem value="3">3 ks (Balení 3 ks)</SelectItem>
                                <SelectItem value="12">12 ks (Balení 12 ks)</SelectItem>
                                <SelectItem value="21">21 ks (Balení 21 ks)</SelectItem>
                                <SelectItem value="custom">Vlastní velikost...</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Pack Size Input */}
                    {isCustom && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                            <Label htmlFor="custom-size">Zadejte vlastní počet lahviček</Label>
                            <Input
                                id="custom-size"
                                type="number"
                                min="1"
                                value={customPackSize}
                                onChange={(e) => setCustomPackSize(e.target.value)}
                                placeholder="např. 6"
                            />
                        </div>
                    )}

                    {/* Material Selection */}
                    <div className="grid gap-2">
                        <Label htmlFor="material">Obalový materiál ze skladu</Label>
                        <Select
                            value={materialId}
                            onValueChange={setMaterialId}
                        >
                            <SelectTrigger id="material">
                                <SelectValue placeholder="Vyberte materiál" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border shadow-md rounded-md">
                                {materials.length === 0 ? (
                                    <SelectItem value="_empty" disabled>
                                        Žádné materiály na skladě
                                    </SelectItem>
                                ) : (
                                    materials.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name} ({m.quantity} {m.unit} k dispozici)
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Quantity Required */}
                    <div className="grid gap-2">
                        <Label htmlFor="quantity">Spotřeba na jedno balení (množství)</Label>
                        <div className="flex items-center gap-3">
                            <Input
                                id="quantity"
                                type="number"
                                min="0.001"
                                step="any"
                                value={quantityRequired}
                                onChange={(e) => setQuantityRequired(e.target.value)}
                            />
                            <span className="text-sm font-semibold text-olive-dark/60 uppercase">
                                {materials.find(m => m.id === materialId)?.unit || "ks"}
                            </span>
                        </div>
                        <p className="text-[10px] text-olive-dark/50 font-bold uppercase tracking-wider">
                            Kolik kusů/jednotek materiálu se spotřebuje při zabalení jedné zásilky dané velikosti.
                        </p>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading}>
                        Storno
                    </Button>
                    <Button onClick={handleSave} disabled={loading || !materialId}>
                        {loading ? "Ukládání..." : "Uložit"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
