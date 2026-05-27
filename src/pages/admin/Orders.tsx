import { useState, useEffect } from "react";
import { useInventory, Order } from "@/context/InventoryContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Truck, Clock, Eye, Printer, RefreshCcw, CheckSquare, Square, XCircle, AlertTriangle, LayoutGrid, Copy, ArrowUpDown, Bell, MousePointer2, FileText, Loader2, Download, CalendarRange } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContent } from "@/context/ContentContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
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
        <div className="bg-admin-canvas/60 backdrop-blur-xl rounded-[2.8rem] p-6 sm:p-10 space-y-7 mb-8 border border-white/20 shadow-2xl shadow-olive/5 transition-all duration-700 hover:shadow-olive/10 hover:-translate-y-1 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-10">
            {/* Glossy glass reflection element */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono font-black text-xs text-white bg-olive-dark px-3 py-1.5 rounded-xl">#{order.id.slice(0, 12)}</span>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-olive-dark/40 hover:text-olive-dark hover:bg-olive-dark/10 transition-colors" 
                            onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(order.id);
                                toast({ title: content.admin.orders.copyId, duration: 1000 });
                            }}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-olive-dark/70">{new Date(order.date).toLocaleString(content.lang === 'en' ? 'en-US' : 'cs-CZ')}</p>
                </div>
                <div className="flex flex-col gap-3 items-end">
                    <div className="flex flex-col gap-1 items-end">
                        <Badge className={`text-[9px] font-black uppercase tracking-widest px-3 h-6 rounded-lg border-none shadow-sm ${
                            order.status === 'cancelled' ? 'bg-olive-dark/10 text-olive-dark/40' :
                            order.status === 'pending' ? 'bg-red-500/10 text-red-600' : 
                            'bg-lime text-olive-dark'
                        }`}>
                            {order.status === 'cancelled' ? content.admin.orders.status.storno :
                             order.status === 'pending' ? content.admin.orders.status.unpaid : content.admin.orders.status.paid}
                        </Badge>
                        <span className="text-[8px] font-black text-olive-dark/50 uppercase tracking-widest mt-0.5 pr-1">
                            {order.delivery_info?.paymentMethod === 'transfer_manual' ? content.admin.orders.status.transfer :
                             order.delivery_info?.paymentMethod === 'stripe_express' ? content.admin.orders.status.express :
                             order.delivery_info?.paymentMethod || content.admin.orders.table.payment}
                        </span>
                    </div>
                    <Badge
                        className={`text-[9px] font-black uppercase tracking-widest px-3 h-6 rounded-lg border-none shadow-sm ${
                            order.status === 'shipped' ? 'bg-olive-dark text-white' :
                                order.status === 'processing' ? 'bg-olive-dark text-white' :
                                    order.status === 'cancelled' ? 'bg-olive-dark/10 text-olive-dark/40' :
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

            <div className="p-5 rounded-2xl bg-olive-dark/5 border border-olive/10 space-y-3">
                <p className="text-sm font-black text-olive-dark uppercase tracking-tight">{order.customer.name}</p>
                <p className="text-[11px] text-olive-dark/80 font-bold truncate">{order.customer.email}</p>
            </div>

            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-olive-dark/60">{content.admin.orders.itemsLabel}:</p>
                <div className="space-y-1">
                    {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="text-xs flex justify-between items-center bg-admin-canvas/60 p-2 rounded-xl border border-olive-dark/5">
                            <span className="font-bold text-olive-dark">{item.quantity}{content.admin.dashboard.multiplier} {item.name}</span>
                            <span className="font-black text-olive-dark/70">{item.price} {content.bankInfo.currency}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-olive-dark/10">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-widest text-olive-dark/60">{content.admin.orders.totalPriceLabel}</span>
                    <span className="font-display font-black text-lg text-olive-dark">{order.total} {content.bankInfo.currency}</span>
                </div>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="icon" variant="outline" className="rounded-xl h-11 w-11 border-olive/10 hover:bg-olive-dark hover:text-white transition-all">
                                <Eye className="w-5 h-5" />
                            </Button>
                        </DialogTrigger>
                        <OrderDetailDialog order={order} />
                    </Dialog>
                    {order.status === 'pending' && (
                        <Button size="icon" onClick={() => onStatusChange(order.id, 'paid')} className="bg-lime text-olive-dark hover:bg-lime/80 rounded-xl h-11 w-11 shadow-lg shadow-lime/20" aria-label={content.admin.orders.markAsPaid}>
                            <CheckCircle className="w-5 h-5" />
                        </Button>
                    )}
                    {(order.status === 'paid' || order.status === 'processing') && (
                        <Button size="icon" onClick={() => onStatusChange(order.id, 'shipped')} className="bg-olive-dark text-white hover:bg-black rounded-xl h-11 w-11" aria-label={content.admin.orders.markAsShipped}>
                            <Truck className="w-5 h-5" />
                        </Button>
                    )}
                    <InvoiceModal order={order}>
                        <Button size="icon" variant="ghost" className="h-11 w-11 p-0 text-olive-dark/60 hover:text-olive-dark hover:bg-admin-canvas/80 rounded-xl" aria-label={content.admin.orders.viewInvoice}>
                            <FileText className="h-5 h-5" />
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
        <div className="hidden md:block overflow-x-auto rounded-[2.5rem] border border-olive/5 bg-admin-canvas/50 backdrop-blur-sm shadow-sm">
            <Table>
                <TableHeader className="bg-admin-canvas/40 border-b border-olive/5">
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
                            className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-3 cursor-pointer hover:bg-olive-dark/5 transition-colors text-center w-24"
                            onClick={() => onSort('id')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {content?.admin?.orders?.table?.id} {sortConfig.key === 'id' && <ArrowUpDown className="w-3 h-3 text-olive-dark" />}
                            </div>
                        </TableHead>
                        <TableHead
                            className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-3 cursor-pointer hover:bg-olive-dark/5 transition-colors text-center w-28"
                            onClick={() => onSort('date')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                {content?.admin?.orders?.table?.date} {sortConfig.key === 'date' && <ArrowUpDown className="w-3 h-3 text-olive-dark" />}
                            </div>
                        </TableHead>
                        <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-3 text-center">{content?.admin?.orders?.table?.customer}</TableHead>
                        <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-3 text-center w-24">{content?.admin?.orders?.table?.items}</TableHead>
                        <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-3 text-center w-24">{content?.admin?.orders?.table?.amount}</TableHead>
                        <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-3 text-center w-24">{content?.admin?.orders?.table?.payment}</TableHead>
                        <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-3 text-center w-24">{content?.admin?.orders?.table?.method}</TableHead>
                        <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-3 text-center w-28">{content?.admin?.orders?.table?.status}</TableHead>
                        <TableHead className="font-black text-olive-dark uppercase text-[9px] tracking-widest py-3 text-center pr-4">{content?.admin?.orders?.table?.actions}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={8} className="text-center py-20 text-olive-dark/60 font-black uppercase tracking-[0.2em] italic">
                                {content.admin.orders.empty}
                            </TableCell>
                        </TableRow>
                    ) : (
                        data.map((order) => (
                            <TableRow key={order.id} className={`transition-all duration-300 hover:bg-admin-canvas border-b border-olive/5 group ${selectedOrders.has(order.id) ? "bg-lime/5" : ""}`}>
                                <TableCell className="pl-4">
                                    <Checkbox
                                        checked={selectedOrders.has(order.id)}
                                        onCheckedChange={() => toggleOrderSelection(order.id)}
                                        className="rounded-lg border-olive/20 data-[state=checked]:bg-lime data-[state=checked]:border-lime data-[state=checked]:text-olive-dark"
                                    />
                                </TableCell>
                                <TableCell className="py-3">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono font-black text-[9px] text-white bg-olive-dark px-2 py-1 rounded-lg">#{order.id.slice(0, 12)}</span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 opacity-60 group-hover:opacity-100 transition-all text-olive-dark/70 hover:text-olive-dark hover:bg-olive-dark/10" 
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
                                    <span className="text-[9px] font-black text-olive-dark/70 uppercase tracking-wider bg-olive-dark/5 px-2 py-1 rounded-lg">
                                        {new Date(order.date).toLocaleDateString(content.lang === 'en' ? 'en-US' : 'cs-CZ')}
                                    </span>
                                </TableCell>
                                <TableCell className="px-2">
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-black text-olive-dark text-[11px] uppercase tracking-tight truncate">{order.customer.name}</span>
                                        <span className="text-[9px] text-olive-dark/70 font-bold tracking-tight truncate">{order.customer.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center px-1">
                                    <div className="flex flex-col gap-0.5 items-center">
                                        {order.items.slice(0, 1).map((item, idx) => (
                                            <div key={idx} className="text-[8px] font-black uppercase text-olive-dark/80 bg-admin-canvas border border-olive-dark/10 px-2 py-0.5 rounded-lg shadow-sm">
                                                {item.quantity}x {item.name.split(' ')[0]}
                                            </div>
                                        ))}
                                        {order.items.length > 1 && <span className="text-[7px] text-olive-dark/40 font-black uppercase tracking-widest">+ {order.items.length - 1} {content.admin.orders.more}</span>}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center px-2">
                                    <span className="font-display font-black text-sm text-olive-dark">{(order.total || 0).toLocaleString(content.lang === 'en' ? 'en-US' : 'cs-CZ')} <span className="text-[8px] text-olive-dark/40 tracking-normal">{content.bankInfo.currency}</span></span>
                                </TableCell>
                                <TableCell className="text-center px-1">
                                    <Badge 
                                        className={`text-[8px] font-black uppercase tracking-widest px-2 h-5 rounded-md border-none shadow-sm ${
                                            order.status === 'cancelled' ? 'bg-olive-dark/10 text-olive-dark/60' :
                                            order.status === 'pending' ? 'bg-red-500/10 text-red-600' : 
                                            'bg-lime text-olive-dark'
                                        }`}
                                    >
                                        {order.status === 'cancelled' ? content.admin.orders.status.storno :
                                         order.status === 'pending' ? content.admin.orders.status.unpaid : content.admin.orders.status.paid}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-center px-1">
                                    <span className="text-[9px] font-black text-olive-dark/60 uppercase tracking-widest">
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
                                        {order.status === 'shipped' ? content.admin.dashboard.statusShipped :
                                            order.status === 'processing' ? content.admin.dashboard.statusProcessing :
                                                order.status === 'cancelled' ? content.admin.dashboard.statusCancelled :
                                                    content.admin.dashboard.statusReceived}
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
                                                        className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-500/10 rounded-xl"
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
                                                                <div className="font-mono text-xs font-black text-white bg-olive-dark px-3 py-1.5 rounded-xl w-fit mb-2">#{order.id.slice(0, 12)}</div>
                                                                <div className="text-xs font-black text-olive-dark uppercase tracking-tight">{order.customer.name}</div>
                                                            </div>
                                                            <p className="text-xs text-olive-dark/70 font-bold leading-relaxed px-1">
                                                                {content.admin.orders.cancelDialog.warning}
                                                            </p>
                                                        </div>
                                                    </DialogHeader>
                                                    <DialogFooter className="gap-3 mt-8">
                                                        <DialogClose asChild>
                                                            <Button variant="ghost" className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest text-olive-dark/40 hover:text-olive-dark transition-all">{content.admin.orders.cancelDialog.back}</Button>
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
                                            <Button size="sm" variant="outline" className="h-10 w-10 p-0 text-olive-dark/70 border-olive-dark/10 hover:text-olive-dark hover:bg-admin-canvas rounded-xl transition-all" title={content.admin.orders.viewInvoice}>
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
        typeof window !== 'undefined' && typeof Notification !== 'undefined' 
            ? Notification.permission 
            : 'default'
    );
    const [sortConfig, setSortConfig] = useState<{ key: 'id' | 'date'; direction: 'asc' | 'desc' }>({
        key: 'date',
        direction: 'desc'
    });
    
    // Export State
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [exportType, setExportType] = useState<'month' | 'quarter' | 'year' | 'custom'>('month');
    const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
    const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

    if (!content || !orders) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 data-testid="admin-loader" className="w-12 h-12 animate-spin text-white" />
                <p className="text-muted-foreground font-medium animate-pulse">{content?.admin?.auth?.verifying || "Loading..."}</p>
            </div>
        );
    }

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
        if (typeof window === 'undefined' || typeof Notification === 'undefined') return;
        
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

    const handleExportCSV = () => {
        let filteredForExport = orders;
        const now = new Date();
        let fromDate = dateFrom;
        let toDate = dateTo;

        if (exportType === 'month') {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            fromDate = firstDay;
            toDate = lastDay;
        } else if (exportType === 'quarter') {
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const firstDay = new Date(now.getFullYear(), currentQuarter * 3, 1);
            const lastDay = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0);
            fromDate = firstDay;
            toDate = lastDay;
        } else if (exportType === 'year') {
            const firstDay = new Date(now.getFullYear(), 0, 1);
            const lastDay = new Date(now.getFullYear(), 11, 31);
            fromDate = firstDay;
            toDate = lastDay;
        }

        if (fromDate && toDate) {
            const from = fromDate.getTime();
            const to = toDate.getTime() + 86400000; // Přidat den pro obsáhnutí i posledního dne
            filteredForExport = orders.filter(o => {
                const oDate = new Date(o.date).getTime();
                return oDate >= from && oDate < to;
            });
        }

        if (filteredForExport.length === 0) {
            toast({
                title: "Chyba exportu",
                description: "Za vybrané období nebyly nalezeny žádné objednávky.",
                variant: "destructive"
            });
            return;
        }

        const headers = ["Číslo objednávky", "Datum", "Zákazník", "E-mail", "Celková částka", "Měna", "Způsob platby", "Stav objednávky", "Zboží (souhrn)"];
        const rows = filteredForExport.map(o => {
            const itemsStr = o.items.map((i: any) => `${i.quantity}x ${i.name}`).join(', ');
            return [
                o.id,
                new Date(o.date).toLocaleDateString('cs-CZ'),
                `"${o.customer.name}"`,
                o.customer.email,
                o.total,
                content.bankInfo.currency,
                o.delivery_info?.paymentMethod || "Neuvedeno",
                o.status,
                `"${itemsStr}"`
            ].join(';');
        });

        // Přidání UTF-8 BOM pro korektní češtinu v Excelu
        const csvContent = '\uFEFF' + headers.join(';') + '\n' + rows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        const timestamp = new Date().toISOString().split('T')[0];
        link.setAttribute("download", `boostup-faktury-${exportType}-${timestamp}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsExportDialogOpen(false);
        toast({
            title: "Export úspěšný",
            description: `Bylo exportováno ${filteredForExport.length} objednávek.`,
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
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 flex-wrap">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-lime animate-pulse shadow-[0_0_12px_rgba(163,230,53,0.8)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-olive-dark/70 italic">Admin Terminal v2.0</span>
                    </div>
                    <h2 
                        data-testid="admin-page-title" 
                        className="text-4xl sm:text-5xl font-black tracking-tighter text-olive-dark italic font-display bg-gradient-to-r from-olive-dark to-olive/60 bg-clip-text text-transparent pb-1"
                    >
                        {content.admin.orders.title || "Objednávky"}
                    </h2>
                    <div className="h-1.5 w-24 bg-gradient-to-r from-lime to-transparent rounded-full" />
                </div>
               <div className="flex flex-wrap items-center gap-2">
                    {notificationPermission !== 'granted' && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 h-10 px-4 border-amber-500/30 bg-amber-500/10 text-amber-900 hover:bg-amber-500/20 font-bold animate-pulse"
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
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 h-10 px-4 border-olive/20 shadow-sm text-olive-dark hover:text-olive-dark font-semibold bg-lime/10 hover:bg-lime/20"
                        onClick={() => setIsExportDialogOpen(true)}
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Export CSV</span>
                    </Button>
                </div>
            </div>
            <Tabs defaultValue="pending" className="w-full">
                <div className="overflow-x-auto pb-6 -mx-4 px-4 md:overflow-visible md:pb-0 md:mx-0 md:px-0 mb-8 sm:mb-12">
                    <TabsList className="flex w-fit md:w-full md:grid md:grid-cols-4 min-w-max md:min-w-0 bg-admin-canvas/60 backdrop-blur-md p-2 sm:p-3 rounded-[2.5rem] h-auto border border-white/20 shadow-xl shadow-olive/5">
                        <TabsTrigger value="pending" className="px-6 sm:px-10 py-3 sm:py-4 rounded-[1.8rem] sm:rounded-[2rem] data-[state=active]:bg-olive-dark data-[state=active]:text-lime data-[state=active]:shadow-2xl data-[state=active]:shadow-olive-dark/30 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.15em] transition-all duration-500 scale-95 data-[state=active]:scale-100">{content.admin.orders.tabPending} ({filteredOrders.pending.length})</TabsTrigger>
                        <TabsTrigger value="processing" className="px-6 sm:px-10 py-3 sm:py-4 rounded-[1.8rem] sm:rounded-[2rem] data-[state=active]:bg-olive-dark data-[state=active]:text-lime data-[state=active]:shadow-2xl data-[state=active]:shadow-olive-dark/30 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.15em] transition-all duration-500 scale-95 data-[state=active]:scale-100">{content.admin.orders.tabProcessing} ({filteredOrders.processing.length})</TabsTrigger>
                        <TabsTrigger value="shipped" className="px-6 sm:px-10 py-3 sm:py-4 rounded-[1.8rem] sm:rounded-[2rem] data-[state=active]:bg-olive-dark data-[state=active]:text-lime data-[state=active]:shadow-2xl data-[state=active]:shadow-olive-dark/30 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.15em] transition-all duration-500 scale-95 data-[state=active]:scale-100">{content.admin.orders.tabShipped} ({filteredOrders.shipped.length})</TabsTrigger>
                        <TabsTrigger value="cancelled" className="px-6 sm:px-10 py-3 sm:py-4 rounded-[1.8rem] sm:rounded-[2rem] data-[state=active]:bg-olive-dark data-[state=active]:text-lime data-[state=active]:shadow-2xl data-[state=active]:shadow-olive-dark/30 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.15em] transition-all duration-500 scale-95 data-[state=active]:scale-100">{content.admin.orders.tabCancelled} ({filteredOrders.cancelled.length})</TabsTrigger>
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
                <div className="fixed bottom-4 sm:bottom-10 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 glass-dark rounded-[2rem] sm:rounded-[3rem] px-6 sm:px-12 py-4 sm:py-6 flex flex-col md:flex-row items-center gap-6 sm:gap-12 animate-in fade-in slide-in-from-bottom-10 z-50 shadow-2xl border-white border-opacity-10">
                    <div className="flex items-center gap-6 pr-0 md:pr-12 border-b md:border-b-0 md:border-r border-white border-opacity-10 pb-4 md:pb-0 w-full md:w-auto justify-between md:justify-start">
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

                        <div className="flex gap-3 p-2 bg-white bg-opacity-5 rounded-[2.5rem] border border-white border-opacity-5">
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

            <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogContent className="sm:max-w-md rounded-[2.5rem] border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 font-black uppercase text-lg tracking-tight text-olive-dark">
                            <Download className="w-6 h-6 text-lime" />
                            Export faktur do CSV
                        </DialogTitle>
                        <DialogDescription className="text-olive-dark/60 font-bold">
                            Stáhněte si údaje z objednávek ve formátu pro import do účetnictví. Zvolte období, za které chcete data vygenerovat.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-6 mt-4 p-2">
                        <div className="space-y-3">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-olive-dark/60">Období exportu</Label>
                            <Select value={exportType} onValueChange={(val: any) => setExportType(val)}>
                                <SelectTrigger className="rounded-xl border-olive/10 bg-white shadow-sm h-12">
                                    <SelectValue placeholder="Vyberte období" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-olive/10 shadow-xl">
                                    <SelectItem value="month">Aktuální měsíc</SelectItem>
                                    <SelectItem value="quarter">Aktuální čtvrtletí</SelectItem>
                                    <SelectItem value="year">Celý aktuální rok</SelectItem>
                                    <SelectItem value="custom">Vlastní rozsah (Od-Do)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {exportType === 'custom' && (
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="space-y-3 flex-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-olive-dark/60">Datum od</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={`w-full justify-start text-left font-bold rounded-xl border-olive/10 bg-white shadow-sm h-12 ${!dateFrom && "text-muted-foreground"}`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateFrom ? format(dateFrom, "d. MMMM yyyy", { locale: cs }) : <span>Vyberte datum</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dateFrom}
                                                onSelect={setDateFrom}
                                                initialFocus
                                                locale={cs}
                                                className="bg-white rounded-2xl p-4"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-3 flex-1">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-olive-dark/60">Datum do</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={`w-full justify-start text-left font-bold rounded-xl border-olive/10 bg-white shadow-sm h-12 ${!dateTo && "text-muted-foreground"}`}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {dateTo ? format(dateTo, "d. MMMM yyyy", { locale: cs }) : <span>Vyberte datum</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={dateTo}
                                                onSelect={setDateTo}
                                                initialFocus
                                                locale={cs}
                                                className="bg-white rounded-2xl p-4"
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                        )}
                        
                        <div className="p-4 bg-lime/10 rounded-2xl border border-lime/20 flex gap-4 mt-2">
                            <CalendarRange className="w-5 h-5 text-lime-dark shrink-0" />
                            <p className="text-xs font-bold text-olive-dark leading-relaxed">
                                Vygenerovaný soubor <strong>.csv</strong> použijte k nahrání do softwaru jako je Pohoda, FlexiBee, iDoklad a další. Soubor používá kódování UTF-8 a oddělovač ";" (standard pro český Excel).
                            </p>
                        </div>
                    </div>
                    <DialogFooter className="gap-3 mt-4">
                        <Button variant="ghost" onClick={() => setIsExportDialogOpen(false)} className="rounded-xl px-6 font-black uppercase text-[10px] tracking-widest text-olive-dark/40 hover:text-olive-dark transition-all">Zrušit</Button>
                        <Button onClick={handleExportCSV} className="rounded-xl bg-lime hover:bg-lime/90 text-olive-dark px-8 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-lime/20 h-12 gap-2">
                            <Download className="w-4 h-4" />
                            Stáhnout Export
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Orders;
