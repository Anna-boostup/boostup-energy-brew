import React, { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { newsletterTemplateService } from "@/lib/newsletterTemplateService";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { 
    Plus,
    FileCode,
    RefreshCcw,
    Megaphone,
    Users,
    CheckCircle,
    Clock,
    ArrowRight,
    AlertCircle,
    Search,
    Database,
    Send,
    Mail,
    Zap,
    Key,
    Info,
    Loader2,
    Save,
    HelpCircle,
    Code,
    RefreshCw,
    Eye,
    X
} from "lucide-react";
import { EMAIL_DEFAULTS, EMAIL_BASE_LAYOUT } from '@/data/emailDefaults';
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/context/ContentContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface EmailTemplate {
    id: string;
    subject: string;
    content_html: string;
    placeholders: string[];
    updated_at: string;
}

const FRIENDLY_PLACEHOLDERS: Record<string, string> = {
    customerName: "Jméno zákazníka",
    orderNumber: "Číslo objednávky",
    itemsHtml: "Seznam produktů (tabulka)",
    total: "Celková cena",
    trackingNumber: "Sledovací kód dopravy",
    message: "Text zprávy",
    customerEmail: "Email odesílatele",
    resetLink: "Odkaz na zresetování hesla",
    magicLink: "Přihlašovací odkaz",
    subscriberEmail: "Email odběratele",
    BASE_URL: "Adresa webu (URL)"
};

const EmailManagement = () => {
    const { user } = useAuth();
    const { content } = useContent();

    const SYSTEM_TEMPLATES = [
        { id: 'order_confirmation', label: content?.admin?.emailManager?.templates?.order_confirmation, icon: Database },
        { id: 'shipping', label: content?.admin?.emailManager?.templates?.shipping, icon: Send },
        { id: 'contact_auto_reply', label: content?.admin?.emailManager?.templates?.contact_auto_reply, icon: Mail },
        { id: 'registration', label: content?.admin?.emailManager?.templates?.registration, icon: Zap },
        { id: 'reset_password', label: content?.admin?.emailManager?.templates?.reset_password, icon: Key },
        { id: 'magic_link', label: content?.admin?.emailManager?.templates?.magic_link, icon: Key },
        { id: 'contact_inquiry', label: content?.admin?.emailManager?.templates?.contact_inquiry, icon: Info },
        { id: 'newsletter_signup', label: content?.admin?.emailManager?.templates?.newsletter_signup, icon: Mail },
    ];

    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [templateTypes, setTemplateTypes] = useState(SYSTEM_TEMPLATES);
    const [selectedTypeId, setSelectedTypeId] = useState<string>(SYSTEM_TEMPLATES[0].id);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingTest, setSendingTest] = useState(false);
    const [searchParams] = useSearchParams();
    const [useMasterFrame, setUseMasterFrame] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // New template dialog state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [newId, setNewId] = useState('');
    const [newLabel, setNewLabel] = useState('');

    // Local form state
    const [currentSubject, setCurrentSubject] = useState('');
    const [currentContent, setCurrentContent] = useState('');

    // Campaign state
    const [subscribers, setSubscribers] = useState<{id: string, email: string}[]>([]);
    const [campaignLoading, setCampaignLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [sendProgress, setSendProgress] = useState(0);
    const [totalToSend, setTotalToSend] = useState(0);
    const [sentCount, setSentCount] = useState(0);
    const [selectedCampaignTemplate, setSelectedCampaignTemplate] = useState<string>('');

    useEffect(() => {
        fetchTemplates();
        const blogId = searchParams.get('from_blog');
        if (blogId) {
            importBlogContent(blogId);
        }
    }, [searchParams]);

    const importBlogContent = async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('blog_posts')
                .select('*')
                .eq('id', id)
                .single();
            
            if (error) throw error;
            if (data) {
                setCurrentSubject(data.title);
                setCurrentContent(data.content);
                setSelectedTypeId('newsletter_custom'); // Default to a custom type or keep existing
                toast.success("Obsah blogu byl úspěšně importován.");
            }
        } catch (err) {
            console.error('Error importing blog:', err);
            toast.error("Nepodařilo se importovat obsah blogu.");
        }
    };

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
            toast.error(content?.admin?.emailManager?.errors?.load || "Error loading templates");
        } finally {
            setLoading(false);
        }
    };

    const ActionBar = () => (
        <div className="fixed bottom-6 left-4 right-4 z-50 sm:hidden">
            <div className="bg-olive-dark/95 backdrop-blur-xl rounded-3xl p-3 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setIsPreviewOpen(true)} 
                        className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 text-lime active:bg-lime active:text-olive-dark transition-all"
                    >
                        <Eye className="h-5 w-5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleSendTest} 
                        disabled={sendingTest || saving} 
                        className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 text-white/70 active:bg-lime active:text-olive-dark transition-all"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={handleResetToDefault} 
                        disabled={saving || sendingTest}
                        className="h-12 w-12 rounded-2xl bg-white/5 border border-white/5 text-red-400/70 active:bg-red-500 active:text-white transition-all"
                    >
                        <RefreshCcw className="h-5 w-5" />
                    </Button>
                </div>
                <Button 
                    onClick={handleSave} 
                    disabled={saving || sendingTest}
                    className="flex-1 h-12 rounded-2xl bg-lime hover:bg-lime/90 text-olive-dark font-black uppercase text-[10px] tracking-[0.2em] shadow-xl active:scale-[0.97] transition-all gap-2"
                >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {content?.admin?.emailManager?.form?.save || "Save"}
                </Button>
            </div>
        </div>
    );

    useEffect(() => {
        const existing = templates.find(t => t.id === selectedTypeId);
        if (existing) {
            setCurrentSubject(existing.subject || '');
            setCurrentContent(existing.content_html || '');
        } else if (EMAIL_DEFAULTS[selectedTypeId]) {
            // Fallback to system defaults if no DB override exists
            setCurrentSubject(EMAIL_DEFAULTS[selectedTypeId].subject);
            setCurrentContent(EMAIL_DEFAULTS[selectedTypeId].content_html);
        } else {
            setCurrentSubject('');
            setCurrentContent('');
        }
    }, [selectedTypeId, templates]);

    const handleResetToDefault = () => {
        if (!EMAIL_DEFAULTS[selectedTypeId]) {
            toast.error(content?.admin?.emailManager?.errors?.defaultMissing || "Default not found");
            return;
        }

        setCurrentSubject(EMAIL_DEFAULTS[selectedTypeId].subject);
        setCurrentContent(EMAIL_DEFAULTS[selectedTypeId].content_html);
        toast.success(content?.admin?.emailManager?.success?.defaultLoaded || "Default template loaded");
    };

    const handleCreateTemplate = async () => {
        if (!newId.trim()) {
            toast.error(content?.admin?.emailManager?.errors?.idRequired || "ID is required");
            return;
        }

        const sanitizedId = newId.trim().toLowerCase().replace(/\s+/g, '_');
        
        if (templateTypes.some(t => t.id === sanitizedId)) {
            toast.error(content?.admin?.emailManager?.errors?.idExists || "ID already exists");
            return;
        }

        try {
            setSaving(true);
            const { error } = await supabase
                .from('email_templates')
                .insert({
                    id: sanitizedId,
                    subject: content?.admin?.emailManager?.editor?.newSubject || "New Subject",
                    content_html: content?.admin?.emailManager?.editor?.newContent || "<p>Content</p>",
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            
            toast.success(content?.admin?.emailManager?.success?.created || "Template created");
            setIsCreateOpen(false);
            setNewId('');
            setNewLabel('');
            await fetchTemplates();
            setSelectedTypeId(sanitizedId);
        } catch (err: any) {
            toast.error((content?.admin?.emailManager?.errors?.create || "Error creating template") + ": " + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleSave = async () => {
        if (!currentSubject.trim() || !currentContent.trim()) {
            toast.error(content?.admin?.emailManager?.errors?.fieldsRequired || "Fields required");
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
            
            toast.success(content?.admin?.emailManager?.success?.saved || "Template saved");
            fetchTemplates();
        } catch (err: any) {
            console.error('Error saving template:', err);
            toast.error((content?.admin?.emailManager?.errors?.save || "Error saving template") + ": " + err.message);
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
                    subject: currentSubject,
                    content_html: useMasterFrame 
                        ? newsletterTemplateService.render({ 
                            heroTitle: currentSubject, 
                            bodyContent: currentContent 
                        }) 
                        : currentContent,
                    customerName: content?.admin?.emailManager?.testData?.customerName || "Test Customer",
                    orderNumber: content?.admin?.emailManager?.testData?.orderNumber || "TEST-001",
                    total: 999,
                    trackingNumber: 'Z123456789',
                    message: content?.admin?.emailManager?.testData?.message || "Test message",
                    items: [
                        { name: content?.admin?.emailManager?.testData?.itemName1 || "Item 1", price: 69, quantity: 3 },
                        { name: content?.admin?.emailManager?.testData?.itemName2 || "Item 2", price: 290, quantity: 1 }
                    ]
                })
            });

            if (!response.ok) throw new Error('Failed to send email');
            
            toast.success((content?.admin?.emailManager?.success?.testSent || "Test sent to {email}").replace('{email}', user.email));
        } catch (err) {
            console.error('Test email error:', err);
            toast.error(content?.admin?.emailManager?.errors?.test || "Error sending test email");
        } finally {
            setSendingTest(false);
        }
    };

    const fetchSubscribers = async () => {
        try {
            setCampaignLoading(true);
            const { data, error } = await supabase
                .from('newsletter_subscriptions')
                .select('id, email');
            
            if (error) throw error;
            setSubscribers(data || []);
        } catch (err: any) {
            console.error('Error fetching subscribers:', err);
            toast.error(content?.admin?.emailManager?.errors?.subscribers || "Error fetching subscribers");
        } finally {
            setCampaignLoading(false);
        }
    };

    const handleSendCampaign = async () => {
        if (!selectedCampaignTemplate) {
            toast.error(content?.admin?.emailManager?.campaign?.selectTemplate || "Please select a template");
            return;
        }

        if (subscribers.length === 0) {
            toast.error(content?.admin?.emailManager?.campaign?.noSubscribers || "No subscribers found");
            return;
        }

        const confirmSend = window.confirm((content?.admin?.emailManager?.campaign?.confirm || "Send to {count} subscribers?").replace('{count}', subscribers.length.toString()));
        if (!confirmSend) return;

        setIsSending(true);
        setSendProgress(0);
        setSentCount(0);
        setTotalToSend(subscribers.length);

        const batchSize = 5;
        for (let i = 0; i < subscribers.length; i += batchSize) {
            const batch = subscribers.slice(i, i + batchSize);
            
            await Promise.all(batch.map(async (sub) => {
                try {
                    await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            to: sub.email,
                            type: selectedCampaignTemplate,
                            subject: currentSubject,
                            content_html: useMasterFrame 
                                ? newsletterTemplateService.render({ 
                                    heroTitle: currentSubject, 
                                    bodyContent: currentContent 
                                }) 
                                : currentContent,
                            subscription_id: sub.id
                        })
                    });
                    setSentCount(prev => prev + 1);
                } catch (err) {
                    console.error(`Failed to send campaign email to ${sub.email}:`, err);
                }
            }));

            const progress = Math.round(((i + batch.length) / subscribers.length) * 100);
            setSendProgress(progress);
            
            // Wait slightly between batches to avoid rate limits
            if (i + batchSize < subscribers.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        setIsSending(false);
        toast.success(content?.admin?.emailManager?.success?.campaignSent || "Campaign sent");
    };

    const selectedType = templateTypes.find(t => t.id === selectedTypeId);
    const filteredTypes = templateTypes.filter(t => 
        (t.label || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
        (t.id || "").toLowerCase().includes(searchQuery.toLowerCase())
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
                <Loader2 data-testid="admin-loader" className="w-10 h-10 animate-spin text-lime" />
                <p className="text-olive-dark font-black uppercase tracking-[0.3em] text-xs">{content?.admin?.emailManager?.loading || content?.admin?.general?.loading || "Loading..."}</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-32 animate-in fade-in duration-1000">
            {/* Header section moved above Tabs for better E2E synchronization */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-10 flex-wrap">
                <div className="space-y-3 flex-1 min-w-[280px]">
                    <h2 data-testid="admin-page-title" className="text-3xl sm:text-5xl font-black tracking-tighter text-olive-dark font-display uppercase italic leading-none">{content?.admin?.emailManager?.title || "Email Management"}</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        <p className="text-brand-muted font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px] leading-none">{content?.admin?.emailManager?.description}</p>
                    </div>
                </div>

                <div className="hidden sm:flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                    <Button 
                        onClick={() => setIsPreviewOpen(true)} 
                        variant="outline"
                        className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl border-white/10 text-white hover:bg-white/5 font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] transition-all gap-3"
                    >
                        <Eye className="h-4 sm:h-5 w-4 sm:w-5" />
                        Náhled
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        disabled={saving || sendingTest} 
                        className="h-12 sm:h-14 px-8 sm:px-12 rounded-2xl bg-olive-dark hover:bg-black text-white font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] shadow-2xl shadow-olive-dark/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-3"
                    >
                        {saving ? <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" /> : <Save className="h-4 sm:h-5 w-4 sm:w-5" />}
                        {content?.admin?.emailManager?.form?.save || "Save"}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="templates" className="w-full" onValueChange={(val) => {
                if (val === 'campaigns' && subscribers.length === 0) {
                    fetchSubscribers();
                }
            }}>

            {/* Mobile Template Selector (Horizontal) */}
            <div className="lg:hidden w-full overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 mask-fade-right">
                <div className="flex gap-3">
                    {templateTypes.map((type) => (
                        <Button
                            key={type.id}
                            variant={selectedTypeId === type.id ? "default" : "outline"}
                            onClick={() => setSelectedTypeId(type.id)}
                            className={`h-auto py-3 px-4 rounded-2xl flex flex-col items-center gap-2 min-w-[100px] transition-all border-none ${
                                selectedTypeId === type.id 
                                ? 'bg-olive-dark text-white ring-4 ring-olive/5' 
                                : 'bg-white text-olive-dark/60 hover:bg-white hover:text-olive-dark'
                            }`}
                        >
                            <type.icon className={`h-5 w-5 ${selectedTypeId === type.id ? 'text-lime' : 'text-olive-dark/20'}`} />
                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{type.label}</span>
                        </Button>
                    ))}
                    <Button
                        variant="ghost"
                        onClick={() => setIsCreateOpen(true)}
                        className="h-auto py-3 px-6 rounded-2xl border-2 border-dashed border-olive/10 flex flex-col items-center gap-2 min-w-[100px] text-olive-dark/30 hover:bg-white transition-all"
                    >
                        <Plus className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">{content?.admin?.emailManager?.buttons?.new || "NEW"}</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
                {/* Sidebar - Template List (Hidden on mobile, used on Desktop) */}
                <div className="hidden lg:block lg:col-span-4 space-y-6">
                    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-olive-dark shadow-olive-dark/20">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black uppercase italic tracking-tight text-white/90">{content?.admin?.emailManager?.templatesTitle || "Templates"}</CardTitle>
                            <CardDescription className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{content?.admin?.emailManager?.templatesDesc}</CardDescription>
                            
                            <div className="flex items-center justify-between gap-4 mt-6">
                                <div className="relative flex-1">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                                    <Input 
                                        placeholder={content?.admin?.emailManager?.editor?.searchPlaceholder || "Search..."} 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-white/10 border-white/5 rounded-xl pl-12 h-12 text-sm text-white focus-visible:ring-lime placeholder:text-white/20"
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
                                            <DialogTitle className="text-2xl font-black uppercase italic italic tracking-tight">{content?.admin?.emailManager?.dialogs?.createTitle || "New Template"}</DialogTitle>
                                            <DialogDescription className="text-white/40 font-bold uppercase text-[10px] tracking-widest mt-2">
                                                {content?.admin?.emailManager?.dialogs?.createDesc}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-6 py-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-white/40">{content?.admin?.emailManager?.dialogs?.idLabel || "Template ID"}</Label>
                                                <Input 
                                                    value={newId}
                                                    onChange={(e) => setNewId(e.target.value)}
                                                    placeholder={content?.admin?.emailManager?.dialogs?.idPlaceholder || "e.g. newsletter"}
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
                                                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (content?.admin?.emailManager?.dialogs?.createBtn || "Create") }
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
                                                    : 'hover:bg-white/5 text-white/50 hover:text-white'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-olive-dark/10' : 'bg-white/5 group-hover:bg-white/10'}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-xs font-black uppercase tracking-wider text-left">
                                                            {(type as any).isCustom && <span className="text-[8px] bg-olive-dark/20 px-1.5 py-0.5 rounded-sm mr-2 text-olive-dark/60">{content?.admin?.emailManager?.editor?.customBadge || "Custom"}</span>}
                                                            {type.label}
                                                        </span>
                                                        <span className={`text-[9px] font-bold tracking-widest opacity-30 uppercase`}>
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
                            <h4 className="font-black uppercase text-xs tracking-widest">{content?.admin?.emailManager?.editor?.howItWorks || "How it works"}</h4>
                        </div>
                        <p className="text-white/50 text-[11px] leading-relaxed font-bold">
                            {content?.admin?.emailManager?.editor?.howItWorksDesc}
                        </p>
                        <div className="pt-4 border-t border-white/5 text-white/30 text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-between">
                            <span>{content?.admin?.emailManager?.editor?.status || "Status"}:</span>
                            <span className="text-lime flex items-center gap-1">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                LIVE
                            </span>
                        </div>
                    </Card>
                </div>

                {/* Main Editor */}
                <div className="lg:col-span-8 space-y-8">
                    <Card className="border-none shadow-2xl rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white shadow-olive/10">
                        <div className="bg-olive-dark py-8 sm:py-10 px-6 sm:px-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="p-3 sm:p-4 bg-lime/10 rounded-2xl border border-lime/20">
                                        <Code className="w-6 h-6 sm:w-8 sm:h-8 text-lime" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-3xl font-black text-white font-display uppercase tracking-tight italic">
                                            {selectedType?.label}
                                        </h3>
                                        <p className="text-white/60 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] mt-2">{content?.admin?.emailManager?.description}</p>
                                    </div>
                                </div>
                                {!templates.some(t => t.id === selectedTypeId) && (
                                    <Badge className="bg-olive/20 text-lime border-none py-1.5 px-4 rounded-full font-black text-[8px] sm:text-[9px] tracking-widest hidden sm:flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                                        {content?.admin?.emailManager?.editor?.default || "Default"}
                                    </Badge>
                                )}
                            </div>
                        </div>

                        <CardContent className="p-6 sm:p-12 space-y-10">
                            {/* Layout Reference Alert */}
                            <div className="bg-lime/5 border border-lime/20 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 mb-4">
                                <div className="flex items-center gap-3 sm:gap-4 text-left mr-auto">
                                    <div className="p-2 sm:p-3 bg-lime/10 rounded-xl">
                                        <FileCode className="w-4 h-4 sm:w-5 sm:h-5 text-lime" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-black text-olive-dark uppercase tracking-wide">{content?.admin?.emailManager?.editor?.structure || "Structure"}</h4>
                                        <p className="text-[9px] sm:text-[11px] text-olive-dark/70 font-bold">{content?.admin?.emailManager?.editor?.structureDesc}</p>
                                    </div>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" className="w-full sm:w-auto bg-white border-lime/30 text-olive-dark font-black text-[9px] uppercase tracking-widest px-4 rounded-xl hover:bg-lime hover:border-lime transition-all h-10">
                                            {content?.admin?.emailManager?.editor?.viewHtml || "View HTML"}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col p-0 border-none bg-olive-dark">
                                        <div className="p-8 border-b border-white/5">
                                            <h3 className="text-xl font-black text-white uppercase italic tracking-tight">{content?.admin?.emailManager?.dialogs?.htmlTitle || "Layout HTML"}</h3>
                                            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mt-1">{content?.admin?.emailManager?.dialogs?.htmlDesc}</p>
                                        </div>
                                        <ScrollArea className="flex-1 p-8">
                                            <pre className="text-[11px] text-white/70 font-mono leading-relaxed bg-black/30 p-8 rounded-2xl whitespace-pre-wrap">
                                                {EMAIL_BASE_LAYOUT}
                                            </pre>
                                        </ScrollArea>
                                        <div className="p-6 bg-black/20 flex justify-end gap-3">
                                            <Button 
                                                variant="ghost"
                                                className="text-white/40 hover:text-white uppercase text-[10px] font-black tracking-widest"
                                                onClick={() => {
                                                    const fullHtml = EMAIL_BASE_LAYOUT
                                                        .replace('{{subject}}', currentSubject)
                                                        .replace('{{content_html}}', currentContent);
                                                    const blob = new Blob([fullHtml], { type: 'text/html' });
                                                    const url = URL.createObjectURL(blob);
                                                    window.open(url, '_blank');
                                                }}
                                            >
                                                {content?.admin?.emailManager?.editor?.previewFull || "Preview Full"}
                                            </Button>
                                            <Button 
                                                className="bg-lime text-olive-dark font-black uppercase text-[10px] tracking-widest px-8 rounded-xl h-11 shadow-lg shadow-lime/20"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(EMAIL_BASE_LAYOUT);
                                                    toast.success(content?.admin?.emailManager?.editor?.copySuccess || "Copied to clipboard");
                                                }}
                                            >
                                                {content?.admin?.emailManager?.editor?.copyBase || "Copy Base"}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            {/* Subject Field */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark/70 pl-1">{content?.admin?.emailManager?.editor?.subject || "Subject"}</Label>
                                    <div className="flex items-center gap-2">
                                        <Badge 
                                            variant="outline" 
                                            className="text-white/50 bg-white/5 hover:bg-lime hover:text-olive-dark cursor-pointer text-[9px] border-white/10 font-black transition-all px-3 py-1 gap-2 rounded-lg" 
                                            onClick={() => setCurrentSubject(currentSubject + ' {{orderNumber}}')}
                                        >
                                            <Plus className="w-3 h-3" />
                                            Číslo objednávky
                                        </Badge>
                                    </div>
                                </div>
                                <Input 
                                    value={currentSubject}
                                    onChange={(e) => setCurrentSubject(e.target.value)}
                                    placeholder={content?.admin?.emailManager?.editor?.subjectPlaceholder || "Email Subject"}
                                    className="h-16 rounded-2xl bg-background border-transparent font-black text-olive-dark text-lg px-8 focus-visible:ring-lime shadow-sm"
                                />
                            </div>

                            {/* HTML Content Editor */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-olive-dark/70 pl-1">{content?.admin?.emailManager?.editor?.content || "HTML Content"}</Label>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[9px] font-black text-olive/20 uppercase tracking-widest">{content?.admin?.emailManager?.editor?.styleLabel}</span>
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <Switch 
                                            checked={useMasterFrame} 
                                            onCheckedChange={setUseMasterFrame} 
                                            className="data-[state=checked]:bg-lime"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-olive-dark/80">Použít Master Šablonu</span>
                                            <span className="text-[8px] text-olive-dark/50 uppercase font-black tracking-widest">Zabalit obsah do značkového layoutu BoostUp</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="bg-lime/10 text-lime border-lime/20 text-[8px] font-black">ACTIVE</Badge>
                                </div>

                                <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-1 -mx-2 px-2">
                                    {getPlaceholdersForType(selectedTypeId).map((tag) => (
                                        <Button
                                            key={tag}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentContent(currentContent + `{{${tag}}}`)}
                                            className="h-9 rounded-xl bg-lime/10 border-lime/20 text-lime font-black text-[9px] uppercase tracking-widest whitespace-nowrap px-4 hover:bg-lime hover:text-olive-dark transition-all flex items-center gap-2"
                                        >
                                            <Zap className="w-3 h-3" />
                                            {FRIENDLY_PLACEHOLDERS[tag] || tag}
                                        </Button>
                                    ))}
                                </div>
                                <RichTextEditor
                                    value={currentContent}
                                    onChange={setCurrentContent}
                                    placeholder="Zadejte obsah newsletteru..."
                                />
                            </div>

                            {/* Placeholders Help (Desktop) */}
                            <div className="hidden sm:block p-10 bg-olive-dark rounded-[2rem] space-y-6 shadow-xl">
                                <div className="flex items-center gap-4">
                                    <Info className="w-5 h-5 text-lime" />
                                    <h4 className="font-black uppercase text-xs tracking-widest text-white">{content?.admin?.emailManager?.editor?.tagsTitle || "Available Tags"}</h4>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {getPlaceholdersForType(selectedTypeId).map((tag) => (
                                        <button
                                            key={tag}
                                            onClick={() => setCurrentContent(currentContent + `{{${tag}}}`)}
                                            className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-lime hover:border-lime group transition-all duration-300"
                                        >
                                            <div className="p-1.5 rounded-lg bg-white/10 group-hover:bg-olive-dark/10">
                                                <Plus className="w-3 h-3 text-lime group-hover:text-olive-dark" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-white/70 group-hover:text-olive-dark">
                                                {FRIENDLY_PLACEHOLDERS[tag] || tag}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[9px] font-bold text-white/20 italic tracking-wider">
                                    {content?.admin?.emailManager?.editor?.tagsNote}
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
                                <h4 className="text-olive-dark font-black uppercase text-sm tracking-tight">{content?.admin?.emailManager?.editor?.previewCtaTitle}</h4>
                                <p className="text-olive-dark/60 text-[10px] font-bold uppercase tracking-widest mt-1">{content?.admin?.emailManager?.editor?.previewCtaDesc}</p>
                            </div>
                        </div>
                        <Button 
                            variant="ghost" 
                            disabled={sendingTest || saving}
                            onClick={handleSendTest}
                            className="bg-olive-dark text-white rounded-xl h-12 px-8 font-black uppercase text-[10px] tracking-widest hover:bg-black hover:scale-105 transition-all w-full sm:w-auto relative z-10"
                        >
                            {sendingTest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                            {content?.admin?.emailManager?.form?.test || "Test"}
                        </Button>
                    </Card>
                </div>
            </div>
            </TabsContent>

            <TabsContent value="campaigns" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Campaign Controls */}
                    <div className="lg:col-span-12">
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 sm:gap-10 mb-8 sm:mb-12">
                            <div className="space-y-3">
                                <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-olive-dark font-display uppercase italic leading-none">{content?.admin?.emailManager?.campaign?.title || "Campaign"}</h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                                    <p className="text-brand-muted font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px] leading-none">{content?.admin?.emailManager?.campaign?.description}</p>
                                </div>
                            </div>

                            <Button 
                                onClick={handleSendCampaign}
                                disabled={isSending || !selectedCampaignTemplate || subscribers.length === 0}
                                className="h-14 px-12 rounded-2xl bg-olive-dark hover:bg-black text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-olive-dark/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-3"
                            >
                                {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                {isSending ? (content?.admin?.emailManager?.campaign?.sending || "Sending...") : (content?.admin?.emailManager?.campaign?.start || "Start Campaign")}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
                            {/* Audience Info */}
                            <Card className="border-none shadow-2xl rounded-[2.5rem] bg-olive-dark text-white p-6 sm:p-10 overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-lime/10 blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-2xl">
                                            <Users className="w-6 h-6 text-lime" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{content?.admin?.emailManager?.campaign?.target || "Target Audience"}</p>
                                            <h4 className="text-xl font-black uppercase italic">{content?.admin?.emailManager?.campaign?.subscribers || "Subscribers"}</h4>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-6 border-t border-white/5">
                                        {campaignLoading ? (
                                            <Loader2 className="w-8 h-8 animate-spin text-lime" />
                                        ) : (
                                            <p className="text-6xl font-black tracking-tighter text-lime">{subscribers.length}</p>
                                        )}
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-2">{content?.admin?.emailManager?.campaign?.activeEmails || "Active Emails"}</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-lime/60 italic mt-6">
                                        <Info className="w-3 h-3" />
                                        {content?.admin?.emailManager?.campaign?.sourceNote}
                                    </div>
                                </div>
                            </Card>

                            {/* Campaign Setup */}
                            <Card className="lg:col-span-2 border-none shadow-2xl rounded-[2.5rem] bg-white p-6 sm:p-10">
                                <div className="space-y-6 sm:space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-olive-dark/40">{content?.admin?.emailManager?.campaign?.selectTemplate || "Select Template"}</Label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {templateTypes.map((type) => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setSelectedCampaignTemplate(type.id)}
                                                    className={`p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${
                                                        selectedCampaignTemplate === type.id
                                                        ? 'border-lime bg-lime/5 text-olive-dark'
                                                        : 'border-olive/5 bg-background hover:border-olive/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-2 rounded-xl transition-colors ${selectedCampaignTemplate === type.id ? 'bg-lime text-olive-dark' : 'bg-olive/5'}`}>
                                                            {React.createElement(type.icon, { className: "w-4 h-4" })}
                                                        </div>
                                                        <span className="text-xs font-black uppercase tracking-widest">{type.label}</span>
                                                    </div>
                                                    {selectedCampaignTemplate === type.id && <CheckCircle className="w-5 h-5 text-lime" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {isSending && (
                                        <div className="space-y-4 p-8 bg-background rounded-3xl border border-olive/10 animate-in slide-in-from-bottom-4">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 animate-spin text-lime" />
                                                    {content?.admin?.emailManager?.campaign?.sending || "Sending..."}
                                                </span>
                                                <span className="text-lime">{sendProgress}%</span>
                                            </div>
                                            <Progress value={sendProgress} className="h-3 bg-olive/5" />
                                            <p className="text-center text-[10px] font-bold text-olive-dark/40 uppercase tracking-widest">
                                                {(content?.admin?.emailManager?.campaign?.progressStatus || "{sentCount} / {totalToSend}").replace('{sentCount}', sentCount.toString()).replace('{totalToSend}', totalToSend.toString())}
                                            </p>
                                        </div>
                                    )}

                                    {!isSending && selectedCampaignTemplate && (
                                        <div className="space-y-4">
                                            <div className="p-6 bg-lime/10 border border-lime/30 rounded-2xl flex items-start gap-4">
                                                <AlertCircle className="w-6 h-6 text-lime shrink-0 mt-1" />
                                                <div className="space-y-1">
                                                    <h5 className="text-[10px] font-black uppercase tracking-widest text-olive-dark">{(content?.admin?.emailManager?.campaign?.completed || "Ready").toUpperCase()}</h5>
                                                    <p className="text-[11px] font-bold text-olive-dark/60">
                                                        {content?.admin?.emailManager?.campaign?.startDesc}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </TabsContent>
            </Tabs>

            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                <DialogContent className="max-w-[95vw] w-[900px] h-[90vh] p-0 overflow-hidden bg-background border-none rounded-[2rem] sm:rounded-[3rem] shadow-2xl">
                    <div className="flex flex-col h-full">
                        <div className="bg-olive-dark p-6 sm:p-8 flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-white font-black uppercase tracking-widest text-[10px] opacity-40">Náhled Emailu</h3>
                                <p className="text-white font-display text-lg sm:text-2xl font-black italic">{currentSubject || "Bez předmětu"}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setIsPreviewOpen(false)}
                                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 text-white"
                            >
                                <X className="w-6 h-6" />
                            </Button>
                        </div>
                        
                        <div className="flex-1 bg-[#f4f1e6] overflow-y-auto p-4 sm:p-12 flex justify-center">
                            <div className="w-full max-w-[680px] bg-white shadow-2xl rounded-2xl overflow-hidden min-h-full">
                                <iframe 
                                    srcDoc={
                                        useMasterFrame 
                                            ? newsletterTemplateService.render({ 
                                                heroTitle: currentSubject, 
                                                bodyContent: currentContent 
                                            }) 
                                            : `<!DOCTYPE html><html><head><style>body{font-family:sans-serif;padding:40px;line-height:1.6;}</style></head><body>${currentContent}</body></html>`
                                    }
                                    className="w-full h-full min-h-[600px] border-none"
                                    title="Email Preview"
                                />
                            </div>
                        </div>

                        <div className="bg-white border-t border-olive/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 text-[10px] font-black uppercase text-olive-dark/40 tracking-[0.2em]">
                                <Mail className="w-4 h-4" />
                                Modul: {selectedTypeId}
                                {useMasterFrame && <Badge className="bg-lime/10 text-lime border-none ml-2">Master Frame</Badge>}
                            </div>
                            <Button 
                                onClick={handleSendTest} 
                                disabled={sendingTest}
                                className="w-full sm:w-auto bg-olive-dark text-white font-black uppercase text-[10px] tracking-widest px-8 h-12 rounded-xl"
                            >
                                {sendingTest ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                Odeslat testovací email
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <ActionBar />
        </div>
    );
};

export default EmailManagement;
