import { useState } from "react";
import { useManufacture, ManufactureMaterial } from "@/context/ManufactureContext";
import { Button } from "@/components/ui/button";
import { Plus, History, Edit, Beaker, Bell, AlertTriangle, TrendingDown } from "lucide-react";
import { ManufactureRestockDialog } from "@/components/admin/ManufactureRestockDialog";
import { ManufactureHistoryDialog } from "@/components/admin/ManufactureHistoryDialog";
import { ManufactureEditDialog } from "@/components/admin/ManufactureEditDialog";
import { Badge } from "@/components/ui/badge";

const ManufactureInventory = () => {
    const { materials, loading } = useManufacture();

    // Dialog States
    const [restockId, setRestockId] = useState<string | null>(null);
    const [historyId, setHistoryId] = useState<string | null>(null);
    const [editId, setEditId] = useState<string | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);

    if (loading) return <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-lime/20 border-t-lime rounded-full animate-spin" />
            <p className="text-olive-dark font-black uppercase text-xs tracking-widest">Načítám sklad výroby...</p>
        </div>
    </div>;

    return (
        <div className="space-y-12 pb-32 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex items-start gap-6">
                    <div className="w-20 h-20 rounded-[2.2rem] bg-olive-dark flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-lime/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Beaker className="w-10 h-10 text-lime relative z-10" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black text-olive-dark tracking-tighter font-display uppercase italic leading-none">Sklad výroby</h1>
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                            <p className="text-brand-muted font-black uppercase tracking-[0.4em] text-[10px]">
                                Správa surovin a produkčních materiálů
                            </p>
                        </div>
                    </div>
                </div>
                <Button 
                    onClick={() => setIsAddOpen(true)} 
                    className="h-16 px-10 bg-olive-dark hover:bg-black text-lime gap-4 font-black uppercase text-xs tracking-[0.3em] rounded-2xl shadow-2xl shadow-olive/20 transition-all hover:scale-[1.05] active:scale-95 group"
                >
                    <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    Nový materiál
                </Button>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 gap-6">
                {materials.length === 0 ? (
                    <div className="glass-card rounded-[3.5rem] p-24 text-center space-y-8">
                        <div className="w-24 h-24 bg-olive-dark/5 rounded-[2.5rem] flex items-center justify-center mx-auto">
                            <Beaker className="w-10 h-10 text-olive-dark/20" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-black text-olive-dark font-display uppercase italic">Sklad je prázdný</p>
                            <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest">Zatím nebyly přidány žádné výrobní suroviny.</p>
                        </div>
                    </div>
                ) : (
                    <div className="glass-card rounded-[3.5rem] overflow-hidden border border-white/40 shadow-2xl">
                        {/* Desktop View Table */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-olive/10 bg-olive-dark">
                                        <th className="px-10 py-8 text-left text-[10px] font-black uppercase tracking-[0.3em] text-lime/60">Identifikace surovin</th>
                                        <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-lime/60">Aktuální stav</th>
                                        <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-lime/60">Limit / Varování</th>
                                        <th className="px-10 py-8 text-right text-[10px] font-black uppercase tracking-[0.3em] text-lime/60">Akce</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-olive/5">
                                    {materials.map((m) => {
                                        const isCritical = m.quantity <= m.min_quantity;
                                        const isWarning = !isCritical && m.warning_quantity > 0 && m.quantity <= m.warning_quantity;
                                        
                                        return (
                                            <tr key={m.id} className="hover:bg-white/40 transition-colors group">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-6">
                                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative shadow-lg ${isCritical ? 'bg-red-50 text-red-600' : 'bg-olive-dark text-lime'}`}>
                                                            <Beaker className="w-6 h-6" />
                                                            {m.notifications_enabled && (
                                                                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md">
                                                                    <Bell className={`w-3 h-3 ${isCritical ? 'text-red-500 animate-bounce' : 'text-olive-dark'}`} />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="font-display font-black text-xl text-olive-dark uppercase italic tracking-tight group-hover:translate-x-1 transition-transform">{m.name}</p>
                                                            <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest leading-none">ID: {m.id.split('-')[0]}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="space-y-1">
                                                        <div className={`text-3xl font-black font-display italic leading-none ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-olive-dark'}`}>
                                                            {m.quantity} <span className="text-sm font-black uppercase text-brand-muted opacity-40">{m.unit}</span>
                                                        </div>
                                                        <Badge variant="outline" className={`border-none px-0 text-[10px] font-black uppercase tracking-widest ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-lime-dark'}`}>
                                                            {isCritical ? 'KRITICKÝ STAV' : isWarning ? 'NÍZKÁ ZÁSOBA' : 'STAV V POŘÁDKU'}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex flex-col items-end gap-1.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted">Limit:</span>
                                                            <span className="text-xs font-black text-olive-dark">{m.min_quantity} {m.unit}</span>
                                                        </div>
                                                        {m.warning_quantity > 0 && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted">Varovat při:</span>
                                                                <span className="text-xs font-black text-orange-500">{m.warning_quantity} {m.unit}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-12 w-12 rounded-2xl bg-white border border-olive/5 text-olive-dark hover:bg-olive-dark hover:text-lime transition-all"
                                                            onClick={() => setHistoryId(m.id)}
                                                        >
                                                            <History className="h-5 w-5" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-12 w-12 rounded-2xl bg-white border border-olive/5 text-olive-dark hover:bg-olive-dark hover:text-lime transition-all"
                                                            onClick={() => setEditId(m.id)}
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            className="h-12 w-12 rounded-2xl bg-lime text-olive-dark hover:bg-olive-dark hover:text-lime shadow-lg shadow-lime/20"
                                                            onClick={() => setRestockId(m.id)}
                                                        >
                                                            <Plus className="h-5 w-5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View Card Grid */}
                        <div className="md:hidden divide-y divide-olive/5">
                            {materials.map((m) => {
                                const isCritical = m.quantity <= m.min_quantity;
                                const isWarning = !isCritical && m.warning_quantity > 0 && m.quantity <= m.warning_quantity;
                                return (
                                    <div key={m.id} className="p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isCritical ? 'bg-red-50 text-red-600' : 'bg-olive-dark text-lime'}`}>
                                                    <Beaker className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-display font-black text-xl text-olive-dark uppercase italic leading-tight">{m.name}</p>
                                                    <p className="text-[10px] text-brand-muted font-black text-center">LIMIT: {m.min_quantity} {m.unit}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-2xl font-black font-display italic leading-none ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-olive-dark'}`}>
                                                    {m.quantity} <span className="text-[10px] uppercase opacity-40">{m.unit}</span>
                                                </p>
                                                <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${isCritical ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-lime-dark'}`}>
                                                    {isCritical ? 'KRITICKÝ STAV' : isWarning ? 'NÍZKÝ STAV' : 'V POŘÁDKU'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-14 rounded-2xl border-olive/10 font-black uppercase text-[10px] tracking-widest text-olive-dark"
                                                onClick={() => setRestockId(m.id)}
                                            >
                                                Změnit stav
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-14 w-14 rounded-2xl border-olive/10"
                                                onClick={() => setEditId(m.id)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-14 w-14 rounded-2xl border-olive/10"
                                                onClick={() => setHistoryId(m.id)}
                                            >
                                                <History className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
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
