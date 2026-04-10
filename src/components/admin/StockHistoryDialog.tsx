import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInventory, SKU } from "@/context/InventoryContext";
import { History, ArrowUpRight, ArrowDownRight, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import { cs, enGB } from "date-fns/locale";
import { useContent } from "@/context/ContentContext";
import { Badge } from "@/components/ui/badge";

interface StockHistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    sku: SKU | null;
}

export const StockHistoryDialog = ({ isOpen, onClose, sku }: StockHistoryDialogProps) => {
    const { content } = useContent();
    const { history } = useInventory();

    if (!content) return null;
    const t = content?.admin?.inventory?.stock?.history || {};
    const dateLocale = content?.lang === 'en' ? enGB : cs;

    const stockHistory = sku ? history.filter(h => h.sku === sku).sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
    ) : [];

    const getTypeName = (type: string) => {
        switch (type) {
            case 'restock': return t.types.restock;
            case 'sale': return t.types.sale;
            case 'correction': return t.types.correction;
            default: return type;
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'restock': return <ArrowUpRight className="w-4 h-4 text-green-600" />;
            case 'sale': return <ArrowDownRight className="w-4 h-4 text-orange-600" />;
            default: return <RefreshCcw className="w-4 h-4 text-blue-600" />;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <History className="w-5 h-5" />
                        {t.title} {sku}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 pb-6 mt-4">
                    {stockHistory.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                           {t.empty}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[160px]">{t.table.date}</TableHead>
                                    <TableHead>{t.table.user}</TableHead>
                                    <TableHead>{t.table.type}</TableHead>
                                    <TableHead className="text-right">{t.table.change}</TableHead>
                                    <TableHead className="max-w-[200px]">{t.table.note}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockHistory.map((h, i) => (
                                    <TableRow key={h.id || i}>
                                        <TableCell className="font-mono text-[11px]">
                                            {format(new Date(h.date), "d. MMMM yyyy HH:mm", { locale: dateLocale })}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {h.user_email || t.systemUser}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-xs font-medium">
                                                {getTypeIcon(h.type)}
                                                {getTypeName(h.type)}
                                            </div>
                                        </TableCell>
                                        <TableCell className={`text-right font-bold ${h.quantity > 0 ? "text-green-600" : "text-red-600"}`}>
                                            {h.quantity > 0 ? "+" : ""}{h.quantity}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground truncate" title={h.note}>
                                            {h.note || "-"}
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
