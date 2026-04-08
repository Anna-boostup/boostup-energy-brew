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
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-64px)] overflow-hidden bg-white/40 backdrop-blur-xl rounded-[3rem] border border-white/60 shadow-2xl animate-in fade-in duration-700">
            {/* Header Content */}
            <div className="p-8 md:p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/60">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-slate-900 rounded-[1.5rem] shadow-lg shadow-slate-900/10">
                        <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 font-display uppercase tracking-tight">Centrum Zpráv</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Interakce se zákazníky</p>
                    </div>
                    {unreadCount > 0 && (
                        <Badge className="bg-primary text-slate-900 font-black ml-4 px-4 py-1.5 rounded-xl text-[10px] tracking-widest border-none">
                            {unreadCount} NOVÉ
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative w-full md:w-72 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 transition-colors group-focus-within:text-primary" />
                        <Input 
                            placeholder="Hledat..." 
                            className="h-12 pl-11 bg-white/80 border-none rounded-2xl shadow-sm focus-visible:ring-primary focus-visible:ring-offset-0 text-sm font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchMessages} disabled={loading} className="h-12 w-12 rounded-2xl bg-white/80 border-none shadow-sm hover:bg-white transition-all active:scale-95">
                        <RefreshCcw className={`w-5 h-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* List Sidebar */}
                <div className="w-full md:w-80 lg:w-[400px] border-r border-slate-100 flex flex-col bg-slate-50/20">
                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-3">
                            {filteredMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                                    <div className="p-8 bg-white rounded-[2.5rem] shadow-inner mb-6">
                                        <Inbox className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <p className="text-slate-900 font-black text-lg font-display uppercase tracking-tight"> Inbox je prázdný</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Všechny zprávy vyřízeny.</p>
                                </div>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <button
                                        key={msg.id}
                                        onClick={() => handleSelectMessage(msg.id)}
                                        className={`w-full text-left p-6 rounded-[2rem] transition-all duration-500 relative group border-2 ${
                                            selectedMessageId === msg.id 
                                                ? "bg-white border-primary shadow-2xl shadow-primary/10 translate-x-2" 
                                                : "bg-transparent border-transparent hover:bg-white/50 hover:border-slate-100"
                                        }`}
                                    >
                                        {!msg.is_read && (
                                            <div className="absolute top-6 right-6 w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20 animate-pulse" />
                                        )}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <span className={`text-[10px] uppercase font-black tracking-[0.15em] ${msg.is_read ? 'text-slate-400' : 'text-primary'}`}>
                                                    {format(new Date(msg.created_at), "d. MMM · HH:mm", { locale: cs })}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className={`text-sm font-black uppercase tracking-tight line-clamp-1 ${selectedMessageId === msg.id ? 'text-slate-900' : 'text-slate-700'}`}>
                                                    {msg.subject}
                                                </h3>
                                                <p className={`text-[11px] font-bold ${selectedMessageId === msg.id ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-widest`}>
                                                    {msg.from_name || msg.from_email.split('@')[0]}
                                                </p>
                                            </div>
                                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-bold italic opacity-80">
                                                "{msg.body_text}"
                                            </p>
                                            {msg.replied_at && (
                                                <div className="mt-1 flex items-center gap-1.5 pt-2 border-t border-slate-50">
                                                    <CheckCheck className="w-3 h-3 text-primary" />
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">Odpovězeno</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Detail View */}
                <div className="hidden md:flex flex-1 bg-white/40 flex-col">
                    <AnimatePresence mode="wait">
                        {selectedMessage ? (
                            <motion.div 
                                key={selectedMessage.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.5 }}
                                className="flex-1 flex flex-col h-full"
                            >
                                {/* Detail Header */}
                                <div className="p-10 border-b border-slate-100 bg-white/40 space-y-8">
                                    <div className="flex justify-between items-start gap-6">
                                        <div className="space-y-4 flex-1">
                                            <h2 className="text-4xl font-black text-slate-900 font-display leading-[1.1] uppercase tracking-tight">
                                                {selectedMessage.subject}
                                            </h2>
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                                                    <User className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-slate-900 leading-tight">
                                                        {selectedMessage.from_name || "Host"}
                                                    </p>
                                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                        {selectedMessage.from_email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            {!isReplyMode && (
                                                <Button 
                                                    onClick={() => setIsReplyMode(true)}
                                                    className="h-14 px-8 bg-slate-900 hover:bg-black text-primary font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl shadow-slate-900/10"
                                                >
                                                    <Mail className="w-5 h-5 mr-3" />
                                                    Odpovědět
                                                </Button>
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white border border-slate-100 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-[2.5rem] border-none p-10 shadow-2xl">
                                                    <AlertDialogHeader className="space-y-4">
                                                        <AlertDialogTitle className="text-3xl font-black text-slate-900 font-display uppercase tracking-tight">Smazat konverzaci?</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-slate-400 font-bold text-sm leading-relaxed">
                                                            Tato akce trvale odstraní zprávu z databáze. Tuto operaci nelze vzít zpět.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="mt-8 gap-4">
                                                        <AlertDialogCancel className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest border-slate-200">Zrušit</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={() => deleteMessage(selectedMessage.id)}
                                                            className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl"
                                                        >
                                                            Potvrdit smazání
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-8 border-t border-slate-100 pt-8">
                                        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <Clock className="w-4 h-4 text-slate-200" />
                                            PŘIJATO: {format(new Date(selectedMessage.created_at), "d. MMMM yyyy HH:mm", { locale: cs })}
                                        </div>
                                        {selectedMessage.replied_at && (
                                            <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                                <div className="p-1 bg-primary/20 rounded-md">
                                                    <CheckCheck className="w-3.5 h-3.5" />
                                                </div>
                                                VYŘÍZENO: {format(new Date(selectedMessage.replied_at), "d. MMM HH:mm", { locale: cs })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Body Content */}
                                <ScrollArea className="flex-1">
                                    <div className="p-10 space-y-12">
                                        {/* Original Message */}
                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1 h-4 bg-primary rounded-full" />
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Původní dopis</h3>
                                                </div>
                                            </div>
                                            <div className="rounded-[2.5rem] bg-white border border-slate-100 p-10 shadow-sm leading-relaxed overflow-hidden">
                                                {selectedMessage.body_html ? (
                                                    <div 
                                                        className="prose prose-slate max-w-none prose-p:font-bold prose-p:text-slate-600 prose-headings:font-black"
                                                        dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }} 
                                                    />
                                                ) : (
                                                    <p className="whitespace-pre-wrap font-display font-black text-slate-900 text-lg leading-relaxed">
                                                        {selectedMessage.body_text || "Bez obsahu."}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reply History */}
                                        {selectedMessage.reply_text && (
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1 h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(196,241,53,0.5)]" />
                                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Vaše reakce</h3>
                                                </div>
                                                <div className="rounded-[2.5rem] bg-slate-900 border border-slate-800 p-10 shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                                                        <CheckCheck className="w-20 h-20 text-primary rotate-12" />
                                                    </div>
                                                    <p className="whitespace-pre-wrap font-display font-black text-white text-lg leading-relaxed relative z-10">
                                                        {selectedMessage.reply_text}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Reply Editor */}
                                        {isReplyMode && (
                                            <motion.div 
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="space-y-6 pt-10 border-t border-slate-100"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1 h-4 bg-slate-900 rounded-full" />
                                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Napsat odpověď</h3>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => setIsReplyMode(false)} className="px-4 h-8 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 rounded-xl">Zrušit</Button>
                                                </div>
                                                <textarea 
                                                    className="w-full min-h-[250px] p-10 rounded-[2.5rem] border-2 border-slate-100 bg-white shadow-inner focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none font-display font-black text-xl text-slate-900 placeholder:text-slate-200"
                                                    placeholder="Napište něco skvělého..."
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-4">
                                                    <Button 
                                                        onClick={handleSendReply}
                                                        disabled={isSending || !replyText.trim()}
                                                        className="h-16 px-10 bg-slate-900 hover:bg-black text-primary font-black uppercase text-sm tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                                                    >
                                                        {isSending ? (
                                                            <><RefreshCcw className="w-5 h-5 mr-3 animate-spin" /> Odesílám...</>
                                                        ) : (
                                                            <><Mail className="w-5 h-5 mr-3" /> Odeslat Teď</>
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
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="p-16 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner group"
                                >
                                    <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl mx-auto mb-8 transition-transform duration-700 group-hover:rotate-12">
                                        <Mail className="w-10 h-10 text-primary" />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900 font-display uppercase tracking-tight">
                                        Vyberte zprávu
                                    </h2>
                                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
                                        Klikněte na konverzaci v levém panelu
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
