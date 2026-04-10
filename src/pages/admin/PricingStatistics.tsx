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
    const { orders } = useInventory();
    const { content, refreshContent } = useContent();
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

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
                <div>
                    <h1 data-testid="admin-page-title" className="text-2xl sm:text-3xl font-black text-olive-dark uppercase italic tracking-tight font-display">{content?.admin?.pricing?.title}</h1>
                    <p className="text-brand-muted font-bold uppercase tracking-widest text-[10px] mt-1">{content?.admin?.pricing?.description}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pricing Card */}
                <Card className="lg:col-span-1 border border-white/40 shadow-sm rounded-[2rem] sm:rounded-[2.5rem] bg-white/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-left-4 duration-500">
                    <CardHeader className="bg-olive-dark border-b border-olive/10 py-6 sm:py-8 px-6 sm:px-10">
                        <div className="flex items-center gap-3 mb-2">
                             <CardTitle className="text-lg sm:text-xl text-white font-black">{content?.admin?.pricing?.card?.title}</CardTitle>
                        </div>
                        <CardDescription className="text-white/60 text-[10px] sm:text-xs font-bold font-display uppercase tracking-widest">{content?.admin?.pricing?.card?.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 sm:pt-8 sm:px-10 space-y-8">
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
                                            className="h-14 pl-5 rounded-2xl border-background bg-white font-display font-black text-xl text-olive-dark focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
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
                                            className="h-14 pl-5 rounded-2xl border-background bg-white font-display font-black text-xl text-olive-dark focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
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
                                            className="h-14 pl-5 rounded-2xl border-background bg-white font-display font-black text-xl text-olive-dark focus-visible:ring-primary focus-visible:border-primary transition-all shadow-sm"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-olive-dark">{content?.admin?.pricing?.card?.currency}</span>
                                    </div>
                            </div>
                        </div>

                        <Button 
                            className="w-full h-16 bg-primary hover:bg-lime-dark text-olive-dark font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                            onClick={handleSavePrices}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {content?.admin?.pricing?.card?.save}
                        </Button>
                    </CardContent>
                </Card>

                {/* Orders Stats Card */}
                <Card className="lg:col-span-2 border border-white/40 shadow-sm rounded-[2rem] sm:rounded-[2.5rem] bg-white/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
                    <CardHeader className="bg-white/40 border-b border-olive/8 py-6 sm:py-8 px-6 sm:px-10">
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
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                                    axisLine={false}
                                    tickLine={false}
                                    interval={3}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
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
                                <Line 
                                    type="monotone" 
                                    dataKey="orders" 
                                    name={content?.admin?.pricing?.stats?.ordersLabel}
                                    stroke="#3d5a2f" 
                                    strokeWidth={6}
                                    dot={{ r: 0 }}
                                    activeDot={{ r: 8, strokeWidth: 0, fill: '#d4f45d' }}
                                    animationDuration={2000}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Units Stats Card */}
                <Card className="lg:col-span-3 border border-white/40 shadow-sm rounded-[2rem] sm:rounded-[2.5rem] bg-white/50 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <CardHeader className="bg-olive-dark border-b border-olive/10 py-6 sm:py-8 px-6 sm:px-10">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-primary/20 rounded-xl">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-lg sm:text-xl font-black text-white">{content?.admin?.pricing?.stats?.unitsTitle}</CardTitle>
                        </div>
                        <CardDescription className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{content?.admin?.pricing?.stats?.unitsSubtitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-10 sm:pt-12 px-2 sm:px-10 h-[350px] sm:h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData} barGap={0}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="label" 
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                                    axisLine={false}
                                    tickLine={false}
                                    interval={2}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
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
                                <Bar dataKey="lemon" name={content?.admin?.pricing?.stats?.flavors?.lemon} stackId="a" fill="#d4f45d" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="red" name={content?.admin?.pricing?.stats?.flavors?.red} stackId="a" fill="#aa263e" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="silky" name={content?.admin?.pricing?.stats?.flavors?.silky} stackId="a" fill="#1b2e1b" radius={[10, 10, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PricingStatistics;
