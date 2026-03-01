import { useState } from "react";
import { useInventory, SKU } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, History, Edit } from "lucide-react";
import { RestockDialog } from "@/components/admin/RestockDialog";
import { StockHistoryDialog } from "@/components/admin/StockHistoryDialog";
import { ProductEditDialog } from "@/components/admin/ProductEditDialog";

const MobileInventoryCard = ({ sku, product, qty, onHistory, onRestock, onEdit }: { sku: string, product?: any, qty: number, onHistory: () => void, onRestock: () => void, onEdit: () => void }) => (
    <div className="border rounded-lg p-4 space-y-4 mb-4 bg-white shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-mono font-bold text-lg">{sku}</p>
                <div className="flex flex-col">
                    <span className="font-bold text-sm">
                        {product?.name || (
                            sku.includes('lemon') ? "🍋 Lemon Blast" :
                                sku.includes('red') ? "🍓 Red Rush" :
                                    sku.includes('silky') ? "🌿 Silky Leaf" : sku
                        )}
                    </span>
                    <span className="text-xs text-foreground/90 font-medium">
                        {sku.includes('-')
                            ? `📦 Balení ${sku.split('-')[1]} ks`
                            : "🍾 Samostatná lahev (pro Mixy)"}
                    </span>
                </div>
            </div>
            <div className={`text-right font-bold text-xl ${qty < 10 ? "text-red-600" : ""}`}>
                {qty} ks
            </div>
        </div>

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
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
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

    const sortedStock = Object.entries(stock)
        .filter(([sku]) => !sku.includes('mix'))
        .sort(([skuA], [skuB]) => {
            const parseSku = (sku: string) => {
                const parts = sku.split('-');
                const flavor = parts[0];
                const size = parts.length > 1 ? parseInt(parts[1]) : 1;
                return { flavor, size };
            };
            const a = parseSku(skuA);
            const b = parseSku(skuB);
            if (a.flavor !== b.flavor) return a.flavor.localeCompare(b.flavor);
            return a.size - b.size;
        });

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
                            <TableHead>Název</TableHead>
                            <TableHead className="text-right">Množství</TableHead>
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
                                        <div className="flex flex-col">
                                            <span className="font-bold">
                                                {product?.name || (
                                                    sku.includes('lemon') ? "🍋 Lemon Blast" :
                                                        sku.includes('red') ? "🍓 Red Rush" :
                                                            sku.includes('silky') ? "🌿 Silky Leaf" : sku
                                                )}
                                            </span>
                                            <span className="text-xs text-foreground/90 font-medium">
                                                {sku.includes('-')
                                                    ? `📦 Balení ${sku.split('-')[1]} ks`
                                                    : "🍾 Samostatná lahev (pro Mixy)"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`font-bold ${qty < 10 ? "text-red-600" : ""}`}>
                                            {qty} ks
                                        </span>
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
                                                className="bg-green-600 hover:bg-green-700 text-white"
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
