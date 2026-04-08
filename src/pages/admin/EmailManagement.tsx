import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
    Mail, 
    Save, 
    Send, 
    Loader2, 
    Info, 
    Code, 
    Eye, 
    Database, 
    HelpCircle,
    ChevronRight,
    Search,
    RefreshCw,
    Zap,
    Key,
    Plus
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface EmailTemplate {
    id: string;
    subject: string;
    content_html: string;
    placeholders: string[];
    updated_at: string;
}

const SYSTEM_TEMPLATES = [
    { id: 'order_confirmation', label: 'Potvrzení objednávky', icon: Database },
    { id: 'shipping', label: 'Odeslání zásilky', icon: Send },
    { id: 'contact_auto_reply', label: 'Automatická odpověď kontaktu', icon: Mail },
    { id: 'registration', label: 'Uvítání nového uživatele', icon: Zap },
    { id: 'reset_password', label: 'Reset hesla', icon: Key },
    { id: 'magic_link', label: 'Rychlé přihlášení', icon: Key },
    { id: 'contact_inquiry', label: 'Nová zpráva (pro admina)', icon: Info },
    { id: 'newsletter_signup', label: 'Přihlášení newsletteru', icon: Mail },
];

const EmailManagement = () => {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [templateTypes, setTemplateTypes] = useState(SYSTEM_TEMPLATES);
    const [selectedTypeId, setSelectedTypeId] = useState<string>(SYSTEM_TEMPLATES[0].id);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // New template dialog state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newId, setNewId] = useState('');
    const [newLabel, setNewLabel] = useState('');

    // Local form state
    const [currentSubject, setCurrentSubject] = useState('');
    const [currentContent, setCurrentContent] = useState('');

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('email_templates')
                .select('*');
            
            if (error) throw error;
            const dbData = data || [];
            setTemplates(dbData);
            
            // Merge system templates with custom ones found in DB
            const customTypes = dbData
                .filter(dbT => !SYSTEM_TEMPLATES.some(sysT => sysT.id === dbT.id))
                .map(dbT => ({
                    id: dbT.id,
                    label: dbT.id.toUpperCase().replace(/_/g, ' '),
                    icon: Mail,
                    isCustom: true
                }));
            
            setTemplateTypes([...SYSTEM_TEMPLATES, ...customTypes]);

            // Set initial form values for the selected type if template exists
            const existing = dbData.find(t => t.id === selectedTypeId);
            if (existing) {
                setCurrentSubject(existing.subject);
                setCurrentContent(existing.content_html);
            }
        } catch (err: any) {
            console.error('Error fetching templates:', err);
            toast.error("Nepodařilo se načíst šablony");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const existing = templates.find(t => t.id === selectedTypeId);
        if (existing) {
            setCurrentSubject(existing.subject || '');
            setCurrentContent(existing.content_html || '');
        } else {
            // Find if it's a known system template we haven't overridden yet
            setCurrentSubject('');
            setCurrentContent('');
        }
    }, [selectedTypeId, templates]);

    const handleCreateTemplate = async () => {
        if (!newId.trim()) {
            toast.error("ID šablony je povinné");
            return;
        }

        const sanitizedId = newId.trim().toLowerCase().replace(/\s+/g, '_');
        
        if (templateTypes.some(t => t.id === sanitizedId)) {
            toast.error("Šablona s tímto ID již existuje");
            return;
        }

        try {
            setSaving(true);
            const { error } = await supabase
                .from('email_templates')
                .insert({
                    id: sanitizedId,
                    subject: 'Nový e-mail',
                    content_html: '<p>Tady začněte psát svůj e-mail...</p>',
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            
            toast.success("Nová šablona byla vytvořena");
            setIsCreateOpen(false);
            setNewId('');
            setNewLabel('');
            await fetchTemplates();
            setSelectedTypeId(sanitizedId);
        } catch (err: any) {
            toast.error("Chyba při vytváření: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!currentSubject.trim() || !currentContent.trim()) {
            toast.error("Předmět i obsah musí být vyplněny");
            return;
        }

        try {
            setSaving(true);
            const { error } = await supabase
                .from('email_templates')
                .upsert({
                    id: selectedTypeId,
                    subject: currentSubject,
                    content_html: currentContent,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            
            toast.success("Šablona byla uložena");
            fetchTemplates();
        } catch (err: any) {
            console.error('Error saving template:', err);
            toast.error("Nepodařilo se uložit šablonu: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSendTest = async () => {
        if (!user?.email) return;

        try {
            setSendingTest(true);
            const response = await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    to: user.email,
                    type: selectedTypeId,
                    customerName: 'Test Testovič',
                    orderNumber: 'TEST-12345',
                    total: 999,
                    trackingNumber: 'Z123456789',
                    message: 'Toto je testovací zpráva pro náhled šablony.',
                    items: [
                        { name: 'BoostUp Lemon Blast', price: 69, quantity: 3 },
                        { name: 'BoostUp Mixed Pack', price: 290, quantity: 1 }
                    ]
                })
            });

            if (!response.ok) throw new Error('Failed to send email');
            
            toast.success(`Testovací email byl odeslán na ${user.email}`);
        } catch (err) {
            console.error('Test email error:', err);
            toast.error("Chyba při odesílání testovacího emailu");
        } finally {
            setSendingTest(false);
        }
    };

    const selectedType = templateTypes.find(t => t.id === selectedTypeId);
    const filteredTypes = templateTypes.filter(t => 
        t.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getPlaceholdersForType = (typeId: string) => {
        switch (typeId) {
            case 'order_confirmation': return ['customerName', 'orderNumber', 'itemsHtml', 'total', 'BASE_URL'];
            case 'shipping': return ['customerName', 'orderNumber', 'trackingNumber', 'BASE_URL'];
            case 'contact_auto_reply': return ['message', 'BASE_URL'];
            case 'registration': return ['customerName', 'BASE_URL'];
            case 'reset_password': return ['resetLink', 'BASE_URL'];
            case 'magic_link': return ['magicLink', 'BASE_URL'];
            case 'contact_inquiry': return ['customerName', 'customerEmail', 'message', 'BASE_URL'];
            case 'newsletter_signup': return ['subscriberEmail', 'BASE_URL'];
            default: return ['BASE_URL'];
        }
    };

    if (loading && templates.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-lime" />
                <p className="text-olive-dark font-black uppercase tracking-[0.3em] text-xs">Načítám engine šablon...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-32 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 flex-wrap">
                <div className="space-y-3">
                    <h2 className="text-5xl font-black tracking-tighter text-olive-dark font-display uppercase italic leading-none">EMAIL CMS</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        <p className="text-brand-muted font-black uppercase tracking-[0.4em] text-[10px] leading-none">Správa systémových emailů a šablon</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 ml-auto">
                    <Button 
                        variant="outline" 
                        onClick={handleSendTest} 
                        disabled={sendingTest || saving} 
                        className="h-14 px-8 rounded-2xl bg-white border-olive/10 text-olive-dark font-black uppercase text-[10px] tracking-widest shadow-xl shadow-olive/5 hover:bg-olive hover:text-white transition-all gap-3"
                    >
                        {sendingTest ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                        Odeslat test na můj mail
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={saving || sendingTest} 
                        className="h-14 px-12 rounded-2xl bg-olive-dark hover:bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-olive-dark/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-3"
                    >
                        {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                        Uložit šablonu
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Sidebar - Template List */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="glass-card border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-olive-dark shadow-olive-dark/10">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black uppercase italic tracking-tight text-white/90">Systémové Emaily</CardTitle>
                            <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Vyberte šablonu k úpravě</CardDescription>
                            
                            <div className="flex items-center justify-between gap-4 mt-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                                    <Input 
                                        placeholder="Hledat šablonu..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-white/5 border-white/10 rounded-xl pl-12 h-12 text-sm text-white focus-visible:ring-lime"
                                    />
                                </div>
                                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="h-12 w-12 rounded-xl bg-lime text-olive-dark hover:scale-105 transition-all p-0 shadow-lg shadow-lime/20">
                                            <Plus className="w-6 h-6" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-olive-dark border-white/10 text-white rounded-[2rem]">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black uppercase italic italic tracking-tight">Vytvořit nový e-mail</DialogTitle>
                                            <DialogDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-2">
                                                Definujte ID šablony pro systémové použití.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-6 py-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">Unikátní ID (např. leto_akce)</Label>
                                                <Input 
                                                    value={newId}
                                                    onChange={(e) => setNewId(e.target.value)}
                                                    placeholder="bez mezer a diakritiky"
                                                    className="bg-white/5 border-white/10 h-14 rounded-xl text-white font-bold"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button 
                                                onClick={handleCreateTemplate}
                                                disabled={saving}
                                                className="w-full h-14 bg-lime text-olive-dark font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white transition-all shadow-xl shadow-lime/10"
                                            >
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Vytvořit šablonu"}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4">
                            <ScrollArea className="h-[500px] pr-4">
                                <div className="space-y-2">
                                    {filteredTypes.map((type) => {
                                        const Icon = type.icon;
                                        const isActive = selectedTypeId === type.id;
                                        const isStored = templates.some(t => t.id === type.id);

                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => setSelectedTypeId(type.id)}
                                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group ${
                                                    isActive 
                                                    ? 'bg-lime text-olive-dark shadow-lg shadow-lime/20' 
                                                    : 'hover:bg-white/5 text-white/60 hover:text-white'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-olive-dark/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-xs font-black uppercase tracking-wider text-left">
                                                            {(type as any).isCustom && <span className="text-[8px] bg-olive-dark/20 px-1.5 py-0.5 rounded-sm mr-2 text-olive-dark/60">VLASTNÍ</span>}
                                                            {type.label}
                                                        </span>
                                                        <span className={`text-[9px] font-bold tracking-widest opacity-40 uppercase`}>
                                                            {type.id}
                                                        </span>
                                                    </div>
                                                </div>
                                                {isStored && (
                                                    <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-olive-dark' : 'bg-lime'}`} />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card className="bg-olive-dark border-none shadow-2xl rounded-[2rem] p-8 space-y-4">
                        <div className="flex items-center gap-4 text-lime">
                            <HelpCircle className="w-5 h-5" />
                            <h4 className="font-black uppercase text-xs tracking-widest">Jak to funguje?</h4>
                        </div>
                        <p className="text-white/50 text-[11px] leading-relaxed font-bold">
                            Texty, které vložíte do databáze, přepíší výchozí nastavení v kódu. Pokud chcete obnovit původní text, stačí smazat obsah a uložit, nebo ponechat šablonu prázdnou.
                        </p>
                        <div className="pt-4 border-t border-white/5 text-white/30 text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-between">
                            <span>Status Engine:</span>
                            <span className="text-lime flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                LIVE
                            </span>
                        </div>
                    </Card>
                </div>

                {/* Main Editor */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="glass-card border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white shadow-olive/10">
                        <div className="bg-olive-dark py-10 px-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="p-4 bg-lime/10 rounded-2xl border border-lime/20">
                                        <Code className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-white font-display uppercase tracking-tight italic">
                                            {selectedType?.label}
                                        </h3>
                                        <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.4em] mt-2">Editace HTML šablony a metadat</p>
                                    </div>
                                </div>
                                {!templates.some(t => t.id === selectedTypeId) && (
                                    <Badge className="bg-terracotta text-white border-none py-1.5 px-4 rounded-full font-black text-[9px] tracking-widest">
                                        POUŽÍVÁ SE VÝCHOZÍ KÓD
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <CardContent className="p-12 space-y-10">
                            {/* Subject Field */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark/40 pl-1">Předmět E-mailu</Label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-olive/30 hover:bg-olive/5 cursor-pointer text-[9px] border-olive/10" onClick={() => setCurrentSubject(currentSubject + ' {{orderNumber}}')}>+ {"{{orderNumber}}"}</Badge>
                                    </div>
                                </div>
                                <Input 
                                    value={currentSubject}
                                    onChange={(e) => setCurrentSubject(e.target.value)}
                                    placeholder="Zadejte předmět emailu..."
                                    className="h-16 rounded-2xl bg-background border-transparent font-black text-olive-dark text-lg px-8 focus-visible:ring-lime shadow-sm"
                                />
                            </div>

                            {/* HTML Content Editor */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark/40 pl-1">HTML Tělo E-mailu</Label>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[9px] font-black text-olive/20 uppercase tracking-widest">Styl: BoostUp Premium Layout</span>
                                    </div>
                                </div>
                                <div className="relative group">
                                    <Textarea 
                                        value={currentContent}
                                        onChange={(e) => setCurrentContent(e.target.value)}
                                        placeholder="Zadejte HTML kód šablony..."
                                        className="min-h-[500px] rounded-[2rem] bg-background border-transparent font-mono text-sm text-olive-dark p-10 focus-visible:ring-lime shadow-sm leading-relaxed resize-none"
                                    />
                                </div>
                            </div>

                            {/* Placeholders Help */}
                            <div className="p-10 bg-olive-dark rounded-[2rem] space-y-6 shadow-xl">
                                <div className="flex items-center gap-4">
                                    <Info className="w-5 h-5 text-lime" />
                                    <h4 className="font-black uppercase text-xs tracking-widest text-white">Dostupné Značky (Placeholders)</h4>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {getPlaceholdersForType(selectedTypeId).map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => setCurrentContent(currentContent + `{{${tag}}}`)}
                                            className="px-4 py-2 bg-white/5 hover:bg-lime hover:text-olive-dark rounded-xl text-[10px] font-black tracking-widest text-white/40 transition-all border border-white/5 flex items-center gap-2 group"
                                        >
                                            <span className="opacity-40 group-hover:opacity-100">{"{{"}</span>
                                            {tag}
                                            <span className="opacity-40 group-hover:opacity-100">{"}}"}</span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[9px] font-bold text-white/20 italic tracking-wider">
                                    Kliknutím na značku ji vložíte do editoru. Tyto značky budou při odesílání automaticky nahrazeny reálnými údaji.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Preview Card */}
                    <Card className="bg-lime p-8 rounded-[2rem] border-none shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[80px] -translate-y-1/2 translate-x-1/2 rounded-full group-hover:scale-150 transition-transform duration-1000" />
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-14 h-14 bg-olive-dark rounded-2xl flex items-center justify-center text-white shadow-xl">
                                <Eye className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="text-olive-dark font-black uppercase text-sm tracking-tight">Chcete vidět jak to vypadá?</h4>
                                <p className="text-olive-dark/60 text-[10px] font-bold uppercase tracking-widest mt-1">Odešlete si testovací email s těmito změnami</p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            disabled={sendingTest || saving}
                            onClick={handleSendTest}
                            className="bg-olive-dark text-white rounded-xl h-12 px-8 font-black uppercase text-[10px] tracking-widest hover:bg-black hover:scale-105 transition-all w-full sm:w-auto relative z-10"
                        >
                            {sendingTest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            Odeslat náhled
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EmailManagement;
