
import { useState } from "react";
import { useInventory, SKU } from "@/context/InventoryContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Inventory = () => {
    const { stock, updateStock } = useInventory();
    const [editingSku, setEditingSku] = useState<SKU | null>(null);
    const [editValue, setEditValue] = useState<number>(0);
    const { toast } = useToast();

    const handleEdit = (sku: SKU, currentQty: number) => {
        setEditingSku(sku);
        setEditValue(currentQty);
    };

    const handleSave = (sku: SKU) => {
        updateStock(sku, editValue);
        setEditingSku(null);
        toast({
            title: "Sklad aktualizován",
            description: `Položka ${sku} byla nastavena na ${editValue} ks.`,
        });
    };

    const handleCancel = () => {
        setEditingSku(null);
    };

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
                            <TableHead>Název (Odhad)</TableHead>
                            <TableHead className="text-right">Množství</TableHead>
                            <TableHead className="text-right">Akce</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(stock).map(([sku, qty]) => (
                            <TableRow key={sku}>
                                <TableCell className="font-mono font-medium">{sku}</TableCell>
                                <TableCell>
                                    {/* Simple mapping for demo purposes */}
                                    {sku.includes('lemon') && "🍋 Lemon Blast"}
                                    {sku.includes('red') && "🍓 Red Rush"}
                                    {sku.includes('silky') && "🌿 Silky Leaf"}
                                    {sku.includes('mix') && "🧪 Mix Pack"}
                                    {" - "}
                                    {sku.split('-')[1]} ks
                                </TableCell>
                                <TableCell className="text-right">
                                    {editingSku === sku ? (
                                        <Input
                                            type="number"
                                            value={editValue}
                                            onChange={(e) => setEditValue(Number(e.target.value))}
                                            className="w-24 text-right ml-auto"
                                        />
                                    ) : (
                                        <span className={qty < 10 ? "text-red-600 font-bold" : ""}>
                                            {qty} ks
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    {editingSku === sku ? (
                                        <div className="flex justify-end gap-2">
                                            <Button size="icon" variant="ghost" onClick={() => handleSave(sku)} className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100">
                                                <Save className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" onClick={handleCancel} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100">
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button size="icon" variant="ghost" onClick={() => handleEdit(sku, qty)} className="h-8 w-8">
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default Inventory;
