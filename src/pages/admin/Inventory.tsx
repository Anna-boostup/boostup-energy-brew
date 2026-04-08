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
                    className={`flex items-center gap-1.5 rounded-xl border transition-all duration-500 ${
                        count > 0
                            ? "bg-white/80 border-olive/10 shadow-sm backdrop-blur-sm"
                            : "bg-olive-dark/5 border-transparent opacity-20"
                    } px-3 py-1.5 hover:scale-105`}
                >
                    <span className="text-[9px] font-black uppercase tracking-[0.15em] text-olive/40">{size}ks</span>
                    <span className="text-sm font-black text-olive-dark font-display">{count}×</span>
                </div>
            );
        })}
    </div>
);

const MobileInventoryCard = ({ sku, product, qty, onHistory, onRestock, onEdit }: { sku: string, product?: any, qty: number, onHistory: () => void, onRestock: () => void, onEdit: () => void }) => (
    <div className="glass-card rounded-[3rem] p-8 space-y-8 mb-8 border-none animate-in fade-in slide-in-from-bottom-6">
        <div className="flex justify-between items-start">
            <div>
                <div className="font-mono font-black text-[11px] text-white bg-olive-dark px-3 py-1.5 rounded-xl w-fit mb-3 shadow-xl shadow-olive-dark/10">#{sku}</div>
                <div className="flex flex-col">
                    <span className="font-black text-2xl text-olive-dark leading-tight uppercase tracking-tight">
                        {product?.name || getFlavorLabel(sku)}
                    </span>
                    <span className="text-[10px] text-olive/40 font-black uppercase tracking-widest mt-1">Stav zásob</span>
                </div>
            </div>
            <div className={`text-right ${qty < 10 ? "text-terracotta font-black" : "text-olive-dark"}`}>
                <div className="text-4xl font-black font-display leading-none">{qty}</div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-30 mt-1">Lahviček</div>
            </div>
        </div>

        <div className="flex items-center justify-between p-5 rounded-[2rem] bg-olive-dark/5 border border-olive/5">
            <span className="text-[10px] font-black text-olive/40 uppercase tracking-[0.2em]">Aktivní prodej</span>
            <Switch
                checked={product?.is_active !== false}
                onCheckedChange={async (checked) => {
                   if (product) await updateProduct(product.sku, { is_active: checked });
                }}
                className="data-[state=checked]:bg-lime shadow-lg shadow-lime/10"
            />
        </div>

        <div className="space-y-4">
            <span className="text-[10px] font-black text-olive/20 uppercase tracking-[0.3em] ml-2">Přepočet na balení</span>
            <PackBreakdown bottles={qty} />
        </div>

        <div className="flex gap-3 pt-6 border-t border-olive/5">
            <Button
                variant="outline"
                onClick={onHistory}
                className="h-14 rounded-2xl border-olive/10 hover:bg-olive-dark hover:text-white font-black uppercase text-[10px] tracking-widest flex-1 transition-all"
                aria-label={`Historie pohybů pro ${sku}`}
            >
                <History className="h-4 w-4 mr-2" />
                Historie
            </Button>
            <Button
                variant="outline"
                className="h-14 rounded-2xl border-olive/10 hover:bg-white text-olive-dark/40 hover:text-olive-dark font-black uppercase text-[10px] tracking-widest flex-1 transition-all"
                onClick={onEdit}
                aria-label={`Upravit detaily pro ${sku}`}
            >
                <Edit className="h-4 w-4 mr-2" />
                Edit
            </Button>
            <Button
                className="bg-lime hover:bg-lime/80 text-olive-dark h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest flex-1 shadow-xl shadow-lime/20 transition-all"
                onClick={onRestock}
                aria-label={`Naskladnit ${sku}`}
            >
                <Plus className="h-4 w-4 mr-2" />
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-5xl font-black tracking-tighter text-olive-dark font-display uppercase italic">SKLAD VÝROBKŮ</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="w-2 h-2 rounded-full bg-lime animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-muted leading-none">Kontrola zásob a naskladnění hotových lahviček.</p>
                    </div>
                </div>
            </div>

            {/* Desktop Table Container */}
            <div className="hidden md:block overflow-hidden rounded-[3rem] glass-card border-none shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/40 border-b border-olive/5">
                        <TableRow className="hover:bg-transparent border-none">
                            <TableHead className="font-black text-brand-primary uppercase text-[10px] tracking-[0.4em] py-4 px-6">PRODUKT / SKU</TableHead>
                            <TableHead className="font-black text-brand-primary uppercase text-[10px] tracking-[0.4em] py-4 text-right w-[140px]">SKLADEM</TableHead>
                            <TableHead className="font-black text-brand-primary uppercase text-[10px] tracking-[0.4em] py-4 pl-8">BALENÍ</TableHead>
                            <TableHead className="font-black text-brand-primary uppercase text-[10px] tracking-[0.4em] py-4 text-center w-[120px]">PRODEJ</TableHead>
                            <TableHead className="font-black text-brand-primary uppercase text-[10px] tracking-[0.4em] py-4 text-right px-6">AKCE</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedStock.map(([sku, qty]) => {
                            const product = products.find(p => p.sku === sku);
                            return (
                                <TableRow key={sku} className="transition-all duration-300 hover:bg-white border-b border-olive/8 group">
                                    <TableCell className="py-4 px-6">
                                        <div className="flex flex-col">
                                            <span className="font-display font-black text-olive-dark text-lg leading-tight uppercase tracking-tight">
                                                {product?.name || getFlavorLabel(sku)}
                                            </span>
                                            <span className="font-mono font-black text-[10px] text-white bg-olive-dark px-2 py-0.5 rounded-lg w-fit mt-1.5 shadow-sm">#{sku}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`font-display font-black text-3xl tabular-nums leading-none ${qty < 10 ? "text-terracotta" : "text-olive-dark"}`}>
                                                {qty}
                                            </span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-olive/20 mt-1">Lahviček</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="pl-8">
                                        <PackBreakdown bottles={qty} />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Switch
                                                checked={product?.is_active !== false}
                                                onCheckedChange={async (checked) => {
                                                    if (product) await updateProduct(product.sku, { is_active: checked });
                                                }}
                                                className="data-[state=checked]:bg-lime shadow-lg shadow-lime/10"
                                            />
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${product?.is_active !== false ? "text-white" : "text-olive/30"}`}>
                                                {product?.is_active !== false ? "AKTIVNÍ" : "VYPNUTO"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-6">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setHistorySku(sku)}
                                                className="h-10 w-10 p-0 rounded-xl border-olive/15 hover:bg-olive-dark hover:text-white hover:border-olive-dark transition-all duration-200 text-olive-dark/50"
                                                title="Historie pohybů"
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-10 w-10 p-0 rounded-xl border-olive/15 hover:bg-olive-dark hover:text-white hover:border-olive-dark transition-all duration-200 text-olive-dark/50"
                                                onClick={() => setEditSku(sku)}
                                                title="Upravit detaily"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-10 w-10 p-0 rounded-xl text-terracotta/60 hover:text-terracotta hover:bg-terracotta/10 transition-all duration-200"
                                                onClick={() => setRestockData({ sku: sku as SKU, mode: "out" })}
                                                title="Odebrat ze skladu"
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-olive-dark hover:bg-olive text-white h-10 px-5 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md transition-all duration-200 ml-1"
                                                onClick={() => setRestockData({ sku: sku as SKU, mode: "in" })}
                                            >
                                                <Plus className="h-3.5 w-3.5 mr-1.5" />
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

            {/* Mobile List Container */}
            <div className="md:hidden space-y-6 px-1">
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
