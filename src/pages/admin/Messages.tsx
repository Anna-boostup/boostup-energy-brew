import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { cs } from "date-fns/locale";
import { useContent } from "@/context/ContentContext";
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
    const [showDetailOnMobile, setShowDetailOnMobile] = useState(false);
    const { content } = useContent();
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
                title: content?.admin?.general?.error || "Error",
                description: content?.admin?.messages?.error || "Failed to fetch messages",
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
                title: content?.admin?.messages?.actions?.confirmDelete || "Deleted",
                description: content?.admin?.messages?.deleteDesc || "Message deleted successfully",
            });
        } catch (error) {
            console.error('Error deleting message:', error);
            toast({
                title: content?.admin?.general?.error || "Error",
                description: content?.admin?.general?.errorDesc || "Operation failed",
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
                title: content?.admin?.messages?.success?.replied || "Replied",
                description: content?.admin?.messages?.success?.repliedDesc || "Reply sent successfully",
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
                title: content?.admin?.general?.error || "Error",
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
        setShowDetailOnMobile(true);
        const msg = messages.find(m => m.id === id);
        if (msg && !msg.is_read) {
            markAsRead(id);
        }
    };

    const filteredMessages = messages.filter(m => 
        (m.subject || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.from_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.from_name && m.from_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const unreadCount = messages.filter(m => !m.is_read).length;

    if (loading && messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 data-testid="admin-loader" className="w-12 h-12 animate-spin text-olive-dark" />
                <p className="text-olive-dark font-black uppercase tracking-[0.4em] animate-pulse">Načítám zprávy...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-64px)] overflow-hidden bg-admin-canvas border border-olive-dark/10 rounded-[3rem] shadow-2xl animate-in fade-in duration-700">
            {/* Header Content */}
            <div className="p-6 sm:p-10 border-b border-background flex flex-col md:flex-row md:items-center justify-between gap-6 bg-admin-canvas/60">
                <div className="flex items-center gap-4 sm:gap-5">
                    <div className="p-3 sm:p-4 bg-olive-dark rounded-[1.2rem] sm:rounded-[1.5rem] shadow-lg shadow-olive-dark/10">
                        <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                        <h1 data-testid="admin-page-title" className="text-xl sm:text-3xl font-black text-olive-dark font-display uppercase tracking-tight leading-none">{content?.admin?.messages?.title || "Messages"}</h1>
                        <p className="text-[9px] sm:text-xs text-olive-dark/60 font-black uppercase tracking-[0.2em] mt-1.5">{content?.admin?.messages?.description}</p>
                    </div>
                    {unreadCount > 0 && (
                        <Badge className="bg-lime text-olive-dark font-black ml-4 px-3 sm:px-4 py-1.5 rounded-xl text-[9px] sm:text-[10px] tracking-widest border-none shadow-lg shadow-lime/20">
                            {unreadCount}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:w-72 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-olive-dark/40 transition-colors group-focus-within:text-olive-dark" />
                        <Input 
                            placeholder={content?.admin?.messages?.search || "Search..."} 
                            className="h-12 sm:h-14 pl-11 bg-admin-canvas/80 border-none rounded-2xl shadow-sm focus-visible:ring-olive-dark/20 focus-visible:ring-offset-0 text-sm font-bold placeholder:text-olive-dark/40"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={fetchMessages} disabled={loading} className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-admin-canvas/80 border-none shadow-sm hover:bg-admin-canvas transition-all active:scale-95 shrink-0">
                        <RefreshCcw className={`w-5 h-5 text-olive-dark/60 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* List Sidebar */}
                <div className="w-full md:w-80 lg:w-[400px] border-r border-background flex flex-col bg-background/20">
                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-3">
                            {filteredMessages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 text-center px-10">
                                    <div className="p-8 bg-admin-canvas rounded-[2.5rem] shadow-inner mb-6">
                                        <Inbox className="w-10 h-10 text-olive-dark/20" />
                                    </div>
                                    <p className="text-olive-dark font-black text-lg font-display uppercase tracking-tight"> {content?.admin?.messages?.empty || "Inbox empty"}</p>
                                    <p className="text-[10px] text-olive-dark/60 font-black uppercase tracking-widest mt-2">{content?.admin?.messages?.allResolved}</p>
                                </div>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <button
                                        key={msg.id}
                                        onClick={() => handleSelectMessage(msg.id)}
                                        className={`w-full text-left p-6 rounded-[2rem] transition-all duration-500 relative group border-2 ${
                                            selectedMessageId === msg.id 
                                                ? "bg-admin-canvas border-primary shadow-2xl shadow-primary/10 translate-x-2" 
                                                : "bg-transparent border-transparent hover:bg-olive-dark/5 hover:border-olive-dark/10"
                                        }`}
                                    >
                                        {!msg.is_read && (
                                            <div className="absolute top-6 right-6 w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20 animate-pulse" />
                                        )}
                                        <div className="flex flex-col gap-3">
                                            <div className="flex justify-between items-start">
                                                <span className={`text-[10px] uppercase font-black tracking-[0.15em] ${msg.is_read ? 'text-olive-dark/50' : 'text-primary'}`}>
                                                    {format(new Date(msg.created_at), "d. MMM · HH:mm", { locale: cs })}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className={`text-sm font-black uppercase tracking-tight line-clamp-1 ${selectedMessageId === msg.id ? 'text-olive-dark' : 'text-olive-dark'}`}>
                                                    {msg.subject}
                                                </h3>
                                                <p className={`text-[11px] font-black ${selectedMessageId === msg.id ? 'text-olive-dark/70' : 'text-olive-dark/60'} uppercase tracking-widest`}>
                                                    {msg.from_name || msg.from_email.split('@')[0]}
                                                </p>
                                            </div>
                                            <p className="text-xs text-olive-dark/60 line-clamp-2 leading-relaxed font-black italic opacity-85">
                                                "{msg.body_text}"
                                            </p>
                                            {msg.replied_at && (
                                                <div className="mt-1 flex items-center gap-1.5 pt-2 border-t border-background">
                                                    <CheckCheck className="w-3 h-3 text-primary" />
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{content?.admin?.messages?.status?.replied || "Replied"}</span>
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
                <div className={`${showDetailOnMobile ? 'flex' : 'hidden'} md:flex flex-1 bg-admin-canvas/40 flex-col`}>
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
                                <div className="p-6 sm:p-10 border-b border-background bg-admin-canvas/40 space-y-6 sm:space-y-8">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                                        <div className="space-y-4 flex-1 w-full">
                                            <div className="flex items-center gap-3 md:hidden mb-2">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    onClick={() => setShowDetailOnMobile(false)}
                                                    className="h-8 px-2 font-black uppercase text-[10px] tracking-widest text-primary hover:text-olive-dark"
                                                >
                                                    <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                                                    {content?.admin?.general?.back || "Back"}
                                                </Button>
                                            </div>
                                            <h2 className="text-2xl sm:text-4xl font-black text-olive-dark font-display leading-[1.1] uppercase tracking-tight">
                                                {selectedMessage.subject}
                                            </h2>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-olive-dark flex items-center justify-center shadow-lg">
                                                    <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="text-lg sm:text-xl font-black text-olive-dark leading-tight">
                                                        {selectedMessage.from_name || content?.admin?.messages?.status?.guest || "Guest"}
                                                    </p>
                                                    <p className="text-xs sm:text-sm text-olive-dark/60 font-black uppercase tracking-widest mt-0.5">
                                                        {selectedMessage.from_email}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 w-full sm:w-auto">
                                            {!isReplyMode && (
                                                <Button 
                                                    onClick={() => setIsReplyMode(true)}
                                                    className="h-12 sm:h-14 flex-1 sm:flex-initial px-6 sm:px-8 bg-olive-dark hover:bg-black text-primary font-black uppercase text-[10px] sm:text-xs tracking-widest rounded-2xl shadow-xl shadow-olive-dark/10"
                                                >
                                                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                                                    {content?.admin?.messages?.actions?.reply || "Reply"}
                                                </Button>
                                            )}
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-admin-canvas border border-background text-olive-dark/30 hover:text-red-500 hover:bg-red-500/10 transition-all">
                                                        <Trash2 className="w-5 h-5" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="rounded-[2.5rem] border-none p-10 shadow-2xl">
                                                    <AlertDialogHeader className="space-y-4">
                                                        <AlertDialogTitle className="text-3xl font-black text-olive-dark font-display uppercase tracking-tight">{content?.admin?.messages?.deleteTitle || "Delete Message"}</AlertDialogTitle>
                                                        <AlertDialogDescription className="text-olive-dark/60 font-black text-sm leading-relaxed">
                                                            {content?.admin?.messages?.deleteDesc}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter className="mt-8 gap-4">
                                                        <AlertDialogCancel className="h-14 px-8 rounded-2xl font-black uppercase text-xs tracking-widest border-background">{content?.admin?.messages?.actions?.cancel || "Cancel"}</AlertDialogCancel>
                                                        <AlertDialogAction 
                                                            onClick={() => deleteMessage(selectedMessage.id)}
                                                            className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white font-black uppercase text-xs tracking-widest rounded-2xl"
                                                        >
                                                            {content?.admin?.messages?.actions?.confirmDelete || "Delete"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap items-center gap-4 sm:gap-8 border-t border-background pt-6 sm:pt-8">
                                        <div className="flex items-center gap-3 text-[9px] sm:text-[10px] font-black text-olive-dark/60 uppercase tracking-[0.2em]">
                                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-background" />
                                            {content?.admin?.messages?.received || "Received"}: {format(new Date(selectedMessage.created_at), "d. MMMM yyyy HH:mm", { locale: content?.lang === 'cs' ? cs : undefined })}
                                        </div>
                                        {selectedMessage.replied_at && (
                                            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                                <div className="p-1 bg-primary/20 rounded-md">
                                                    <CheckCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                                </div>
                                                {content?.admin?.messages?.resolved || "Resolved"}: {format(new Date(selectedMessage.replied_at), "d. MMM HH:mm", { locale: content?.lang === 'cs' ? cs : undefined })}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Body Content */}
                                <ScrollArea className="flex-1">
                                    <div className="p-6 sm:p-10 space-y-8 sm:space-y-12">
                                        {/* Original Message */}
                                        <div className="space-y-4 sm:space-y-6">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1 h-3 sm:h-4 bg-primary rounded-full" />
                                                    <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-olive-dark/60">{content?.admin?.messages?.originalLabel || "Original Message"}</h3>
                                                </div>
                                            </div>
                                            <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-admin-canvas border border-background p-6 sm:p-10 shadow-sm leading-relaxed overflow-hidden">
                                                {selectedMessage.body_html ? (
                                                    <div 
                                                        className="prose prose-slate max-w-none prose-p:font-black prose-p:text-olive-dark/80 prose-headings:font-black text-sm sm:text-base"
                                                        dangerouslySetInnerHTML={{ __html: selectedMessage.body_html }} 
                                                    />
                                                ) : (
                                                    <p className="whitespace-pre-wrap font-display font-black text-olive-dark text-lg leading-relaxed">
                                                        {selectedMessage.body_text || content?.admin?.messages?.noContent || "No content"}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Reply History */}
                                        {selectedMessage.reply_text && (
                                            <div className="space-y-4 sm:space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-1 h-3 sm:h-4 bg-primary rounded-full shadow-[0_0_10px_rgba(196,241,53,0.5)]" />
                                                    <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-primary">{content?.admin?.messages?.replyLabel || "Reply"}</h3>
                                                </div>
                                                <div className="rounded-[2rem] sm:rounded-[2.5rem] bg-olive-dark border border-olive-dark p-6 sm:p-10 shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity">
                                                        <CheckCheck className="w-16 h-16 sm:w-20 sm:h-20 text-primary rotate-12" />
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
                                                className="space-y-6 pt-10 border-t border-background"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1 h-4 bg-olive-dark rounded-full" />
                                                        <h3 className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-olive-dark">{content?.admin?.messages?.writeReply || "Write Reply"}</h3>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => setIsReplyMode(false)} className="px-4 h-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-olive-dark/60 hover:text-olive-dark rounded-xl">{content?.admin?.messages?.actions?.cancel || "Cancel"}</Button>
                                                </div>
                                                <textarea 
                                                    className="w-full min-h-[200px] sm:min-h-[250px] p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border-2 border-background bg-admin-canvas shadow-inner focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all outline-none font-display font-black text-lg sm:text-xl text-olive-dark placeholder:text-olive-dark/20"
                                                    placeholder={content?.admin?.messages?.replyPlaceholder || "Type your reply..."}
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                />
                                                <div className="flex justify-end gap-4">
                                                    <Button 
                                                        onClick={handleSendReply}
                                                        disabled={isSending || !replyText.trim()}
                                                        className="h-14 sm:h-16 px-8 sm:px-10 bg-olive-dark hover:bg-black text-primary font-black uppercase text-xs sm:text-sm tracking-[0.15em] sm:tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 w-full sm:w-auto"
                                                    >
                                                        {isSending ? (
                                                            <><RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-3 animate-spin" /> {content?.admin?.messages?.actions?.saving || "Saving..."}</>
                                                        ) : (
                                                            <><Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-3" /> {content?.admin?.messages?.actions?.send || "Send"}</>
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
                                    className="p-16 bg-admin-canvas/40 rounded-[3rem] border-2 border-dashed border-background shadow-inner group"
                                >
                                    <div className="w-24 h-24 bg-admin-canvas rounded-[2rem] flex items-center justify-center shadow-2xl mx-auto mb-8 transition-transform duration-700 group-hover:rotate-12">
                                        <Mail className="w-10 h-10 text-primary" />
                                    </div>
                                    <h2 className="text-3xl font-black text-olive-dark font-display uppercase tracking-tight">
                                        {content?.admin?.messages?.selectMessage || "Select Message"}
                                    </h2>
                                    <p className="text-olive-dark/60 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
                                        {content?.admin?.messages?.clickMessage}
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
