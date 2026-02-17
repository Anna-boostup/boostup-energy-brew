
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, Users } from "lucide-react";
import { useInventory } from "@/context/InventoryContext";
import InvoiceModal from "@/components/admin/InvoiceModal";

const AdminDashboard = () => {
    const { stock, orders } = useInventory();
    const totalStock = Object.values(stock).reduce((a, b) => a + b, 0);
    const lowStockItems = Object.entries(stock).filter(([_, qty]) => qty < 10).length;

    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const todayOrders = orders.filter(o => new Date(o.date).toDateString() === new Date().toDateString()).length;

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Přehled</h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Celkové tržby</CardTitle>
                        <span className="font-bold text-muted-foreground">Kč</span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalRevenue} Kč</div>
                        <p className="text-xs text-muted-foreground">Lokální data</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Objednávky</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{orders.length}</div>
                        <p className="text-xs text-muted-foreground">+{todayOrders} dnes</p>
                    </CardContent>
                </Card>
                <Card className="col-span-1 md:col-span-2">
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
                            <p className="text-muted-foreground">Zatím žádné objednávky.</p>
                        ) : (
                            <div className="space-y-4">
                                {orders.slice(0, 10).map((order) => (
                                    <div key={order.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                        <div className="grid gap-1">
                                            <p className="font-bold text-sm">#{order.id}</p>
                                            <p className="text-xs text-muted-foreground">{order.customer.name} ({order.customer.email})</p>
                                            <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-sm">{order.total} Kč</p>
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Zaplaceno
                                                </span>
                                            </div>
                                            <InvoiceModal order={order} />
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
