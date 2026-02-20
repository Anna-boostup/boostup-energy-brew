import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useInventory, Product } from "@/context/InventoryContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ProductEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export const ProductEditDialog = ({ isOpen, onClose, product }: ProductEditDialogProps) => {
    const { updateProduct } = useInventory();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Product>>({
        name: "",
        price: 0,
        description: "",
        ingredients: "",
        tooltip: "",
        is_on_sale: false,
        image_url: ""
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                price: product.price || 0,
                description: product.description || "",
                ingredients: product.ingredients || "",
                tooltip: product.tooltip || "",
                is_on_sale: product.is_on_sale || false,
                image_url: product.image_url || ""
            });
        }
    }, [product, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        setIsLoading(true);
        try {
            await updateProduct(product.sku, formData);
            toast({
                title: "Produkt aktualizován",
                description: `Změny u ${product.sku} byly úspěšně uloženy.`,
            });
            onClose();
        } catch (error: any) {
            toast({
                title: "Chyba při ukládání",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Upravit produkt: {product.sku}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Název produktu</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2 border p-3 rounded-md bg-muted/30">
                        <div className="space-y-0.5">
                            <Label htmlFor="is_on_sale">Akce</Label>
                            <p className="text-xs text-muted-foreground">Zobrazí štítek AKCE u produktu</p>
                        </div>
                        <Switch
                            id="is_on_sale"
                            checked={formData.is_on_sale}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_on_sale: checked }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="price">Cena (Kč)</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Popis (pod názvem na hlavní straně)</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Např. Citrusová svěžest a energie..."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tooltip">Tooltip (text v bublině "i")</Label>
                        <Textarea
                            id="tooltip"
                            value={formData.tooltip}
                            onChange={(e) => setFormData(prev => ({ ...prev, tooltip: e.target.value }))}
                            placeholder="Text, který se zobrazí v bublině..."
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="ingredients">Složení (Vyskakovací okno)</Label>
                        <Textarea
                            id="ingredients"
                            value={formData.ingredients}
                            onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image_url">URL Obrázku</Label>
                        <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                        />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Zrušit
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Uložit změny
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
