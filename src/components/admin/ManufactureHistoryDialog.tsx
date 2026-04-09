import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useManufacture, ManufactureMaterial } from "@/context/ManufactureContext";
import { format } from "date-fns";
import { cs, enGB } from "date-fns/locale";
import { useContent } from "@/context/ContentContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    material: ManufactureMaterial | null;
}

export const ManufactureHistoryDialog = ({ isOpen, onClose, material }: Props) => {
    const { content } = useContent();
    const { movements } = useManufacture();

    if (!content) return null;
    const t = content.admin.inventory.manufacture.dialogs.history;
    const dateLocale = content.lang === 'en' ? enGB : cs;

    const filteredMovements = movements.filter(m => m.material_id === material?.id);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>{t.title.replace('{name}', material?.name || "")}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t.table.date}</TableHead>
                                <TableHead>{t.table.type}</TableHead>
                                <TableHead className="text-right">{t.table.change}</TableHead>
                                <TableHead>{t.table.user}</TableHead>
                                <TableHead>{t.table.note}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMovements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        {t.empty}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMovements.map((move) => (
                                    <TableRow key={move.id}>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {format(new Date(move.created_at), "d. MMM HH:mm", { locale: dateLocale })}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${move.type === 'restock' ? 'bg-green-100 text-green-700' :
                                                    move.type === 'use' ? 'bg-olive-dark/10 text-olive-dark' :
                                                        'bg-background text-olive'
                                                }`}>
                                                {move.type === 'restock' ? t.types.restock :
                                                    move.type === 'use' ? t.types.use : t.types.correction}
                                            </span>
                                        </TableCell>
                                        <TableCell className={`text-right font-bold ${move.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                                            {move.amount > 0 ? "+" : ""}{move.amount} {material?.unit}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {move.user?.full_name || move.user?.email || t.systemUser}
                                        </TableCell>
                                        <TableCell className="text-xs italic text-muted-foreground">
                                            {move.note || "-"}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
};
