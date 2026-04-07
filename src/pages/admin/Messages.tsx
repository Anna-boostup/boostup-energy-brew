import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { 
    Mail, 
    Search, 
    Trash2, 
    CheckCheck, 
    ChevronRight, 
    User, 
    Inbox,
    RefreshCcw,
    Eye,
    EyeOff,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    created_at: string;
    from_email: string;
    from_name: string | null;
    subject: string;
    body_text: string;
    body_html: string;
    is_read: boolean;
    metadata: any;
    replied_at?: string;
    reply_text?: string;
}

const Messages = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isReplyMode, setIsReplyMode] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const { toast } = useToast();

    const selectedMessage = messages.find(m => m.id === selectedMessageId);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast({
                title: "Chyba při načítání",
                description: "Nepodařilo se stáhnout zprávy.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
            setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const deleteMessage = async (id: string) => {
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setMessages(prev => prev.filter(m => m.id !== id));
            if (selectedMessageId === id) setSelectedMessageId(null);
            toast({
                title: "Zpráva smazána",
                description: "Zpráva byla úspěšně odstraněna z databáze.",
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            toast({
                title: "Chyba",
                description: "Nepodařilo se smazat zprávu.",
                variant: "destructive"
            });
        }
    };

    const handleSendReply = async () => {
        if (!selectedMessage || !replyText.trim()) return;

        setIsSending(true);
        try {
            // Include message_id if it exists in metadata
            const originalMessageId = selectedMessage.metadata?.message_id;

            const response = await fetch('/api/send-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageId: selectedMessage.id,
                    replyText: replyText,
                    customerEmail: selectedMessage.from_email,
                    originalSubject: selectedMessage.subject,
                    originalMessageId: originalMessageId
                })
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Failed to send reply');

            toast({
                title: "Odpověď odeslána",
                description: "Vaše zpráva byla úspěšně doručena zákazníkovi.",
            });

            // Update local state
            setMessages(prev => prev.map(m => 
                m.id === selectedMessage.id 
                    ? { ...m, replied_at: new Date().toISOString(), reply_text: replyText } 
                    : m
            ));
            
            setIsReplyMode(false);
            setReplyText("");
        } catch (error: any) {
            console.error('Error sending reply:', error);
            toast({
                title: "Chyba při odesílání",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsSending(false);
        }
    };

    const handleSelectMessage = (id: string) => {
        setSelectedMessageId(id);
        setIsReplyMode(false);
        setReplyText("");
        const msg = messages.find(m => m.id === id);
        if (msg && !msg.is_read) {
            markAsRead(id);
        }
    };

    const filteredMessages = messages.filter(m => 
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.from_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.from_name && m.from_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const unreadCount = messages.filter(m => !m.is_read).length;

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-64px)] overflow-hidden bg-white rounded-3xl border shadow-sm">
            {/* Header Content */}
            <div className="p-4 md:p-6 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/10 rounded-2xl">
                        <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-display font-black uppercase italic tracking-tight">Centrum Zpráv</h1>
                        <p className="text-xs text-slate-500 font-medium">Správa příchozích emailů od zákazníků</p>
                    </div>
                    {unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground font-black ml-2 px-2.5">
                            {unreadCount} NEPŘEČTENO
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input 
                            placeholder="Hledat odesílatele, předmět..." 
                            className="pl-9 bg-white border-slate-200 rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" size="icon" onClick={fetchMessages} disabled={loading} className="rounded-xl border-slate-200">
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* List Sidebar */}
                <div className="w-full md:w-80 lg:w-96 border-r flex flex-col bg-slate-50/30">
                    <ScrollArea className="flex-1">
                        <div className="p-3 space-y-2">
                            {filteredMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                    <div className="p-4 bg-slate-100 rounded-full mb-4">
                                        <Inbox className="w-8 h-8 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 font-bold text-sm">Žádné zprávy k zobrazení</p>
                                    <p className="text-xs text-slate-400 mt-1">Vše je vyřízeno nebo zkuste jiné hledání.</p>
                                </div>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <motion.button
                                        key={msg.id}
                                        onClick={() => handleSelectMessage(msg.id)}
                                        layoutId={msg.id}
                                        className={`w-full text-left p-4 rounded-2xl transition-all duration-300 relative group border ${
                                            selectedMessageId === msg.id 
                                                ? "bg-white border-primary shadow-lg shadow-primary/5 ring-1 ring-primary/20" 
                                                : "bg-transparent border-transparent hover:bg-white hover:border-slate-200"
                                        }`}
                                    >
                                        {!msg.is_read && (
                                            <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" />
                                        )}
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-start gap-2">
                                                <span className={`text-[10px] uppercase font-black tracking-widest ${msg.is_read ? 'text-slate-400' : 'text-primary'}`}>
                                                    {format(new Date(msg.created_at), "d. MMMM HH:mm", { locale: cs })}
                                                </span>
                                                {msg.replied_at && (
                                                    <Badge variant="outline" className="text-[9px] py-0 border-primary/20 text-primary">ODPOVĚZENO</Badge>
                                                )}
                                            </div>
                                            <div className="space-y-0.5">
                                                <h3 className={`text-sm font-black italic uppercase leading-none truncate ${selectedMessageId === msg.id ? 'text-slate-900' : 'text-slate-800'}`}>
                                                    {msg.subject}
                                                </h3>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[11px] font-bold text-slate-500 truncate">
                                                        {msg.from_name || msg.from_email}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-medium">
                                                {msg.body_text}
                                            </p>
                                        </div>
                                    </motion.button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Detail View */}
                <div className="hidden md:flex flex-1 bg-white flex-col">
                    <AnimatePresence mode="wait">
                        {selectedMessage ? (
                            <motion.div 
                                key={selectedMessage.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 flex flex-col h-full"
                            >
                                {/* Detail Header */}
                                <div className="p-6 border-b space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-display font-black uppercase italic leading-[0.9] tracking-tighter">
                                                {selectedMessage.subject}
                                            </h2>
                                            <div className="flex items-center gap-3 pt-2">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                                    <User className="w-5 h-5 text-slate-400" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 leading-tight">
                                                        {selectedMessage.from_name || "Neznámý odesílatel"}
                                                    </p>
                                                    <p className="text-xs text-slate-500 font-medium">
                                                        {selectedMessage.from_email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {!isReplyMode && (
                                                <Button 
                                                    onClick={() => setIsReplyMode(true)}
                                                    className="bg-primary hover:bg-primary/90 rounded-xl"
                                                >
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    Odpovědět
                                                </Button>
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="sm" className="rounded-xl border-red-100 text-red-500 hover:bg-red-50">
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Smazat
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-3xl border-slate-200">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle className="font-display font-black uppercase italic">Opravdu smazat zprávu?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Tato akce je nevratná. Zpráva bude trvale odstraněna z vaší historie.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="rounded-xl">Zrušit</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={() => deleteMessage(selectedMessage.id)}
                                                            className="bg-red-600 hover:bg-red-700 rounded-xl"
                                                        >
                                                            Smazat navždy
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            Přijato: {format(new Date(selectedMessage.created_at), "PPPP HH:mm", { locale: cs })}
                                        </div>
                                        {selectedMessage.replied_at && (
                                            <div className="flex items-center gap-1.5 text-primary">
                                                <CheckCheck className="w-3.5 h-3.5" />
                                                Odpovězeno: {format(new Date(selectedMessage.replied_at), "d. MMMM HH:mm", { locale: cs })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Body Content */}
                                <ScrollArea className="flex-1 p-6">
                                    <div className="space-y-8">
                                        {/* Original Message */}
                                        <Tabs defaultValue="plain" className="flex flex-col">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Původní zpráva</h3>
                                                <TabsList className="bg-slate-100 rounded-xl p-1">
                                                    <TabsTrigger value="plain" className="rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">Text</TabsTrigger>
                                                    <TabsTrigger value="html" className="rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:shadow-sm">HTML</TabsTrigger>
                                                </TabsList>
                                            </div>
                                            <div className="rounded-2xl border border-slate-100 bg-slate-50/20 p-6">
                                                <TabsContent value="plain" className="mt-0 outline-none">
                                                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed font-medium">
                                                        {selectedMessage.body_text || "Žádný obsah zprávy."}
                                                    </pre>
                                                </TabsContent>
                                                <TabsContent value="html" className="mt-0 outline-none">
                                                    {selectedMessage.body_html ? (
                                                        <div 
                                                            className="prose prose-sm max-w-none text-slate-700"
                                                            dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }} 
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center py-10 text-slate-400 italic text-sm font-medium">
                                                            HTML není k dispozici.
                                                        </div>
                                                    )}
                                                </TabsContent>
                                            </div>
                                        </Tabs>

                                        {/* Reply History */}
                                        {selectedMessage.reply_text && (
                                            <div className="space-y-4">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Vaše odpověď</h3>
                                                <div className="rounded-2xl border border-primary/10 bg-primary/[0.02] p-6">
                                                    <pre className="whitespace-pre-wrap font-sans text-sm text-slate-700 leading-relaxed font-medium">
                                                        {selectedMessage.reply_text}
                                                    </pre>
                                                </div>
                                            </div>
                                        )}

                                        {/* Reply Editor */}
                                        {isReplyMode && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-4 pt-4 border-t"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Nová odpověď</h3>
                                                    <Button variant="ghost" size="sm" onClick={() => setIsReplyMode(false)} className="h-7 text-[10px] font-bold">Zrušit</Button>
                                                </div>
                                                <textarea 
                                                    className="w-full min-h-[200px] p-4 rounded-2xl border-2 border-primary/20 focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none text-sm font-medium text-slate-700 leading-relaxed"
                                                    placeholder="Napište svou odpověď zde..."
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                />
                                                <div className="flex justify-end">
                                                    <Button 
                                                        onClick={handleSendReply}
                                                        disabled={isSending || !replyText.trim()}
                                                        className="bg-primary hover:bg-primary/90 rounded-xl px-8 h-12 font-bold"
                                                    >
                                                        {isSending ? (
                                                            <><RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> Odesílám...</>
                                                        ) : (
                                                            <><Mail className="w-4 h-4 mr-2" /> Odeslat odpověď</>
                                                        )}
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </motion.div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                                <motion.div 
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-8 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200"
                                >
                                    <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <h2 className="text-xl font-display font-black uppercase italic tracking-tight text-slate-400">
                                        Vyberte zprávu k přečtení
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1 font-bold">
                                        Klikněte na zprávu v seznamu pro zobrazení jejího obsahu a možnost odpovědět.
                                    </p>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Messages;
