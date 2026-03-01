import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, Users, Printer, Eye, FileText } from "lucide-react";
import { useInventory, Order } from "@/context/InventoryContext";
import InvoiceModal from "@/components/admin/InvoiceModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { OrderDetailDialog } from "@/components/orders/OrderDetailDialog";

const AdminDashboard = () => {
    const { stock, orders } = useInventory();
    const totalStock = Object.values(stock).reduce((a, b) => a + b, 0);
    const lowStockItems = Object.entries(stock).filter(([_, qty]) => qty < 10).length;

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const todayOrders = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length;

    // Status groups
    const newOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'paid').length;
    const processingCount = orders.filter(o => o.status === 'processing').length;
    const shippedCount = orders.filter(o => o.status === 'shipped').length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Přehled</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-emerald-50/30 border-emerald-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Celkové tržby</CardTitle>
                        <span className="font-bold text-muted-foreground">Kč</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRevenue.toLocaleString('cs-CZ')} Kč</div>
                        <p className="text-xs text-foreground/70">Lokální data</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stav objednávek (Celkem: {orders.length})</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Nové / Zaplacené</p>
                                <div className="text-xl font-bold">{newOrdersCount}</div>
                                <p className="text-[10px] text-foreground/70">+{todayOrders} dnes</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">Rozpracované</p>
                                <div className="text-xl font-bold">{processingCount}</div>
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Vyřízené</p>
                                <div className="text-xl font-bold">{shippedCount}</div>
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">Stornované</p>
                                <div className="text-xl font-bold">{cancelledCount}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Skladové zásoby (Kusy)</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Lemon Blast</p>
                                <div className="text-xl font-bold">{stock['lemon'] || 0}</div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Red Rush</p>
                                <div className="text-xl font-bold">{stock['red'] || 0}</div>
                            </div>
                            <div>
                                <p className="text-xs font-medium text-muted-foreground">Silky Leaf</p>
                                <div className="text-xl font-bold">{stock['silky'] || 0}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-7">
                    <CardHeader>
                        <CardTitle>Nedávné objednávky</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {orders.length === 0 ? (
                            <p className="text-foreground/70">Zatím žádné objednávky.</p>
                        ) : (
                            <div className="space-y-4">
                                {orders.slice(0, 10).map((order) => (
                                    <div key={order.id} className="flex flex-col md:flex-row md:items-center justify-between border-b pb-4 last:border-0 last:pb-0 gap-4">
                                        <div className="grid gap-1">
                                            <p className="font-bold text-sm">#{order.id}</p>
                                            <p className="text-xs text-foreground/70">{order.customer.name} ({order.customer.email})</p>
                                            <p className="text-xs text-foreground/70">{new Date(order.date).toLocaleString('cs-CZ')}</p>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4">
                                            <div className="flex flex-col gap-1 items-end">
                                                <Badge
                                                    variant={order.status === 'pending' ? 'outline' : 'secondary'}
                                                    className={order.status !== 'pending' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none' : 'border-amber-200 text-amber-700'}
                                                >
                                                    {order.status === 'pending' ? 'Platba: Čeká' : 'Platba: Zaplaceno'}
                                                </Badge>
                                                <Badge
                                                    variant={order.status === 'shipped' ? 'default' : 'outline'}
                                                    className={
                                                        order.status === 'shipped' ? 'bg-emerald-700 text-white border-none' :
                                                            order.status === 'processing' ? 'border-blue-200 text-blue-800 bg-blue-50' :
                                                                order.status === 'cancelled' ? 'border-slate-300 text-slate-600 bg-slate-50' :
                                                                    'border-amber-300 text-amber-800 bg-amber-50'
                                                    }
                                                >
                                                    {order.status === 'shipped' ? 'Stav: Vyřízena' :
                                                        order.status === 'processing' ? 'Stav: Rozpracováno' :
                                                            order.status === 'cancelled' ? 'Stav: Stornováno' :
                                                                'Stav: Čeká k vyřízení'}
                                                </Badge>
                                            </div>
                                            <div className="flex gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" aria-label={`Zobrazit detail objednávky ${order.id}`}>
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <OrderDetailDialog order={order} />
                                                </Dialog>
                                                {order.packeta_barcode && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-green-700 hover:text-green-800 hover:bg-green-50"
                                                        onClick={() => window.open(`/api/get-packeta-label?barcode=${order.packeta_barcode}`, '_blank')}
                                                        aria-label={`Tisk štítku Zásilkovny pro objednávku ${order.id}`}
                                                        title="Tisk štítku Zásilkovny"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <InvoiceModal order={order}>
                                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-700 hover:text-slate-900 hover:bg-slate-100" aria-label={`Zobrazit fakturu pro objednávku ${order.id}`}>
                                                        <FileText className="h-4 w-4" />
                                                    </Button>
                                                </InvoiceModal>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
