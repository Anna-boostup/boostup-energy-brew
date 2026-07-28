import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Megaphone, Save, Loader2, Check, Info, Wrench, AlertTriangle, Tag, X, CalendarClock } from 'lucide-react';
import { useAnnouncementBanner } from '@/hooks/useAnnouncementBanner';
import {
    BannerConfig,
    BannerType,
    BannerLiveStatus,
    BANNER_STYLES,
    DEFAULT_BANNER,
    bannerText,
    bannerLinkLabel,
    bannerLiveStatus,
} from '@/config/banner';

const TYPE_ICON: Record<BannerType, React.ComponentType<{ className?: string }>> = {
    info: Info,
    maintenance: Wrench,
    warning: AlertTriangle,
    promo: Tag,
};

const TYPES: BannerType[] = ['info', 'maintenance', 'warning', 'promo'];

const SCHEDULE_STATUS: Record<BannerLiveStatus, { label: string; cls: string; dot: string }> = {
    'off': { label: 'Neaktivní', cls: 'bg-olive/5 text-olive/60', dot: 'bg-olive/40' },
    'manual-on': { label: 'Zobrazuje se (ruční režim)', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    'active': { label: 'Aktivní – banner se právě zobrazuje', cls: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    'scheduled-before': { label: 'Naplánováno – čeká na začátek období', cls: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
    'scheduled-after': { label: 'Ukončeno – naplánované období už proběhlo', cls: 'bg-olive/5 text-olive/60', dot: 'bg-olive/40' },
};

const BannerSettings = () => {
    const { banner, loading, saving, saveBanner } = useAnnouncementBanner();
    const { toast } = useToast();
    const [draft, setDraft] = useState<BannerConfig>(DEFAULT_BANNER);
    const [previewLang, setPreviewLang] = useState<'cs' | 'en'>('cs');
    const [now, setNow] = useState(() => new Date());

    useEffect(() => {
        if (!loading) setDraft({ ...DEFAULT_BANNER, ...banner });
    }, [loading, banner]);

    // Při zapnutém plánu tikáme čas, ať se živý stav v adminu průběžně přepočítá.
    useEffect(() => {
        if (!draft.scheduleEnabled) return;
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
    }, [draft.scheduleEnabled]);

    const update = (patch: Partial<BannerConfig>) => setDraft(prev => ({ ...prev, ...patch }));

    const handleSave = async () => {
        const willShow = draft.enabled || draft.scheduleEnabled;
        if (willShow && !draft.textCs.trim() && !draft.textEn.trim()) {
            toast({ title: 'Chybí text', description: 'Zapnutý banner musí mít vyplněný text alespoň v jednom jazyce.', variant: 'destructive' });
            return;
        }
        if (draft.scheduleEnabled && draft.startAt && draft.endAt
            && new Date(draft.startAt).getTime() >= new Date(draft.endAt).getTime()) {
            toast({ title: 'Neplatné období', description: 'Konec zobrazení musí být později než začátek.', variant: 'destructive' });
            return;
        }
        const ok = await saveBanner(draft);
        toast(ok
            ? { title: 'Uloženo', description: 'Nastavení baneru bylo uloženo.' }
            : { title: 'Chyba', description: 'Nepodařilo se uložit nastavení.', variant: 'destructive' });
    };

    if (loading) {
        return <div className="flex items-center justify-center py-24"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    const style = BANNER_STYLES[draft.type] || BANNER_STYLES.info;
    const PreviewIcon = TYPE_ICON[draft.type] || Info;
    const previewText = bannerText(draft, previewLang);
    const previewLinkLabel = bannerLinkLabel(draft, previewLang);
    const liveStatus = bannerLiveStatus(draft, now);

    return (
        <div className="max-w-3xl mx-auto pb-32">
            <div className="flex items-center gap-3 mb-2">
                <Megaphone className="w-7 h-7 text-primary" />
                <h1 className="text-2xl md:text-3xl font-black font-display uppercase tracking-tight text-olive-dark">Oznamovací banner</h1>
            </div>
            <p className="text-sm text-olive/70 mb-8 max-w-2xl">
                Pruh nahoře na webu pro oznámení o údržbě, upozornění nebo akci. Text je dvojjazyčný,
                může mít odkaz a návštěvník ho může zavřít křížkem (zavření se pamatuje v prohlížeči;
                po změně textu se banner zobrazí znovu).
            </p>

            {/* Zobrazení baneru: ruční přepínač + automatické plánování */}
            <div className={`rounded-3xl border-2 p-5 sm:p-6 mb-5 transition-all ${(draft.enabled || draft.scheduleEnabled) ? 'border-primary/40 bg-primary/5' : 'border-olive/10 bg-white'}`}>
                {/* Ruční zapnutí / vypnutí */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="font-black text-olive-dark uppercase tracking-tight">Zobrazit banner na webu</div>
                        <div className="text-[11px] text-olive/50 uppercase tracking-widest">{draft.scheduleEnabled ? 'Řízeno plánem (viz níže)' : (draft.enabled ? 'Zapnuto' : 'Vypnuto')}</div>
                    </div>
                    <button type="button" onClick={() => update({ enabled: !draft.enabled })} disabled={draft.scheduleEnabled}
                        className={`w-12 h-7 rounded-full flex items-center px-1 transition-all ${draft.enabled ? 'bg-primary justify-end' : 'bg-olive/20 justify-start'} ${draft.scheduleEnabled ? 'opacity-40 cursor-not-allowed' : ''}`} aria-pressed={draft.enabled}>
                        <span className="w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">{draft.enabled && <Check className="w-3 h-3 text-primary" />}</span>
                    </button>
                </div>

                {/* Automatické plánování podle data a času */}
                <div className="mt-5 pt-5 border-t border-olive/10">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 font-black text-olive-dark uppercase tracking-tight text-sm">
                                <CalendarClock className="w-4 h-4 text-primary" />
                                Automatické plánování
                            </div>
                            <div className="text-[11px] text-olive/50 uppercase tracking-widest">{draft.scheduleEnabled ? 'Řídí datum a čas' : 'Vypnuto – řídí ruční přepínač'}</div>
                        </div>
                        <button type="button" onClick={() => update({ scheduleEnabled: !draft.scheduleEnabled })}
                            className={`w-12 h-7 rounded-full flex items-center px-1 transition-all ${draft.scheduleEnabled ? 'bg-primary justify-end' : 'bg-olive/20 justify-start'}`} aria-pressed={draft.scheduleEnabled}>
                            <span className="w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">{draft.scheduleEnabled && <Check className="w-3 h-3 text-primary" />}</span>
                        </button>
                    </div>

                    {draft.scheduleEnabled && (
                        <div className="mt-4 space-y-4">
                            <p className="text-xs text-olive/60 leading-relaxed">
                                Banner se <b>sám zapne a vypne</b> podle nastaveného období. V tomto režimu se ruční přepínač výše ignoruje.
                                Prázdná hranice = bez omezení (např. jen „Zobrazit od" = ukazovat od daného času dál). Čas je v místním pásmu.
                            </p>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-olive/70 uppercase tracking-widest">Zobrazit od</label>
                                    <Input type="datetime-local" value={draft.startAt} onChange={(e) => update({ startAt: e.target.value })}
                                        className="mt-1 h-9 bg-white border-olive/15 text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-olive/70 uppercase tracking-widest">Zobrazit do</label>
                                    <Input type="datetime-local" value={draft.endAt} onChange={(e) => update({ endAt: e.target.value })}
                                        className="mt-1 h-9 bg-white border-olive/15 text-sm" />
                                </div>
                            </div>
                            <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold ${SCHEDULE_STATUS[liveStatus].cls}`}>
                                <span className={`w-2 h-2 rounded-full ${SCHEDULE_STATUS[liveStatus].dot}`} />
                                {SCHEDULE_STATUS[liveStatus].label}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Typ baneru */}
            <div className="rounded-3xl border-2 border-olive/10 bg-white p-5 sm:p-6 mb-5">
                <div className="font-black text-olive-dark uppercase tracking-tight mb-3 text-sm">Typ (barva)</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TYPES.map((tp) => {
                        const st = BANNER_STYLES[tp];
                        const TIcon = TYPE_ICON[tp];
                        const active = draft.type === tp;
                        return (
                            <button key={tp} type="button" onClick={() => update({ type: tp })}
                                className={`rounded-2xl border-2 p-3 flex flex-col items-center gap-2 transition-all ${active ? 'border-primary ring-2 ring-primary/30' : 'border-olive/10 hover:border-olive/30'}`}>
                                <span className={`w-full rounded-lg py-1.5 flex items-center justify-center ${st.container}`}>
                                    <TIcon className="w-4 h-4" />
                                </span>
                                <span className="text-xs font-semibold text-olive-dark">{st.labelCs}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Texty */}
            <div className="rounded-3xl border-2 border-olive/10 bg-white p-5 sm:p-6 mb-5 space-y-4">
                <div className="font-black text-olive-dark uppercase tracking-tight text-sm">Text oznámení</div>
                <div>
                    <label className="text-xs font-semibold text-olive/70 uppercase tracking-widest">Česky</label>
                    <Textarea value={draft.textCs} onChange={(e) => update({ textCs: e.target.value })}
                        rows={2} placeholder="Např. V neděli 20. 7. probíhá údržba e-shopu…"
                        className="mt-1 bg-white border-olive/15 text-sm" />
                </div>
                <div>
                    <label className="text-xs font-semibold text-olive/70 uppercase tracking-widest">Anglicky</label>
                    <Textarea value={draft.textEn} onChange={(e) => update({ textEn: e.target.value })}
                        rows={2} placeholder="E.g. Scheduled maintenance on July 20…"
                        className="mt-1 bg-white border-olive/15 text-sm" />
                </div>
            </div>

            {/* Odkaz */}
            <div className="rounded-3xl border-2 border-olive/10 bg-white p-5 sm:p-6 mb-5 space-y-4">
                <div className="font-black text-olive-dark uppercase tracking-tight text-sm">Odkaz (volitelné)</div>
                <div>
                    <label className="text-xs font-semibold text-olive/70 uppercase tracking-widest">URL</label>
                    <Input value={draft.linkUrl} onChange={(e) => update({ linkUrl: e.target.value })}
                        placeholder="https://… nebo /kontakt" className="mt-1 h-9 bg-white border-olive/15 text-sm" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-olive/70 uppercase tracking-widest">Popisek CZ</label>
                        <Input value={draft.linkLabelCs} onChange={(e) => update({ linkLabelCs: e.target.value })}
                            placeholder="Více informací" className="mt-1 h-9 bg-white border-olive/15 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-olive/70 uppercase tracking-widest">Popisek EN</label>
                        <Input value={draft.linkLabelEn} onChange={(e) => update({ linkLabelEn: e.target.value })}
                            placeholder="Learn more" className="mt-1 h-9 bg-white border-olive/15 text-sm" />
                    </div>
                </div>
            </div>

            {/* Zavření křížkem */}
            <div className="rounded-3xl border-2 border-olive/10 bg-white p-5 sm:p-6 mb-5">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="font-black text-olive-dark uppercase tracking-tight text-sm">Povolit zavření křížkem</div>
                        <div className="text-[11px] text-olive/50 uppercase tracking-widest">{draft.dismissible ? 'Návštěvník může zavřít' : 'Nelze zavřít'}</div>
                    </div>
                    <button type="button" onClick={() => update({ dismissible: !draft.dismissible })}
                        className={`w-12 h-7 rounded-full flex items-center px-1 transition-all ${draft.dismissible ? 'bg-primary justify-end' : 'bg-olive/20 justify-start'}`} aria-pressed={draft.dismissible}>
                        <span className="w-5 h-5 rounded-full bg-white shadow flex items-center justify-center">{draft.dismissible && <Check className="w-3 h-3 text-primary" />}</span>
                    </button>
                </div>
            </div>

            {/* Náhled */}
            <div className="rounded-3xl border-2 border-olive/10 bg-white p-5 sm:p-6 mb-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="font-black text-olive-dark uppercase tracking-tight text-sm">Náhled</div>
                    <div className="flex gap-1">
                        {(['cs', 'en'] as const).map((lg) => (
                            <button key={lg} type="button" onClick={() => setPreviewLang(lg)}
                                className={`px-3 py-1 rounded-full text-xs font-semibold uppercase transition-all ${previewLang === lg ? 'bg-primary text-white' : 'bg-olive/10 text-olive/60'}`}>
                                {lg}
                            </button>
                        ))}
                    </div>
                </div>
                {previewText ? (
                    <div className={`w-full border rounded-xl ${style.container}`}>
                        <div className="px-4 py-2 flex items-center gap-3 text-sm">
                            <PreviewIcon className="w-4 h-4 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <span>{previewText}</span>
                                {draft.linkUrl && (
                                    <span className={`ml-2 font-semibold ${style.link}`}>{previewLinkLabel}</span>
                                )}
                            </div>
                            {draft.dismissible && <X className="w-4 h-4 shrink-0" />}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-6 text-olive/40 text-sm bg-olive/5 rounded-xl border border-dashed">
                        Zadej text pro náhled
                    </div>
                )}
            </div>

            {/* Uložit */}
            <div className="fixed bottom-0 left-0 right-0 sm:left-64 bg-white/95 backdrop-blur border-t border-olive/10 p-4 flex justify-end z-20">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Uložit nastavení
                </Button>
            </div>
        </div>
    );
};

export default BannerSettings;
