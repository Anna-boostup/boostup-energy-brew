import { useState, useEffect, useRef } from "react";
import { useContent } from "@/context/ContentContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useInventory, Product } from "@/context/InventoryContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, ImageOff, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProductEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

export const ProductEditDialog = ({ isOpen, onClose, product }: ProductEditDialogProps) => {
    const { content } = useContent();
    const { updateProduct } = useInventory();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<Partial<Product>>({
        name: "",
        description: "",
        tooltip: "",
        is_on_sale: false,
        is_active: true,
        image_url: ""
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || "",
                description: product.description || "",
                tooltip: product.tooltip || "",
                is_on_sale: product.is_on_sale || false,
                is_active: product.is_active !== false, // Default to true
                image_url: product.image_url || ""
            });
            setImageError(false);
        }
    }, [product, isOpen]);

    const handleImageUpload = async (file: File) => {
        if (!file || !product) return;

        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${product.sku}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(fileName);

            setFormData(prev => ({ ...prev, image_url: publicUrl }));
            setImageError(false);

            toast({
                title: content?.admin?.inventory?.products?.edit?.imageSuccess,
                description: content?.admin?.inventory?.products?.edit?.imageSuccessDesc,
            });
        } catch (error: any) {
            toast({
                title: content?.admin?.inventory?.products?.edit?.imageError,
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleImageUpload(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) handleImageUpload(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;

        setIsLoading(true);
        try {
            await updateProduct(product.sku, formData);
            toast({
                title: content?.admin?.inventory?.products?.edit?.success,
                description: content?.admin?.inventory?.products?.edit?.successDesc?.replace('{sku}', product.sku),
            });
            onClose();
        } catch (error: any) {
            toast({
                title: content?.admin?.inventory?.products?.edit?.error,
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!product || !content) return null;
    const t = content?.admin?.inventory?.products?.edit || {};
    const isMixProduct = product.sku.startsWith('mix-');

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[520px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-background rounded-t-xl">
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                        <span className="text-xs font-mono bg-background text-olive-dark/60 px-2 py-0.5 rounded">{product.sku}</span>
                        {t.title}
                    </DialogTitle>
                </DialogHeader>

                {/* Scrollable content */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                    <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

                        {/* Name */}
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-sm font-semibold">{t.nameLabel}</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className="text-sm"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Sale toggle */}
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-amber-50 border-amber-200">
                                <div>
                                    <p className="text-sm font-semibold text-amber-800">{t.saleLabel}</p>
                                    <p className="text-xs text-amber-600">{t.saleDesc}</p>
                                </div>
                                <Switch
                                    id="is_on_sale"
                                    checked={formData.is_on_sale}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_on_sale: checked }))}
                                />
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center justify-between p-3 rounded-lg border bg-olive-dark/5 border-olive/10">
                                <div>
                                    <p className="text-sm font-semibold text-olive-dark">{t.activeLabel}</p>
                                    <p className="text-xs text-olive/60">{t.activeDesc}</p>
                                </div>
                                <Switch
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                                />
                            </div>
                        </div>


                        {/* Description */}
                        <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-sm font-semibold">{t.descLabel}</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder={t.descPlaceholder}
                                className="text-sm resize-none"
                                rows={2}
                            />
                        </div>

                        {/* Tooltip */}
                        <div className="space-y-1.5">
                            <Label htmlFor="tooltip" className="text-sm font-semibold">{t.tooltipLabel}</Label>
                            <Textarea
                                id="tooltip"
                                value={formData.tooltip}
                                onChange={(e) => setFormData(prev => ({ ...prev, tooltip: e.target.value }))}
                                placeholder={t.tooltipPlaceholder}
                                className="text-sm resize-none"
                                rows={2}
                            />
                        </div>

                        {/* Image upload — only for non-mix products */}
                        {!isMixProduct && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">{t.imageLabel}</Label>
                                <div className="flex gap-3 items-start">
                                    {/* Preview */}
                                    <div className="w-20 h-20 shrink-0 rounded-lg border bg-background flex items-center justify-center overflow-hidden">
                                        {formData.image_url && !imageError ? (
                                            <img
                                                src={formData.image_url}
                                                alt={t.imagePreview}
                                                className="w-full h-full object-contain"
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            <ImageOff className="w-6 h-6 text-olive/20" />
                                        )}
                                    </div>

                                    {/* Drop zone */}
                                    <div
                                        className="flex-1 border-2 border-dashed border-background hover:border-primary rounded-lg p-3 text-center cursor-pointer transition-colors"
                                        onDrop={handleDrop}
                                        onDragOver={(e) => e.preventDefault()}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {isUploading ? (
                                            <div className="flex flex-col items-center gap-1.5 py-1">
                                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                                <p className="text-xs text-olive/50">{t.uploading}</p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1.5 py-1">
                                                <Upload className="h-5 w-5 text-olive/40" />
                                                <p className="text-xs text-olive/50">
                                                    {t.uploadHint}
                                                </p>
                                                <p className="text-[10px] text-olive/40">{t.uploadFormat}</p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <DialogFooter className="px-6 py-4 border-t bg-background rounded-b-xl">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            {content?.admin?.orders?.cancel || "Cancel"}
                        </Button>
                        <Button type="submit" disabled={isLoading || isUploading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t?.saveBtn}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
