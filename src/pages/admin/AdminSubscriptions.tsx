import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Loader2, RefreshCw, XCircle, Check, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

const SETTINGS_KEY = 'subscription_dispatch';
const SHIPPING_LABELS: Record<string, string> = { personal: 'Osobní', zasilkovna: 'Zásilkovna', courier: 'Kurýr' };

const AdminSubscriptions = () => {
    const { toast } = useToast();
    const [subs, setSubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalEnabled, setGlobalEnabled] = useState(false);
    const [globalDate, setGlobalDate] = useState('');
    const [savingGlobal, setSavingGlobal] = useState(false);
    const [busy, setBusy] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const [{ data: subData }, { data: setting }] = await Promise.all([
                supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
                supabase.from('app_settings').select('value').eq('key', SETTINGS_KEY).maybeSingle(),
            ]);
            setSubs(subData || []);
            if (setting?.value) {
                try {
                    const v = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
                    setGlobalEnabled(!!v.enabled);
                    setGlobalDate(v.date || '');
                } catch { /* ignore */ }
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const saveGlobal = async () => {
        setSavingGlobal(true);
        try {
            const value = JSON.stringify({ enabled: globalEnabled, date: globalDate });
            const { error } = await supabase.from('app_settings').upsert({ key: SETTINGS_KEY, value }, { onConflict: 'key' });
            if (error) throw error;
            if (globalEnabled && globalDate) {
                await supabase.from('subscriptions')
                    .update({ next_delivery_date: globalDate, updated_at: new Date().toISOString() })
                    .eq('uses_global_date', true).neq('status', 'cancelled');
            }
            toast({ title: 'Uloženo', description: globalEnabled ? 'Globální datum nastaveno a propsáno.' : 'Globální datum vypnuto.' });
            await load();
        } catch (e: any) { toast({ title: 'Chyba', description: e?.message, variant: 'destructive' }); }
        finally { setSavingGlobal(false); }
    };

    const adminAction = async (sub: any, action: string) => {
        setBusy(`${sub.id}:${action}`);
        try {
            const { data: sess } = await supabase.auth.getSession();
            const token = sess?.session?.access_token;
            const res = await fetch('/api/subscription-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ subscriptionId: sub.id, action }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) { toast({ title: 'Chyba', description: data?.error, variant: 'destructive' }); return; }
            toast({ title: 'Hotovo', description: data?.message });
            await load();
        } catch (e: any) { toast({ title: 'Chyba', description: e?.message, variant: 'destructive' }); }
        finally { setBusy(null); }
    };

    const fmt = (d?: string | null) => d ? new Date(d).toLocaleDateString('cs-CZ') : '—';

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex items-center gap-3 mb-6">
                <RefreshCw className="w-7 h-7 text-primary" />
                <h1 className="text-2xl md:text-3xl font-black font-display uppercase tracking-tight text-olive-dark">Předplatné</h1>
            </div>

            <div className={`rounded-3xl border-2 p-5 sm:p-6 mb-6 transition-all ${globalEnabled ? 'border-primary/40 bg-primary/5' : 'border-olive/10 bg-white'}`}>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 font-black text-olive-dark uppercase tracking-tight text-sm"><CalendarClock className="w-4 h-4 text-primary" /> Globální datum odeslání</div>
                        <div className="text-[11px] text-olive/50 uppercase tracking-widest">{globalEnabled ? 'Zapnuto – platí pro všechny (mimo individuální)' : 'Vypnuto'}</div>
                    </div>
                    <button type="button" onClick={() => setGlobalEnabled(v => !v)} className={`w-12 h-7 rounded-full flex items-center px-1 transition-all ${globalEnabled ? 'bg-primary justify-end' : 'bg-olive/20 justify-start'}`}>
                        <span className="w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">{globalEnabled && <Check className="w-3 h-3 text-primary" />}</span>
                    </button>
                </div>
                {globalEnabled && (
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3">
                        <div>
                            <label className="text-[10px] font-bold uppercase text-olive/60">Datum odeslání pro všechny</label>
                            <input type="date" value={globalDate} onChange={e => setGlobalDate(e.target.value)} className="mt-1 block bg-white border-2 border-olive/15 rounded-xl px-3 py-2 text-sm" />
                        </div>
                        <p className="text-xs text-olive/50 flex-1">Uložením se datum propíše všem předplatným bez vlastního (individuálního) data. Neovlivní datum stržení platby.</p>
                    </div>
                )}
                <div className="mt-4">
                    <Button size="sm" onClick={saveGlobal} disabled={savingGlobal || (globalEnabled && !globalDate)} className="gap-2">
                        {savingGlobal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Uložit
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : subs.length === 0 ? (
                <div className="text-center py-16 text-olive/50">Zatím žádná předplatná.</div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border-2 border-olive/10 bg-white">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-[10px] uppercase tracking-widest text-olive/50 border-b border-olive/10">
                                <th className="px-4 py-3">Zákazník</th>
                                <th className="px-4 py-3">Produkt</th>
                                <th className="px-4 py-3">Interval</th>
                                <th className="px-4 py-3">Odeslání</th>
                                <th className="px-4 py-3">Doprava</th>
                                <th className="px-4 py-3">Stav</th>
                                <th className="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {subs.map(s => (
                                <tr key={s.id} className="border-b border-olive/5 hover:bg-olive/5">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-olive-dark">{s.email || '—'}</div>
                                        {s.stripe_subscription_id && <a href={`https://dashboard.stripe.com/subscriptions/${s.stripe_subscription_id}`} target="_blank" rel="noreferrer" className="text-[11px] text-primary inline-flex items-center gap-1">Stripe <ExternalLink className="w-3 h-3" /></a>}
                                    </td>
                                    <td className="px-4 py-3">{s.product_handle} ×{s.quantity}</td>
                                    <td className="px-4 py-3">{s.interval === 'monthly' ? 'Měsíčně' : '2 měsíce'}</td>
                                    <td className="px-4 py-3">{fmt(s.next_delivery_date)}{!s.uses_global_date && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <span className="ml-1 text-[10px] text-amber-600 cursor-help underline decoration-dotted">(vlastní)</span>
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-[240px] text-xs leading-relaxed">Zákazník má vlastní datum odeslání – globální datum ho nepřepíše.</TooltipContent>
                                        </Tooltip>
                                    )}</td>
                                    <td className="px-4 py-3">{SHIPPING_LABELS[s.shipping_method || ''] || s.shipping_method || '—'}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant={s.status === 'active' ? 'default' : s.status === 'paused' ? 'secondary' : 'destructive'} className="uppercase text-[10px]">
                                            {s.status === 'cancelled' ? 'Zrušeno' : s.status === 'paused' ? 'Pozastaveno' : s.cancel_at_period_end ? 'Zruší se' : 'Aktivní'}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-right whitespace-nowrap">
                                        {s.status !== 'cancelled' && (s.cancel_at_period_end ? (
                                            <Button size="sm" variant="outline" disabled={busy === `${s.id}:resume`} onClick={() => adminAction(s, 'resume')}>{busy === `${s.id}:resume` ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Obnovit'}</Button>
                                        ) : (
                                            <Button size="sm" variant="ghost" className="text-destructive gap-1" disabled={busy === `${s.id}:cancel`} onClick={() => adminAction(s, 'cancel')}>
                                                {busy === `${s.id}:cancel` ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Zrušit
                                            </Button>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminSubscriptions;
