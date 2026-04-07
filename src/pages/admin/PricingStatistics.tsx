import React, { useMemo, useState } from 'react';
import { useInventory } from "@/context/InventoryContext";
import { useContent } from "@/context/ContentContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
    BarChart, Bar, ComposedChart, Area
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, Package, Save, Loader2, BarChart3, ShoppingCart } from "lucide-react";
import { format, parseISO, subDays, isWithinInterval, startOfDay } from 'date-fns';
import { cs } from 'date-fns/locale';

const PricingStatistics = () => {
    const { orders } = useInventory();
    const { content, refreshContent } = useContent();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    // Pricing form state
    const [prices, setPrices] = useState({
        pack3: content.pricing?.pack3 || 229,
        pack12: content.pricing?.pack12 || 849,
        pack21: content.pricing?.pack21 || 1399
    });

    // Handle price save
    const handleSavePrices = async () => {
        setIsSaving(true);
        try {
            const newContent = {
                ...content,
                pricing: prices
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
                title: "Ceny aktualizovány",
                description: "Nové ceny byly úspěšně uloženy a projeví se na webu.",
            });
        } catch (error: any) {
            toast({
                title: "Chyba při ukládání",
                description: error.message,
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
                label: format(parseISO(date), 'd. MMM', { locale: cs }),
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
    }, [orders]);

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ceny a Statistiky</h1>
                    <p className="text-muted-foreground">Správa prodejních cen a přehled výkonu e-shopu.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pricing Card */}
                <Card className="lg:col-span-1 shadow-sm border-primary/20">
                    <CardHeader className="bg-primary/5 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-primary" />
                            Globální ceny balení
                        </CardTitle>
                        <CardDescription>Tyto ceny platí pro VŠECHNY příchutě i pro MIX balení.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="pack3" className="font-bold">Balení 3 ks (Kč)</Label>
                                <div className="relative">
                                    <Input 
                                        id="pack3" 
                                        type="number" 
                                        value={prices.pack3} 
                                        onChange={(e) => setPrices(p => ({ ...p, pack3: parseInt(e.target.value) || 0 }))}
                                        className="pl-10 font-bold"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🍋</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest pl-1">{(prices.pack3 / 3).toFixed(2)} Kč / shot</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pack12" className="font-bold">Balení 12 ks (Kč)</Label>
                                <div className="relative">
                                    <Input 
                                        id="pack12" 
                                        type="number" 
                                        value={prices.pack12} 
                                        onChange={(e) => setPrices(p => ({ ...p, pack12: parseInt(e.target.value) || 0 }))}
                                        className="pl-10 font-bold"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🍇</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest pl-1">{(prices.pack12 / 12).toFixed(2)} Kč / shot</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="pack21" className="font-bold">Balení 21 ks (Kč)</Label>
                                <div className="relative">
                                    <Input 
                                        id="pack21" 
                                        type="number" 
                                        value={prices.pack21} 
                                        onChange={(e) => setPrices(p => ({ ...p, pack21: parseInt(e.target.value) || 0 }))}
                                        className="pl-10 font-bold"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">🌿</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest pl-1">{(prices.pack21 / 21).toFixed(2)} Kč / shot</p>
                            </div>
                        </div>

                        <Button 
                            className="w-full h-12 bg-primary hover:bg-primary/90 text-black font-bold uppercase tracking-widest gap-2"
                            onClick={handleSavePrices}
                            disabled={isSaving}
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Uložit změny cen
                        </Button>
                    </CardContent>
                </Card>

                {/* Orders Stats Card */}
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-slate-600" />
                            Počet objednávek (posledních 30 dní)
                        </CardTitle>
                        <CardDescription>Denní přehled přijatých objednávek.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={statsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="label" 
                                    tick={{ fontSize: 10, fontWeight: 600 }} 
                                    axisLine={false}
                                    tickLine={false}
                                    interval={2}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 600 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ stroke: '#f1f5f9', strokeWidth: 2 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="orders" 
                                    name="Počet objednávek"
                                    stroke="#84cc16" 
                                    strokeWidth={4}
                                    dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Units Stats Card */}
                <Card className="lg:col-span-3 shadow-sm">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-slate-600" />
                            Prodané jednotky dle příchutí
                        </CardTitle>
                        <CardDescription>Počet prodaných jednotlivých lahviček (včetně obsahu v mixech a baleních).</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 h-[450px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={statsData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis 
                                    dataKey="label" 
                                    tick={{ fontSize: 10, fontWeight: 600 }} 
                                    axisLine={false}
                                    tickLine={false}
                                    interval={1}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 600 }}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                <Bar dataKey="lemon" name="Lemon Blast" stackId="a" fill="#eab308" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="red" name="Red Rush" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
                                <Bar dataKey="silky" name="Silky Leaf" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PricingStatistics;
