import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Search, XCircle, CheckCircle, UserPlus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";

const SubscriptionCancel = () => {
    const { toast } = useToast();
    const [orderId, setOrderId] = useState('');
    const [email, setEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [info, setInfo] = useState<any>(null);
    const [done, setDone] = useState<string | null>(null);

    const call = async (action: string, immediate = false) => {
        setBusy(true);
        try {
            const res = await fetch('/api/subscription-cancel-public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, email, action, immediate }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) { toast({ title: 'Chyba', description: data?.error || 'Zkuste to prosím znovu.', variant: 'destructive' }); return null; }
            return data;
        } catch (e: any) {
            toast({ title: 'Chyba', description: e?.message || 'Zkuste to prosím znovu.', variant: 'destructive' });
            return null;
        } finally { setBusy(false); }
    };

    const lookup = async () => {
        setDone(null); setInfo(null);
        const data = await call('lookup');
        if (data) setInfo(data);
    };
    const cancel = async () => {
        const data = await call('cancel', false);
        if (data?.ok) { setDone(data.message); setInfo(null); }
    };

    return (
        <div className="max-w-xl mx-auto px-4 py-16 pt-28">
            <h1 className="text-3xl font-black font-display uppercase tracking-tight mb-2">Zrušení předplatného</h1>
            <p className="text-muted-foreground mb-8">Předplatné zrušíte i bez účtu — zadejte číslo objednávky a e-mail, na který bylo předplatné založené.</p>

            {done ? (
                <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-6 flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Hotovo</p>
                        <p className="text-sm text-muted-foreground mt-1">{done}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Číslo objednávky</label>
                        <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="BUP..." className="mt-1 w-full bg-background border-2 border-border rounded-xl px-4 py-3 font-bold" />
                    </div>
                    <div>
                        <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">E-mail</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vas@email.cz" className="mt-1 w-full bg-background border-2 border-border rounded-xl px-4 py-3 font-bold" />
                    </div>
                    <Button onClick={lookup} disabled={busy || !orderId || !email} className="gap-2">
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Najít předplatné
                    </Button>

                    {info && (
                        <div className="rounded-2xl border-2 border-border p-5 mt-4 space-y-3">
                            {info.hasActiveSubscription ? (
                                <>
                                    <p className="text-sm">
                                        K objednávce jsme našli aktivní předplatné{info.nextDate ? <> — další odeslání <b>{new Date(info.nextDate).toLocaleDateString('cs-CZ')}</b></> : null}.
                                        {info.pendingCancel ? ' Zrušení už je naplánované ke konci období.' : ''}
                                    </p>
                                    {!info.pendingCancel && (
                                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                                            <p className="text-sm font-bold text-foreground">Nechcete rušit?</p>
                                            <p className="text-xs text-muted-foreground">
                                                Se založeným účtem zásilku jen posunete, změníte dopravu nebo předplatné pozastavíte — změnu termínu, dopravy i pauzu lze udělat jen po přihlášení. Rušit tak vůbec nemusíte.
                                            </p>
                                            <Link to="/register" className="inline-block">
                                                <Button variant="outline" size="sm" className="gap-2 mt-1">
                                                    <UserPlus className="w-4 h-4" /> Založit účet
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                    {!info.pendingCancel && (
                                        <Button onClick={cancel} disabled={busy} variant="destructive" className="gap-2">
                                            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Zrušit ke konci období
                                        </Button>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Chcete <b>odstoupit od smlouvy do 14 dnů</b> (s vrácením peněz)? Použijte{' '}
                                        <Link to={`/odstoupeni-od-smlouvy?orderId=${encodeURIComponent(orderId)}&email=${encodeURIComponent(email)}`} className="underline text-primary">formulář pro odstoupení</Link>.
                                    </p>
                                </>
                            ) : (
                                <p className="text-sm text-muted-foreground">K této objednávce jsme nenašli aktivní předplatné (možná už bylo zrušené, nebo objednávka nebyla předplatné).</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SubscriptionCancel;
