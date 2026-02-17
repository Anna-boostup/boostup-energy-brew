import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInventory, SKU } from "@/context/InventoryContext";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface StockHistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    sku: SKU | null;
}

export const StockHistoryDialog = ({ isOpen, onClose, sku }: StockHistoryDialogProps) => {
    const { movements } = useInventory();

    // if (!sku) return null; // Removed to keep Dialog mounted

    const skuMovements = movements
        .filter((m) => m.sku === sku)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Historie pohybů: {sku || ''}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {skuMovements.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">Žádné pohyby pro tuto položku.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Datum</TableHead>
                                    <TableHead>Uživatel</TableHead>
                                    <TableHead>Typ</TableHead>
                                    <TableHead className="text-right">Změna</TableHead>
                                    <TableHead>Poznámka</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {skuMovements.map((movement) => (
                                    <TableRow key={movement.id}>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {format(new Date(movement.date), "d. M. yyyy HH:mm", { locale: cs })}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {movement.user ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{movement.user.full_name || 'Admin'}</span>
                                                    <span className="text-[10px] text-muted-foreground">{movement.user.email}</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground italic">Systém</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                movement.type === 'restock' ? 'default' :
                                                    movement.type === 'sale' ? 'secondary' : 'outline'
                                            } className={
                                                movement.type === 'restock' ? 'bg-green-600' :
                                                    movement.type === 'sale' ? 'bg-blue-600' : 'bg-gray-500'
                                            }>
                                                {movement.type === 'restock' && "Naskladnění"}
                                                {movement.type === 'sale' && "Prodej"}
                                                {movement.type === 'correction' && "Korekce"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className={`text-right font-mono font-bold ${movement.amount > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {movement.amount > 0 ? "+" : ""}{movement.amount}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {movement.note || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
