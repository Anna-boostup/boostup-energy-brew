import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
                title: enabled ? content?.admin?.dashboard?.salesActive : content?.admin?.dashboard?.salesPaused,
                description: enabled ? content?.admin?.dashboard?.salesActiveDesc : content?.admin?.dashboard?.salesPausedDesc,
            });
        } catch (error: any) {
            toast({
                title: content?.admin?.dashboard?.updateError || "Error",
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
                <Loader2 data-testid="admin-loader" className="w-12 h-12 animate-spin text-white" />
                <p className="text-muted-foreground font-medium animate-pulse">{content?.admin?.auth?.verifying || "Loading..."}</p>
            </div>
        );
    }

    const isSalesEnabled = content?.isSalesEnabled !== false; // Default to true

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-5 duration-1000">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
                <div>
                    <h2 data-testid="admin-page-title" className="text-4xl sm:text-6xl font-black tracking-tighter text-olive-dark font-display leading-tight">{content?.admin?.dashboard?.title}</h2>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex -space-x-1">
                            <div className="w-2 h-2 rounded-full bg-lime" />
                            <div className="w-2 h-2 rounded-full bg-lime/40" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-olive/40 leading-none">{content?.admin?.dashboard?.welcome}</p>
                    </div>
                </div>
                

                {/* Sales Toggle Control — conspicuous shop status */}
                <div className={`flex items-center gap-5 p-3 pl-6 rounded-[2rem] border-2 transition-all duration-500 ${
                    isSalesEnabled
                    ? 'bg-lime border-lime shadow-xl shadow-lime/20'
                    : 'bg-terracotta border-terracotta shadow-xl shadow-terracotta/20'
                }`}>
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-1.5 ${
                            isSalesEnabled ? 'text-olive-dark/50' : 'text-cream/60'
                        }`}>{content?.admin?.dashboard?.salesStatus}</span>
                        <span className={`text-xl font-black uppercase tracking-tighter leading-none ${
                            isSalesEnabled ? 'text-olive-dark' : 'text-cream'
                        }`}>
                            {isSalesEnabled ? content?.admin?.dashboard?.salesActive : content?.admin?.dashboard?.salesPaused}
                        </span>
                    </div>
                    <div className={`flex items-center p-1.5 rounded-[1.5rem] shadow-inner ${
                        isSalesEnabled ? 'bg-olive-dark/20' : 'bg-cream/20'
                    }`}>
                        {isUpdating ? (
                            <div className="px-5 py-2">
                                <Loader2 className={`w-5 h-5 animate-spin ${
                                    isSalesEnabled ? 'text-olive-dark' : 'text-cream'
                                }`} />
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 px-3 py-2">
                                <Switch
                                    id="sales-toggle"
                                    checked={isSalesEnabled}
                                    onCheckedChange={toggleSales}
                                    disabled={isUpdating}
                                    className="data-[state=checked]:bg-olive-dark data-[state=unchecked]:bg-cream/30 h-7 w-12"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass-dark rounded-[2.5rem] p-6 sm:p-8 relative overflow-hidden group border-white/5">
                    <div className="absolute -top-6 -right-6 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                        <DollarSign className="w-48 h-48 text-white" />
                    </div>
                    <CardHeader className="p-0 relative z-10">
                        <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">{content?.admin?.dashboard?.revenue}</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 pt-4 p-0">
                        <div className="text-3xl sm:text-5xl font-black text-white font-display tracking-tighter mb-1">
                            {(totalRevenue || 0).toLocaleString(content?.lang === 'en' ? 'en-US' : 'cs-CZ')} <span className="text-white text-lg sm:text-2xl ml-1">{content?.bankInfo?.currency}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-[2px] bg-lime/30" />
                            <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">{content?.admin?.dashboard?.revenueDesc}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-3 rounded-[2.5rem] glass-card overflow-hidden transition-all duration-500 hover:shadow-2xl">
                    <CardHeader className="pb-4 pt-6 sm:pt-10 px-6 sm:px-10">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-olive-dark" />
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-muted">{content?.admin?.dashboard?.workflow}</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 sm:px-10 pb-6 sm:pb-10">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-12">
                            <div className="relative group/stat">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted mb-3 ml-1">{content?.admin?.dashboard?.newOrders}</p>
                                <div className="text-4xl sm:text-5xl font-black text-olive-dark font-display leading-none group-hover:scale-105 transition-transform duration-300">{newOrdersCount}</div>
                                <div className="mt-4 inline-flex items-center px-4 py-1.5 rounded-full bg-lime text-olive-dark text-[9px] font-black shadow-lg shadow-lime/20">
                                    +{todayOrders} {content?.admin?.dashboard?.todayLabel}
                                </div>
                            </div>
                            <div className="group/stat">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted mb-3 ml-1">{content?.admin?.dashboard?.processing}</p>
                                <div className="text-4xl sm:text-5xl font-black text-olive-dark font-display leading-none group-hover:scale-105 transition-transform duration-300">{processingCount}</div>
                                <div className="w-6 h-1 bg-olive/10 mt-5 rounded-full" />
                            </div>
                            <div className="group/stat">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted mb-3 ml-1">{content?.admin?.dashboard?.shipped}</p>
                                <div className="text-4xl sm:text-5xl font-black text-olive-dark font-display leading-none group-hover:scale-105 transition-transform duration-300">{shippedCount}</div>
                                <div className="w-6 h-1 bg-lime mt-5 rounded-full" />
                            </div>
                            <div className="group/stat opacity-40 grayscale-[0.5]">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/60 mb-3 ml-1">{content?.admin?.dashboard?.cancelled}</p>
                                <div className="text-4xl sm:text-5xl font-black text-olive-dark font-display leading-none">{cancelledCount}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1 md:col-span-4 rounded-[2.5rem] glass-card border-none overflow-hidden shadow-2xl">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
                            <div className="p-6 sm:p-10 border-b sm:border-b-0 sm:border-r border-olive/5 bg-olive-dark text-white flex flex-col justify-center">
                                <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-3 mb-4">
                                    <Package className="w-4 h-4" /> {content?.admin?.dashboard?.inventory}
                                </Label>
                                <p className="text-[10px] text-white/40 font-bold leading-relaxed uppercase tracking-widest">{content?.admin?.inventory?.description}</p>
                            </div>
                            <div className="p-6 sm:p-10 flex flex-col justify-center border-b sm:border-b-0 sm:border-r border-olive/5 hover:bg-olive-dark/5 transition-all group">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-olive/40 mb-3">{content?.admin?.inventory?.lemon}</span>
                                <div className="flex items-end gap-2 group-hover:scale-110 transition-transform duration-500 origin-left">
                                    <span className="text-3xl sm:text-5xl font-black text-olive-dark font-display leading-none">{stock['lemon'] || 0}</span>
                                    <span className="text-[11px] font-black text-olive/30 mb-1">{content?.admin?.dashboard?.unitKs}</span>
                                </div>
                            </div>
                            <div className="p-6 sm:p-10 flex flex-col justify-center border-b md:border-b-0 md:border-r border-olive/5 hover:bg-olive-dark/5 transition-all group">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-olive/40 mb-3 text-red-700">{content?.admin?.inventory?.red}</span>
                                <div className="flex items-end gap-2 group-hover:scale-110 transition-transform duration-500 origin-left">
                                    <span className="text-3xl sm:text-5xl font-black text-olive-dark font-display leading-none">{stock['red'] || 0}</span>
                                    <span className="text-[11px] font-black text-olive/30 mb-1">{content?.admin?.dashboard?.unitKs}</span>
                                </div>
                            </div>
                            <div className="p-6 sm:p-10 flex flex-col justify-center hover:bg-olive-dark/5 transition-all group">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-olive/40 mb-3">{content?.admin?.inventory?.silky}</span>
                                <div className="flex items-end gap-2 group-hover:scale-110 transition-transform duration-500 origin-left">
                                    <span className="text-3xl sm:text-5xl font-black text-olive-dark font-display leading-none">{stock['silky'] || 0}</span>
                                    <span className="text-[11px] font-black text-olive/30 mb-1">{content?.admin?.dashboard?.unitKs}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-7 overflow-hidden rounded-[2.5rem] sm:rounded-[4rem] glass-card border-none shadow-2xl">
                    <CardHeader className="bg-white/40 backdrop-blur-md py-6 sm:py-10 px-6 sm:px-12 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-olive/5 gap-6">
                        <div>
                            <CardTitle className="text-xl sm:text-2xl font-black text-olive-dark font-display leading-tight">{content?.admin?.dashboard?.recentOrders}</CardTitle>
                            <CardDescription className="text-[10px] font-black text-brand-muted mt-2 uppercase tracking-[0.2em]">{content?.admin?.dashboard?.recentOrdersDesc}</CardDescription>
                        </div>
                        <Button variant="outline" className="rounded-2xl font-black text-[10px] uppercase tracking-widest border-olive/10 h-12 sm:h-14 px-6 sm:px-8 hover:bg-olive-dark hover:text-white transition-all duration-300 shadow-xl shadow-olive/5 w-full sm:w-auto" onClick={() => window.location.hash = '/admin/orders'}>
                            {content?.admin?.dashboard?.viewAll}
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        {orders.length === 0 ? (
                            <div className="p-20 text-center flex flex-col items-center justify-center gap-4">
                                <ShoppingBag className="w-12 h-12 text-background" />
                                <p className="text-olive/40 font-bold uppercase text-xs tracking-widest">{content?.admin?.dashboard?.noOrders}</p>
                            </div>
                        ) : (
                            <div className="divide-y-2 divide-olive/8">
                                {orders.slice(0, 10).map((order, index) => (
                                    <div
                                        key={order.id}
                                        className={`flex flex-col xl:flex-row xl:items-center justify-between p-6 sm:p-10 transition-all duration-300 gap-8 group hover:bg-white/80 ${
                                            index % 2 === 0 ? 'bg-white/30' : 'bg-cream/60'
                                        }`}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-4 mb-4">
                                                <span className="font-mono font-black text-[11px] text-white bg-olive-dark px-3 py-1.5 rounded-xl tracking-tighter uppercase whitespace-nowrap shadow-xl shadow-olive-dark/10">
                                                    #{order.id.slice(0, 8)}
                                                </span>
                                                <span className="text-[10px] font-black text-olive/20 uppercase tracking-[0.3em] flex items-center gap-2">
                                                    <div className="w-1 h-1 rounded-full bg-lime" />
                                                    {new Date(order.date).toLocaleDateString(content?.lang === 'en' ? 'en-US' : 'cs-CZ', { day: 'numeric', month: 'long' })}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <h4 className="text-xl sm:text-2xl font-black text-olive-dark group-hover:scale-105 origin-left transition-transform duration-500">{order.customer.name}</h4>
                                                <span className="text-[10px] sm:text-xs font-bold text-brand-muted mt-1 group-hover:text-olive-dark transition-colors">{order.customer.email}</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-between xl:justify-end gap-x-12 gap-y-6 shrink-0">
                                            <div className="flex flex-col items-start xl:items-end gap-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/20">{content?.admin?.dashboard?.paymentLabel}</span>
                                                    <Badge className={`text-[10px] h-7 px-4 rounded-xl font-black border-none shadow-lg ${
                                                        order.status === 'pending' 
                                                            ? 'bg-orange/10 text-orange' 
                                                            : 'bg-lime text-olive-dark shadow-lime/20'
                                                    }`}>
                                                        {order.status === 'pending' ? content?.admin?.dashboard?.paymentPending : content?.admin?.dashboard?.paymentPaid}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/20">{content?.admin?.dashboard?.statusLabel}</span>
                                                    <Badge className={`text-[10px] h-7 px-4 rounded-xl font-black border-none shadow-lg ${
                                                        order.status === 'shipped' ? 'bg-olive-dark text-white' :
                                                        order.status === 'processing' ? 'bg-olive-light text-white' :
                                                        order.status === 'cancelled' ? 'bg-olive/10 text-olive/40' :
                                                        'bg-lime/20 text-olive-dark'
                                                    }`}>
                                                        {order.status === 'shipped' ? content?.admin?.dashboard?.statusShipped :
                                                            order.status === 'processing' ? content?.admin?.dashboard?.statusProcessing :
                                                                order.status === 'cancelled' ? content?.admin?.dashboard?.statusCancelled :
                                                                    content?.admin?.dashboard?.statusReceived}
                                                    </Badge>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-start xl:items-end">
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted leading-none mb-2">{content?.admin?.dashboard?.amountLabel}</span>
                                                <span className="text-3xl font-black text-olive-dark font-display leading-none">{(order.total || 0).toLocaleString(content?.lang === 'en' ? 'en-US' : 'cs-CZ')} <span className="text-sm font-bold text-olive/20 tracking-normal ml-1">{content?.bankInfo?.currency}</span></span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" className="h-16 w-16 rounded-[1.5rem] border-olive/10 hover:bg-olive-dark hover:text-white transition-all duration-500 shadow-lg shadow-olive/5">
                                                            <Eye className="h-6 w-6" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <OrderDetailDialog order={order} />
                                                </Dialog>
                                                
                                                <InvoiceModal order={order}>
                                                    <Button variant="outline" className="h-16 w-16 rounded-[1.5rem] border-olive/10 hover:bg-white text-olive/40 hover:text-olive-dark transition-all duration-500 shadow-lg shadow-olive/5">
                                                        <FileText className="h-6 w-6" />
                                                    </Button>
                                                </InvoiceModal>

                                                {order.packeta_barcode && (
                                                    <Button
                                                        variant="outline"
                                                        className="h-16 w-16 rounded-[1.5rem] bg-lime text-olive-dark border-none hover:bg-lime/80 transition-all duration-500 shadow-xl shadow-lime/20"
                                                        onClick={() => window.open(`/api/get-packeta-label?packetId=${order.packeta_packet_id}`, '_blank')}
                                                        title={content?.admin?.orders?.packetaLabel}
                                                    >
                                                        <Printer className="h-6 w-6" />
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
