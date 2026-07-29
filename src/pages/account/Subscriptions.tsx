import React, { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Calendar, RefreshCw, Loader2, AlertCircle, XCircle, Truck, Save, Info } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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
    next_delivery_date: string | null;
    created_at: string;
    shipping_method?: string | null;
    last_shipping_change_at?: string | null;
    last_date_change_at?: string | null;
    cancel_at_period_end?: boolean;
}

const MIN_DAYS = 5;
const SHIPPING_LABELS: Record<string, string> = { personal: 'Osobní odběr', zasilkovna: 'Zásilkovna', courier: 'Kurýr' };

const daysUntil = (d?: string | null): number | null => {
    if (!d) return null;
    const t = new Date(d).getTime();
    if (isNaN(t)) return null;
    return Math.floor((t - Date.now()) / 86400000);
};
const changedThisMonth = (iso?: string | null): boolean => {
    if (!iso) return false;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
};

const InfoTip = ({ text }: { text: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <button type="button" tabIndex={-1} aria-label="Nápověda" className="text-muted-foreground/60 hover:text-primary transition-colors align-middle">
                <Info className="w-3.5 h-3.5" />
            </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[240px] text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
);

const Subscriptions = () => {
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);
    const [dateDraft, setDateDraft] = useState<Record<string, string>>({});
    const [shipDraft, setShipDraft] = useState<Record<string, string>>({});

    useEffect(() => { if (user) fetchSubscriptions(); }, [user]);

    const fetchSubscriptions = async () => {
        try {
            // Napáruj případná hostovská předplatná (shoda e-mailu) na tento účet
            await supabase.rpc('link_my_subscriptions');
            let query = supabase.from('subscriptions').select('*');
            query = user?.email
                ? query.or(`user_id.eq.${user.id},email.eq.${user.email}`)
                : query.eq('user_id', user?.id);
            const { data, error } = await query.order('created_at', { ascending: false });
            if (error) throw error;
            setSubscriptions(data || []);
        } catch (e) {
            console.error("Error fetching subscriptions:", e);
        } finally {
            setLoading(false);
        }
    };

    const manage = async (sub: Subscription, action: string, payload?: any) => {
        setBusy(`${sub.id}:${action}`);
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const token = sessionData?.session?.access_token;
            if (!token) { toast({ title: 'Přihlaste se prosím znovu.', variant: 'destructive' }); return; }
            const res = await fetch('/api/subscription-manage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ subscriptionId: sub.id, action, payload }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                toast({ title: 'Nepodařilo se provést změnu', description: data?.error || 'Zkuste to prosím později.', variant: 'destructive' });
                return;
            }
            toast({ title: 'Hotovo', description: data?.message || 'Změna byla uložena.' });
            await fetchSubscriptions();
        } catch (e: any) {
            toast({ title: 'Chyba', description: e?.message || 'Zkuste to prosím později.', variant: 'destructive' });
        } finally {
            setBusy(null);
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
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-primary"><RefreshCw className="w-8 h-8" /></div>
                    <div>
                        <h3 className="text-lg font-bold">Zatím nemáte žádné předplatné</h3>
                        <p className="text-muted-foreground text-sm max-w-sm mx-auto">Aktivujte si předplatné u jakéhokoli produktu a získejte automaticky slevu 15% na každou objednávku.</p>
                    </div>
                    <Button asChild><a href="/#produkty">Prozkoumat produkty</a></Button>
                </div>
            ) : (
                <div className="grid gap-6">
                    {subscriptions.map((sub) => {
                        const dleft = daysUntil(sub.next_delivery_date);
                        const locked = dleft !== null && dleft < MIN_DAYS;
                        const dateLockedMonth = changedThisMonth(sub.last_date_change_at);
                        const shipLockedMonth = changedThisMonth(sub.last_shipping_change_at);
                        const isCancelled = sub.status === 'cancelled';
                        const pendingCancel = !!sub.cancel_at_period_end;
                        const canEdit = !isCancelled && !locked;
                        return (
                            <Card key={sub.id} className="overflow-hidden border-2">
                                <CardHeader className="bg-muted/30 pb-4">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <CardTitle className="font-display text-xl uppercase italic">{sub.product_handle?.replace('-', ' ')} ({sub.quantity}ks)</CardTitle>
                                            <CardDescription className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5" />
                                                Odeslání: {sub.next_delivery_date ? new Date(sub.next_delivery_date).toLocaleDateString('cs-CZ') : '—'}
                                            </CardDescription>
                                        </div>
                                        <Badge variant={sub.status === 'active' ? 'default' : sub.status === 'paused' ? 'secondary' : 'destructive'} className="uppercase font-bold tracking-wider">
                                            {isCancelled ? 'Zrušeno' : sub.status === 'paused' ? 'Pozastaveno' : pendingCancel ? 'Zruší se' : 'Aktivní'}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-5">
                                    <div className="grid sm:grid-cols-3 gap-4 text-sm">
                                        <div><p className="text-[10px] uppercase font-bold text-muted-foreground">Interval</p><p className="font-bold">{sub.interval === 'monthly' ? 'Měsíčně' : 'Každé 2 měsíce'}</p></div>
                                        <div><p className="text-[10px] uppercase font-bold text-muted-foreground">Množství</p><p className="font-bold">{sub.quantity}× BoostUp</p></div>
                                        <div><p className="text-[10px] uppercase font-bold text-muted-foreground">Doprava</p><p className="font-bold">{SHIPPING_LABELS[sub.shipping_method || ''] || sub.shipping_method || '—'}</p></div>
                                    </div>

                                    {!isCancelled && (
                                        <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
                                            {locked && (
                                                <p className="text-xs text-amber-600 font-semibold">Změny jsou uzamčené — do odeslání zbývá méně než {MIN_DAYS} dní.</p>
                                            )}
                                            <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold uppercase text-muted-foreground inline-flex items-center gap-1">Změnit datum odeslání <InfoTip text="Změnit lze 1× za kalendářní měsíc a nejpozději 5 dní před odesláním. Nové datum posune i datum platby." /></label>
                                                    <input type="date" value={dateDraft[sub.id] || ''} onChange={(e) => setDateDraft(p => ({ ...p, [sub.id]: e.target.value }))}
                                                        disabled={!canEdit || dateLockedMonth}
                                                        className="mt-1 w-full bg-background border-2 border-border rounded-xl px-3 py-2 text-sm disabled:opacity-50" />
                                                </div>
                                                <Button size="sm" disabled={!canEdit || dateLockedMonth || !dateDraft[sub.id] || busy === `${sub.id}:change_date`}
                                                    onClick={() => manage(sub, 'change_date', { date: dateDraft[sub.id] })}>
                                                    {busy === `${sub.id}:change_date` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                            {dateLockedMonth && <p className="text-[11px] text-muted-foreground -mt-2">Datum už bylo tento měsíc změněno.</p>}

                                            <div className="flex flex-col sm:flex-row sm:items-end gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[10px] font-bold uppercase text-muted-foreground inline-flex items-center gap-1">Změnit dopravu <InfoTip text="Změnit lze 1× za kalendářní měsíc a nejpozději 5 dní před odesláním. Cena dopravy se přepočítá podle nového způsobu." /></label>
                                                    <select value={shipDraft[sub.id] ?? (sub.shipping_method || '')} onChange={(e) => setShipDraft(p => ({ ...p, [sub.id]: e.target.value }))}
                                                        disabled={!canEdit || shipLockedMonth}
                                                        className="mt-1 w-full bg-background border-2 border-border rounded-xl px-3 py-2 text-sm disabled:opacity-50">
                                                        <option value="personal">Osobní odběr</option>
                                                        <option value="zasilkovna">Zásilkovna</option>
                                                        <option value="courier">Kurýr</option>
                                                    </select>
                                                </div>
                                                <Button size="sm" variant="outline" disabled={!canEdit || shipLockedMonth || busy === `${sub.id}:change_shipping`}
                                                    onClick={() => manage(sub, 'change_shipping', { method: shipDraft[sub.id] ?? sub.shipping_method })}>
                                                    {busy === `${sub.id}:change_shipping` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                            {shipLockedMonth && <p className="text-[11px] text-muted-foreground -mt-2">Doprava už byla tento měsíc změněna.</p>}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="bg-muted/10 border-t pt-4 flex justify-between items-center gap-3">
                                    <p className="text-xs text-muted-foreground">
                                        {pendingCancel ? 'Zruší se ke konci aktuálního období.' : 'Platba i doprava se účtují u každé zásilky.'}
                                    </p>
                                    {!isCancelled && !pendingCancel && (
                                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive gap-2"
                                            disabled={locked || busy === `${sub.id}:cancel`}
                                            onClick={() => { if (window.confirm('Opravdu zrušit předplatné ke konci aktuálního období?')) manage(sub, 'cancel'); }}>
                                            {busy === `${sub.id}:cancel` ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                            Zrušit
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            )}

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20 flex gap-4 items-start">
                <AlertCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <div className="space-y-2">
                    <h4 className="font-bold text-sm">Jak funguje předplatné?</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Dopravu i datum odeslání můžete měnit jednou za kalendářní měsíc, nejpozději {MIN_DAYS} dní před odesláním. Zrušení proběhne ke konci aktuálního období.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Subscriptions;
