import { useInventory } from "@/context/InventoryContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Truck, Clock, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog";
import { OrderDetailDialog } from "@/components/orders/OrderDetailDialog";


const MobileOrderCard = ({ order, onStatusChange }: { order: any, onStatusChange: (id: string, status: 'shipped' | 'paid') => void }) => (
    <div className="border rounded-lg p-4 space-y-4 mb-4 bg-white shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold">#{order.id.slice(0, 8)}</p>
                <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col gap-1 items-end">
                <Badge variant={order.status === 'pending' ? 'outline' : 'secondary'} className={order.status !== 'pending' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100' : ''}>
                    {order.status === 'pending' ? 'Platba: Čeká' : 'Platba: Zaplaceno'}
                </Badge>
                <Badge variant={order.status === 'shipped' ? 'default' : 'outline'} className={order.status === 'shipped' ? 'bg-blue-600' : 'border-amber-200 text-amber-700'}>
                    {order.status === 'shipped' ? 'Stav: Vyřízena' : 'Stav: Čeká k vyřízení'}
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
                {order.status === 'paid' && (
                    <Button size="sm" onClick={() => onStatusChange(order.id, 'shipped')} className="bg-blue-600 hover:bg-blue-700">
                        <Truck className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </div>
    </div>
);

const Orders = () => {
    const { orders, updateOrderStatus } = useInventory();
    const { toast } = useToast();

    const handleStatusChange = (orderId: string, newStatus: 'shipped' | 'paid') => {
        updateOrderStatus(orderId, newStatus);
        toast({
            title: "Stav objednávky změněn",
            description: `Objednávka ${orderId.slice(0, 8)} byla označena jako ${newStatus === 'shipped' ? 'Odeslaná' : 'Zaplacená'}.`,
        });
    };

    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid');
    const shippedOrders = orders.filter(o => o.status === 'shipped');

    const OrderTable = ({ data }: { data: typeof orders }) => (
        <>
            {/* Desktop View */}
            <div className="hidden md:block">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Datum</TableHead>
                            <TableHead>Zákazník</TableHead>
                            <TableHead>Položky</TableHead>
                            <TableHead>Cena celkem</TableHead>
                            <TableHead>Stav</TableHead>
                            <TableHead className="text-right">Akce</TableHead>
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
                                <TableRow key={order.id}>
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
                                            <Badge variant={order.status === 'pending' ? 'outline' : 'secondary'} className={order.status !== 'pending' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 w-fit' : 'w-fit'}>
                                                {order.status === 'pending' ? 'Platba: Čeká' : 'Platba: Zaplaceno'}
                                            </Badge>
                                            <Badge variant={order.status === 'shipped' ? 'default' : 'outline'} className={order.status === 'shipped' ? 'bg-blue-600 w-fit' : 'border-amber-200 text-amber-700 w-fit'}>
                                                {order.status === 'shipped' ? 'Stav: Vyřízena' : 'Stav: Čeká k vyřízení'}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Detail
                                                    </Button>
                                                </DialogTrigger>
                                                <OrderDetailDialog order={order} />
                                            </Dialog>

                                            {order.status === 'pending' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStatusChange(order.id, 'paid')}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                                                    title="Označit jako zaplacené"
                                                >
                                                    <CheckCircle className="w-4 h-4" />
                                                </Button>
                                            )}
                                            {order.status === 'paid' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleStatusChange(order.id, 'shipped')}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    title="Označit jako vyřízené/odeslané"
                                                >
                                                    <Truck className="w-4 h-4" />
                                                </Button>
                                            )}
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
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold tracking-tight">Správa objednávek</h2>
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
        </div>
    );
};

export default Orders;
