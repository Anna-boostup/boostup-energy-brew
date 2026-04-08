import { useState } from "react";
import { useInventory, Order } from "@/context/InventoryContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Truck, Clock, Eye, Printer, RefreshCcw, CheckSquare, Square, XCircle, AlertTriangle, LayoutGrid, Layers, ArrowUpDown, Bell, MousePointer2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { OrderDetailDialog } from "@/components/orders/OrderDetailDialog";
import { FileText } from "lucide-react";
import InvoiceModal from "@/components/admin/InvoiceModal";


const MobileOrderCard = ({ order, onStatusChange }: { order: any, onStatusChange: (id: string, status: Order['status']) => void }) => {
    const { toast } = useToast();
    return (
        <div className="glass-card rounded-[2.5rem] p-6 sm:p-8 space-y-6 mb-6 border-none shadow-xl transition-all duration-500 hover:scale-[1.01] overflow-hidden animate-in fade-in slide-in-from-bottom-6">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-black text-xs text-white bg-olive-dark px-3 py-1.5 rounded-xl">#{order.id.slice(0, 8)}</span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-olive/20 hover:text-white transition-colors" 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(order.id);
                                toast({ title: "ID zkopírováno", duration: 1000 });
                            }}
                        >
                            <Layers className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/30">{new Date(order.date).toLocaleString('cs-CZ')}</p>
                </div>
                <div className="flex flex-col gap-3 items-end">
                    <Badge className={`text-[9px] font-black uppercase tracking-widest px-3 h-6 rounded-lg border-none shadow-sm ${order.status === 'pending' ? 'bg-orange-500/10 text-orange-600' : 'bg-lime text-olive-dark'}`}>
                        {order.status === 'pending' ? 'ČEKÁ' : 'ZAPLACENO'}
                    </Badge>
                    <Badge
                        className={`text-[9px] font-black uppercase tracking-widest px-3 h-6 rounded-lg border-none shadow-sm ${
                            order.status === 'shipped' ? 'bg-olive-dark text-white' :
                                order.status === 'processing' ? 'bg-[#3d5a2f] text-white' :
                                    order.status === 'cancelled' ? 'bg-olive/10 text-olive/40' :
                                        'bg-lime/20 text-olive-dark'
                        }`}
                    >
                        {order.status === 'shipped' ? 'VYŘÍZENO' :
                            order.status === 'processing' ? 'VÝROBA' :
                                order.status === 'cancelled' ? 'STORNO' :
                                    'PŘIJATO'}
                    </Badge>
                </div>
            </div>

            <div className="p-5 rounded-2xl bg-olive-dark/5 border border-olive/5 space-y-3">
                <p className="text-sm font-black text-olive-dark uppercase tracking-tight">{order.customer.name}</p>
                <p className="text-[11px] text-olive/50 font-bold truncate">{order.customer.email}</p>
            </div>

            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-olive/40">Položky:</p>
                <div className="space-y-1">
                    {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="text-xs flex justify-between items-center bg-background/50 p-2 rounded-xl border border-background">
                            <span className="font-medium text-olive">{item.quantity}x {item.name}</span>
                            <span className="font-bold text-olive/40">{item.price} Kč</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-background">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-olive/40">Celková cena</span>
                    <span className="font-display font-black text-xl text-olive-dark">{order.total} Kč</span>
                </div>
                <div className="flex gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="rounded-xl h-12 px-6 border-olive/10 hover:bg-olive-dark hover:text-white font-black uppercase text-[10px] tracking-widest">Detail</Button>
                        </DialogTrigger>
                        <OrderDetailDialog order={order} />
                    </Dialog>
                    {order.status === 'pending' && (
                        <Button size="sm" onClick={() => onStatusChange(order.id, 'paid')} className="bg-lime text-olive-dark hover:bg-lime/80 rounded-xl h-12 px-4 shadow-lg shadow-lime/20" aria-label="Označit jako zaplacené">
                            <CheckCircle className="w-5 h-5" />
                        </Button>
                    )}
                    {(order.status === 'paid' || order.status === 'processing') && (
                        <Button size="sm" onClick={() => onStatusChange(order.id, 'shipped')} className="bg-olive-dark text-white hover:bg-black rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest" aria-label="Označit jako vyřízené">
                            <Truck className="w-4 h-4 mr-2" />
                            <span>Odeslat</span>
                        </Button>
                    )}
                    <InvoiceModal order={order}>
                        <Button size="sm" variant="ghost" className="h-10 w-10 p-0 text-olive/40 hover:text-olive-dark hover:bg-background rounded-xl" aria-label="Zobrazit fakturu">
                            <FileText className="h-5 w-5" />
                        </Button>
                    </InvoiceModal>
                </div>
            </div>
        </div>
    )
};

