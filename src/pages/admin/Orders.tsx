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
        <div className="border border-white/40 rounded-[2.5rem] p-6 space-y-4 mb-6 bg-white/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-lg text-slate-900">#{order.id}</span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6 text-slate-400 hover:text-primary transition-colors" 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(order.id);
                                toast({ title: "ID zkopírováno", duration: 1000 });
                            }}
                            title="Kopírovat ID"
                        >
                            <Layers className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    <p className="text-xs font-medium text-slate-500">{new Date(order.date).toLocaleString('cs-CZ')}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                    <Badge variant={order.status === 'pending' ? 'outline' : order.status === 'cancelled' ? 'destructive' : 'secondary'} className={`text-[10px] uppercase tracking-tighter ${order.status !== 'pending' && order.status !== 'cancelled' ? 'bg-emerald-50 text-emerald-700 border-emerald-500/20' : ''}`}>
                        {order.status === 'pending' ? 'Platba: Čeká' :
                            order.status === 'cancelled' ? 'Platba: Storno' :
                                'Platba: Zaplaceno'}
                    </Badge>
                    <Badge
                        variant={order.status === 'shipped' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'outline'}
                        className={`text-[10px] uppercase tracking-tighter ${
                            order.status === 'shipped' ? 'bg-slate-900 text-white' :
                                order.status === 'processing' ? 'border-primary/30 text-lime-700 bg-lime/5' :
                                    order.status === 'cancelled' ? 'bg-red-50 text-red-900 border-red-200' :
                                        'border-amber-300 text-amber-900 bg-amber-50/50'
                        }`}
                    >
                        {order.status === 'shipped' ? 'Stav: Vyřízena' :
                            order.status === 'processing' ? 'Stav: Rozpracováno' :
                                order.status === 'cancelled' ? 'Stav: Stornováno' :
                                    'Stav: Čeká k vyřízení'}
                    </Badge>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/40 border border-white/60 space-y-2">
                <p className="text-sm font-bold text-slate-800">{order.customer.name}</p>
                <p className="text-xs text-slate-500 font-medium truncate">{order.customer.email}</p>
            </div>

            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Položky:</p>
                <div className="space-y-1">
                    {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="text-xs flex justify-between items-center bg-slate-50/50 p-2 rounded-xl border border-slate-100">
                            <span className="font-medium text-slate-700">{item.quantity}x {item.name}</span>
                            <span className="font-bold text-slate-400">{item.price} Kč</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Celková cena</span>
                    <span className="font-display font-black text-xl text-slate-900">{order.total} Kč</span>
                </div>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="rounded-xl h-10 px-4 border-slate-200 hover:bg-slate-50">Detail</Button>
                        </DialogTrigger>
                        <OrderDetailDialog order={order} />
                    </Dialog>
                    {order.status === 'pending' && (
                        <Button size="sm" onClick={() => onStatusChange(order.id, 'paid')} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10" aria-label="Označit jako zaplacené">
                            <CheckCircle className="w-4 h-4" />
                        </Button>
                    )}
                    {(order.status === 'paid' || order.status === 'processing') && (
                        <Button size="sm" onClick={() => onStatusChange(order.id, 'shipped')} className="bg-slate-900 hover:bg-black text-white rounded-xl h-10 px-4" aria-label="Označit jako vyřízené">
                            <Truck className="w-4 h-4 mr-2" />
                            <span className="text-xs font-bold">Odeslat</span>
                        </Button>
                    )}
                    <InvoiceModal order={order}>
                        <Button size="sm" variant="ghost" className="h-10 w-10 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl" aria-label="Zobrazit fakturu">
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
        <div className="hidden md:block">
            <Table>
                <TableHeader className="bg-slate-50 border-b border-slate-200">
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12">
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
                                aria-label="Vybrat všechny objednávky v této kategorii"
                                className="rounded-md border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                        </TableHead>
                        <TableHead
                            className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-5 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => onSort('id')}
                        >
                            <div className="flex items-center gap-2">
                                Objednávka {sortConfig.key === 'id' && <ArrowUpDown className="w-3 h-3" />}
                            </div>
                        </TableHead>
                        <TableHead
                            className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-5 cursor-pointer hover:text-primary transition-colors text-center"
                            onClick={() => onSort('date')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                Datum {sortConfig.key === 'date' && <ArrowUpDown className="w-3 h-3" />}
                            </div>
                        </TableHead>
                        <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-5">Zákazník</TableHead>
                        <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-5 text-right w-[20%]">Obsah</TableHead>
                        <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-5 text-right">Celkem</TableHead>
                        <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-5 text-center">Stav</TableHead>
                        <TableHead className="font-black text-slate-900 uppercase text-[10px] tracking-widest py-5 text-right">Akce</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-20 text-slate-400 font-medium italic">
                                Žádné objednávky v této kategorii.
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((order) => (
                            <TableRow key={order.id} className={`transition-colors hover:bg-slate-50/80 border-b border-slate-100 ${selectedOrders.has(order.id) ? "bg-lime/5" : ""}`}>
                                <TableCell>
                                    <Checkbox
                                        checked={selectedOrders.has(order.id)}
                                        onCheckedChange={() => toggleOrderSelection(order.id)}
                                        aria-label={`Vybrat objednávku ${order.id}`}
                                        className="rounded-md border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                    />
                                </TableCell>
                                <TableCell className="py-4">
                                    <div className="flex items-center gap-2 group">
                                        <span className="font-mono font-black text-sm text-slate-950 tracking-tighter">#{order.id}</span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all text-slate-400 hover:text-primary hover:bg-transparent" 
                                            onClick={() => {
                                                navigator.clipboard.writeText(order.id);
                                                toast({ title: "ID zkopírováno", duration: 1000 });
                                            }}
                                            title="Kopírovat ID"
                                        >
                                            <Layers className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                        {new Date(order.date).toLocaleDateString('cs-CZ')}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-bold text-slate-900 text-sm leading-none mb-1">{order.customer.name}</span>
                                        <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">{order.customer.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col gap-0.5 items-end">
                                        {order.items.slice(0, 2).map((item, idx) => (
                                            <div key={idx} className="text-[10px] font-bold text-slate-600 bg-slate-50 border border-slate-100 px-2 rounded-md w-fit">
                                                {item.quantity}x {item.name.split(' ')[0]}...
                                            </div>
                                        ))}
                                        {order.items.length > 2 && <span className="text-[9px] text-slate-400 font-black uppercase mt-0.5">+ {order.items.length - 2} další</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="font-display font-black text-slate-900">{order.total} Kč</span>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col gap-1.5 items-center">
                                        <Badge variant={order.status === 'pending' ? 'outline' : order.status === 'cancelled' ? 'destructive' : 'secondary'} className={`text-[9px] uppercase tracking-tighter px-2 h-5 flex items-center ${order.status !== 'pending' && order.status !== 'cancelled' ? 'bg-emerald-50 text-emerald-700 border-emerald-500/20' : 'bg-transparent text-slate-500'}`}>
                                            {order.status === 'pending' ? 'Čeká' :
                                                order.status === 'cancelled' ? 'Storno' :
                                                    'Zaplaceno'}
                                        </Badge>
                                        <Badge
                                            variant={order.status === 'shipped' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'outline'}
                                            className={`text-[9px] uppercase tracking-tighter px-2 h-5 flex items-center ${
                                                order.status === 'shipped' ? 'bg-slate-900 text-white' :
                                                    order.status === 'processing' ? 'border-primary/40 text-primary-foreground bg-primary' :
                                                        order.status === 'cancelled' ? 'bg-red-50 text-red-900 border-red-200' :
                                                            'border-amber-300 text-amber-900 bg-amber-50/50'
                                            }`}
                                        >
                                            {order.status === 'shipped' ? 'Vyřízena' :
                                                order.status === 'processing' ? 'Příprava' :
                                                    order.status === 'cancelled' ? 'Zrušeno' :
                                                        'Nová'}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right tabular-nums">
                                    <div className="flex justify-end gap-1">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl" aria-label={`Detail objednávky ${order.id}`}>
                                                    <Eye className="w-4.5 h-4.5" />
                                                </Button>
                                            </DialogTrigger>
                                            <OrderDetailDialog order={order} />
                                        </Dialog>

                                        {order.status === 'pending' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onStatusChange(order.id, 'paid')}
                                                className="h-9 w-9 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                                                title="Označit jako zaplacené"
                                                aria-label="Označit jako zaplacené"
                                            >
                                                <CheckCircle className="w-4.5 h-4.5" />
                                            </Button>
                                        )}
                                        {order.status === 'paid' && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onStatusChange(order.id, 'processing')}
                                                className="h-9 w-9 p-0 text-primary hover:text-primary-foreground hover:bg-primary rounded-xl"
                                                title="Označit jako rozpracované"
                                                aria-label="Označit jako rozpracované"
                                            >
                                                <Clock className="w-4.5 h-4.5" />
                                            </Button>
                                        )}
                                        {(order.status === 'paid' || order.status === 'processing') && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => onStatusChange(order.id, 'shipped')}
                                                className="h-9 w-9 p-0 text-slate-900 hover:text-white hover:bg-slate-900 rounded-xl"
                                                title="Označit jako vyřízené/odeslané"
                                                aria-label="Označit jako vyřízené/odeslané"
                                            >
                                                <Truck className="w-4.5 h-4.5" />
                                            </Button>
                                        )}

                                        {order.status !== 'shipped' && order.status !== 'cancelled' && (
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl"
                                                        title="Stornovat objednávku"
                                                        aria-label="Stornovat objednávku"
                                                    >
                                                        <XCircle className="w-4.5 h-4.5" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="rounded-[2.5rem] border-red-100">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-2 text-red-600">
                                                            <AlertTriangle className="w-5 h-5" />
                                                            Stornovat objednávku
                                                        </DialogTitle>
                                                        <div className="pt-4 space-y-3">
                                                            <div className="text-sm font-bold text-slate-900">Opravdu chcete stornovat tuto objednávku?</div>
                                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                                <div className="font-mono text-xs font-black">ID: #{order.id}</div>
                                                                <div className="text-xs font-medium text-slate-500 mt-1">{order.customer.name}</div>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                                Tato akce je nevratná. Zboží bude vráceno do skladových zásob a objednávka bude označena jako stornovaná.
                                                            </p>
                                                        </div>
                                                    </DialogHeader>
                                                    <DialogFooter className="gap-2 sm:gap-0 mt-6">
                                                        <DialogClose asChild>
                                                            <Button variant="outline" className="rounded-xl border-slate-200">Zpět</Button>
                                                        </DialogClose>
                                                        <DialogClose asChild>
                                                            <Button variant="destructive" className="rounded-xl bg-red-600 hover:bg-red-700" onClick={() => onStatusChange(order.id, 'cancelled')}>
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
                                                variant="ghost"
                                                className="h-9 w-9 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                                                title="Tisk štítku Zásilkovny"
                                                aria-label="Tisk štítku Zásilkovny"
                                                onClick={() => window.open(`/api/get-packeta-label?barcode=${order.packeta_barcode}`, '_blank')}
                                            >
                                                <Printer className="w-4.5 h-4.5" />
                                            </Button>
                                        )}
                                        <InvoiceModal order={order}>
                                            <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl" aria-label={`Faktura pro objednávku ${order.id}`}>
                                                <FileText className="w-4.5 h-4.5" />
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
                    description: "Nyní budete upozorněni na každou novou objednávku přímo v prohlížeči.",
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
                <h2 className="text-3xl font-bold tracking-tight">Správa objednávek</h2>
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
                            <Button variant="outline" size="sm" className="gap-2 h-10 px-4 border-slate-300 shadow-sm text-slate-800 hover:text-slate-950 font-semibold" aria-label="Změnit řazení objednávek">
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
                        className="gap-2 h-10 px-4 border-slate-300 shadow-sm text-slate-800 hover:text-slate-950 font-semibold"
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
                <div className="overflow-x-auto pb-2 -mx-1 px-1 mb-2 scrollbar-hide">
                    <TabsList className="flex w-fit md:w-full md:grid md:grid-cols-4 min-w-max md:min-w-0 bg-slate-100 border border-slate-200">
                        <TabsTrigger value="pending" className="px-4 data-[state=active]:bg-white data-[state=active]:text-slate-950 font-bold">Nové / Zaplacené ({filteredOrders.pending.length})</TabsTrigger>
                        <TabsTrigger value="processing" className="px-4 data-[state=active]:bg-white data-[state=active]:text-slate-950 font-bold">Rozpracované ({filteredOrders.processing.length})</TabsTrigger>
                        <TabsTrigger value="shipped" className="px-4 data-[state=active]:bg-white data-[state=active]:text-slate-950 font-bold">Vyřízené ({filteredOrders.shipped.length})</TabsTrigger>
                        <TabsTrigger value="cancelled" className="px-4 data-[state=active]:bg-white data-[state=active]:text-slate-950 font-bold">Stornované ({filteredOrders.cancelled.length})</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="pending" className="mt-4">
                    <p className="text-slate-600 font-medium mb-4 md:hidden text-sm px-1">Tip: Posunutím karty zobrazíte více detailů.</p>
                    <Card>
                        <CardHeader className="hidden md:flex">
                            <CardTitle>Nové a zaplacené objednávky</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            <OrderTable
                                data={filteredOrders.pending}
                                selectedOrders={selectedOrders}
                                toggleOrderSelection={toggleOrderSelection}
                                onStatusChange={handleStatusChange}
                                setSelectedOrders={setSelectedOrders}
                                onSort={handleSort}
                                sortConfig={sortConfig}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="processing" className="mt-4">
                    <Card>
                        <CardHeader className="hidden md:flex">
                            <CardTitle>Rozpracované objednávky</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            <OrderTable
                                data={filteredOrders.processing}
                                selectedOrders={selectedOrders}
                                toggleOrderSelection={toggleOrderSelection}
                                onStatusChange={handleStatusChange}
                                setSelectedOrders={setSelectedOrders}
                                onSort={handleSort}
                                sortConfig={sortConfig}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="shipped" className="mt-4">
                    <Card>
                        <CardHeader className="hidden md:flex">
                            <CardTitle>Odeslané a dokončené objednávky</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            <OrderTable
                                data={filteredOrders.shipped}
                                selectedOrders={selectedOrders}
                                toggleOrderSelection={toggleOrderSelection}
                                onStatusChange={handleStatusChange}
                                setSelectedOrders={setSelectedOrders}
                                onSort={handleSort}
                                sortConfig={sortConfig}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cancelled" className="mt-4">
                    <Card>
                        <CardHeader className="hidden md:flex">
                            <CardTitle>Stornované objednávky</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            <OrderTable
                                data={filteredOrders.cancelled}
                                selectedOrders={selectedOrders}
                                toggleOrderSelection={toggleOrderSelection}
                                onStatusChange={handleStatusChange}
                                setSelectedOrders={setSelectedOrders}
                                onSort={handleSort}
                                sortConfig={sortConfig}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {selectedOrders.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border-2 border-slate-300 shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-8 animate-in fade-in slide-in-from-bottom-8 z-50 min-w-fit whitespace-nowrap">
                    <div className="flex flex-col pr-8 border-r-2 border-slate-200">
                        <div className="text-xs text-slate-700 uppercase font-black tracking-wider mb-0.5">Vybráno</div>
                        <div className="text-xl font-black text-emerald-700 line-height-none">{selectedOrders.size} <span className="text-sm font-bold text-slate-500">obj.</span></div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-slate-800 hover:text-slate-950 font-bold h-10 px-4 border-slate-300"
                            onClick={() => setSelectedOrders(new Set())}
                            aria-label="Zrušit výběr objednávek"
                        >
                            Zrušit
                        </Button>

                        <div className="flex gap-2 p-1 bg-slate-50 border rounded-2xl">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-10 text-blue-800 hover:text-blue-950 hover:bg-blue-100 font-bold gap-2"
                                onClick={() => handleBulkStatusChange('processing')}
                                title="Hromadně označit jako rozpracované"
                                aria-label="Hromadně označit jako rozpracované"
                            >
                                <Clock className="w-4 h-4" />
                                <span className="hidden sm:inline">Rozpracovat</span>
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-10 text-blue-800 hover:text-blue-950 hover:bg-blue-100 font-bold gap-2"
                                onClick={() => handleBulkStatusChange('shipped')}
                                title="Hromadně označit jako vyřízené/odeslané"
                                aria-label="Hromadně označit jako vyřízené/odeslané"
                            >
                                <Truck className="w-4 h-4" />
                                <span className="hidden sm:inline">Odeslat</span>
                            </Button>

                            <Dialog open={isBulkCancelDialogOpen} onOpenChange={setIsBulkCancelDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-10 text-red-700 hover:text-red-900 hover:bg-red-100 font-bold gap-2"
                                        title="Hromadně stornovat"
                                        aria-label="Hromadně stornovat vybrané objednávky"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span className="hidden sm:inline">Storno</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-red-500" />
                                            Hromadné storno
                                        </DialogTitle>
                                        <div className="pt-2">
                                            <div className="text-sm font-medium">Stornovat vybrané objednávky</div>
                                            <div className="text-xs text-muted-foreground mt-1">
                                                Opravdu chcete stornovat {selectedOrders.size} vybraných objednávek? Tuto akci nelze vrátit.
                                            </div>
                                        </div>
                                    </DialogHeader>
                                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                                        <Button variant="outline" onClick={() => setIsBulkCancelDialogOpen(false)}>Zpět</Button>
                                        <Button variant="destructive" onClick={handleBulkCancel}>
                                            Potvrdit hromadné storno
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Button
                            size="sm"
                            className="bg-emerald-700 hover:bg-emerald-800 gap-2 px-6 h-10 shadow-lg shadow-emerald-200 font-bold"
                            onClick={handleBulkPrint}
                            aria-label="Tisknout štítky pro vybrané objednávky"
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
                            className="h-24 flex flex-col gap-2 items-center justify-center border-2 hover:border-slate-400 hover:bg-slate-50"
                            onClick={executeSequentialPrint}
                        >
                            <Layers className="w-8 h-8 text-slate-600" />
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
