import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventory, RecipeRule } from "@/context/InventoryContext";
import { useManufacture } from "@/context/ManufactureContext";
import { useToast } from "@/hooks/use-toast";
import { FLAVORS } from "@/config/product-data";
import { Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    rule: RecipeRule | null;
}

const InfoTip = ({ text }: { text: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <button type="button" tabIndex={-1} aria-label="Nápověda" className="text-muted-foreground/60 hover:text-primary transition-colors align-middle">
                <Info className="w-3.5 h-3.5" />
            </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[260px] text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
);

export const RecipeRuleDialog = ({ isOpen, onClose, rule }: Props) => {
    const { addRecipeRule, updateRecipeRule } = useInventory();
    const { materials } = useManufacture();
    const { toast } = useToast();

    const [productSku, setProductSku] = useState<string>("");
    const [materialId, setMaterialId] = useState<string>("");
    const [quantityRequired, setQuantityRequired] = useState<string>("0.1");
    const [basis, setBasis] = useState<'unit' | 'batch'>('unit');
    const [batchBottles, setBatchBottles] = useState<string>("1000");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (rule) {
            setProductSku(rule.product_sku);
            setMaterialId(rule.material_id);
            setQuantityRequired(rule.quantity_required.toString());
            setBasis(rule.input_basis === 'batch' ? 'batch' : 'unit');
            setBatchBottles(rule.batch_bottles ? rule.batch_bottles.toString() : "1000");
        } else {
            setProductSku(FLAVORS[0]?.id || "lemon");
            if (materials.length > 0) {
                setMaterialId(materials[0].id);
            } else {
                setMaterialId("");
            }
            setQuantityRequired("0.1");
            setBasis('unit');
            setBatchBottles("1000");
        }
    }, [rule, isOpen, materials]);

    const handleSave = async () => {
        if (!productSku) {
            toast({
                title: "Chyba",
                description: "Vyberte příchuť.",
                variant: "destructive",
            });
            return;
        }

        if (!materialId) {
            toast({
                title: "Chyba",
                description: "Vyberte surovinu/materiál ze skladu.",
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

        let batchVal: number | null = null;
        if (basis === 'batch') {
            batchVal = parseInt(batchBottles);
            if (isNaN(batchVal) || batchVal <= 0) {
                toast({
                    title: "Chyba",
                    description: "Zadejte počet lahviček ve várce (větší než 0).",
                    variant: "destructive",
                });
                return;
            }
        }

        setLoading(true);
        try {
            const data = {
                product_sku: productSku,
                material_id: materialId,
                quantity_required: qty,
                input_basis: basis,
                batch_bottles: batchVal,
            };

            let success = false;
            if (rule) {
                success = await updateRecipeRule(rule.id, data);
            } else {
                success = await addRecipeRule(data);
            }

            if (success) {
                toast({
                    title: "Receptura uložena",
                    description: `Receptura byla úspěšně uložena.`,
                });
                onClose();
            } else {
                throw new Error("Chyba při ukládání do databáze.");
            }
        } catch (error: any) {
            toast({
                title: "Chyba při ukládání",
                description: error.message || "Nepodařilo se uložit recepturu.",
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
                    <DialogTitle>
                        {rule ? `Upravit recepturu` : `Nová receptura`}
                    </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="product-sku">Příchuť (hotový produkt)</Label>
                        <Select value={productSku} onValueChange={setProductSku}>
                            <SelectTrigger id="product-sku">
                                <SelectValue placeholder="Vyberte příchuť" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border shadow-md rounded-md">
                                {FLAVORS.map(f => (
                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="material">Surovina (Materiál k odečtení)</Label>
                        <Select value={materialId} onValueChange={setMaterialId}>
                            <SelectTrigger id="material">
                                <SelectValue placeholder="Vyberte surovinu" />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border shadow-md rounded-md max-h-[200px]">
                                {materials.map(m => (
                                    <SelectItem key={m.id} value={m.id}>
                                        {m.name} ({m.unit})
                                    </SelectItem>
                                ))}
                                {materials.length === 0 && (
                                    <SelectItem value="empty" disabled>Žádné materiály nenalezeny</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="basis" className="inline-flex items-center gap-1">Zadat množství <InfoTip text="Zvol, zda je množství na 1 lahvičku, nebo na celou várku. U várky doplň počet lahviček – spotřeba se přepočítá na 1 kus (např. 5000 g na várku 1000 ks = 5 g/ks)." /></Label>
                        <Select value={basis} onValueChange={(v) => setBasis(v as 'unit' | 'batch')}>
                            <SelectTrigger id="basis">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border shadow-md rounded-md">
                                <SelectItem value="unit">Na 1 lahvičku</SelectItem>
                                <SelectItem value="batch">Na várku (více lahviček)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {basis === 'batch' && (
                        <div className="grid gap-2">
                            <Label htmlFor="batch-bottles" className="inline-flex items-center gap-1">Počet lahviček ve várce <InfoTip text="Kolik hotových lahviček vznikne z jedné várky. Slouží k přepočtu spotřeby suroviny na 1 kus." /></Label>
                            <Input
                                id="batch-bottles"
                                type="number"
                                min="1"
                                step="1"
                                value={batchBottles}
                                onChange={(e) => setBatchBottles(e.target.value)}
                                className="font-mono text-lg"
                                placeholder="např. 1000"
                            />
                        </div>
                    )}

                    <div className="grid gap-2">
                        <Label htmlFor="quantity">
                            {basis === 'batch' ? 'Množství na celou várku' : 'Množství na 1 lahvičku'}
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="quantity"
                                type="number"
                                min="0.001"
                                step="0.001"
                                value={quantityRequired}
                                onChange={(e) => setQuantityRequired(e.target.value)}
                                className="font-mono text-lg"
                            />
                            <span className="text-sm font-bold text-olive-dark/60 uppercase">
                                {materials.find(m => m.id === materialId)?.unit || "?"}
                            </span>
                        </div>
                        {basis === 'batch' ? (
                            <p className="text-xs text-olive-dark/60 mt-1">
                                Systém automaticky přepočítá spotřebu na 1 lahvičku
                                {(() => {
                                    const q = parseFloat(quantityRequired);
                                    const b = parseInt(batchBottles);
                                    const unit = materials.find(m => m.id === materialId)?.unit || "";
                                    return (!isNaN(q) && !isNaN(b) && b > 0)
                                        ? ` (= ${(q / b).toLocaleString('cs-CZ', { maximumFractionDigits: 6 })} ${unit}/ks).`
                                        : '.';
                                })()}
                            </p>
                        ) : (
                            <p className="text-xs text-olive-dark/60 mt-1">
                                Zadejte přesné množství potřebné k výrobě 1 ks hotového produktu.
                            </p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={loading}>Zrušit</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-lime text-olive-dark hover:bg-lime/80 font-black">
                        {loading ? "Ukládám..." : "Uložit recepturu"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
