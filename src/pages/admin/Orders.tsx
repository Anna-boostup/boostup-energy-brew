import { useInventory } from "@/context/InventoryContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Truck, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
                                <Badge variant={
                                    order.status === 'pending' ? 'outline' :
                                        order.status === 'paid' ? 'secondary' : 'default'
                                }>
                                    {order.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                                    {order.status === 'paid' && <CheckCircle className="w-3 h-3 mr-1" />}
                                    {order.status === 'shipped' && <Truck className="w-3 h-3 mr-1" />}
                                    {order.status === 'pending' ? 'Čeká na platbu' :
                                        order.status === 'paid' ? 'Zaplaceno' : 'Odesláno'}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                                {order.status !== 'shipped' && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleStatusChange(order.id, 'shipped')}
                                        className="bg-primary hover:bg-primary/90"
                                    >
                                        <Truck className="w-4 h-4 mr-2" />
                                        Odeslat
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Čekající a zaplacené objednávky</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrderTable data={pendingOrders} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="shipped" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Odeslané a dokončené objednávky</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OrderTable data={shippedOrders} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default Orders;