interface OrderTableProps {
    data: Order[];
    selectedOrders: Set<string>;
    toggleOrderSelection: (id: string) => void;
    onStatusChange: (id: string, status: Order['status']) => void;
    setSelectedOrders: (ids: Set<string>) => void;
    onSort: (key: 'id' | 'date') => void;
    sortConfig: { key: 'id' | 'date'; direction: 'asc' | 'desc' };
}

const OrderTable = ({ data, selectedOrders, toggleOrderSelection, onStatusChange, setSelectedOrders, onSort, sortConfig }: OrderTableProps) => {
    const { toast } = useToast();
    return (
    <>
        {/* Desktop View */}
        <div className="hidden md:block overflow-hidden rounded-[2.5rem] border border-olive/5 bg-white/50 backdrop-blur-sm">
            <Table>
                <TableHeader className="bg-white/40 border-b border-olive/5">
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="w-16 pl-8">
                            <Checkbox
                                checked={data.length > 0 && data.every(o => selectedOrders.has(o.id))}
                                onCheckedChange={(checked) => {
                                    const newSelected = new Set(selectedOrders);
                                    data.forEach(o => {
                                        if (checked) newSelected.add(o.id);
                                        else newSelected.delete(o.id);
                                    });
                                    setSelectedOrders(newSelected);
                                }}
                                className="rounded-lg border-olive/20 data-[state=checked]:bg-lime data-[state=checked]:border-lime data-[state=checked]:text-olive-dark"
                            />
                        </TableHead>
                        <TableHead
                            className="font-black text-brand-primary uppercase text-[10px] tracking-[0.3em] py-8 cursor-pointer hover:text-white transition-colors"
                            onClick={() => onSort('id')}
                        >
                            <div className="flex items-center gap-2">
                                ID {sortConfig.key === 'id' && <ArrowUpDown className="w-3 h-3 text-white" />}
                            </div>
                        </TableHead>
                        <TableHead
                            className="font-black text-brand-primary uppercase text-[10px] tracking-[0.3em] py-8 cursor-pointer hover:text-white transition-colors text-center"
                            onClick={() => onSort('date')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                DATUM {sortConfig.key === 'date' && <ArrowUpDown className="w-3 h-3 text-white" />}
                            </div>
                        </TableHead>
                        <TableHead className="font-black text-brand-primary uppercase text-[10px] tracking-[0.3em] py-8">ZÁKAZNÍK</TableHead>
                        <TableHead className="font-black text-brand-primary uppercase text-[10px] tracking-[0.3em] py-8 text-right w-[15%]">POLOŽKY</TableHead>
                        <TableHead className="font-black text-brand-primary uppercase text-[10px] tracking-[0.3em] py-8 text-right">ČÁSTKA</TableHead>
                        <TableHead className="font-black text-brand-primary uppercase text-[10px] tracking-[0.3em] py-8 text-center">STATUS</TableHead>
                        <TableHead className="font-black text-brand-primary uppercase text-[10px] tracking-[0.3em] py-8 text-right pr-8">AKCE</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-20 text-olive/40 font-medium italic">
                                Žádné objednávky v této kategorii.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((order) => (
                            <TableRow key={order.id} className={`transition-all duration-300 hover:bg-white border-b border-olive/5 group ${selectedOrders.has(order.id) ? "bg-lime/5" : ""}`}>
                                <TableCell className="pl-8">
                                    <Checkbox
                                        checked={selectedOrders.has(order.id)}
                                        onCheckedChange={() => toggleOrderSelection(order.id)}
                                        className="rounded-lg border-olive/20 data-[state=checked]:bg-lime data-[state=checked]:border-lime data-[state=checked]:text-olive-dark"
                                    />
                                </TableCell>
                                <TableCell className="py-6">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono font-black text-[11px] text-white bg-olive-dark px-3 py-1.5 rounded-xl">#{order.id.slice(0, 8)}</span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-all text-olive/20 hover:text-white hover:bg-transparent" 
                                            onClick={() => {
                                                navigator.clipboard.writeText(order.id);
                                                toast({ title: "ID zkopírováno", duration: 1000 });
                                            }}
                                        >
                                            <Layers className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="text-[10px] font-black text-brand-muted uppercase tracking-[0.2em] bg-olive/5 px-3 py-1.5 rounded-xl">
                                        {new Date(order.date).toLocaleDateString('cs-CZ')}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-black text-olive-dark text-sm uppercase tracking-tight group-hover:text-white transition-colors">{order.customer.name}</span>
                                        <span className="text-[10px] text-brand-muted font-bold tracking-wider truncate max-w-[180px]">{order.customer.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col gap-1 items-end">
                                        {order.items.slice(0, 1).map((item, idx) => (
                                            <div key={idx} className="text-[9px] font-black uppercase text-brand-muted bg-white border border-olive/5 px-3 py-1 rounded-xl shadow-sm">
                                                {item.quantity}x {item.name.split(' ')[0]}
                                            </div>
                                        ))}
                                        {order.items.length > 1 && <span className="text-[8px] text-white font-black uppercase tracking-[0.2em] mt-1">+ {order.items.length - 1} DALŠÍ</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="font-display font-black text-lg text-olive-dark">{(order.total || 0).toLocaleString('cs-CZ')} <span className="text-[10px] text-olive/20 tracking-normal">CZK</span></span>
                                </TableCell>
                                <TableCell className="text-right pr-8">
                                    <div className="flex justify-end gap-2">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="outline" className="h-10 w-10 p-0 rounded-xl border-olive/10 hover:bg-olive-dark hover:text-white transition-all shadow-sm">
                                                    <Eye className="w-5 h-5" />
                                                </Button>
                                            </DialogTrigger>
                                            <OrderDetailDialog order={order} />
                                        </Dialog>

                                        {order.status === 'pending' && (
                                            <Button
                                                size="sm"
                                                onClick={() => onStatusChange(order.id, 'paid')}
                                                className="h-10 w-10 p-0 bg-lime text-olive-dark hover:bg-lime/80 rounded-xl shadow-lg shadow-lime/20"
                                                title="Označit jako zaplacené"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </Button>
                                        )}
                                        {order.status === 'paid' && (
                                            <Button
                                                size="sm"
                                                onClick={() => onStatusChange(order.id, 'processing')}
                                                className="h-10 w-10 p-0 bg-[#3d5a2f] text-white hover:bg-[#2d4422] rounded-xl shadow-lg shadow-[#3d5a2f]/20"
                                                title="Označit jako rozpracované"
                                            >
                                                <Clock className="w-5 h-5" />
                                            </Button>
                                        )}
                                        {(order.status === 'paid' || order.status === 'processing') && (
                                            <Button
                                                size="sm"
                                                onClick={() => onStatusChange(order.id, 'shipped')}
                                                className="h-10 w-10 p-0 bg-olive-dark text-white hover:bg-black rounded-xl shadow-lg shadow-olive-dark/20"
                                                title="Označit jako vyřízené/odeslané"
                                            >
                                                <Truck className="w-5 h-5" />
                                            </Button>
                                        )}

                                        {order.status !== 'shipped' && order.status !== 'cancelled' && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                                        title="Stornovat objednávku"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-3 text-red-600 font-black uppercase text-lg tracking-tight">
                                                            <AlertTriangle className="w-6 h-6" />
                                                            Stornovat objednávku
                                                        </DialogTitle>
                                                        <div className="pt-6 space-y-4">
                                                            <div className="text-sm font-black text-olive-dark uppercase tracking-tight">Opravdu chcete stornovat tuto objednávku?</div>
                                                            <div className="p-5 bg-olive-dark/5 rounded-[1.5rem] border border-olive/5">
                                                                <div className="font-mono text-xs font-black text-white bg-olive-dark px-3 py-1.5 rounded-xl w-fit mb-2">#{order.id.slice(0, 8)}</div>
                                                                <div className="text-xs font-black text-olive-dark uppercase tracking-tight">{order.customer.name}</div>
                                                            </div>
                                                            <p className="text-xs text-olive/40 font-bold leading-relaxed px-1">
                                                                Tato akce je nevratná. Zboží bude vráceno do skladových zásob a objednávka bude označena jako stornovaná.
                                                            </p>
                                                        </div>
                                                    </DialogHeader>
                                                    <DialogFooter className="gap-3 mt-8">
                                                        <DialogClose asChild>
                                                            <Button variant="ghost" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest text-olive/40 hover:text-olive-dark transition-all">Zpět</Button>
                                                        </DialogClose>
                                                        <DialogClose asChild>
                                                            <Button variant="destructive" className="rounded-xl bg-red-600 hover:bg-red-700 px-8 font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-red-600/20" onClick={() => onStatusChange(order.id, 'cancelled')}>
                                                                Potvrdit storno
                                                            </Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}

                                        {order.packeta_barcode && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-10 w-10 p-0 text-olive-dark border-olive/10 hover:bg-olive-dark hover:text-white rounded-xl transition-all"
                                                title="Tisk štítku Zásilkovny"
                                                onClick={() => window.open(`/api/get-packeta-label?barcode=${order.packeta_barcode}`, '_blank')}
                                            >
                                                <Printer className="w-5 h-5" />
                                            </Button>
                                        )}
                                        <InvoiceModal order={order}>
                                            <Button size="sm" variant="outline" className="h-10 w-10 p-0 text-olive-dark/40 border-olive/10 hover:text-olive-dark hover:bg-white rounded-xl transition-all" title="Faktura">
                                                <FileText className="w-5 h-5" />
                                            </Button>
                                        </InvoiceModal>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden">
            {data.length === 0 ? (
                <p className="text-center py-8 text-foreground/70">Žádné objednávky.</p>
            ) : (
                data.map((order) => (
                    <MobileOrderCard key={order.id} order={order} onStatusChange={onStatusChange} />
                ))
            )}
        </div>
    </>
    );
};

const Orders = () => {
    const { orders, updateOrderStatus } = useInventory();
    const { toast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
    const [printIds, setPrintIds] = useState<string[]>([]);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        typeof window !== 'undefined' ? Notification.permission : 'default'
    );

    const [sortConfig, setSortConfig] = useState<{ key: 'id' | 'date'; direction: 'asc' | 'desc' }>({
        key: 'date',
        direction: 'desc'
    });

    const requestNotificationPermission = async () => {
        if (typeof window === 'undefined') return;
        
        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === 'granted') {
                toast({
                    title: "Oznámení povolena! 🔔",
                    description: "Nyní budete upozorněni na každou novou zprávu od zákazníků přímo v prohlížeči.",
                });
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    };

    const handleSort = (key: 'id' | 'date') => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
    };

    const getSortedOrders = (ordersList: Order[]) => {
        return [...ordersList].sort((a, b) => {
            if (sortConfig.key === 'id') {
                return sortConfig.direction === 'asc'
                    ? a.id.localeCompare(b.id)
                    : b.id.localeCompare(a.id);
            } else {
                return sortConfig.direction === 'asc'
                    ? new Date(a.date).getTime() - new Date(b.date).getTime()
                    : new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });
    };

    const toggleOrderSelection = (id: string) => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedOrders(newSelected);
    };

    const handleBulkPrint = () => {
        // Find all identifying IDs. Barcodes (Z...) are most reliable.
        const ids = orders
            .filter(o => selectedOrders.has(o.id) && (o.packeta_barcode || o.packeta_packet_id))
            .map(o => o.packeta_barcode || o.packeta_packet_id) as string[];

        if (ids.length === 0) {
            toast({
                title: "Nelze tisknout hromadně",
                description: "Vybrané objednávky nemají číselné ID ani čárový kód zásilky. Vytiskněte je prosím po jednom z detailu objednávky.",
                variant: "destructive"
            });
            return;
        }

        setPrintIds(ids);
        setIsPrintDialogOpen(true);
    };

    const executeA4Print = () => {
        // Packeta's bulk PDF format for 4 labels on A4 page
        window.open(`/api/get-bulk-packeta-labels?ids=${printIds.join(',')}&format=A6 on A4`, '_blank');

        // Automatically move to processing
        handleBulkStatusChange('processing');

        setIsPrintDialogOpen(false);
        toast({
            title: "Tisk spuštěn",
            description: "Štítky se generují v novém okně. Objednávky byly přesunuty do 'Rozpracovaných'.",
        });
    };

    const executeSequentialPrint = () => {
        // format='105x148mm' is the standard A6 size and ensures each label is on its own page
        window.open(`/api/get-bulk-packeta-labels?ids=${printIds.join(',')}&format=105x148mm`, '_blank');

        // Automatically move to processing
        handleBulkStatusChange('processing');

        setIsPrintDialogOpen(false);
        toast({
            title: "Tisk spuštěn",
            description: "Štítky se generují v novém okně. Objednávky byly přesunuty do 'Rozpracovaných'.",
        });
    };

    const handleSyncPacketa = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/sync-packeta-status');
            const data = await res.json();

            if (res.ok) {
                const updatedCount = data.processed?.filter((r: any) => r.status === 'updated_and_notified').length || 0;
                toast({
                    title: "Synchronizace dokončena",
                    description: `Všechny zásilky byly zkontrolovány. Aktualizováno objednávek: ${updatedCount}.`,
                });
            } else {
                throw new Error(data.error || 'Nastala chyba při synchronizaci.');
            }
        } catch (e: any) {
            toast({
                title: "Chyba synchronizace",
                description: e.message,
                variant: "destructive"
            });
        } finally {
            setIsSyncing(false);
        }
    };

    const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
        updateOrderStatus(orderId, newStatus);
        toast({
            title: "Stav objednávky změněn",
            description: `Objednávka ${orderId.slice(0, 8)} byla označena jako ${newStatus === 'shipped' ? 'Odeslaná' :
                newStatus === 'paid' ? 'Zaplacená' :
                    newStatus === 'cancelled' ? 'Stornovaná' :
                        'Rozpracovaná'
                }.`,
        });
    };

    const handleBulkStatusChange = (newStatus: Order['status']) => {
        const idsArray = Array.from(selectedOrders);
        idsArray.forEach(id => updateOrderStatus(id, newStatus));

        toast({
            title: "Hromadná změna stavu",
            description: `${idsArray.length} objednávek bylo označeno jako ${newStatus === 'shipped' ? 'Odeslané' :
                newStatus === 'processing' ? 'Rozpracované' :
                    newStatus === 'paid' ? 'Zaplacené' : 'Stornované'
                }.`,
        });
        setSelectedOrders(new Set());
    };

    const [isBulkCancelDialogOpen, setIsBulkCancelDialogOpen] = useState(false);

    const handleBulkCancel = () => {
        handleBulkStatusChange('cancelled');
        setIsBulkCancelDialogOpen(false);
    };

    const filteredOrders = {
        pending: getSortedOrders(orders.filter(o => o.status === 'pending' || o.status === 'paid')),
        processing: getSortedOrders(orders.filter(o => o.status === 'processing')),
        shipped: getSortedOrders(orders.filter(o => o.status === 'shipped')),
        cancelled: getSortedOrders(orders.filter(o => o.status === 'cancelled'))
    };

    const pendingCount = filteredOrders.pending.length + filteredOrders.processing.length;

    return (
        <div className="space-y-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Správa objednávek</h2>
               <div className="flex flex-wrap items-center gap-2">
                    {notificationPermission !== 'granted' && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-10 px-4 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold animate-pulse"
                            onClick={requestNotificationPermission}
                            aria-label="Zapnout oznámení v prohlížeči"
                        >
                            <Bell className="w-4 h-4" />
                            <span>Povolit oznámení</span>
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 h-10 px-4 border-olive/20 shadow-sm text-olive-dark hover:text-olive-dark font-semibold" aria-label="Změnit řazení objednávek">
                                <ArrowUpDown className="w-4 h-4" />
                                <span className="hidden sm:inline">Řazení</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Seřadit podle</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setSortConfig({ key: 'date', direction: 'desc' }) }}>
                                Nejnovější prve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSortConfig({ key: 'date', direction: 'asc' }) }}>
                                Nejstarší prve
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setSortConfig({ key: 'id', direction: 'asc' }) }}>
                                Čísla obj. (0-9)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSortConfig({ key: 'id', direction: 'desc' }) }}>
                                Čísla obj. (9-0)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 h-10 px-4 border-olive/20 shadow-sm text-olive-dark hover:text-olive-dark font-semibold"
                        onClick={handleSyncPacketa}
                        disabled={isSyncing}
                        aria-label={isSyncing ? "Synchronizuji stav zásilek" : "Synchronizovat stav se Zásilkovnou"}
                    >
                        <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{isSyncing ? 'Synchronizuji...' : 'Synchronizovat'}</span>
                        <span className="sm:hidden">{isSyncing ? '...' : 'Sync'}</span>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <div className="overflow-x-auto pb-4 -mx-4 px-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0 mb-8">
                    <TabsList className="flex w-fit md:w-full md:grid md:grid-cols-4 min-w-max md:min-w-0 bg-olive-dark/5 p-2 rounded-[2rem] h-auto border border-olive/5">
                        <TabsTrigger value="pending" className="px-8 py-3.5 rounded-[1.5rem] data-[state=active]:bg-lime data-[state=active]:text-olive-dark data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20 font-black uppercase text-[10px] tracking-widest transition-all">Nové / Zaplacené ({filteredOrders.pending.length})</TabsTrigger>
                        <TabsTrigger value="processing" className="px-8 py-3.5 rounded-[1.5rem] data-[state=active]:bg-lime data-[state=active]:text-olive-dark data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20 font-black uppercase text-[10px] tracking-widest transition-all">Rozpracované ({filteredOrders.processing.length})</TabsTrigger>
                        <TabsTrigger value="shipped" className="px-8 py-3.5 rounded-[1.5rem] data-[state=active]:bg-lime data-[state=active]:text-olive-dark data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20 font-black uppercase text-[10px] tracking-widest transition-all">Vyřízené ({filteredOrders.shipped.length})</TabsTrigger>
                        <TabsTrigger value="cancelled" className="px-8 py-3.5 rounded-[1.5rem] data-[state=active]:bg-lime data-[state=active]:text-olive-dark data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20 font-black uppercase text-[10px] tracking-widest transition-all">Stornované ({filteredOrders.cancelled.length})</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="pending" className="mt-0 focus-visible:outline-none outline-none ring-0 animate-in fade-in slide-in-from-left-4 duration-500">
                    <OrderTable
                        data={filteredOrders.pending}
                        selectedOrders={selectedOrders}
                        toggleOrderSelection={toggleOrderSelection}
                        onStatusChange={handleStatusChange}
                        setSelectedOrders={setSelectedOrders}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                    />
                </TabsContent>

                <TabsContent value="processing" className="mt-0 focus-visible:outline-none outline-none ring-0 animate-in fade-in slide-in-from-left-4 duration-500">
                    <OrderTable
                        data={filteredOrders.processing}
                        selectedOrders={selectedOrders}
                        toggleOrderSelection={toggleOrderSelection}
                        onStatusChange={handleStatusChange}
                        setSelectedOrders={setSelectedOrders}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                    />
                </TabsContent>

                <TabsContent value="shipped" className="mt-0 focus-visible:outline-none outline-none ring-0 animate-in fade-in slide-in-from-left-4 duration-500">
                    <OrderTable
                        data={filteredOrders.shipped}
                        selectedOrders={selectedOrders}
                        toggleOrderSelection={toggleOrderSelection}
                        onStatusChange={handleStatusChange}
                        setSelectedOrders={setSelectedOrders}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                    />
                </TabsContent>

                <TabsContent value="cancelled" className="mt-0 focus-visible:outline-none outline-none ring-0 animate-in fade-in slide-in-from-left-4 duration-500">
                    <OrderTable
                        data={filteredOrders.cancelled}
                        selectedOrders={selectedOrders}
                        toggleOrderSelection={toggleOrderSelection}
                        onStatusChange={handleStatusChange}
                        setSelectedOrders={setSelectedOrders}
                        onSort={handleSort}
                        sortConfig={sortConfig}
                    />
                </TabsContent>
            </Tabs>

            {selectedOrders.size > 0 && (
                <div className="fixed bottom-4 sm:bottom-10 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 glass-dark rounded-[2rem] sm:rounded-[3rem] px-6 sm:px-12 py-4 sm:py-6 flex flex-col md:flex-row items-center gap-6 sm:gap-12 animate-in fade-in slide-in-from-bottom-10 z-50 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] border-white/10">
                    <div className="flex items-center gap-6 pr-0 md:pr-12 border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex flex-col">
                            <div className="text-[9px] sm:text-[10px] text-white font-black uppercase tracking-[0.2em] mb-1">VYBRÁNO</div>
                            <div className="text-2xl sm:text-3xl font-black text-white leading-none font-display">{selectedOrders.size} <span className="text-[10px] sm:text-xs font-bold text-white/30 uppercase tracking-widest ml-1">OBJ.</span></div>
                        </div>
                        <Button
                            variant="ghost"
                            className="text-white/40 hover:text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest h-10 px-4 rounded-xl hover:bg-white/5 transition-all"
                            onClick={() => setSelectedOrders(new Set())}
                        >
                            Zrušit
                        </Button>
                    </div>

                        <div className="flex gap-3 p-2 bg-white/5 rounded-[2.5rem] border border-white/5">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-12 px-8 text-white hover:bg-lime hover:text-olive-dark font-black uppercase text-[10px] tracking-widest gap-3 rounded-[1.5rem] transition-all duration-300"
                                onClick={() => handleBulkStatusChange('processing')}
                            >
                                <Clock className="w-4 h-4" />
                                <span className="hidden sm:inline">ROZPRACOVAT</span>
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-12 px-8 text-white hover:bg-lime hover:text-olive-dark font-black uppercase text-[10px] tracking-widest gap-3 rounded-[1.5rem] transition-all duration-300"
                                onClick={() => handleBulkStatusChange('shipped')}
                            >
                                <Truck className="w-4 h-4" />
                                <span className="hidden sm:inline">ODESLAT</span>
                            </Button>

                            <Dialog open={isBulkCancelDialogOpen} onOpenChange={setIsBulkCancelDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-12 px-8 text-red-400 hover:bg-red-500 hover:text-white font-black uppercase text-[10px] tracking-widest gap-3 rounded-[1.5rem] transition-all duration-300"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span className="hidden sm:inline">STORNO</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-3 text-red-600 font-black uppercase text-lg tracking-tight">
                                            <AlertTriangle className="w-6 h-6" />
                                            Hromadné storno
                                        </DialogTitle>
                                        <div className="pt-6">
                                            <div className="text-sm font-black text-olive-dark uppercase tracking-tight">Stornovat vybrané objednávky</div>
                                            <div className="text-xs text-olive/40 font-bold mt-2 leading-relaxed">
                                                Opravdu chcete stornovat {selectedOrders.size} vybraných objednávek? Tuto akci nelze vrátit.
                                            </div>
                                        </div>
                                    </DialogHeader>
                                    <DialogFooter className="gap-3 mt-8">
                                        <Button variant="ghost" onClick={() => setIsBulkCancelDialogOpen(false)} className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest text-olive/40 hover:text-olive-dark">Zpět</Button>
                                        <Button variant="destructive" onClick={handleBulkCancel} className="rounded-xl bg-red-600 hover:bg-red-700 px-8 font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-red-600/20">
                                            Potvrdit hromadné storno
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Button
                            size="sm"
                            className="bg-lime text-olive-dark hover:bg-lime/80 gap-3 px-10 h-12 rounded-[1.5rem] shadow-xl shadow-lime/20 font-black uppercase text-[10px] tracking-widest transition-all"
                            onClick={handleBulkPrint}
                        >
                            <Printer className="w-4 h-4" />
                            <span>Tisk štítků</span>
                        </Button>
                    </div>
                </div>
            )}

            <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Možnosti hromadného tisku</DialogTitle>
                        <DialogDescription>
                            Vyberte si formát, jakým chcete vytisknout {printIds.length} štítků.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4 mt-4">
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 items-center justify-center border-2 hover:border-emerald-500 hover:bg-emerald-50"
                            onClick={executeA4Print}
                        >
                            <LayoutGrid className="w-8 h-8 text-emerald-600" />
                            <div className="flex flex-col">
                                <span className="font-bold text-base">Kombinovat na A4</span>
                                <span className="text-xs text-muted-foreground italic">Šetří papír, skládá štítky vedle sebe</span>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 items-center justify-center border-2 hover:border-olive/40 hover:bg-background"
                            onClick={executeSequentialPrint}
                        >
                            <Layers className="w-8 h-8 text-olive-dark/60" />
                            <div className="flex flex-col">
                                <span className="font-bold text-base">Tisk postupně (po jednom)</span>
                                <span className="text-xs text-muted-foreground italic">Otevře každý štítek v novém okně</span>
                            </div>
                        </Button>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button variant="ghost" onClick={() => setIsPrintDialogOpen(false)}>Zrušit</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Orders;
