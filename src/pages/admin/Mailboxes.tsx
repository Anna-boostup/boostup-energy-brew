import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Plus, Inbox, Trash2, Edit2, Loader2, Save, Mail, Server, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Mailbox {
    id: string;
    email_address: string;
    imap_host: string;
    imap_port: number;
    imap_user: string;
    smtp_host: string;
    smtp_port: number;
    smtp_user: string;
    purpose: 'general' | 'invoices';
    is_active: boolean;
    last_synced_at: string | null;
}

export default function Mailboxes() {
    const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email_address: '',
        imap_host: '',
        imap_port: 993,
        imap_user: '',
        imap_password: '',
        smtp_host: '',
        smtp_port: 465,
        smtp_user: '',
        smtp_password: '',
        purpose: 'general' as 'general' | 'invoices',
        is_active: true
    });

    useEffect(() => {
        fetchMailboxes();
    }, []);

    const fetchMailboxes = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('mailboxes')
                .select('id, email_address, imap_host, imap_port, imap_user, smtp_host, smtp_port, smtp_user, purpose, is_active, last_synced_at')
                .order('created_at', { ascending: false });

            if (error) {
                if (error.code === '42P01') {
                    console.log('Mailboxes table not created yet.');
                    return;
                }
                throw error;
            }
            setMailboxes(data || []);
        } catch (err: any) {
            console.error('Error fetching mailboxes:', err);
            toast.error("Nepodařilo se načíst schránky.");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (mailbox?: Mailbox) => {
        if (mailbox) {
            setEditingId(mailbox.id);
            setFormData({
                email_address: mailbox.email_address,
                imap_host: mailbox.imap_host,
                imap_port: mailbox.imap_port,
                imap_user: mailbox.imap_user,
                imap_password: '',
                smtp_host: mailbox.smtp_host,
                smtp_port: mailbox.smtp_port,
                smtp_user: mailbox.smtp_user,
                smtp_password: '',
                purpose: mailbox.purpose,
                is_active: mailbox.is_active
            });
        } else {
            setEditingId(null);
            setFormData({
                email_address: '',
                imap_host: '',
                imap_port: 993,
                imap_user: '',
                imap_password: '',
                smtp_host: '',
                smtp_port: 465,
                smtp_user: '',
                smtp_password: '',
                purpose: 'general',
                is_active: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.email_address || !formData.imap_host || !formData.smtp_host) {
            toast.error("Vyplňte všechny povinné údaje (E-mail, IMAP Host, SMTP Host)");
            return;
        }

        try {
            setLoading(true);
            const payload: any = { ...formData };
            if (editingId && !payload.imap_password) delete payload.imap_password;
            if (editingId && !payload.smtp_password) delete payload.smtp_password;

            if (editingId) {
                const { error } = await supabase
                    .from('mailboxes')
                    .update(payload)
                    .eq('id', editingId);
                if (error) throw error;
                toast.success("Schránka úspěšně upravena.");
            } else {
                if (!payload.imap_password || !payload.smtp_password) {
                    toast.error("Pro novou schránku musíte zadat heslo.");
                    setLoading(false);
                    return;
                }
                const { error } = await supabase
                    .from('mailboxes')
                    .insert([payload]);
                if (error) throw error;
                toast.success("Schránka úspěšně přidána.");
            }
            setIsDialogOpen(false);
            fetchMailboxes();
        } catch (err: any) {
            console.error('Error saving mailbox:', err);
            toast.error(err.message || "Nepodařilo se uložit schránku.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Opravdu smazat tuto schránku? Historie zpráv zůstane zachována.")) return;
        try {
            const { error } = await supabase.from('mailboxes').delete().eq('id', id);
            if (error) throw error;
            toast.success("Schránka byla smazána.");
            fetchMailboxes();
        } catch (err: any) {
            console.error('Error deleting mailbox:', err);
            toast.error("Chyba při mazání.");
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display font-black text-4xl text-olive-dark tracking-tight uppercase flex items-center gap-3">
                        <Inbox className="w-10 h-10 text-lime" />
                        E-mailové schránky
                    </h1>
                    <p className="text-olive-light mt-2 text-lg">
                        Správa integrovaných e-mailových účtů pro příjem faktur a komunikaci se zákazníky.
                    </p>
                </div>
                <Button 
                    onClick={() => handleOpenDialog()}
                    className="bg-lime hover:bg-lime-hover text-olive-dark font-bold rounded-2xl h-12 px-6 shadow-xl"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Přidat schránku
                </Button>
            </div>

            {loading && mailboxes.length === 0 ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-lime" />
                </div>
            ) : mailboxes.length === 0 ? (
                <Card className="border-dashed border-2 border-olive-light/20 bg-transparent shadow-none">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm mb-4">
                            <Mail className="w-8 h-8 text-olive-light/50" />
                        </div>
                        <h3 className="font-display font-bold text-xl text-olive-dark">Zatím žádné schránky</h3>
                        <p className="text-olive-light mt-2 mb-6 max-w-md">
                            Přidejte e-mailovou schránku pro automatické stahování faktur a komunikaci se zákazníky přímo z administrace.
                        </p>
                        <Button onClick={() => handleOpenDialog()} variant="outline" className="rounded-2xl border-olive-light/30 text-olive-dark">
                            Přidat první schránku
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mailboxes.map(mb => (
                        <Card key={mb.id} className="rounded-3xl border-0 shadow-xl overflow-hidden group">
                            <div className="p-6 bg-white">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl ${mb.purpose === 'invoices' ? 'bg-terracotta/10 text-terracotta' : 'bg-lime/20 text-olive-dark'}`}>
                                        <Inbox className="w-6 h-6" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(mb)} className="h-8 w-8 rounded-xl text-olive-light hover:text-olive-dark hover:bg-olive-light/10">
                                            <Edit2 className="w-4 h-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(mb.id)} className="h-8 w-8 rounded-xl text-olive-light hover:text-red-500 hover:bg-red-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                                
                                <h3 className="font-bold text-lg text-olive-dark mb-1 truncate" title={mb.email_address}>
                                    {mb.email_address}
                                </h3>
                                <div className="flex items-center gap-2 mb-6">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        mb.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {mb.is_active ? 'Aktivní' : 'Neaktivní'}
                                    </span>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-olive-light/10 text-olive-dark capitalize">
                                        {mb.purpose === 'invoices' ? 'Faktury' : 'Zprávy'}
                                    </span>
                                </div>

                                <div className="space-y-3 text-sm text-olive-light bg-admin-canvas/50 rounded-2xl p-4">
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Server className="w-4 h-4" /> IMAP</span>
                                        <span className="font-mono text-xs">{mb.imap_host}:{mb.imap_port}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="flex items-center gap-2"><Send className="w-4 h-4" /> SMTP</span>
                                        <span className="font-mono text-xs">{mb.smtp_host}:{mb.smtp_port}</span>
                                    </div>
                                </div>
                                
                                <div className="mt-4 text-xs text-olive-light/60 text-center">
                                    Poslední synchronizace: {mb.last_synced_at ? new Date(mb.last_synced_at).toLocaleString('cs-CZ') : 'Nikdy'}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-3xl border-0 shadow-2xl p-0 overflow-hidden bg-white">
                    <div className="p-6 bg-olive-dark text-white">
                        <DialogHeader>
                            <DialogTitle className="font-display font-black text-2xl uppercase tracking-widest">
                                {editingId ? "Úprava Schránky" : "Nová Schránka"}
                            </DialogTitle>
                            <DialogDescription className="text-white/60">
                                Nastavte přístupové údaje pro připojení k e-mailovému serveru.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                    
                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-2">
                            <Label>E-mailová adresa</Label>
                            <Input 
                                value={formData.email_address}
                                onChange={e => setFormData({...formData, email_address: e.target.value})}
                                placeholder="např. dodavatele@drinkboostup.cz"
                                className="rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Účel schránky</Label>
                                <select 
                                    className="flex h-10 w-full items-center justify-between rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.purpose}
                                    onChange={e => setFormData({...formData, purpose: e.target.value as any})}
                                >
                                    <option value="general">Obecné Zprávy (Komunikace)</option>
                                    <option value="invoices">Faktury (Automatické naskladnění)</option>
                                </select>
                            </div>
                            <div className="space-y-2 flex flex-col justify-center">
                                <Label>Aktivní připojení</Label>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Switch 
                                        checked={formData.is_active}
                                        onCheckedChange={c => setFormData({...formData, is_active: c})}
                                    />
                                    <span className="text-sm text-olive-light">Povolit stahování</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-admin-canvas/50 p-4 rounded-2xl border border-olive-light/10 space-y-4">
                            <h4 className="font-bold flex items-center gap-2"><Server className="w-4 h-4"/> Příchozí pošta (IMAP)</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-xs">Server (Host)</Label>
                                    <Input value={formData.imap_host} onChange={e => setFormData({...formData, imap_host: e.target.value})} placeholder="imap.wedos.net" className="rounded-xl h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Port</Label>
                                    <Input type="number" value={formData.imap_port} onChange={e => setFormData({...formData, imap_port: parseInt(e.target.value)})} className="rounded-xl h-8 text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Uživatelské jméno</Label>
                                    <Input value={formData.imap_user} onChange={e => setFormData({...formData, imap_user: e.target.value})} placeholder="email@domena.cz" className="rounded-xl h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Heslo {editingId && "(Ponechte prázdné pro zachování)"}</Label>
                                    <Input type="password" value={formData.imap_password} onChange={e => setFormData({...formData, imap_password: e.target.value})} placeholder="***" className="rounded-xl h-8 text-sm" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-admin-canvas/50 p-4 rounded-2xl border border-olive-light/10 space-y-4">
                            <h4 className="font-bold flex items-center gap-2"><Send className="w-4 h-4"/> Odchozí pošta (SMTP)</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-xs">Server (Host)</Label>
                                    <Input value={formData.smtp_host} onChange={e => setFormData({...formData, smtp_host: e.target.value})} placeholder="smtp.wedos.net" className="rounded-xl h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Port</Label>
                                    <Input type="number" value={formData.smtp_port} onChange={e => setFormData({...formData, smtp_port: parseInt(e.target.value)})} className="rounded-xl h-8 text-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs">Uživatelské jméno</Label>
                                    <Input value={formData.smtp_user} onChange={e => setFormData({...formData, smtp_user: e.target.value})} placeholder="email@domena.cz" className="rounded-xl h-8 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Heslo {editingId && "(Ponechte prázdné pro zachování)"}</Label>
                                    <Input type="password" value={formData.smtp_password} onChange={e => setFormData({...formData, smtp_password: e.target.value})} placeholder="***" className="rounded-xl h-8 text-sm" />
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 rounded-b-3xl">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-10">Zrušit</Button>
                        <Button onClick={handleSave} disabled={loading} className="bg-olive-dark hover:bg-olive-dark/90 text-white rounded-xl h-10">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Uložit
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
