import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Truck, Clock, Eye } from "lucide-react";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { OrderDetailDialog, OrderType } from "@/components/orders/OrderDetailDialog";
import { formatPrice } from "@/lib/utils";

const AccountOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<OrderType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                // Use type assertion here if needed, or rely on TS inference. 
                // Since we don't have exact DB types generated, manual mapping/casting is fine for now.
                .order('created_at', { ascending: false });

            if (!error && data) {
                // Map DB snake_case to our internal structure if necessary, 
                // but our OrderType tries to match what we store.
                // However, 'created_at' is usually what we use for date.
                const mappedOrders = data.map((o: any) => ({
                    ...o,
                    date: o.created_at, // Map created_at to date for consistency
                    customer: {
                        name: o.customer_name,
                        email: o.customer_email
                    }
                }));
                setOrders(mappedOrders);
            }
            setLoading(false);
        };

        fetchOrders();
    }, [user]);

    if (loading) {
        return <div className="text-center py-10">Načítám objednávky...</div>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Moje objednávky</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Desktop View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Číslo</TableHead>
                                <TableHead>Datum</TableHead>
                                <TableHead>Cena</TableHead>
                                <TableHead>Stav</TableHead>
                                <TableHead className="text-right">Detail</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        Zatím nemáte žádné objednávky.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-mono">{order.id.slice(0, 12)}...</TableCell>
                                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                                        <TableCell className="font-bold">{formatPrice(order.total)}</TableCell>
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
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Zobrazit
                                                    </Button>
                                                </DialogTrigger>
                                                <OrderDetailDialog order={order} />
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Zatím nemáte žádné objednávky.
                        </div>
                    ) : (
                        orders.map((order) => (
                            <div key={order.id} className="border rounded-lg p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-mono text-sm text-muted-foreground">#{order.id.slice(0, 12)}</div>
                                        <div className="text-sm font-medium">{new Date(order.date).toLocaleDateString()}</div>
                                    </div>
                                    <Badge variant={
                                        order.status === 'pending' ? 'outline' :
                                            order.status === 'paid' ? 'secondary' : 'default'
                                    }>
                                        {order.status === 'pending' ? 'Čeká na platbu' :
                                            order.status === 'paid' ? 'Zaplaceno' : 'Odesláno'}
                                    </Badge>
                                </div>

                                <div className="flex justify-between items-center pt-2 border-t">
                                    <span className="font-bold text-lg">{formatPrice(order.total)}</span>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline">
                                                Detail
                                            </Button>
                                        </DialogTrigger>
                                        <OrderDetailDialog order={order} />
                                    </Dialog>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default AccountOrders;
