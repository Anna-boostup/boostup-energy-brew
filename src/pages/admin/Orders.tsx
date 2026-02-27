import { useState } from "react";
import { useInventory, Order } from "@/context/InventoryContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Truck, Clock, Eye, Printer, RefreshCcw, CheckSquare, Square, XCircle, AlertTriangle, LayoutGrid, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { OrderDetailDialog } from "@/components/orders/OrderDetailDialog";
import { FileText } from "lucide-react";
import InvoiceModal from "@/components/admin/InvoiceModal";


const MobileOrderCard = ({ order, onStatusChange }: { order: any, onStatusChange: (id: string, status: Order['status']) => void }) => (
    <div className="border rounded-lg p-4 space-y-4 mb-4 bg-white shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold">#{order.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
                <Badge variant={order.status === 'pending' ? 'outline' : order.status === 'cancelled' ? 'destructive' : 'secondary'} className={order.status !== 'pending' && order.status !== 'cancelled' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : ''}>
                    {order.status === 'pending' ? 'Platba: Čeká' :
                        order.status === 'cancelled' ? 'Platba: Storno' :
                            'Platba: Zaplaceno'}
                </Badge>
                <Badge
                    variant={order.status === 'shipped' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'outline'}
                    className={
                        order.status === 'shipped' ? 'bg-blue-600' :
                            order.status === 'processing' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                                order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                    'border-amber-200 text-amber-700'
                    }
                >
                    {order.status === 'shipped' ? 'Stav: Vyřízena' :
                        order.status === 'processing' ? 'Stav: Rozpracováno' :
                            order.status === 'cancelled' ? 'Stav: Stornováno' :
                                'Stav: Čeká k vyřízení'}
                </Badge>
            </div>
        </div>

        <div className="space-y-1">
            <p className="text-sm font-medium">{order.customer.name}</p>
            <p className="text-xs text-slate-500">{order.customer.email}</p>
        </div>

        <div className="border-t pt-2">
            <p className="text-xs font-semibold mb-1 text-muted-foreground">Položky:</p>
            {order.items.map((item: any, idx: number) => (
                <div key={idx} className="text-sm flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                </div>
            ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-bold">{order.total} Kč</span>
            <div className="flex gap-2">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">Detail</Button>
                    </DialogTrigger>
                    <OrderDetailDialog order={order} />
                </Dialog>
                {order.status === 'pending' && (
                    <Button size="sm" onClick={() => onStatusChange(order.id, 'paid')} className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle className="w-4 h-4" />
                    </Button>
                )}
                {(order.status === 'paid' || order.status === 'processing') && (
                    <Button size="sm" onClick={() => onStatusChange(order.id, 'shipped')} className="bg-blue-600 hover:bg-blue-700">
                        <Truck className="w-4 h-4" />
                    </Button>
                )}
                {order.packeta_barcode && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => window.open(`/api/get-packeta-label?barcode=${order.packeta_barcode}`, '_blank')}
                        title="Tisk štítku Zásilkovny"
                    >
                        <Printer className="h-4 w-4" />
                    </Button>
                )}
                <InvoiceModal order={order}>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                        <FileText className="h-4 w-4" />
                    </Button>
                </InvoiceModal>
            </div>
        </div>
    </div>
);

const Orders = () => {
    const { orders, updateOrderStatus } = useInventory();
    const { toast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
    const [printIds, setPrintIds] = useState<string[]>([]);

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
        // Find all numeric packet IDs. Barcodes (Z...) are NOT supported by the bulk API.
        const ids = orders
            .filter(o => selectedOrders.has(o.id) && o.packeta_packet_id)
            .map(o => o.packeta_packet_id) as string[];

        if (ids.length === 0) {
            toast({
                title: "Nelze tisknout hromadně",
                description: "Vybrané objednávky nemají číselné ID zásilky (možná byly vytvořeny postaru). Vytiskněte je prosím po jednom z detailu objednávky.",
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
        setIsPrintDialogOpen(false);
    };

    const executeSequentialPrint = () => {
        // format='105x148mm' is the standard A6 size and ensures each label is on its own page
        window.open(`/api/get-bulk-packeta-labels?ids=${printIds.join(',')}&format=105x148mm`, '_blank');
        setIsPrintDialogOpen(false);
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

    const pendingOrders = orders.filter(o => o.status !== 'shipped' && o.status !== 'cancelled');
    const shippedOrders = orders.filter(o => o.status === 'shipped' || o.status === 'cancelled');

    const OrderTable = ({ data }: { data: typeof orders }) => (
        <>
            {/* Desktop View */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader className="bg-slate-100">
                        <TableRow className="border-b-2 border-slate-300">
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
                                />
                            </TableHead>
                            <TableHead className="font-extrabold text-slate-950 uppercase text-[11px] tracking-wider py-4">ID</TableHead>
                            <TableHead className="font-extrabold text-slate-950 uppercase text-[11px] tracking-wider py-4">Datum</TableHead>
                            <TableHead className="font-extrabold text-slate-950 uppercase text-[11px] tracking-wider py-4">Zákazník</TableHead>
                            <TableHead className="font-extrabold text-slate-950 uppercase text-[11px] tracking-wider py-4">Položky</TableHead>
                            <TableHead className="font-extrabold text-slate-950 uppercase text-[11px] tracking-wider py-4">Cena celkem</TableHead>
                            <TableHead className="font-extrabold text-slate-950 uppercase text-[11px] tracking-wider py-4">Stav</TableHead>
                            <TableHead className="font-extrabold text-slate-950 uppercase text-[11px] tracking-wider py-4 text-right">Akce</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Žádné objednávky v této kategorii.
                                </TableCell>
                            </TableRow>
                        ) : (
                            data.map((order) => (
                                <TableRow key={order.id} className={selectedOrders.has(order.id) ? "bg-slate-50" : ""}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedOrders.has(order.id)}
                                            onCheckedChange={() => toggleOrderSelection(order.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
                                    <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.customer.name}</span>
                                            <span className="text-xs text-muted-foreground">{order.customer.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="text-sm">
                                                    {item.quantity}x <span className="font-medium">{item.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold">{order.total} Kč</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={order.status === 'pending' ? 'outline' : order.status === 'cancelled' ? 'destructive' : 'secondary'} className={order.status !== 'pending' && order.status !== 'cancelled' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 w-fit' : 'w-fit'}>
                                                {order.status === 'pending' ? 'Platba: Čeká' :
                                                    order.status === 'cancelled' ? 'Platba: Storno' :
                                                        'Platba: Zaplaceno'}
                                            </Badge>
                                            <Badge
                                                variant={order.status === 'shipped' ? 'default' : order.status === 'cancelled' ? 'destructive' : 'outline'}
                                                className={
                                                    order.status === 'shipped' ? 'bg-blue-600 w-fit' :
                                                        order.status === 'processing' ? 'border-blue-200 text-blue-700 bg-blue-50 w-fit' :
                                                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100 w-fit' :
                                                                'border-amber-200 text-amber-700 w-fit'
                                                }
                                            >
                                                {order.status === 'shipped' ? 'Stav: Vyřízena' :
                                                    order.status === 'processing' ? 'Stav: Rozpracováno' :
                                                        order.status === 'cancelled' ? 'Stav: Stornováno' :
                                                            'Stav: Čeká k vyřízení'}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                </DialogTrigger>
                                                <OrderDetailDialog order={order} />
                                            </Dialog>

                                            {order.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleStatusChange(order.id, 'paid')}
                                                    className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                    title="Označit jako zaplacené"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {order.status === 'paid' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleStatusChange(order.id, 'processing')}
                                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    title="Označit jako rozpracované"
                                                >
                                                    <Clock className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {(order.status === 'paid' || order.status === 'processing') && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleStatusChange(order.id, 'shipped')}
                                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    title="Označit jako vyřízené/odeslané"
                                                >
                                                    <Truck className="w-4 h-4" />
                                                </Button>
                                            )}

                                            {order.status !== 'shipped' && order.status !== 'cancelled' && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                            title="Stornovat objednávku"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle className="flex items-center gap-2">
                                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                                                Stornovat objednávku
                                                            </DialogTitle>
                                                            <DialogHeader>
                                                                <div className="text-sm font-medium">Stornovat objednávku</div>
                                                                <div className="text-xs text-muted-foreground mt-1">
                                                                    Opravdu chcete stornovat objednávku #{order.id.slice(0, 8)}? Tuto akci nelze vrátit.
                                                                </div>
                                                            </DialogHeader>
                                                        </DialogHeader>
                                                        <DialogFooter className="gap-2 sm:gap-0 mt-4">
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline">Zpět</Button>
                                                            </DialogTrigger>
                                                            <Button variant="destructive" onClick={() => handleStatusChange(order.id, 'cancelled')}>
                                                                Potvrdit storno
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            )}

                                            {order.packeta_barcode && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    title="Tisk štítku Zásilkovny"
                                                    onClick={() => window.open(`/api/get-packeta-label?barcode=${order.packeta_barcode}`, '_blank')}
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <InvoiceModal order={order}>
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                                                    <FileText className="h-4 w-4" />
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
                    <p className="text-center py-8 text-muted-foreground">Žádné objednávky.</p>
                ) : (
                    data.map((order) => (
                        <MobileOrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
                    ))
                )}
            </div>
        </>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Správa objednávek</h2>
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 h-10 px-4 border-slate-200 shadow-sm"
                    onClick={handleSyncPacketa}
                    disabled={isSyncing}
                >
                    <RefreshCcw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Synchronizuji...' : 'Synchronizovat Zásilkovnu'}
                </Button>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="pending">Aktuální ({pendingOrders.length})</TabsTrigger>
                    <TabsTrigger value="shipped">Vyřízené ({shippedOrders.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-6">
                    <p className="text-muted-foreground mb-4 md:hidden text-sm px-1">Tip: Posunutím karty zobrazíte více detailů.</p>
                    <Card>
                        <CardHeader className="hidden md:flex">
                            <CardTitle>Čekající a zaplacené objednávky</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            <OrderTable data={pendingOrders} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="shipped" className="mt-6">
                    <Card>
                        <CardHeader className="hidden md:flex">
                            <CardTitle>Odeslané a dokončené objednávky</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            <OrderTable data={shippedOrders} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {selectedOrders.size > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white border border-slate-200 shadow-xl rounded-full px-6 py-3 flex items-center gap-6 animate-in fade-in slide-in-from-bottom-4 z-50">
                    <div className="text-sm font-medium text-slate-600 border-r pr-6 border-slate-200">
                        Vybráno: <span className="text-emerald-600 font-bold">{selectedOrders.size}</span> objednávek
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-600 hover:text-red-600 hover:bg-red-50"
                            onClick={() => setSelectedOrders(new Set())}
                        >
                            Zrušit výběr
                        </Button>
                        <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 gap-2 px-4 h-9"
                            onClick={handleBulkPrint}
                        >
                            <Printer className="w-4 h-4" />
                            Hromadný tisk
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
