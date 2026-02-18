import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Calendar, RefreshCw, Package, Loader2, AlertCircle, Pause, Play, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

interface Subscription {
    id: string;
    status: 'active' | 'paused' | 'cancelled';
    interval: 'monthly' | 'bimonthly';
    product_handle: string;
    quantity: number;
    next_delivery_date: string;
    created_at: string;
}

const Subscriptions = () => {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchSubscriptions();
        }
    }, [user]);

    const fetchSubscriptions = async () => {
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setSubscriptions(data || []);
        } catch (error) {
            console.error("Error fetching subscriptions:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (sub: Subscription) => {
        const newStatus = sub.status === 'active' ? 'paused' : 'active';
        try {
            const { error } = await supabase
                .from('subscriptions')
                .update({ status: newStatus })
                .eq('id', sub.id);

            if (error) throw error;

            setSubscriptions(prev => prev.map(s => s.id === sub.id ? { ...s, status: newStatus } : s));

            toast({
                title: newStatus === 'active' ? "Předplatné aktivováno" : "Předplatné pozastaveno",
                description: `Vaše předplatné ${sub.product_handle} bylo úspěšně ${newStatus === 'active' ? "obnoveno" : "pozastaveno"}.`,
            });
        } catch (error) {
            toast({
                title: "Chyba",
                description: "Nepodařilo se změnit stav předplatného.",
                variant: "destructive"
            });
        }
    };

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold font-display">Moje předplatné</h2>
                <p className="text-muted-foreground">Správa vašich pravidelných zásilek BoostUp.</p>
            </div>

            {subscriptions.length === 0 ? (
                <div className="bg-card border-2 border-dashed border-border rounded-2xl p-12 text-center space-y-4">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary">
                        <RefreshCw className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Zatím nemáte žádné předplatné</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                            Aktivujte si předplatné u jakéhokoli produktu a získejte automaticky slevu 15% na každou objednávku.
                        </p>
                    </div>
                    <Button asChild>
                        <a href="/#produkty">Prozkoumat produkty</a>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {subscriptions.map((sub) => (
                        <Card key={sub.id} className="overflow-hidden border-2 transition-all hover:border-primary/30">
                            <CardHeader className="bg-muted/30 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                        <CardTitle className="font-display text-xl uppercase italic">
                                            {sub.product_handle.replace('-', ' ')} ({sub.quantity}ks)
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Další doručení: {new Date(sub.next_delivery_date || sub.created_at).toLocaleDateString('cs-CZ')}
                                        </CardDescription>
                                    </div>
                                    <Badge variant={sub.status === 'active' ? 'default' : sub.status === 'paused' ? 'secondary' : 'destructive'} className="uppercase font-bold tracking-wider">
                                        {sub.status === 'active' ? 'Aktivní' : sub.status === 'paused' ? 'Pozastaveno' : 'Zrušeno'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid md:grid-cols-3 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                                            <RefreshCw className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Interval</p>
                                            <p className="font-bold">{sub.interval === 'monthly' ? 'Měsíčně' : 'Každé 2 měsíce'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary">
                                            <Package className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Množství</p>
                                            <p className="font-bold">{sub.quantity}x BoostUp Pack</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-lime">
                                            <Badge className="bg-lime text-black hover:bg-lime/90 font-black">-15%</Badge>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground leading-none">Vaše cena</p>
                                            <p className="font-bold">Věrnostní sleva aktivní</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-muted/10 border-t pt-4 flex gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => toggleStatus(sub)}
                                >
                                    {sub.status === 'active' ? (
                                        <>
                                            <Pause className="w-4 h-4" />
                                            Pozastavit
                                        </>
                                    ) : (
                                        <>
                                            <Play className="w-4 h-4" />
                                            Obnovit
                                        </>
                                    )}
                                </Button>
                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive gap-2">
                                    <XCircle className="w-4 h-4" />
                                    Zrušit
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 flex gap-4 items-start">
                <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div className="space-y-2">
                    <h4 className="font-bold text-sm">Jak funguje předplatné?</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Předplatné si můžete kdykoli pozastavit nebo zrušit. Platba probíhá automaticky před každým odesláním zásilky.
                        O každé nadcházející objednávce vás budeme informovat e-mailem 3 dny předem.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Subscriptions;
