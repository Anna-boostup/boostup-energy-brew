import React from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    HelpCircle, Globe, ShoppingCart, Package, Factory,
    Type, Save, ToggleLeft, ChevronRight,
    AlertTriangle, Mail, MousePointer2, BarChart, Gift, Settings2, Zap, Layout, ShieldCheck, Palette,
    Database, Send, Info, Key, Newspaper, Loader2
} from "lucide-react";
import { useContent } from "@/context/ContentContext";

interface HelpItem {
    label: string;
    description: string;
}

interface Section {
    icon: React.ElementType;
    title: string;
    description: string;
    items: HelpItem[];
    image?: string;
}

const AdminHelp = () => {
    const { content, loading } = useContent();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 data-testid="admin-loader" className="w-12 h-12 animate-spin text-olive-dark" />
                <p className="text-olive-dark font-black uppercase tracking-[0.4em] animate-pulse">{content?.admin?.general?.loading || "Načítám nápovědu..."}</p>
            </div>
        );
    }

    const sections: Section[] = [
        {
            icon: Globe,
            title: content?.admin?.help?.sections?.content?.title || "Content Management",
            description: content?.admin?.help?.sections?.content?.description || "Manage your website content",
            image: "/admin-guide/content-management.png",
            items: [
                { label: content?.admin?.help?.sections?.content?.items?.hero?.label || "Hero Section", description: content?.admin?.help?.sections?.content?.items?.hero?.desc || "Manage top banner" },
                { label: content?.admin?.help?.sections?.content?.items?.mission?.label || "Mission", description: content?.admin?.help?.sections?.content?.items?.mission?.desc || "Manage mission text" },
                { label: content?.admin?.help?.sections?.content?.items?.ingredients?.label || "Ingredients", description: content?.admin?.help?.sections?.content?.items?.ingredients?.desc || "Manage ingredients" },
                { label: content?.admin?.help?.sections?.content?.items?.concept?.label || "Concept", description: content?.admin?.help?.sections?.content?.items?.concept?.desc || "Manage concept section" },
                { label: content?.admin?.help?.sections?.content?.items?.cta?.label || "CTA", description: content?.admin?.help?.sections?.content?.items?.cta?.desc || "Manage call to action" },
                { label: content?.admin?.help?.sections?.content?.items?.contact?.label || "Contact", description: content?.admin?.help?.sections?.content?.items?.contact?.desc || "Manage contact details" },
                { label: content?.admin?.help?.sections?.content?.items?.flavors?.label || "Flavors", description: content?.admin?.help?.sections?.content?.items?.flavors?.desc || "Manage flavors" },
                { label: content?.admin?.help?.sections?.content?.items?.footer?.label || "Footer", description: content?.admin?.help?.sections?.content?.items?.footer?.desc || "Manage footer content" }
            ]
        },
        {
            icon: Type,
            title: content?.admin?.help?.sections?.typography?.title || "Typography",
            description: content?.admin?.help?.sections?.typography?.description || "Manage fonts and text styles",
            items: [
                { label: content?.admin?.help?.sections?.typography?.items?.font?.label || "Fonts", description: content?.admin?.help?.sections?.typography?.items?.font?.desc || "Select typography" },
                { label: content?.admin?.help?.sections?.typography?.items?.size?.label || "Sizes", description: content?.admin?.help?.sections?.typography?.items?.size?.desc || "Adjust font sizes" },
                { label: content?.admin?.help?.sections?.typography?.items?.styles?.label || "Styles", description: content?.admin?.help?.sections?.typography?.items?.styles?.desc || "Text aesthetics" },
                { label: content?.admin?.help?.sections?.typography?.items?.reset?.label || "Reset", description: content?.admin?.help?.sections?.typography?.items?.reset?.desc || "Restore defaults" },
                { label: content?.admin?.help?.sections?.typography?.items?.live?.label || "Live", description: content?.admin?.help?.sections?.typography?.items?.live?.desc || "Real-time updates" }
            ]
        },
        {
            icon: ToggleLeft,
            title: content?.admin?.help?.sections?.visibility?.title || "Visibility",
            description: content?.admin?.help?.sections?.visibility?.description || "Toggle website sections",
            items: [
                { label: content?.admin?.help?.sections?.visibility?.items?.active?.label || "Active", description: content?.admin?.help?.sections?.visibility?.items?.active?.desc || "Section is visible" },
                { label: content?.admin?.help?.sections?.visibility?.items?.inactive?.label || "Inactive", description: content?.admin?.help?.sections?.visibility?.items?.inactive?.desc || "Section is hidden" },
                { label: content?.admin?.help?.sections?.visibility?.items?.location?.label || "Location", description: content?.admin?.help?.sections?.visibility?.items?.location?.desc || "Find on site" }
            ]
        },
        {
            icon: ShoppingCart,
            title: content?.admin?.help?.sections?.orders?.title || "Orders",
            description: content?.admin?.help?.sections?.orders?.description || "Process customer orders",
            image: "/admin-guide/orders.png",
            items: [
                { label: content?.admin?.help?.sections?.orders?.items?.filtering?.label || "Filtering", description: content?.admin?.help?.sections?.orders?.items?.filtering?.desc || "Filter list" },
                { label: content?.admin?.help?.sections?.orders?.items?.detail?.label || "Order Details", description: content?.admin?.help?.sections?.orders?.items?.detail?.desc || "Full order info" },
                { label: content?.admin?.help?.sections?.orders?.items?.copy?.label || "Copy Info", description: content?.admin?.help?.sections?.orders?.items?.copy?.desc || "Quick duplicate" },
                { label: content?.admin?.help?.sections?.orders?.items?.status?.label || "Status Flow", description: content?.admin?.help?.sections?.orders?.items?.status?.desc || "Update progress" },
                { label: content?.admin?.help?.sections?.orders?.items?.packeta?.label || "Packeta", description: content?.admin?.help?.sections?.orders?.items?.packeta?.desc || "Shipping integration" },
                { label: content?.admin?.help?.sections?.orders?.items?.notifications?.label || "Notifications", description: content?.admin?.help?.sections?.orders?.items?.notifications?.desc || "Email alerts" }
            ]
        },
        {
            icon: BarChart,
            title: content?.admin?.help?.sections?.pricing?.title || "Pricing & Stats",
            description: content?.admin?.help?.sections?.pricing?.description || "Financial overview",
            items: [
                { label: content?.admin?.help?.sections?.pricing?.items?.global?.label || "Global Pricing", description: content?.admin?.help?.sections?.pricing?.items?.global?.desc || "Base prices" },
                { label: content?.admin?.help?.sections?.pricing?.items?.stats?.label || "Statistics", description: content?.admin?.help?.sections?.pricing?.items?.stats?.desc || "Sales charts" },
                { label: content?.admin?.help?.sections?.pricing?.items?.analysis?.label || "Analysis", description: content?.admin?.help?.sections?.pricing?.items?.analysis?.desc || "Insights" }
            ]
        },
        {
            icon: Gift,
            title: content?.admin?.help?.sections?.promos?.title || "Promo Codes",
            description: content?.admin?.help?.sections?.promos?.description || "Discounts & Campaigns",
            items: [
                { label: content?.admin?.help?.sections?.promos?.items?.creation?.label || "Creation", description: content?.admin?.help?.sections?.promos?.items?.creation?.desc || "New codes" },
                { label: content?.admin?.help?.sections?.promos?.items?.popup?.label || "Popups", description: content?.admin?.help?.sections?.promos?.items?.popup?.desc || "Front-end visibility" },
                { label: content?.admin?.help?.sections?.promos?.items?.rules?.label || "Rules", description: content?.admin?.help?.sections?.promos?.items?.rules?.desc || "Usage limits" }
            ]
        },
        {
            icon: Package,
            title: content?.admin?.help?.sections?.inventory?.title || "Inventory",
            description: content?.admin?.help?.sections?.inventory?.description || "Product stock levels",
            image: "/admin-guide/inventory.png",
            items: [
                { label: content?.admin?.help?.sections?.inventory?.items?.add?.label || "Stock Entry", description: content?.admin?.help?.sections?.inventory?.items?.add?.desc || "Update quantities" },
                { label: content?.admin?.help?.sections?.inventory?.items?.minimum?.label || "Alerts", description: content?.admin?.help?.sections?.inventory?.items?.minimum?.desc || "Low stock warning" }
            ]
        },
        {
            icon: Factory,
            title: content?.admin?.help?.sections?.manufacture?.title || "Manufacture",
            description: content?.admin?.help?.sections?.manufacture?.description || "Production inventory",
            image: "/admin-guide/manufacture.png",
            items: [
                { label: content?.admin?.help?.sections?.manufacture?.items?.alert?.label || "Ingredients Alert", description: content?.admin?.help?.sections?.manufacture?.items?.alert?.desc || "Raw materials" },
                { label: content?.admin?.help?.sections?.manufacture?.items?.edit?.label || "Recipes", description: content?.admin?.help?.sections?.manufacture?.items?.edit?.desc || "Modify requirements" },
                { label: content?.admin?.help?.sections?.manufacture?.items?.notifications?.label || "Auto-supply", description: content?.admin?.help?.sections?.manufacture?.items?.notifications?.desc || "Restock workflow" }
            ]
        },
        {
            icon: Save,
            title: content?.admin?.help?.sections?.saving?.title || "Saving & Sync",
            description: content?.admin?.help?.sections?.saving?.description || "Keep data safe",
            items: [
                { label: content?.admin?.help?.sections?.saving?.items?.button?.label || "Saving", description: content?.admin?.help?.sections?.saving?.items?.button?.desc || "Apply changes" },
                { label: content?.admin?.help?.sections?.saving?.items?.loading?.label || "Synchronization", description: content?.admin?.help?.sections?.saving?.items?.loading?.desc || "Real-time sync" },
                { label: content?.admin?.help?.sections?.saving?.items?.reset?.label || "Safe Reset", description: content?.admin?.help?.sections?.saving?.items?.reset?.desc || "Rollback support" }
            ]
        },
        {
            icon: ShieldCheck,
            title: content?.admin?.help?.sections?.security?.title || "Security",
            description: content?.admin?.help?.sections?.security?.description || "Access & Protection",
            items: [
                { label: content?.admin?.help?.sections?.security?.items?.magic?.label || "Magic Link", description: content?.admin?.help?.sections?.security?.items?.magic?.desc || "Secure login" },
                { label: content?.admin?.help?.sections?.security?.items?.detection?.label || "Fraud Detection", description: content?.admin?.help?.sections?.security?.items?.detection?.desc || "Pattern analysis" },
                { label: content?.admin?.help?.sections?.security?.items?.supabase?.label || "Database", description: content?.admin?.help?.sections?.security?.items?.supabase?.desc || "Infra security" }
            ]
        },
        {
            icon: Palette,
            title: content?.admin?.help?.sections?.design?.title || "Design System",
            description: content?.admin?.help?.sections?.design?.description || "Visual consistency",
            items: [
                { label: content?.admin?.help?.sections?.design?.items?.palette?.label || "Colors", description: content?.admin?.help?.sections?.design?.items?.palette?.desc || "Brand palette" },
                { label: content?.admin?.help?.sections?.design?.items?.charts?.label || "Visualization", description: content?.admin?.help?.sections?.design?.items?.charts?.desc || "Data design" },
                { label: content?.admin?.help?.sections?.design?.items?.readability?.label || "UX Flow", description: content?.admin?.help?.sections?.design?.items?.readability?.desc || "User journey" }
            ]
        },
        {
            icon: Mail,
            title: content?.admin?.help?.sections?.marketing?.title || "Marketing Tools",
            description: content?.admin?.help?.sections?.marketing?.description || "Customer interaction",
            items: [
                { label: content?.admin?.help?.sections?.marketing?.items?.campaigns?.label || "Email Campaigns", description: content?.admin?.help?.sections?.marketing?.items?.campaigns?.desc || "Outreach tools" },
                { label: content?.admin?.help?.sections?.marketing?.items?.progress?.label || "Tracking", description: content?.admin?.help?.sections?.marketing?.items?.progress?.desc || "Engagement stats" }
            ]
        },
        {
            icon: Newspaper,
            title: content?.admin?.help?.sections?.newsletter?.title || "Newsletter & Opt-out",
            description: content?.admin?.help?.sections?.newsletter?.description || "Subscriber management",
            items: [
                { label: content?.admin?.help?.sections?.newsletter?.items?.subscribers?.label || "Subscribers", description: content?.admin?.help?.sections?.newsletter?.items?.subscribers?.desc || "Database of active contacts" },
                { label: content?.admin?.help?.sections?.newsletter?.items?.campaigns?.label || "Campaign Creation", description: content?.admin?.help?.sections?.newsletter?.items?.campaigns?.desc || "Mass mailing automation" },
                { label: content?.admin?.help?.sections?.newsletter?.items?.unsub?.label || "Unsubscribe (GDPR)", description: content?.admin?.help?.sections?.newsletter?.items?.unsub?.desc || "Automated opt-out system" },
                { label: content?.admin?.help?.sections?.newsletter?.items?.safety?.label || "Safety", description: content?.admin?.help?.sections?.newsletter?.items?.safety?.desc || "Protection against duplicate sending" }
            ]
        }
    ];

    return (
        <div className="space-y-12 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
                <div>
                    <h1 data-testid="admin-page-title" className="text-2xl sm:text-3xl font-black text-olive-dark uppercase italic tracking-tight font-display">{content?.admin?.help?.title || "Guide"}</h1>
                    <p className="text-brand-muted font-bold uppercase tracking-widest text-[10px] mt-1">{content?.admin?.help?.description}</p>
                </div>
            </div>

            <div className="grid gap-12">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="p-3 sm:p-4 bg-olive-dark rounded-2xl sm:rounded-3xl shadow-xl shadow-olive-dark/10 group">
                                <section.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary transition-transform duration-500 group-hover:rotate-12" />
                            </div>
                            <div className="space-y-1">
                                <h2 className="text-xl sm:text-2xl font-black text-olive-dark font-display uppercase italic tracking-tight">{section.title}</h2>
                                <p className="text-[10px] sm:text-xs text-olive-dark/60 font-black uppercase tracking-[0.2em]">{section.description}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <div className="grid gap-4">
                                <Accordion type="single" collapsible className="w-full">
                                    {section.items.map((item, id) => (
                                        <AccordionItem 
                                            key={id} 
                                            value={`item-${idx}-${id}`}
                                            className="border-none bg-white font-bold rounded-2xl sm:rounded-3xl mb-4 shadow-sm hover:shadow-md transition-all overflow-hidden"
                                        >
                                            <AccordionTrigger className="px-6 sm:px-8 py-5 sm:py-6 hover:no-underline group">
                                                <span className="text-left font-black uppercase text-[10px] sm:text-xs tracking-widest text-olive-dark group-data-[state=open]:text-primary transition-colors">
                                                    {item.label}
                                                </span>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 sm:px-8 pb-6 sm:pb-8 text-xs sm:text-sm text-olive-dark/80 leading-relaxed font-bold">
                                                {item.description}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </div>

                            {section.image && (
                                <div className="rounded-[2.5rem] sm:rounded-[3rem] overflow-hidden bg-olive-dark/5 p-4 sm:p-6 shadow-canvas border border-white relative group">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                    <img 
                                        src={section.image} 
                                        alt={section.title} 
                                        className="w-full h-auto rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl relative z-10 grayscale hover:grayscale-0 transition-all duration-1000"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Tips */}
            <div className="p-8 sm:p-12 bg-olive-dark rounded-[3rem] text-white space-y-8 sm:space-y-10 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-12 opacity-5">
                    <HelpCircle className="w-24 h-24 sm:w-32 sm:h-32 rotate-12" />
                </div>
                
                <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                    <div className="p-3 sm:p-4 bg-primary/20 rounded-2xl backdrop-blur-md">
                        <AlertTriangle className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl sm:text-2xl font-black font-display uppercase italic tracking-tight">{content?.admin?.help?.quickTips || "Quick Tips"}</h3>
                        <p className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-[0.2em]">{content?.admin?.help?.quickTipsDesc}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
                    {[
                        { icon: BarChart, title: content?.admin?.help?.tips?.stats?.title || "Monitoring", desc: content?.admin?.help?.tips?.stats?.desc },
                        { icon: Zap, title: content?.admin?.help?.tips?.fonts?.title || "Appearance", desc: content?.admin?.help?.tips?.fonts?.desc },
                        { icon: ShieldCheck, title: content?.admin?.help?.tips?.security?.title || "Safety", desc: content?.admin?.help?.tips?.security?.desc }
                    ].map((tip, idx) => (
                        <div key={idx} className="p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                            <tip.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary mb-4 group-hover:scale-110 transition-transform" />
                            <h4 className="font-black uppercase text-[10px] sm:text-xs tracking-widest mb-2">{tip.title}</h4>
                            <p className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-widest">{tip.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminHelp;
