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
    const { orders = [], stock = {}, loading: inventoryLoading } = useInventory() || { orders: [], stock: {}, loading: true };
    const { content, loading: contentLoading, refreshContent } = useContent();
    const { toast } = useToast();
    const [isUpdating, setIsUpdating] = useState(false);

    const isLoading = inventoryLoading || contentLoading || !content;

    // Calculate stats
    const totalRevenue = (orders || []).reduce((sum, order) => (order && order.status !== 'cancelled') ? sum + (Number(order.total) || 0) : sum, 0);
    const newOrdersCount = (orders || []).filter(o => o && (o.status === 'pending' || o.status === 'paid')).length;
    const processingCount = (orders || []).filter(o => o && o.status === 'processing').length;
    const shippedCount = (orders || []).filter(o => o && o.status === 'shipped').length;
    const cancelledCount = (orders || []).filter(o => o && o.status === 'cancelled').length;
    
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = (orders || []).filter(o => o && o.date?.startsWith(today)).length;

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

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-lime-600" />
                <p className="text-muted-foreground font-medium animate-pulse">Načítám administraci...</p>
            </div>
        );
    }

    const isSalesEnabled = content.isSalesEnabled !== false; // Default to true

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 font-display">Dashboard</h2>
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Vítejte zpět, pane správce.</p>
                </div>
                
                {/* Sales Toggle Control */}
                <div className={`group flex items-center gap-5 p-3 px-6 rounded-[2rem] border-2 transition-all duration-300 ${isSalesEnabled ? 'bg-white border-primary shadow-lg shadow-primary/10' : 'bg-red-50 border-red-200 shadow-xl shadow-red-200/20'}`}>
                    <div className="flex flex-col">
                        <Label htmlFor="sales-toggle" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1 leading-none">
                            Příjem objednávek
                        </Label>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isSalesEnabled ? 'bg-primary animate-pulse' : 'bg-red-500'}`} />
                            <span className={`text-sm font-black uppercase tracking-tighter ${isSalesEnabled ? 'text-slate-900' : 'text-red-700'}`}>
                                {isSalesEnabled ? 'PRODEJ BĚŽÍ' : 'POZASTAVENO'}
                            </span>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-slate-100 mx-1" />
                    <div className="flex items-center gap-3">
                        {isUpdating ? (
                            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                        ) : (
                            <Switch 
                                id="sales-toggle"
                                checked={isSalesEnabled}
                                onCheckedChange={toggleSales}
                                disabled={isUpdating}
                                className="data-[state=checked]:bg-primary h-7 w-12"
                            />
                        )}
                        <Power className={`w-5 h-5 transition-colors duration-300 ${isSalesEnabled ? 'text-primary' : 'text-red-300'}`} />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-slate-900 border-none rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <DollarSign className="w-24 h-24 text-primary" />
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Celkové tržby</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-black text-white font-display tracking-tighter">
                            {(totalRevenue || 0).toLocaleString('cs-CZ')} <span className="text-primary text-xl ml-1">Kč</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-widest">Za celou dobu existence</p>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-3 rounded-[2.5rem] bg-white/50 backdrop-blur-sm border border-white/40 shadow-sm overflow-hidden">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-900" />
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Přehled stavů</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="relative">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Nové / Placené</p>
                                <div className="text-3xl font-black text-slate-900 font-display leading-none">{newOrdersCount}</div>
                                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark text-[10px] font-black">
                                    +{todayOrders} DNES
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Ve výrobě</p>
                                <div className="text-3xl font-black text-slate-900 font-display leading-none">{processingCount}</div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Odesláno</p>
                                <div className="text-3xl font-black text-slate-900 font-display leading-none">{shippedCount}</div>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Zrušeno</p>
                                <div className="text-3xl font-black text-slate-300 font-display leading-none">{cancelledCount}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-4 rounded-[2.5rem] bg-white border border-white shadow-xl shadow-slate-200/50 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-4">
                            <div className="p-8 border-r border-slate-50 bg-slate-50/30">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 mb-4">
                                    <Package className="w-3 h-3" /> Stav skladu
                                </Label>
                                <p className="text-xs text-slate-500 font-medium leading-relaxed">Aktuální počty hotových lahviček připravených k expedici.</p>
                            </div>
                            <div className="p-8 flex flex-col justify-center border-r border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <span className="text-[10px] font-black uppercase tracking-widest text-yellow-600 mb-1">Lemon Blast</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-slate-900 font-display leading-none">{stock['lemon'] || 0}</span>
                                    <span className="text-[10px] font-black text-slate-400 mb-1">KS</span>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col justify-center border-r border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-1">Red Rush</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-slate-900 font-display leading-none">{stock['red'] || 0}</span>
                                    <span className="text-[10px] font-black text-slate-400 mb-1">KS</span>
                                </div>
                            </div>
                            <div className="p-8 flex flex-col justify-center hover:bg-slate-50/50 transition-colors">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Silky Leaf</span>
                                <div className="flex items-end gap-2">
                                    <span className="text-4xl font-black text-slate-900 font-display leading-none">{stock['silky'] || 0}</span>
                                    <span className="text-[10px] font-black text-slate-400 mb-1">KS</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-7 overflow-hidden rounded-[3rem] border border-white/40 bg-white/50 backdrop-blur-sm shadow-sm">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-8 px-10 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black text-slate-900 font-display">Nedávné objednávky</CardTitle>
                            <CardDescription className="text-xs font-medium text-slate-400 mt-1">Posledních 10 transakcí na e-shopu.</CardDescription>
                        </div>
                        <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200" onClick={() => window.location.hash = '/admin/orders'}>
                            Zobrazit vše
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {orders.length === 0 ? (
                            <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                                <ShoppingBag className="w-12 h-12 text-slate-200" />
                                <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Žádné aktivní objednávky</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {orders.slice(0, 10).map((order) => (
                                    <div key={order.id} className="flex flex-col xl:flex-row xl:items-center justify-between p-6 sm:p-8 hover:bg-white/80 transition-all duration-300 gap-8 group">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="font-mono font-black text-[10px] text-primary bg-slate-900 px-2 py-0.5 rounded-md tracking-tighter uppercase whitespace-nowrap shadow-lg shadow-slate-900/10">
                                                    {order.id}
                                                </span>
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                    {new Date(order.date).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="text-lg font-black text-slate-900 group-hover:text-primary-dark transition-colors">{order.customer.name}</h4>
                                                <span className="text-xs font-bold text-slate-400 group-hover:text-slate-500 transition-colors">{order.customer.email}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex flex-wrap items-center justify-between xl:justify-end gap-x-10 gap-y-4 shrink-0">
                                            <div className="flex flex-col items-start xl:items-end gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Platba:</span>
                                                    <Badge className={`text-[10px] h-6 px-3 rounded-lg font-black border-none shadow-sm ${
                                                        order.status === 'pending' 
                                                            ? 'bg-orange-50 text-orange-600' 
                                                            : 'bg-primary/10 text-primary-dark'
                                                    }`}>
                                                        {order.status === 'pending' ? 'ČEKÁ' : 'ZAPLACENO'}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Status:</span>
                                                    <Badge className={`text-[10px] h-6 px-3 rounded-lg font-black border-none shadow-sm ${
                                                        order.status === 'shipped' ? 'bg-slate-900 text-white' :
                                                        order.status === 'processing' ? 'bg-indigo-50 text-indigo-600' :
                                                        order.status === 'cancelled' ? 'bg-slate-100 text-slate-500' :
                                                        'bg-orange-50 text-orange-600 shadow-orange-500/10'
                                                    }`}>
                                                        {order.status === 'shipped' ? 'VYŘÍZENO' :
                                                            order.status === 'processing' ? 'VÝROBA' :
                                                                order.status === 'cancelled' ? 'STORNO' :
                                                                    'PŘIJATO'}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start xl:items-end">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Částka</span>
                                                <span className="text-2xl font-black text-slate-900 font-display">{(order.total || 0).toLocaleString('cs-CZ')} <span className="text-sm font-bold text-slate-400">Kč</span></span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" className="h-12 w-12 rounded-2xl border-slate-200 hover:bg-slate-900 hover:text-white transition-all duration-300">
                                                            <Eye className="h-5 w-5" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <OrderDetailDialog order={order} />
                                                </Dialog>
                                                
                                                <InvoiceModal order={order}>
                                                    <Button variant="outline" className="h-12 w-12 rounded-2xl border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all">
                                                        <FileText className="h-5 w-5" />
                                                    </Button>
                                                </InvoiceModal>

                                                {order.packeta_barcode && (
                                                    <Button
                                                        variant="outline"
                                                        className="h-12 w-12 rounded-2xl border-slate-200 text-primary-dark hover:bg-primary/20 bg-primary/5 transition-all"
                                                        onClick={() => window.open(`/api/get-packeta-label?barcode=${order.packeta_barcode}`, '_blank')}
                                                        title="Štítek Packeta"
                                                    >
                                                        <Printer className="h-5 w-5" />
                                                    </Button>
                                                )}
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
