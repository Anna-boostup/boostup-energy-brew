import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Truck, Save, Loader2, Check, Globe, Plus, X, Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

const InfoTip = ({ text }: { text: string }) => (
    <Tooltip>
        <TooltipTrigger asChild>
            <button type="button" tabIndex={-1} aria-label="Nápověda" className="text-olive/40 hover:text-primary transition-colors align-middle">
                <Info className="w-3 h-3" />
            </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] text-xs leading-relaxed">{text}</TooltipContent>
    </Tooltip>
);
import { useShippingCountries } from '@/hooks/useShippingCountries';
import { ShippingCountry, ShippingTier, DeliveryMethodId } from '@/config/shipping';

const METHOD_LABELS: Record<DeliveryMethodId, string> = {
    personal: 'Osobní odběr',
    zasilkovna: 'Zásilkovna (výdejní místo)',
    courier: 'Kurýr na adresu',
};

const ShippingSettings = () => {
    const { countries, loading, saving, saveCountries } = useShippingCountries();
    const { toast } = useToast();
    const [draft, setDraft] = useState<ShippingCountry[]>([]);

    useEffect(() => {
        if (!loading) setDraft(countries.map(c => ({ ...c, methods: JSON.parse(JSON.stringify(c.methods)) })));
    }, [loading, countries]);

    const updateCountry = (code: string, patch: Partial<ShippingCountry>) => {
        setDraft(prev => prev.map(c => c.code === code ? { ...c, ...patch } : c));
    };

    const setMethodTiers = (code: string, method: DeliveryMethodId, tiers: ShippingTier[] | undefined) => {
        setDraft(prev => prev.map(c => {
            if (c.code !== code) return c;
            const methods = { ...c.methods };
            if (tiers === undefined) delete methods[method];
            else methods[method] = tiers;
            return { ...c, methods };
        }));
    };

    const toggleMethod = (code: string, method: DeliveryMethodId, on: boolean) => {
        setMethodTiers(code, method, on ? [{ maxBottles: null, price: 0 }] : undefined);
    };

    const updateTier = (code: string, method: DeliveryMethodId, idx: number, patch: Partial<ShippingTier>) => {
        setDraft(prev => prev.map(c => {
            if (c.code !== code) return c;
            const tiers = [...(c.methods[method] || [])];
            tiers[idx] = { ...tiers[idx], ...patch };
            return { ...c, methods: { ...c.methods, [method]: tiers } };
        }));
    };

    const addTier = (code: string, method: DeliveryMethodId) => {
        setDraft(prev => prev.map(c => {
            if (c.code !== code) return c;
            const tiers = [...(c.methods[method] || [])];
            // nové pásmo vlož před poslední „a více" (maxBottles null)
            const insertAt = tiers.length > 0 && tiers[tiers.length - 1].maxBottles === null ? tiers.length - 1 : tiers.length;
            tiers.splice(insertAt, 0, { maxBottles: 12, price: 0 });
            return { ...c, methods: { ...c.methods, [method]: tiers } };
        }));
    };

    const removeTier = (code: string, method: DeliveryMethodId, idx: number) => {
        setDraft(prev => prev.map(c => {
            if (c.code !== code) return c;
            const tiers = (c.methods[method] || []).filter((_, i) => i !== idx);
            return { ...c, methods: { ...c.methods, [method]: tiers } };
        }));
    };

    const numField = (code: string, field: keyof ShippingCountry, value: number | null) => (
        <Input type="number" step="any"
            value={value === null || value === undefined ? '' : value}
            onChange={(e) => updateCountry(code, { [field]: e.target.value.trim() === '' ? null : parseFloat(e.target.value) } as Partial<ShippingCountry>)}
            className="h-9 bg-white border-olive/15 text-sm" />
    );

    const handleSave = async () => {
        const cz = draft.find(c => c.code === 'CZ');
        if (cz && cz.rate !== 1) {
            toast({ title: 'Pozor', description: 'Kurz pro CZK (Česká republika) by měl být 1.', variant: 'destructive' });
            return;
        }
        const ok = await saveCountries(draft);
        toast(ok
            ? { title: 'Uloženo', description: 'Konfigurace doručovacích zemí byla uložena.' }
            : { title: 'Chyba', description: 'Nepodařilo se uložit konfiguraci.', variant: 'destructive' });
    };

    if (loading) {
        return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="max-w-5xl mx-auto pb-32">
            <div className="flex items-center gap-3 mb-2">
                <Truck className="w-7 h-7 text-primary" />
                <h1 className="text-2xl md:text-3xl font-black font-display uppercase tracking-tight text-olive-dark">Doručení a země</h1>
            </div>
            <p className="text-sm text-olive/70 mb-8 max-w-2xl">
                Zapni, kam se posílá. Ceny produktů jsou v CZK a přepočítají se kurzem do měny země.
                Doprava je <strong>pásmová podle počtu lahví</strong> (balení × ks) — Zásilkovna účtuje dle hmotnosti.
                Ceny pásem a práh dopravy zdarma zadáváš v měně dané země. Poslední pásmo „a více" nech bez limitu.
            </p>

            <div className="space-y-5">
                {draft.map((c) => (
                    <div key={c.code} className={`rounded-3xl border-2 p-5 sm:p-6 transition-all ${c.enabled ? 'border-primary/40 bg-primary/5' : 'border-olive/10 bg-white'}`}>
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <Globe className={`w-5 h-5 ${c.enabled ? 'text-primary' : 'text-olive/40'}`} />
                                <div>
                                    <div className="font-black text-olive-dark uppercase tracking-tight">{c.name}</div>
                                    <div className="text-[11px] text-olive/50 uppercase tracking-widest">{c.code} · {c.currency}</div>
                                </div>
                            </div>
                            <button type="button" onClick={() => updateCountry(c.code, { enabled: !c.enabled })}
                                className={`w-12 h-7 rounded-full flex items-center px-1 transition-all ${c.enabled ? 'bg-primary justify-end' : 'bg-olive/20 justify-start'}`} aria-pressed={c.enabled}>
                                <span className="w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">{c.enabled && <Check className="w-3 h-3 text-primary" />}</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-olive/50 mb-1">Měna</label>
                                <Input value={c.currency} onChange={(e) => updateCountry(c.code, { currency: e.target.value.toUpperCase() })} className="h-9 bg-white border-olive/15 text-sm" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-widest text-olive/50 mb-1">Symbol</label>
                                <Input value={c.currencySymbol} onChange={(e) => updateCountry(c.code, { currencySymbol: e.target.value })} className="h-9 bg-white border-olive/15 text-sm" />
                            </div>
                            <div>
                                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-olive/50 mb-1">Kurz CZK→měna <InfoTip text="Přepočet cen z CZK do měny této země. Pro CZK je kurz 1." /></label>
                                {numField(c.code, 'rate', c.rate)}
                            </div>
                            <div>
                                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-olive/50 mb-1">Zaokrouhlení <InfoTip text="Na jakou hodnotu se zaokrouhlují přepočtené ceny (např. 0,10 € nebo 1 Kč)." /></label>
                                {numField(c.code, 'rounding', c.rounding)}
                            </div>
                            <div>
                                <label className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-olive/50 mb-1">Doprava zdarma od ({c.currencySymbol}) <InfoTip text="Objednávky nad tuto částku (v měně země) mají dopravu zdarma. Prázdné = bez hranice." /></label>
                                {numField(c.code, 'freeShippingThreshold', c.freeShippingThreshold)}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {(['personal', 'zasilkovna', 'courier'] as DeliveryMethodId[]).map((m) => {
                                const tiers = c.methods[m];
                                const active = Array.isArray(tiers) && tiers.length > 0;
                                return (
                                    <div key={m} className="rounded-2xl border border-olive/10 bg-white/60 p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={active} onChange={(e) => toggleMethod(c.code, m, e.target.checked)} className="accent-primary w-4 h-4" />
                                                <span className="text-sm font-bold text-olive-dark">{METHOD_LABELS[m]}</span>
                                            </label>
                                            {active && (
                                                <Button type="button" variant="ghost" size="sm" onClick={() => addTier(c.code, m)} className="h-7 text-[11px] gap-1 text-primary">
                                                    <Plus className="w-3 h-3" /> Přidat pásmo
                                                </Button>
                                            )}
                                        </div>
                                        {active && (
                                            <div className="space-y-2">
                                                {(tiers || []).map((t, idx) => (
                                                    <div key={idx} className="flex items-center gap-2">
                                                        <span className="text-[11px] text-olive/50 w-8">do</span>
                                                        <Input type="number" placeholder="a více" value={t.maxBottles === null ? '' : t.maxBottles}
                                                            onChange={(e) => updateTier(c.code, m, idx, { maxBottles: e.target.value.trim() === '' ? null : parseInt(e.target.value, 10) })}
                                                            className="h-8 w-24 bg-white border-olive/15 text-sm" />
                                                        <span className="text-[11px] text-olive/50">ks →</span>
                                                        <Input type="number" step="any" value={t.price}
                                                            onChange={(e) => updateTier(c.code, m, idx, { price: parseFloat(e.target.value) || 0 })}
                                                            className="h-8 w-28 bg-white border-olive/15 text-sm" />
                                                        <span className="text-[11px] text-olive/50">{c.currencySymbol}</span>
                                                        <button type="button" onClick={() => removeTier(c.code, m, idx)} className="text-olive/40 hover:text-destructive p-1">
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white/90 backdrop-blur border-t border-olive/10 p-4 flex justify-end z-20">
                <Button onClick={handleSave} disabled={saving} className="bg-olive-dark text-white hover:bg-olive-dark/90 rounded-2xl font-bold px-8 h-12 gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Uložit konfiguraci
                </Button>
            </div>
        </div>
    );
};

export default ShippingSettings;
