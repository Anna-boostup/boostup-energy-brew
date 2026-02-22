import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useManufacture, ManufactureMaterial } from "@/context/ManufactureContext";
import { format } from "date-fns";
import { cs } from "date-fns/locale";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    material: ManufactureMaterial | null;
}

export const ManufactureHistoryDialog = ({ isOpen, onClose, material }: Props) => {
    const { movements } = useManufacture();

    const filteredMovements = movements.filter(m => m.material_id === material?.id);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Historie pohybu: {material?.name}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Datum</TableHead>
                                <TableHead>Typ</TableHead>
                                <TableHead className="text-right">Změna</TableHead>
                                <TableHead>Uživatel</TableHead>
                                <TableHead>Poznámka</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredMovements.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Žádné záznamy o pohybu.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredMovements.map((move) => (
                                    <TableRow key={move.id}>
                                        <TableCell className="text-xs whitespace-nowrap">
                                            {format(new Date(move.created_at), "d. MMM HH:mm", { locale: cs })}
                                        </TableCell>
                                        <TableCell>
                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${move.type === 'restock' ? 'bg-green-100 text-green-700' :
                                                    move.type === 'use' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-slate-100 text-slate-700'
                                                }`}>
                                                {move.type === 'restock' ? 'Naskladnění' :
                                                    move.type === 'use' ? 'Spotřeba' : 'Oprava'}
                                            </span>
                                        </TableCell>
                                        <TableCell className={`text-right font-bold ${move.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                                            {move.amount > 0 ? "+" : ""}{move.amount} {material?.unit}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {move.user?.full_name || move.user?.email || "Systém"}
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
