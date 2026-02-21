import { useState } from "react";
import { useManufacture, ManufactureMaterial } from "@/context/ManufactureContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, History, Edit, Beaker } from "lucide-react";
import { ManufactureRestockDialog } from "@/components/admin/ManufactureRestockDialog";
import { ManufactureHistoryDialog } from "@/components/admin/ManufactureHistoryDialog";
import { ManufactureEditDialog } from "@/components/admin/ManufactureEditDialog";

const ManufactureInventory = () => {
    const { materials, loading } = useManufacture();

    // Dialog States
    const [restockId, setRestockId] = useState<string | null>(null);
    const [historyId, setHistoryId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);

    if (loading) return <div className="p-8">Načítám sklad výroby...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Sklad výroby</h2>
                <Button onClick={() => setIsAddOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Přidat surovinu/materiál
                </Button>
            </div>

            <div className="bg-white rounded-md border shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Surovina/materiál</TableHead>
                            <TableHead className="text-right">Množství</TableHead>
                            <TableHead className="text-right">Akce</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materials.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                    Zatím žádné suroviny/materiály. Přidejte první tlačítkem výše.
                                </TableCell>
                            </TableRow>
                        ) : (
                            materials.map((m) => (
                                <TableRow key={m.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                                <Beaker className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-bold">{m.name}</p>
                                                <p className="text-xs text-muted-foreground">Jednotka: {m.unit}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className={`font-mono font-bold text-lg ${m.quantity <= m.min_quantity ? "text-red-600" : "text-slate-900"}`}>
                                            {m.quantity} {m.unit}
                                        </span>
                                        {m.quantity <= m.min_quantity && (
                                            <p className="text-[10px] text-red-500 font-bold uppercase">Nízký stav!</p>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setHistoryId(m.id)}
                                                title="Historie pohybu"
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setEditId(m.id)}
                                                title="Upravit detaily"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                onClick={() => setRestockId(m.id)}
                                                title="Změnit stav"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Dialogs */}
            <ManufactureRestockDialog
                isOpen={!!restockId}
                onClose={() => setRestockId(null)}
                material={materials.find(m => m.id === restockId) || null}
            />

            <ManufactureHistoryDialog
                isOpen={!!historyId}
                onClose={() => setHistoryId(null)}
                material={materials.find(m => m.id === historyId) || null}
            />

            <ManufactureEditDialog
                isOpen={!!editId || isAddOpen}
                onClose={() => {
                    setEditId(null);
                    setIsAddOpen(false);
                }}
                material={editId ? materials.find(m => m.id === editId) || null : null}
            />
        </div>
    );
};

export default ManufactureInventory;
