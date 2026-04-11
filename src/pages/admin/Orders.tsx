import { useState } from "react";
import { useInventory, Order } from "@/context/InventoryContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Truck, Clock, Eye, Printer, RefreshCcw, CheckSquare, Square, XCircle, AlertTriangle, LayoutGrid, Copy, ArrowUpDown, Bell, MousePointer2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { useContent } from "@/context/ContentContext";
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
import InvoiceModal from "@/components/admin/InvoiceModal";


const MobileOrderCard = ({ order, onStatusChange }: { order: any, onStatusChange: (id: string, status: Order['status']) => void }) => {
    const { content } = useContent();
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
                            className="h-8 w-8 text-olive/50 hover:text-black hover:bg-olive/10 transition-colors" 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(order.id);
                                toast({ title: content.admin.orders.copyId, duration: 1000 });
                            }}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/30">{new Date(order.date).toLocaleString(content.lang === 'en' ? 'en-US' : 'cs-CZ')}</p>
                </div>
                <div className="flex flex-col gap-3 items-end">
                    <div className="flex flex-col gap-1 items-end">
                        <Badge className={`text-[9px] font-black uppercase tracking-widest px-3 h-6 rounded-lg border-none shadow-sm ${
                            order.status === 'cancelled' ? 'bg-olive/10 text-olive/40' :
                            order.status === 'pending' ? 'bg-red-500/10 text-red-600' : 
                            'bg-lime text-olive-dark'
                        }`}>
                            {order.status === 'cancelled' ? content.admin.orders.status.storno :
                             order.status === 'pending' ? content.admin.orders.status.unpaid : content.admin.orders.status.paid}
                        </Badge>
                        <span className="text-[8px] font-black text-olive/40 uppercase tracking-widest mt-0.5 pr-1">
                            {order.delivery_info?.paymentMethod === 'transfer_manual' ? content.admin.orders.status.transfer :
                             order.delivery_info?.paymentMethod === 'stripe_express' ? content.admin.orders.status.express :
                             order.delivery_info?.paymentMethod || content.admin.orders.table.payment}
                        </span>
                    </div>
                    <Badge
                        className={`text-[9px] font-black uppercase tracking-widest px-3 h-6 rounded-lg border-none shadow-sm ${
                            order.status === 'shipped' ? 'bg-olive-dark text-white' :
                                order.status === 'processing' ? 'bg-[#3d5a2f] text-white' :
                                    order.status === 'cancelled' ? 'bg-olive/10 text-olive/40' :
                                        'bg-lime/20 text-olive-dark'
                        }`}
                    >
                        {order.status === 'shipped' ? content.admin.dashboard.statusShipped :
                            order.status === 'processing' ? content.admin.dashboard.statusProcessing :
                                order.status === 'cancelled' ? content.admin.dashboard.statusCancelled :
                                    content.admin.dashboard.statusReceived}
                    </Badge>
                </div>
            </div>

            <div className="p-5 rounded-2xl bg-olive-dark/5 border border-olive/5 space-y-3">
                <p className="text-sm font-black text-olive-dark uppercase tracking-tight">{order.customer.name}</p>
                <p className="text-[11px] text-olive/50 font-bold truncate">{order.customer.email}</p>
            </div>

            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-olive/40">{content.admin.orders.itemsLabel}:</p>
                <div className="space-y-1">
                    {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="text-xs flex justify-between items-center bg-background/50 p-2 rounded-xl border border-background">
                            <span className="font-medium text-olive">{item.quantity}{content.admin.dashboard.multiplier} {item.name}</span>
                            <span className="font-bold text-olive/40">{item.price} {content.bankInfo.currency}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-background">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-olive/40">{content.admin.orders.totalPriceLabel}</span>
                    <span className="font-display font-black text-xl text-olive-dark">{order.total} {content.bankInfo.currency}</span>
                </div>
                <div className="flex gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="rounded-xl h-12 px-6 border-olive/10 hover:bg-olive-dark hover:text-white font-black uppercase text-[10px] tracking-widest">{content.admin.orders.viewDetail}</Button>
                        </DialogTrigger>
                        <OrderDetailDialog order={order} />
                    </Dialog>
                    {order.status === 'pending' && (
                        <Button size="sm" onClick={() => onStatusChange(order.id, 'paid')} className="bg-lime text-olive-dark hover:bg-lime/80 rounded-xl h-12 px-4 shadow-lg shadow-lime/20" aria-label={content.admin.orders.markAsPaid}>
                            <CheckCircle className="w-5 h-5" />
                        </Button>
                    )}
                    {(order.status === 'paid' || order.status === 'processing') && (
                        <Button size="sm" onClick={() => onStatusChange(order.id, 'shipped')} className="bg-olive-dark text-white hover:bg-black rounded-xl h-12 px-6 font-black uppercase text-[10px] tracking-widest" aria-label={content.admin.orders.markAsShipped}>
                            <Truck className="w-4 h-4 mr-2" />
                            <span>{content.admin.dashboard.statusShipped}</span>
                        </Button>
                    )}
                    <InvoiceModal order={order}>
                        <Button size="sm" variant="ghost" className="h-10 w-10 p-0 text-olive/40 hover:text-olive-dark hover:bg-background rounded-xl" aria-label={content.admin.orders.viewInvoice}>
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
    const { content } = useContent();
    const { toast } = useToast();
    return (
    <>
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto rounded-[2.5rem] border border-olive/5 bg-white/50 backdrop-blur-sm shadow-sm">
            <Table>
                <TableHeader className="bg-white/40 border-b border-olive/5">
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="w-10 pl-4">
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
                            className="font-black text-brand-primary uppercase text-[9px] tracking-widest py-3 cursor-pointer hover:text-white transition-colors w-32"
                            onClick={() => onSort('id')}
                        >
                            <div className="flex items-center gap-2">
                                {content?.admin?.orders?.table?.id} {sortConfig.key === 'id' && <ArrowUpDown className="w-3 h-3 text-white" />}
                            </div>
                        </TableHead>
                        <TableHead
                            className="font-black text-brand-primary uppercase text-[9px] tracking-widest py-3 cursor-pointer hover:text-white transition-colors text-center w-28"
                            onClick={() => onSort('date')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {content?.admin?.orders?.table?.date} {sortConfig.key === 'date' && <ArrowUpDown className="w-3 h-3 text-white" />}
                            </div>
                        </TableHead>
                        <TableHead className="font-black text-brand-primary uppercase text-[9px] tracking-widest py-3 min-w-[140px]">{content?.admin?.orders?.table?.customer}</TableHead>
                        <TableHead className="font-black text-brand-primary uppercase text-[9px] tracking-widest py-3 text-right w-[12%]">{content?.admin?.orders?.table?.items}</TableHead>
                        <TableHead className="font-black text-brand-primary uppercase text-[9px] tracking-widest py-3 text-right w-24">{content?.admin?.orders?.table?.amount}</TableHead>
                        <TableHead className="font-black text-brand-primary uppercase text-[9px] tracking-widest py-3 text-center w-24">{content?.admin?.orders?.table?.payment}</TableHead>
                        <TableHead className="font-black text-brand-primary uppercase text-[9px] tracking-widest py-3 text-center w-24">{content?.admin?.orders?.table?.method}</TableHead>
                        <TableHead className="font-black text-brand-primary uppercase text-[9px] tracking-widest py-3 text-center w-28">{content?.admin?.orders?.table?.status}</TableHead>
                        <TableHead className="font-black text-brand-primary uppercase text-[9px] tracking-widest py-3 text-right pr-4">{content?.admin?.orders?.table?.actions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-20 text-olive/40 font-medium italic">
                                {content.admin.orders.empty}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((order) => (
                            <TableRow key={order.id} className={`transition-all duration-300 hover:bg-white border-b border-olive/5 group ${selectedOrders.has(order.id) ? "bg-lime/5" : ""}`}>
                                <TableCell className="pl-4">
                                    <Checkbox
                                        checked={selectedOrders.has(order.id)}
                                        onCheckedChange={() => toggleOrderSelection(order.id)}
                                        className="rounded-lg border-olive/20 data-[state=checked]:bg-lime data-[state=checked]:border-lime data-[state=checked]:text-olive-dark"
                                    />
                                </TableCell>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-black text-[9px] text-white bg-olive-dark px-2 py-1 rounded-lg">#{order.id.slice(0, 8)}</span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 opacity-40 group-hover:opacity-100 transition-all text-olive/80 hover:text-black hover:bg-olive/10" 
                                            onClick={() => {
                                                navigator.clipboard.writeText(order.id);
                                                toast({ title: content.admin.orders.copyId, duration: 1000 });
                                            }}
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center px-1">
                                    <span className="text-[9px] font-black text-brand-muted uppercase tracking-wider bg-olive/5 px-2 py-1 rounded-lg">
                                        {new Date(order.date).toLocaleDateString(content.lang === 'en' ? 'en-US' : 'cs-CZ')}
                                    </span>
                                </TableCell>
                                <TableCell className="px-2">
                                    <div className="flex flex-col min-w-0 max-w-[140px]">
                                        <span className="font-black text-olive-dark text-[11px] uppercase tracking-tight truncate">{order.customer.name}</span>
                                        <span className="text-[9px] text-brand-muted font-bold tracking-tight truncate">{order.customer.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right px-1">
                                    <div className="flex flex-col gap-0.5 items-end">
                                        {order.items.slice(0, 1).map((item, idx) => (
                                            <div key={idx} className="text-[8px] font-black uppercase text-brand-muted bg-white border border-olive/5 px-2 py-0.5 rounded-lg shadow-sm">
                                                {item.quantity}x {item.name.split(' ')[0]}
                                            </div>
                                        ))}
                                        {order.items.length > 1 && <span className="text-[7px] text-olive/30 font-black uppercase tracking-widest">+ {order.items.length - 1} {content.admin.orders.more}</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right px-2">
                                    <span className="font-display font-black text-sm text-olive-dark">{(order.total || 0).toLocaleString(content.lang === 'en' ? 'en-US' : 'cs-CZ')} <span className="text-[8px] text-olive/20 tracking-normal">{content.bankInfo.currency}</span></span>
                                </TableCell>
                                <TableCell className="text-center px-1">
                                    <Badge 
                                        className={`text-[8px] font-black uppercase tracking-widest px-2 h-5 rounded-md border-none shadow-sm ${
                                            order.status === 'cancelled' ? 'bg-olive/10 text-olive/40' :
                                            order.status === 'pending' ? 'bg-red-500/10 text-red-600' : 
                                            'bg-lime text-olive-dark'
                                        }`}
                                    >
                                        {order.status === 'cancelled' ? content.admin.orders.status.storno :
                                         order.status === 'pending' ? content.admin.orders.status.unpaid : content.admin.orders.status.paid}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center px-1">
                                    <span className="text-[9px] font-black text-olive/40 uppercase tracking-widest">
                                        {order.delivery_info?.paymentMethod === 'transfer_manual' ? content.admin.orders.status.transfer.slice(0, 4) :
                                         order.delivery_info?.paymentMethod === 'stripe_express' ? 'STRP' :
                                         order.delivery_info?.paymentMethod?.toUpperCase().slice(0, 4) || 'CARD'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-center px-1">
                                    <Badge
                                        className={`text-[8px] font-black uppercase tracking-widest px-2 h-5 rounded-md border-none shadow-sm ${
                                            order.status === 'shipped' ? 'bg-olive-dark text-white' :
                                                order.status === 'processing' ? 'bg-[#3d5a2f] text-white' :
                                                    order.status === 'cancelled' ? 'bg-olive/10 text-olive/40' :
                                                        'bg-lime/20 text-olive-dark'
                                        }`}
                                    >
                                        {order.status === 'shipped' ? 'ODOSL.' :
                                            order.status === 'processing' ? 'SPRAC.' :
                                                order.status === 'cancelled' ? 'STORNO' :
                                                    'PRIJ.'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right pr-4 whitespace-nowrap min-w-max">
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
                                                title={content.admin.orders.markAsPaid}
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                            </Button>
                                        )}
                                        {order.status === 'paid' && (
                                            <Button
                                                size="sm"
                                                onClick={() => onStatusChange(order.id, 'processing')}
                                                className="h-10 w-10 p-0 bg-[#3d5a2f] text-white hover:bg-[#2d4422] rounded-xl shadow-lg shadow-[#3d5a2f]/20"
                                                title={content.admin.orders.markAsProcessing}
                                            >
                                                <Clock className="w-5 h-5" />
                                            </Button>
                                        )}
                                        {(order.status === 'paid' || order.status === 'processing') && (
                                            <Button
                                                size="sm"
                                                onClick={() => onStatusChange(order.id, 'shipped')}
                                                className="h-10 w-10 p-0 bg-olive-dark text-white hover:bg-black rounded-xl shadow-lg shadow-olive-dark/20"
                                                title={content.admin.orders.markAsShipped}
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
                                                        title={content.admin.orders.cancelDialog.title}
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-3 text-red-600 font-black uppercase text-lg tracking-tight">
                                                            <AlertTriangle className="w-6 h-6" />
                                                            {content.admin.orders.cancelDialog.title}
                                                        </DialogTitle>
                                                        <div className="pt-6 space-y-4">
                                                            <div className="text-sm font-black text-olive-dark uppercase tracking-tight">{content.admin.orders.cancelDialog.question}</div>
                                                            <div className="p-5 bg-olive-dark/5 rounded-[1.5rem] border border-olive/5">
                                                                <div className="font-mono text-xs font-black text-white bg-olive-dark px-3 py-1.5 rounded-xl w-fit mb-2">#{order.id.slice(0, 8)}</div>
                                                                <div className="text-xs font-black text-olive-dark uppercase tracking-tight">{order.customer.name}</div>
                                                            </div>
                                                            <p className="text-xs text-olive/40 font-bold leading-relaxed px-1">
                                                                {content.admin.orders.cancelDialog.warning}
                                                            </p>
                                                        </div>
                                                    </DialogHeader>
                                                    <DialogFooter className="gap-3 mt-8">
                                                        <DialogClose asChild>
                                                            <Button variant="ghost" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest text-olive/40 hover:text-olive-dark transition-all">{content.admin.orders.cancelDialog.back}</Button>
                                                        </DialogClose>
                                                        <DialogClose asChild>
                                                            <Button variant="destructive" className="rounded-xl bg-red-600 hover:bg-red-700 px-8 font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-red-600/20" onClick={() => onStatusChange(order.id, 'cancelled')}>
                                                                {content.admin.orders.cancelDialog.confirmLabel}
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
                                                title={content.admin.orders.packetaLabel}
                                                onClick={() => window.open(`/api/get-packeta-label?barcode=${order.packeta_barcode}`, '_blank')}
                                            >
                                                <Printer className="w-5 h-5" />
                                            </Button>
                                        )}
                                        <InvoiceModal order={order}>
                                            <Button size="sm" variant="outline" className="h-10 w-10 p-0 text-olive-dark/40 border-olive/10 hover:text-olive-dark hover:bg-white rounded-xl transition-all" title={content.admin.orders.viewInvoice}>
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
                <p className="text-center py-8 text-foreground/70">{content.admin.orders.empty}</p>
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
    const { content } = useContent();
    const { toast } = useToast();
    const { orders, updateOrderStatus } = useInventory();
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [printIds, setPrintIds] = useState<string[]>([]);
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
        typeof window !== 'undefined' ? Notification.permission : 'default'
    );

    const [sortConfig, setSortConfig] = useState<{ key: 'id' | 'date'; direction: 'asc' | 'desc' }>({
        key: 'date',
        direction: 'desc'
    });

    // Auto-sync payments on mount
    useEffect(() => {
        const syncPayments = async () => {
            try {
                await fetch('/api/sync-payments');
                // We don't necessarily need to toast here to avoid being too noisy on every mount,
                // but the DB will be updated and Realtime will refresh the list.
                console.log('[Auto-Sync] Payments sync triggered.');
            } catch (e) {
                console.error('[Auto-Sync] Failed:', e);
            }
        };
        syncPayments();
    }, []);

    const requestNotificationPermission = async () => {
        if (typeof window === 'undefined') return;
        
        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            if (permission === 'granted') {
                toast({
                    title: content.admin.orders.notifEnabled,
                    description: content.admin.orders.notifEnabledDesc,
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
                title: content.admin.orders.bulkPrintErr,
                description: content.admin.orders.bulkPrintErrDesc,
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
            title: content.admin.orders.printStarted,
            description: content.admin.orders.printStartedDesc,
        });
    };

    const executeSequentialPrint = () => {
        // format='105x148mm' is the standard A6 size and ensures each label is on its own page
        window.open(`/api/get-bulk-packeta-labels?ids=${printIds.join(',')}&format=105x148mm`, '_blank');

        // Automatically move to processing
        handleBulkStatusChange('processing');

        setIsPrintDialogOpen(false);
        toast({
            title: content.admin.orders.printingTitle,
            description: content.admin.orders.printingDesc,
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
                    title: content.admin.orders.syncSuccess,
                    description: content.admin.orders.syncSuccessDesc.replace('{count}', updatedCount.toString()),
                });
            } else {
                throw new Error(data.error || content.admin.orders.syncError);
            }
        } catch (e: any) {
            toast({
                title: content.admin.orders.syncError,
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
            title: content.admin.orders.statusChanged,
            description: content.admin.orders.statusChangedDesc
                .replace('{id}', orderId.slice(0, 8))
                .replace('{status}', newStatus === 'shipped' ? content.admin.dashboard.statusShipped :
                    newStatus === 'paid' ? content.admin.orders.status.paid :
                        newStatus === 'cancelled' ? content.admin.dashboard.statusCancelled :
                            content.admin.dashboard.statusProcessing),
        });
    };

    const handleBulkStatusChange = (newStatus: Order['status']) => {
        const idsArray = Array.from(selectedOrders);
        idsArray.forEach(id => updateOrderStatus(id, newStatus));

        toast({
            title: content.admin.orders.bulkStatusTitle,
            description: content.admin.orders.bulkStatusChangedDesc
                .replace('{count}', idsArray.length.toString())
                .replace('{status}', newStatus === 'shipped' ? content.admin.dashboard.statusShipped :
                    newStatus === 'processing' ? content.admin.dashboard.statusProcessing :
                        newStatus === 'paid' ? content.admin.orders.status.paid : content.admin.dashboard.statusCancelled),
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
                <h2 data-testid="admin-page-title" className="text-2xl sm:text-3xl font-bold tracking-tight">{content.admin.orders.title}</h2>
               <div className="flex flex-wrap items-center gap-2">
                    {notificationPermission !== 'granted' && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-10 px-4 border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold animate-pulse"
                            onClick={requestNotificationPermission}
                            aria-label={content.admin.orders.notifToggle}
                        >
                            <Bell className="w-4 h-4" />
                            <span>{content.admin.orders.allowNotif}</span>
                        </Button>
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2 h-10 px-4 border-olive/20 shadow-sm text-olive-dark hover:text-olive-dark font-semibold" aria-label={content.admin.orders.sorting}>
                                <ArrowUpDown className="w-4 h-4" />
                                <span className="hidden sm:inline">{content.admin.orders.sorting}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>{content.admin.orders.sortBy}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setSortConfig({ key: 'date', direction: 'desc' }) }}>
                                {content.admin.orders.sortLatest}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSortConfig({ key: 'date', direction: 'asc' }) }}>
                                {content.admin.orders.sortOldest}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setSortConfig({ key: 'id', direction: 'asc' }) }}>
                                {content.admin.orders.sortIdAsc}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSortConfig({ key: 'id', direction: 'desc' }) }}>
                                {content.admin.orders.sortIdDesc}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 h-10 px-4 border-olive/20 shadow-sm text-olive-dark hover:text-olive-dark font-semibold"
                        onClick={handleSyncPacketa}
                        disabled={isSyncing}
                        aria-label={isSyncing ? content.admin.orders.syncNow + '...' : content.admin.orders.syncNow}
                    >
                        <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">{isSyncing ? content.admin.orders.syncNow + '...' : content.admin.orders.syncNow}</span>
                        <span className="sm:hidden">{isSyncing ? '...' : content.admin.orders.syncNow.slice(0, 4)}</span>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <div className="overflow-x-auto pb-4 -mx-4 px-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0 mb-8">
                    <TabsList className="flex w-fit md:w-full md:grid md:grid-cols-4 min-w-max md:min-w-0 bg-olive-dark/5 p-2 rounded-[2rem] h-auto border border-olive/5">
                        <TabsTrigger value="pending" className="px-8 py-3.5 rounded-[1.5rem] data-[state=active]:bg-lime data-[state=active]:text-olive-dark data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20 font-black uppercase text-[10px] tracking-widest transition-all">{content.admin.orders.tabPending} ({filteredOrders.pending.length})</TabsTrigger>
                        <TabsTrigger value="processing" className="px-8 py-3.5 rounded-[1.5rem] data-[state=active]:bg-lime data-[state=active]:text-olive-dark data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20 font-black uppercase text-[10px] tracking-widest transition-all">{content.admin.orders.tabProcessing} ({filteredOrders.processing.length})</TabsTrigger>
                        <TabsTrigger value="shipped" className="px-8 py-3.5 rounded-[1.5rem] data-[state=active]:bg-lime data-[state=active]:text-olive-dark data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20 font-black uppercase text-[10px] tracking-widest transition-all">{content.admin.orders.tabShipped} ({filteredOrders.shipped.length})</TabsTrigger>
                        <TabsTrigger value="cancelled" className="px-8 py-3.5 rounded-[1.5rem] data-[state=active]:bg-lime data-[state=active]:text-olive-dark data-[state=active]:shadow-xl data-[state=active]:shadow-lime/20 font-black uppercase text-[10px] tracking-widest transition-all">{content.admin.orders.tabCancelled} ({filteredOrders.cancelled.length})</TabsTrigger>
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
                            <div className="text-[9px] sm:text-[10px] text-white font-black uppercase tracking-[0.2em] mb-1">{content.admin.inventory.selected}</div>
                            <div className="text-2xl sm:text-3xl font-black text-white leading-none font-display">{selectedOrders.size} <span className="text-[10px] sm:text-xs font-bold text-white/30 uppercase tracking-widest ml-1">{content.admin.inventory.unit}</span></div>
                        </div>
                        <Button
                            variant="ghost"
                            className="text-white/40 hover:text-white font-black uppercase text-[9px] sm:text-[10px] tracking-widest h-10 px-4 rounded-xl hover:bg-white/5 transition-all"
                            onClick={() => setSelectedOrders(new Set())}
                        >
                            {content.admin.orders.cancel}
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
                                <span className="hidden sm:inline uppercase">{content.admin.dashboard.statusProcessing}</span>
                            </Button>

                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-12 px-8 text-white hover:bg-lime hover:text-olive-dark font-black uppercase text-[10px] tracking-widest gap-3 rounded-[1.5rem] transition-all duration-300"
                                onClick={() => handleBulkStatusChange('shipped')}
                            >
                                <Truck className="w-4 h-4" />
                                <span className="hidden sm:inline uppercase">{content.admin.dashboard.statusShipped}</span>
                            </Button>

                            <Dialog open={isBulkCancelDialogOpen} onOpenChange={setIsBulkCancelDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-12 px-8 text-red-400 hover:bg-red-500 hover:text-white font-black uppercase text-[10px] tracking-widest gap-3 rounded-[1.5rem] transition-all duration-300"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        <span className="hidden sm:inline uppercase">{content.admin.dashboard.statusCancelled}</span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-[2.5rem] border-none shadow-2xl">
                                    <DialogHeader>
                                        <DialogTitle className="flex items-center gap-3 text-red-600 font-black uppercase text-lg tracking-tight">
                                            <AlertTriangle className="w-6 h-6" />
                                            {content.admin.orders.bulkCancelTitle}
                                        </DialogTitle>
                                        <div className="pt-6">
                                            <div className="text-sm font-black text-olive-dark uppercase tracking-tight">{content.admin.orders.bulkCancelTitle}</div>
                                            <div className="text-xs text-olive/40 font-bold mt-2 leading-relaxed">
                                                {content.admin.orders.bulkCancelQuestion.replace('{size}', selectedOrders.size.toString())}
                                            </div>
                                        </div>
                                    </DialogHeader>
                                    <DialogFooter className="gap-3 mt-8">
                                        <Button variant="ghost" onClick={() => setIsBulkCancelDialogOpen(false)} className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest text-olive/40 hover:text-olive-dark">{content.admin.orders.cancelDialog.back}</Button>
                                        <Button variant="destructive" onClick={handleBulkCancel} className="rounded-xl bg-red-600 hover:bg-red-700 px-8 font-black uppercase text-[10px] tracking-widest text-white shadow-xl shadow-red-600/20">
                                            {content.admin.orders.confirmBulkCancel}
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
                            <span>{content.admin.orders.labelsSequential}</span>
                        </Button>
                    </div>
                </div>
            )}

            <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{content.admin.orders.printOptions}</DialogTitle>
                        <DialogDescription>
                            {content.admin.orders.printOptionsDesc.replace('{size}', printIds.length.toString())}
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
                                <span className="font-bold text-base">{content.admin.orders.labelsA4}</span>
                                <span className="text-xs text-muted-foreground italic">{content.admin.orders.labelsA4Desc}</span>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="h-24 flex flex-col gap-2 items-center justify-center border-2 hover:border-olive/40 hover:bg-background"
                            onClick={executeSequentialPrint}
                        >
                            <FileText className="w-8 h-8 text-olive-dark/60" />
                            <div className="flex flex-col">
                                <span className="font-bold text-base">{content.admin.orders.labelsSequential}</span>
                                <span className="text-xs text-muted-foreground italic">{content.admin.orders.labelsSequentialDesc}</span>
                            </div>
                        </Button>
                    </div>
                    <DialogFooter className="sm:justify-start">
                        <Button variant="ghost" onClick={() => setIsPrintDialogOpen(false)}>{content.admin.orders.cancel}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Orders;
