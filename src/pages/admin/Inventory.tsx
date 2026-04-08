import { useState } from "react";
import { useInventory, SKU } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Minus, History, Edit } from "lucide-react";
import { RestockDialog } from "@/components/admin/RestockDialog";
import { StockHistoryDialog } from "@/components/admin/StockHistoryDialog";
import { ProductEditDialog } from "@/components/admin/ProductEditDialog";
import { Switch } from "@/components/ui/switch";
import { FLAVORS, FlavorType } from "@/config/product-data";

const PACK_SIZES = [3, 12, 21] as const;

const BASE_FLAVOR_IDS = FLAVORS.map(f => f.id);
const isBaseFlavor = (sku: string): sku is FlavorType =>
    BASE_FLAVOR_IDS.includes(sku as FlavorType);

const getFlavorLabel = (sku: string) => {
    if (sku.includes('lemon')) return "🍋 Lemon Blast";
    if (sku.includes('red'))   return "🍓 Red Rush";
    if (sku.includes('silky')) return "🌿 Silky Leaf";
    return sku;
};

const PackBreakdown = ({ bottles }: { bottles: number }) => (
    <div className="flex flex-wrap gap-2 mt-2">
        {PACK_SIZES.map(size => {
            const count = Math.floor(bottles / size);
            return (
                <div
                    key={size}
                    className={`flex flex-col items-center justify-center rounded-2xl border px-3 py-2 transition-all ${
                        count > 0 ? "bg-white border-slate-200 shadow-sm" : "bg-slate-50/50 border-slate-100 opacity-40"
                    }`}
                >
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{size}ks</span>
                    <span className="text-sm font-black text-slate-900">{count}×</span>
                </div>
            );
        })}
    </div>
);

const MobileInventoryCard = ({ sku, product, qty, onHistory, onRestock, onEdit }: { sku: string, product?: any, qty: number, onHistory: () => void, onRestock: () => void, onEdit: () => void }) => (
    <div className="border border-white/40 rounded-[2.5rem] p-6 space-y-4 mb-6 bg-white/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md">
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

        <div className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Aktivní prodej</span>
            <Switch
                checked={product?.is_active !== false}
                onCheckedChange={async (checked) => {
                    if (product) {
                        try {
                            await onEdit(); // We keep this if it triggers a refresh or similar but we need direct update
                        } catch (e) {}
                    }
                }}
                className="scale-75 data-[state=checked]:bg-lime"
            />
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
    const { stock, products, updateProduct } = useInventory();

    // Dialog States
    const [restockData, setRestockData] = useState<{ sku: SKU; mode: "in" | "out" } | null>(null);
    const [historySku, setHistorySku] = useState<SKU | null>(null);
    const [editSku, setEditSku] = useState<SKU | null>(null);

    // Show only base flavor SKUs (lemon, red, silky)
    const sortedStock = Object.entries(stock)
        .filter(([sku]) => isBaseFlavor(sku))
        .sort(([skuA], [skuB]) => skuA.localeCompare(skuB));

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Správa skladu</h2>
                    <p className="text-muted-foreground">Přehled zásob hotových výrobků.</p>
                </div>
            </div>

            {/* Desktop Table Container */}
            <div className="bg-white/50 backdrop-blur-sm rounded-[2.5rem] border border-white/40 shadow-sm hidden md:block overflow-hidden transition-all hover:shadow-md animate-in fade-in zoom-in-95 duration-500">
                <Table>
                    <TableHeader className="bg-slate-50 border-b border-slate-200">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-5 px-6">Produkt / SKU</TableHead>
                            <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-5 text-right w-[150px]">Skladem</TableHead>
                            <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-5 pl-10">Přepočet na balení</TableHead>
                            <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-5 text-center w-[120px]">Prodej</TableHead>
                            <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-5 text-right px-6">Akce</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedStock.map(([sku, qty]) => {
                            const product = products.find(p => p.sku === sku);
                            return (
                                <TableRow key={sku} className="transition-colors hover:bg-slate-50/80 border-b border-slate-100 group">
                                    <TableCell className="py-6 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-display font-black text-slate-900 text-base leading-tight mb-1">
                                                {product?.name || getFlavorLabel(sku)}
                                            </span>
                                            <span className="font-mono font-black text-[10px] text-primary bg-slate-900 px-2 py-0.5 rounded-md w-fit tracking-tighter uppercase">
                                                {sku}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`font-display font-black text-2xl tabular-nums leading-none ${qty < 10 ? "text-red-500" : "text-slate-900"}`}>
                                                {qty}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Lahviček</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="pl-10">
                                        <PackBreakdown bottles={qty} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <Switch
                                                checked={product?.is_active !== false}
                                                onCheckedChange={async (checked) => {
                                                    if (product) {
                                                        await updateProduct(product.sku, { is_active: checked });
                                                    }
                                                }}
                                                className="data-[state=checked]:bg-primary shadow-sm"
                                            />
                                            <span className="text-[9px] font-black uppercase tracking-tighter text-slate-400">
                                                {product?.is_active !== false ? "Aktivní" : "Vypnuto"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-6 tabular-nums">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setHistorySku(sku)}
                                                className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                                                title="Historie pohybů"
                                            >
                                                <History className="h-4.5 w-4.5" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-10 w-10 p-0 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                                                onClick={() => setEditSku(sku)}
                                                title="Upravit detaily"
                                            >
                                                <Edit className="h-4.5 w-4.5" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-10 w-10 p-0 rounded-xl text-red-400 hover:text-red-600 hover:bg-red-50"
                                                onClick={() => setRestockData({ sku: sku as SKU, mode: "out" })}
                                                title="Odebrat ze skladu"
                                            >
                                                <Minus className="h-4.5 w-4.5" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-slate-900 hover:bg-black text-white h-10 px-4 rounded-xl font-bold shadow-lg shadow-slate-900/10"
                                                onClick={() => setRestockData({ sku: sku as SKU, mode: "in" })}
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Doplnit
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
                        onRestock={() => setRestockData({ sku: sku as SKU, mode: "in" })}
                        onEdit={() => setEditSku(sku)}
                    />
                ))}
            </div>

            {/* Dialogs */}
            <RestockDialog
                isOpen={!!restockData}
                onClose={() => setRestockData(null)}
                sku={restockData?.sku || null}
                currentStock={restockData ? stock[restockData.sku] : 0}
                initialMode={restockData?.mode}
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
