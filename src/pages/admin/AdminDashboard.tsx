import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Package, Users, Printer, Eye, FileText } from "lucide-react";
import { useInventory, Order } from "@/context/InventoryContext";
import { useContent } from "@/context/ContentContext";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import InvoiceModal from "@/components/admin/InvoiceModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { OrderDetailDialog } from "@/components/orders/OrderDetailDialog";
import { AlertCircle, CheckCircle2, Loader2, Power } from "lucide-react";
import { useState } from "react";

const AdminDashboard = () => {
    const { orders, totalRevenue, stock } = useInventory();
    const { content, refreshContent } = useContent();
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);

    const toggleSales = async (enabled: boolean) => {
        setIsUpdating(true);
        try {
            const newContent = {
                ...content,
                isSalesEnabled: enabled
            };

            const { error } = await supabase
                .from('site_content')
                .upsert({ 
                    id: 'main', 
                    content: newContent,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            await refreshContent();
            toast({
                title: enabled ? "Prodej zapnut" : "Prodej vypnut",
                description: enabled ? "Konfigurátor byl aktivován." : "Konfigurátor byl dočasně deaktivován.",
            });
        } catch (error: any) {
            toast({
                title: "Chyba při aktualizaci",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const isSalesEnabled = content.isSalesEnabled !== false; // Default to true

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-3xl font-bold tracking-tight">Přehled</h2>
                
                {/* Sales Toggle Control */}
                <div className={`flex items-center gap-4 p-2 px-4 rounded-2xl border-2 transition-all ${isSalesEnabled ? 'bg-lime/5 border-lime/20' : 'bg-red-50 border-red-200 shadow-lg shadow-red-200/20'}`}>
                    <div className="flex flex-col">
                        <Label htmlFor="sales-toggle" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                            STAV PRODEJE
                        </Label>
                        <div className="flex items-center gap-2">
                            {isSalesEnabled ? (
                                <CheckCircle2 className="w-4 h-4 text-lime-600" />
                            ) : (
                                <AlertCircle className="w-4 h-4 text-red-600 animate-pulse" />
                            )}
                            <span className={`text-sm font-bold uppercase tracking-tight ${isSalesEnabled ? 'text-lime-700' : 'text-red-700'}`}>
                                {isSalesEnabled ? 'AKTIVNÍ' : 'POZASTAVEN'}
                            </span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-border mx-2" />
                    <div className="flex items-center gap-2">
                        {isUpdating ? (
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        ) : (
                            <Switch 
                                id="sales-toggle"
                                checked={isSalesEnabled}
                                onCheckedChange={toggleSales}
                                disabled={isUpdating}
                            />
                        )}
                        <Power className={`w-4 h-4 transition-colors ${isSalesEnabled ? 'text-lime-600' : 'text-red-400'}`} />
                    </div>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-lime/5 border-lime/10">
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
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="min-w-0">
                                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-orange-dark truncate">Nové / Zaplacené</p>
                                <div className="text-xl font-bold font-display">{newOrdersCount}</div>
                                <p className="text-[10px] text-foreground/70">+{todayOrders} dnes</p>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-olive truncate">Rozpracované</p>
                                <div className="text-xl font-bold font-display">{processingCount}</div>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-lime-dark truncate">Vyřízené</p>
                                <div className="text-xl font-bold font-display">{shippedCount}</div>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground truncate">Stornované</p>
                                <div className="text-xl font-bold font-display">{cancelledCount}</div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-lemon" />
                                    Lemon Blast
                                </p>
                                <div className="text-2xl font-bold font-display mt-1">{stock['lemon'] || 0}</div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-rush" />
                                    Red Rush
                                </p>
                                <div className="text-2xl font-bold font-display mt-1">{stock['red'] || 0}</div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-silky-leaf" />
                                    Silky Leaf
                                </p>
                                <div className="text-2xl font-bold font-display mt-1">{stock['silky'] || 0}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-7 overflow-hidden">
                    <CardHeader className="border-b bg-slate-50/50 py-4">
                        <CardTitle className="text-lg">Nedávné objednávky</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {orders.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">Zatím žádné objednávky.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {orders.slice(0, 10).map((order) => (
                                    <div key={order.id} className="flex flex-col xl:flex-row xl:items-center justify-between p-4 sm:p-6 hover:bg-slate-50/50 transition-colors gap-5">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-sm text-slate-900 font-display">#{order.id}</span>
                                                <Badge variant="outline" className="text-[10px] py-0 font-normal border-slate-200">
                                                    {new Date(order.date).toLocaleDateString('cs-CZ')}
                                                </Badge>
                                            </div>
                                            <p className="text-sm font-medium text-slate-700 truncate">{order.customer.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{order.customer.email}</p>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center justify-between xl:justify-end gap-x-6 gap-y-3 shrink-0">
                                            <div className="flex flex-col gap-1.5 items-start xl:items-end">
                                                <Badge
                                                    variant={order.status === 'pending' ? 'outline' : 'secondary'}
                                                    className={`text-[10px] px-2.5 py-0.5 rounded-md ${
                                                        order.status === 'pending' 
                                                            ? 'border-orange-500/30 text-orange-600 bg-orange-50' 
                                                            : 'bg-emerald-50 text-emerald-700 border- emerald-500/20'
                                                    }`}
                                                >
                                                    {order.status === 'pending' ? 'Platba: Čeká' : 'Platba: Zaplaceno'}
                                                </Badge>
                                                <Badge
                                                    variant={order.status === 'shipped' ? 'default' : 'outline'}
                                                    className={`text-[10px] px-2.5 py-0.5 rounded-md ${
                                                        order.status === 'shipped' ? 'bg-slate-900 text-white' :
                                                        order.status === 'processing' ? 'text-olive-700 bg-olive-50 border-olive-500/20' :
                                                        order.status === 'cancelled' ? 'text-slate-500 bg-slate-100' :
                                                        'text-orange-700 bg-orange-50 border-orange-500/20'
                                                    }`}
                                                >
                                                    {order.status === 'shipped' ? 'Stav: Vyřízena' :
                                                        order.status === 'processing' ? 'Stav: Rozpracováno' :
                                                            order.status === 'cancelled' ? 'Stav: Stornováno' :
                                                                'Stav: Čeká k vyřízení'}
                                                </Badge>
                                            </div>
                                            
                                            <div className="flex items-center gap-1">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button size="sm" variant="outline" className="h-9 w-9 p-0 hover:bg-slate-100 border-slate-200" aria-label={`Zobrazit detail objednávky ${order.id}`}>
                                                            <Eye className="h-4.5 w-4.5 text-slate-600" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <OrderDetailDialog order={order} />
                                                </Dialog>
                                                {order.packeta_barcode && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-9 w-9 p-0 text-olive-600 hover:text-white hover:bg-olive-600 border-olive-200"
                                                        onClick={() => window.open(`/api/get-packeta-label?barcode=${order.packeta_barcode}`, '_blank')}
                                                        title="Tisk štítku Zásilkovny"
                                                    >
                                                        <Printer className="h-4.5 w-4.5" />
                                                    </Button>
                                                )}
                                                <InvoiceModal order={order}>
                                                    <Button size="sm" variant="outline" className="h-9 w-9 p-0 text-slate-400 hover:text-slate-900 border-slate-200 hover:bg-slate-100" aria-label={`Zobrazit fakturu pro objednávku ${order.id}`}>
                                                        <FileText className="h-4.5 w-4.5" />
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
