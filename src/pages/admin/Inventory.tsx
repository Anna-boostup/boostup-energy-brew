import { useState } from "react";
import { useInventory, SKU } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, History, Edit } from "lucide-react";
import { RestockDialog } from "@/components/admin/RestockDialog";
import { StockHistoryDialog } from "@/components/admin/StockHistoryDialog";
import { ProductEditDialog } from "@/components/admin/ProductEditDialog";
import { FLAVORS } from "@/config/product-data";

const PACK_SIZES = [3, 12, 21] as const;

const getFlavorLabel = (sku: string) => {
    if (sku.includes('lemon')) return "🍋 Lemon Blast";
    if (sku.includes('red'))   return "🍓 Red Rush";
    if (sku.includes('silky')) return "🌿 Silky Leaf";
    return sku;
};

const PackBreakdown = ({ bottles }: { bottles: number }) => (
    <div className="flex flex-wrap gap-1 mt-1">
        {PACK_SIZES.map(size => (
            <span
                key={size}
                className="inline-flex items-center rounded-full border bg-muted/50 px-2 py-0.5 text-xs font-medium"
            >
                {Math.floor(bottles / size)}× po {size}
            </span>
        ))}
    </div>
);

const MobileInventoryCard = ({ sku, product, qty, onHistory, onRestock, onEdit }: { sku: string, product?: any, qty: number, onHistory: () => void, onRestock: () => void, onEdit: () => void }) => (
    <div className="border rounded-lg p-4 space-y-4 mb-4 bg-white shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-mono font-bold text-lg">{sku}</p>
                <div className="flex flex-col">
                    <span className="font-bold text-sm">
                        {product?.name || getFlavorLabel(sku)}
                    </span>
                    <span className="text-xs text-foreground/90 font-medium">🍾 Lahvičky na skladě</span>
                </div>
            </div>
            <div className={`text-right font-bold text-xl ${qty < 10 ? "text-terracotta" : ""}`}>
                {qty} ks
            </div>
        </div>

        <PackBreakdown bottles={qty} />

        <div className="flex gap-2 pt-2 border-t">
            <Button
                size="sm"
                variant="outline"
                onClick={onHistory}
                className="flex-1"
                aria-label={`Historie pohybů pro ${sku}`}
                title="Historie"
            >
                <History className="h-3 w-3 mr-1" />
                Historie
            </Button>
            <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={onEdit}
                aria-label={`Upravit detaily pro ${sku}`}
                title="Upravit detaily"
            >
                <Edit className="h-3 w-3 mr-1" />
                Upravit
            </Button>
            <Button
                size="sm"
                className="bg-lime hover:bg-lime-dark text-white flex-1"
                onClick={onRestock}
                aria-label={`Naskladnit ${sku}`}
                title="Naskladnit"
            >
                <Plus className="h-3 w-3 mr-1" />
                Sklad
            </Button>
        </div>
    </div>
);

const Inventory = () => {
    const { stock, products } = useInventory();

    // Dialog States
    const [restockSku, setRestockSku] = useState<SKU | null>(null);
    const [historySku, setHistorySku] = useState<SKU | null>(null);
    const [editSku, setEditSku] = useState<SKU | null>(null);

    // Show only base flavor SKUs (no pack suffix, no mix)
    const baseFlavors = FLAVORS.map(f => f.id);
    const sortedStock = Object.entries(stock)
        .filter(([sku]) => baseFlavors.includes(sku as any))
        .sort(([skuA], [skuB]) => skuA.localeCompare(skuB));

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Správa sklad</h2>
            </div>

            {/* Desktop Table */}
            <div className="bg-white rounded-md border shadow-sm hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>SKU (Kód)</TableHead>
                            <TableHead>Příchuť</TableHead>
                            <TableHead className="text-right">Lahvičky na skladě</TableHead>
                            <TableHead>Odpovídá balením</TableHead>
                            <TableHead className="text-right">Akce</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedStock.map(([sku, qty]) => {
                            const product = products.find(p => p.sku === sku);
                            return (
                                <TableRow key={sku}>
                                    <TableCell className="font-mono font-medium">{sku}</TableCell>
                                    <TableCell>
                                        <span className="font-bold">
                                            {product?.name || getFlavorLabel(sku)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`font-bold text-lg ${qty < 10 ? "text-terracotta" : ""}`}>
                                            {qty} ks
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <PackBreakdown bottles={qty} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setHistorySku(sku)}
                                                aria-label={`Historie pohybů pro ${sku}`}
                                                title="Historie pohybů"
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditSku(sku)}
                                                aria-label={`Upravit detaily pro ${sku}`}
                                                title="Upravit detaily"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-lime hover:bg-lime-dark text-white"
                                                onClick={() => setRestockSku(sku)}
                                                aria-label={`Naskladnit ${sku}`}
                                                title="Naskladnit"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile List */}
            <div className="md:hidden">
                {sortedStock.map(([sku, qty]) => (
                    <MobileInventoryCard
                        key={sku}
                        sku={sku}
                        product={products.find(p => p.sku === sku)}
                        qty={qty}
                        onHistory={() => setHistorySku(sku)}
                        onRestock={() => setRestockSku(sku)}
                        onEdit={() => setEditSku(sku)}
                    />
                ))}
            </div>

            {/* Dialogs */}
            <RestockDialog
                isOpen={!!restockSku}
                onClose={() => setRestockSku(null)}
                sku={restockSku}
                currentStock={restockSku ? stock[restockSku] : 0}
            />

            <StockHistoryDialog
                isOpen={!!historySku}
                onClose={() => setHistorySku(null)}
                sku={historySku}
            />

            <ProductEditDialog
                isOpen={!!editSku}
                onClose={() => setEditSku(null)}
                product={editSku ? products.find(p => p.sku === editSku) || null : null}
            />
        </div>
    );
};

export default Inventory;
