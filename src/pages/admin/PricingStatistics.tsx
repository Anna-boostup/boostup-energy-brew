import React, { useMemo, useState } from 'react';
import { useInventory } from "@/context/InventoryContext";
import { useContent } from "@/context/ContentContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, Save, Loader2, ShoppingCart } from "lucide-react";
import { format, parseISO, subDays } from 'date-fns';
import { cs } from 'date-fns/locale';

const PricingStatistics = () => {
    const { orders, loading: inventoryLoading } = useInventory();
    const { content, loading: contentLoading, refreshContent } = useContent();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // Pricing form state
    const [prices, setPrices] = useState({
        pack3: content?.pricing?.pack3 || 229,
        pack12: content?.pricing?.pack12 || 849,
        pack21: content?.pricing?.pack21 || 1399
    });

    // Handle price save
    const handleSavePrices = async () => {
        setIsSaving(true);
        try {
            const newContent = {
                ...content,
                pricing: prices
            };

            const { error: contentError } = await supabase
                .from('site_content')
                .upsert({ 
                    id: 'main', 
                    content: newContent,
                    updated_at: new Date().toISOString()
                });

            if (contentError) throw contentError;

            // Propagate prices to the products table for individual pack SKUs
            const packUpdates = [
                { suffix: '-3', price: prices.pack3 },
                { suffix: '-12', price: prices.pack12 },
                { suffix: '-21', price: prices.pack21 }
            ];

            for (const update of packUpdates) {
                const { error: productError } = await supabase
                    .from('products')
                    .update({ price: update.price })
                    .like('sku', `%${update.suffix}`);
                
                if (productError) console.error(`Error updating prices for ${update.suffix}:`, productError);
            }

            await refreshContent();
            toast({
                title: content?.admin?.pricing?.card?.success,
                description: content?.admin?.pricing?.card?.successDesc,
            });
        } catch (error: any) {
            toast({
                title: content?.admin?.pricing?.card?.errorTitle,
                description: content?.admin?.pricing?.card?.errorDesc,
                variant: "destructive"
            });
        } finally {
            setIsSaving(false);
        }
    };

    const ActionBar = () => (
        <div className="fixed bottom-6 left-4 right-4 z-50 sm:hidden">
            <div className="bg-olive-dark/95 backdrop-blur-xl rounded-3xl p-3 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-lime">
                        <TrendingUp className="h-5 w-5" />
                    </div>
                </div>
                <Button 
                    onClick={handleSavePrices} 
                    disabled={isSaving}
                    className="flex-1 h-12 rounded-2xl bg-lime hover:bg-lime/90 text-olive-dark font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-[0.97] transition-all gap-2"
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {content?.admin?.pricing?.card?.saveTitle || "Save Prices"}
                </Button>
            </div>
        </div>
    );

    // --- Statistics Data Processing ---
    const statsData = useMemo(() => {
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const d = subDays(new Date(), i);
            return format(d, 'yyyy-MM-dd');
        }).reverse();

        const dataMap = new Map();
        
        last30Days.forEach(date => {
            dataMap.set(date, {
                date,
                label: format(parseISO(date), 'd. MMM', { locale: content?.lang === 'cs' ? cs : undefined }),
                orders: 0,
                onlineOrders: 0,
                promoOrders: 0,
                manualOrders: 0,
                lemon: 0,
                red: 0,
                silky: 0,
                totalUnits: 0
            });
        });

        orders.forEach(order => {
            const orderDate = format(parseISO(order.date), 'yyyy-MM-dd');
            if (dataMap.has(orderDate)) {
                const dayData = dataMap.get(orderDate);
                dayData.orders += 1;

                const isPromo = order.delivery_info?.paymentMethod === 'promo';
                const isManual = order.id?.startsWith('MAN-') && !isPromo;
                const isOnline = !order.id?.startsWith('MAN-') && !isPromo;

                if (isOnline) dayData.onlineOrders += 1;
                else if (isPromo) dayData.promoOrders += 1;
                else if (isManual) dayData.manualOrders += 1;
                
                order.items.forEach(item => {
                    const sku = item.sku.toLowerCase();
                    const qty = item.quantity;
                    
                    // Count by size (units)
                    const sizeMatch = sku.match(/-(\d+)$/);
                    const unitsPerPack = sizeMatch ? parseInt(sizeMatch[1]) : 1;
                    const totalUnits = qty * unitsPerPack;
                    
                    dayData.totalUnits += totalUnits;

                    if (sku.includes('lemon')) dayData.lemon += totalUnits;
                    else if (sku.includes('red')) dayData.red += totalUnits;
                    else if (sku.includes('silky')) dayData.silky += totalUnits;
                    // For mixed packs, use mixConfiguration if available, or just ignore for flavored chart
                    else if (sku.includes('mix') && item.mixConfiguration) {
                        dayData.lemon += (item.mixConfiguration.lemon || 0) * qty;
                        dayData.red += (item.mixConfiguration.red || 0) * qty;
                        dayData.silky += (item.mixConfiguration.silky || 0) * qty;
                    }
                });
            }
        });

        return Array.from(dataMap.values());
    }, [orders, content]);

    // Compute lifetime category totals (excluding cancelled orders)
    const categoryTotals = useMemo(() => {
        let onlineCount = 0;
        let onlineRevenue = 0;
        let onlineUnits = 0;

        let promoCount = 0;
        let promoRevenue = 0;
        let promoUnits = 0;

        let manualCount = 0;
        let manualRevenue = 0;
        let manualUnits = 0;

        orders.forEach(order => {
            if (order.status === 'cancelled') return;

            const isPromo = order.delivery_info?.paymentMethod === 'promo';
            const isManual = order.id?.startsWith('MAN-') && !isPromo;
            const isOnline = !order.id?.startsWith('MAN-') && !isPromo;

            let orderUnits = 0;
            order.items.forEach(item => {
                const sku = item.sku.toLowerCase();
                const sizeMatch = sku.match(/-(\d+)$/);
                const unitsPerPack = sizeMatch ? parseInt(sizeMatch[1]) : 1;
                orderUnits += item.quantity * unitsPerPack;
            });

            const totalValue = Number(order.total) || 0;

            if (isOnline) {
                onlineCount++;
                onlineRevenue += totalValue;
                onlineUnits += orderUnits;
            } else if (isPromo) {
                promoCount++;
                promoRevenue += totalValue;
                promoUnits += orderUnits;
            } else if (isManual) {
                manualCount++;
                manualRevenue += totalValue;
                manualUnits += orderUnits;
            }
        });

        return {
            online: { count: onlineCount, revenue: onlineRevenue, units: onlineUnits },
            promo: { count: promoCount, revenue: promoRevenue, units: promoUnits },
            manual: { count: manualCount, revenue: manualRevenue, units: manualUnits }
        };
    }, [orders]);

    const isLoading = inventoryLoading || contentLoading;

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 data-testid="admin-loader" className="w-12 h-12 animate-spin text-olive-dark" />
                <p className="text-olive-dark font-black uppercase tracking-[0.4em] animate-pulse">{content?.admin?.general?.loading || "Načítám statistiky..."}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 sm:space-y-12 pb-32 animate-in fade-in duration-1000">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-10 flex-wrap">
                <div className="space-y-3 flex-1 min-w-[280px]">
                    <h2 data-testid="admin-page-title" className="text-3xl sm:text-5xl font-black tracking-tighter text-olive-dark font-display uppercase italic leading-none">{content?.admin?.pricing?.title || "Pricing & Stats"}</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        <p className="text-olive-dark/70 font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px] leading-none">{content?.admin?.pricing?.description}</p>
                    </div>
                </div>
                
                <div className="hidden sm:block">
                    <Button onClick={handleSavePrices} disabled={isSaving} className="h-14 px-12 rounded-2xl bg-olive-dark hover:bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-olive-dark/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-3">
                        {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        {content?.admin?.pricing?.card?.saveTitle || "Save Prices"}
                    </Button>
                </div>
            </div>

            {/* Category Breakdown Cards */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 px-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#3d5a2f]">
                        {content?.lang === 'cs' ? "Přehled podle typu prodeje" : "Overview by sales channel"}
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-10">
                    {/* Online Card */}
                    <Card className="border border-white/40 shadow-sm rounded-[2rem] bg-admin-canvas/50 backdrop-blur-sm p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 blur-[40px] -translate-y-1/2 translate-x-1/2" />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3d5a2f]/70">
                                    {content?.admin?.pricing?.stats?.onlineSales || "Prodeje přes net"}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-sky-500/10 text-sky-600 text-[8px] font-black uppercase tracking-widest">
                                    E-shop
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-3xl font-black font-display text-[#3d5a2f]">
                                    {categoryTotals.online.revenue.toLocaleString(content?.lang === 'cs' ? 'cs-CZ' : 'en-US')} {content?.admin?.pricing?.card?.currency || "Kč"}
                                </span>
                                <span className="block text-[9px] text-[#3d5a2f]/50 font-black uppercase tracking-widest">
                                    {content?.admin?.pricing?.stats?.revenueLabel || "Obrat"}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-olive/5">
                                <div>
                                    <span className="block text-lg font-black text-[#3d5a2f]">
                                        {categoryTotals.online.count}
                                    </span>
                                    <span className="block text-[8px] text-[#3d5a2f]/40 font-black uppercase tracking-widest">
                                        {content?.admin?.pricing?.stats?.ordersCountLabel || "Objednávek"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-lg font-black text-[#3d5a2f]">
                                        {categoryTotals.online.units}
                                    </span>
                                    <span className="block text-[8px] text-[#3d5a2f]/40 font-black uppercase tracking-widest">
                                        {content?.admin?.pricing?.stats?.unitsCountLabel || "Kusů"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Manual Orders Card */}
                    <Card className="border border-white/40 shadow-sm rounded-[2rem] bg-admin-canvas/50 backdrop-blur-sm p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 blur-[40px] -translate-y-1/2 translate-x-1/2" />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3d5a2f]/70">
                                    {content?.admin?.pricing?.stats?.manualOrders || "Dopsané objednávky"}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-600 text-[8px] font-black uppercase tracking-widest">
                                    Manuální
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-3xl font-black font-display text-[#3d5a2f]">
                                    {categoryTotals.manual.revenue.toLocaleString(content?.lang === 'cs' ? 'cs-CZ' : 'en-US')} {content?.admin?.pricing?.card?.currency || "Kč"}
                                </span>
                                <span className="block text-[9px] text-[#3d5a2f]/50 font-black uppercase tracking-widest">
                                    {content?.admin?.pricing?.stats?.revenueLabel || "Obrat"}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-olive/5">
                                <div>
                                    <span className="block text-lg font-black text-[#3d5a2f]">
                                        {categoryTotals.manual.count}
                                    </span>
                                    <span className="block text-[8px] text-[#3d5a2f]/40 font-black uppercase tracking-widest">
                                        {content?.admin?.pricing?.stats?.ordersCountLabel || "Objednávek"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-lg font-black text-[#3d5a2f]">
                                        {categoryTotals.manual.units}
                                    </span>
                                    <span className="block text-[8px] text-[#3d5a2f]/40 font-black uppercase tracking-widest">
                                        {content?.admin?.pricing?.stats?.unitsCountLabel || "Kusů"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Promo Gifts Card */}
                    <Card className="border border-white/40 shadow-sm rounded-[2rem] bg-admin-canvas/50 backdrop-blur-sm p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-lime/10 blur-[40px] -translate-y-1/2 translate-x-1/2" />
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#3d5a2f]/70">
                                    {content?.admin?.pricing?.stats?.promoGifts || "Promo dárky"}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-lime/20 text-[#3d5a2f] text-[8px] font-black uppercase tracking-widest">
                                    Promo
                                </span>
                            </div>
                            <div className="space-y-1">
                                <span className="text-3xl font-black font-display text-[#3d5a2f]">
                                    {categoryTotals.promo.units} <span className="text-sm font-bold opacity-60">ks</span>
                                </span>
                                <span className="block text-[9px] text-[#3d5a2f]/50 font-black uppercase tracking-widest">
                                    {content?.admin?.pricing?.stats?.unitsCountLabel || "Kusů"} rozdáno
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-olive/5">
                                <div>
                                    <span className="block text-lg font-black text-[#3d5a2f]">
                                        {categoryTotals.promo.count}
                                    </span>
                                    <span className="block text-[8px] text-[#3d5a2f]/40 font-black uppercase tracking-widest">
                                        {content?.admin?.pricing?.stats?.ordersCountLabel || "Objednávek"}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-lg font-black text-[#3d5a2f]">
                                        {categoryTotals.promo.revenue.toLocaleString(content?.lang === 'cs' ? 'cs-CZ' : 'en-US')} {content?.admin?.pricing?.card?.currency || "Kč"}
                                    </span>
                                    <span className="block text-[8px] text-[#3d5a2f]/40 font-black uppercase tracking-widest">
                                        Hodnota
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
                {/* Pricing Form */}
                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-admin-canvas shadow-olive/10 overflow-hidden group">
                    <CardHeader className="bg-olive-dark p-8 sm:p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-lime/10 blur-[60px] -translate-y-1/2 translate-x-1/2" />
                        <CardTitle className="text-white text-xl font-black uppercase italic tracking-tight flex items-center gap-3 relative z-10">
                            <TrendingUp className="h-5 w-5 text-lime" />
                            {content?.admin?.pricing?.card?.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 sm:p-10 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end px-1">
                                    <Label htmlFor="pack3" className="font-black text-[10px] uppercase tracking-[0.2em] text-olive-dark">{content?.admin?.pricing?.card?.pack3}</Label>
                                    <span className="text-xs font-black text-white bg-olive-dark px-3 py-1 rounded-lg">{(prices.pack3 / 3).toFixed(0)} {content?.admin?.pricing?.card?.perUnit}</span>
                                </div>
                                <div className="relative">
                                        <Input 
                                            id="pack3" 
                                            type="number" 
                                            value={prices.pack3} 
                                            onChange={(e) => setPrices(p => ({ ...p, pack3: parseInt(e.target.value) || 0 }))}
                                            className="h-14 pl-5 rounded-2xl border-background bg-admin-canvas font-display font-black text-xl text-olive-dark focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-olive-dark">{content?.admin?.pricing?.card?.currency}</span>
                                    </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end px-1">
                                    <Label htmlFor="pack12" className="font-black text-[10px] uppercase tracking-[0.2em] text-olive-dark">{content?.admin?.pricing?.card?.pack12}</Label>
                                    <span className="text-xs font-black text-white bg-olive-dark px-3 py-1 rounded-lg">{(prices.pack12 / 12).toFixed(0)} {content?.admin?.pricing?.card?.perUnit}</span>
                                </div>
                                <div className="relative">
                                        <Input 
                                            id="pack12" 
                                            type="number" 
                                            value={prices.pack12} 
                                            onChange={(e) => setPrices(p => ({ ...p, pack12: parseInt(e.target.value) || 0 }))}
                                            className="h-14 pl-5 rounded-2xl border-background bg-admin-canvas font-display font-black text-xl text-olive-dark focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-olive-dark">{content?.admin?.pricing?.card?.currency}</span>
                                    </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end px-1">
                                    <Label htmlFor="pack21" className="font-black text-[10px] uppercase tracking-[0.2em] text-olive-dark">{content?.admin?.pricing?.card?.pack21}</Label>
                                    <span className="text-xs font-black text-white bg-olive-dark px-3 py-1 rounded-lg">{(prices.pack21 / 21).toFixed(0)} {content?.admin?.pricing?.card?.perUnit}</span>
                                </div>
                                <div className="relative">
                                        <Input 
                                            id="pack21" 
                                            type="number" 
                                            value={prices.pack21} 
                                            onChange={(e) => setPrices(p => ({ ...p, pack21: parseInt(e.target.value) || 0 }))}
                                            className="h-14 pl-5 rounded-2xl border-background bg-admin-canvas font-display font-black text-xl text-olive-dark focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-olive-dark">{content?.admin?.pricing?.card?.currency}</span>
                                    </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Stats Card */}
                <Card className="lg:col-span-2 border border-white/40 shadow-sm rounded-[2rem] sm:rounded-[2.5rem] bg-admin-canvas/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                    <CardHeader className="bg-admin-canvas/40 border-b border-olive/8 py-6 sm:py-8 px-6 sm:px-10">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-olive-dark rounded-xl">
                                <ShoppingCart className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl font-black text-olive-dark">{content?.admin?.pricing?.stats?.ordersTitle}</CardTitle>
                        </div>
                        <CardDescription className="text-olive-dark text-[10px] sm:text-xs font-bold uppercase tracking-widest">{content?.admin?.pricing?.stats?.ordersSubtitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8 sm:pt-10 px-4 sm:px-8 h-[300px] sm:h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={statsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="label" 
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#3d5a2f' }} 
                                    axisLine={false}
                                    tickLine={false}
                                    interval={window?.innerWidth < 640 ? 6 : 2}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#3d5a2f' }}
                                    dx={-10}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '20px', 
                                        border: '1px solid #f1f5f9', 
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        padding: '12px 16px',
                                        fontWeight: '900',
                                        fontSize: '12px'
                                    }}
                                    cursor={{ stroke: '#C4F135', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />
                                <Legend 
                                    iconType="circle" 
                                    iconSize={8}
                                    wrapperStyle={{ paddingTop: '10px', fontWeight: '900', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="orders" 
                                    name={content?.admin?.pricing?.stats?.totalOrders || "Celkem"}
                                    stroke="#3d5a2f" 
                                    strokeWidth={4}
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#3d5a2f' }}
                                    animationDuration={2000}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="onlineOrders" 
                                    name={content?.admin?.pricing?.stats?.onlineSales || "Prodeje přes net"}
                                    stroke="#0284c7" 
                                    strokeWidth={3}
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#0284c7' }}
                                    animationDuration={2000}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="manualOrders" 
                                    name={content?.admin?.pricing?.stats?.manualOrders || "Dopsané objednávky"}
                                    stroke="#ea580c" 
                                    strokeWidth={3}
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#ea580c' }}
                                    animationDuration={2000}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="promoOrders" 
                                    name={content?.admin?.pricing?.stats?.promoGifts || "Promo dárky"}
                                    stroke="#84cc16" 
                                    strokeWidth={3}
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 6, strokeWidth: 0, fill: '#84cc16' }}
                                    animationDuration={2000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Units Stats Card */}
                <Card className="lg:col-span-3 border border-white/40 shadow-sm rounded-[2rem] sm:rounded-[2.5rem] bg-admin-canvas/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CardHeader className="bg-olive-dark border-b border-olive/10 py-6 sm:py-8 px-6 sm:px-10">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-primary/20 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl font-black text-white">{content?.admin?.pricing?.stats?.unitsTitle}</CardTitle>
                        </div>
                        <CardDescription className="text-white/60 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{content?.admin?.pricing?.stats?.unitsSubtitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-10 sm:pt-12 px-2 sm:px-10 h-[350px] sm:h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData} barGap={0}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="label" 
                                    tick={{ fontSize: 9, fontWeight: 900, fill: '#3d5a2f' }} 
                                    axisLine={false}
                                    tickLine={false}
                                    interval={window?.innerWidth < 640 ? 6 : 2}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#3d5a2f' }}
                                    dx={-10}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '20px', 
                                        border: '1px solid #f1f5f9', 
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                        padding: '12px 16px',
                                        fontWeight: '900'
                                    }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Legend 
                                    iconType="circle" 
                                    iconSize={8}
                                    wrapperStyle={{ paddingTop: '40px', fontWeight: '900', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }} 
                                />
                                <Bar dataKey="lemon" name={content?.admin?.pricing?.stats?.flavors?.lemon} stackId="a" fill="#dfdf57" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="red" name={content?.admin?.pricing?.stats?.flavors?.red} stackId="a" fill="#aa263e" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="silky" name={content?.admin?.pricing?.stats?.flavors?.silky} stackId="a" fill="#1b2e1b" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
            <ActionBar />
        </div>
    );
};

export default PricingStatistics;
