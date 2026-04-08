import { useState } from "react";
import { useManufacture, ManufactureMaterial } from "@/context/ManufactureContext";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, History, Edit, Beaker, Bell } from "lucide-react";
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
        <div className="space-y-10 pb-20 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 flex-wrap">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 font-display uppercase">Sklad výroby</h2>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Suroviny a materiály pro produkci</p>
                </div>
                <Button onClick={() => setIsAddOpen(true)} className="h-14 px-8 bg-slate-900 hover:bg-black text-primary gap-3 font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl shadow-slate-900/10 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    <Plus className="h-5 w-5" />
                    Přidat surovinu
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
                                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 relative">
                                                <Beaker className="w-4 h-4" />
                                                {m.notifications_enabled && (
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                                                        <Bell className="w-1.5 h-1.5 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold flex items-center gap-2">
                                                    {m.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">Jednotka: {m.unit}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {(() => {
                                            const isCritical = m.quantity <= m.min_quantity;
                                            const isWarning = !isCritical && m.warning_quantity > 0 && m.quantity <= m.warning_quantity;
                                            return (
                                                <>
                                                    <span className={`font-mono font-bold text-lg ${isCritical ? "text-red-600"
                                                            : isWarning ? "text-amber-500"
                                                                : "text-slate-900"
                                                        }`}>
                                                        {m.quantity} {m.unit}
                                                    </span>
                                                    {isCritical && (
                                                        <p className="text-[10px] text-red-500 font-bold uppercase">Kritický stav!</p>
                                                    )}
                                                    {isWarning && (
                                                        <p className="text-[10px] text-amber-500 font-bold uppercase">Dochází...</p>
                                                    )}
                                                </>
                                            );
                                        })()}
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
