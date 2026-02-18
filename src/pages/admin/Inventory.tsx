import { useState } from "react";
import { useInventory, SKU } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, History } from "lucide-react";
import { RestockDialog } from "@/components/admin/RestockDialog";
import { StockHistoryDialog } from "@/components/admin/StockHistoryDialog";

const Inventory = () => {
    const { stock } = useInventory();

    // Dialog States
    const [restockSku, setRestockSku] = useState<SKU | null>(null);
    const [historySku, setHistorySku] = useState<SKU | null>(null);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Správa skladu</h2>
            </div>

            <div className="bg-white rounded-md border shadow-sm">
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
                        {Object.entries(stock)
                            .filter(([sku]) => !sku.includes('mix'))
                            .sort(([skuA], [skuB]) => {
                                const parseSku = (sku: string) => {
                                    const parts = sku.split('-');
                                    const flavor = parts[0];
                                    // If no number, treat as size 1 (single)
                                    const size = parts.length > 1 ? parseInt(parts[1]) : 1;
                                    return { flavor, size };
                                };
                                const a = parseSku(skuA);
                                const b = parseSku(skuB);

                                // Sort by Flavor (Lemon, Red, Silky)
                                if (a.flavor !== b.flavor) return a.flavor.localeCompare(b.flavor);

                                // Sort by Size (1, 3, 12, 21)
                                return a.size - b.size;
                            })
                            .map(([sku, qty]) => (
                                <TableRow key={sku}>
                                    <TableCell className="font-mono font-medium">{sku}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold">
                                                {sku.includes('lemon') && "🍋 Lemon Blast"}
                                                {sku.includes('red') && "🍓 Red Rush"}
                                                {sku.includes('silky') && "🌿 Silky Leaf"}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
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
                                                title="Historie pohybů"
                                            >
                                                <History className="h-4 w-4 mr-1" />
                                                Historie
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                onClick={() => setRestockSku(sku)}
                                                title="Naskladnit"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Naskladnit
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
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
        </div>
    );
};

export default Inventory;
