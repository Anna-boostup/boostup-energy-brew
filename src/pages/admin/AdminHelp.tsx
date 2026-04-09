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
    Database, Send, Info, Key
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
    const { content } = useContent();

    const sections: Section[] = [
        {
            icon: Globe,
            title: content.admin.help.sections.content.title,
            description: content.admin.help.sections.content.description,
            image: "/admin-guide/content-management.png",
            items: [
                { label: content.admin.help.sections.content.items.hero.label, description: content.admin.help.sections.content.items.hero.desc },
                { label: content.admin.help.sections.content.items.mission.label, description: content.admin.help.sections.content.items.mission.desc },
                { label: content.admin.help.sections.content.items.ingredients.label, description: content.admin.help.sections.content.items.ingredients.desc },
                { label: content.admin.help.sections.content.items.concept.label, description: content.admin.help.sections.content.items.concept.desc },
                { label: content.admin.help.sections.content.items.cta.label, description: content.admin.help.sections.content.items.cta.desc },
                { label: content.admin.help.sections.content.items.contact.label, description: content.admin.help.sections.content.items.contact.desc },
                { label: content.admin.help.sections.content.items.flavors.label, description: content.admin.help.sections.content.items.flavors.desc },
                { label: content.admin.help.sections.content.items.footer.label, description: content.admin.help.sections.content.items.footer.desc }
            ]
        },
        {
            icon: Type,
            title: content.admin.help.sections.typography.title,
            description: content.admin.help.sections.typography.description,
            items: [
                { label: content.admin.help.sections.typography.items.font.label, description: content.admin.help.sections.typography.items.font.desc },
                { label: content.admin.help.sections.typography.items.size.label, description: content.admin.help.sections.typography.items.size.desc },
                { label: content.admin.help.sections.typography.items.styles.label, description: content.admin.help.sections.typography.items.styles.desc },
                { label: content.admin.help.sections.typography.items.reset.label, description: content.admin.help.sections.typography.items.reset.desc },
                { label: content.admin.help.sections.typography.items.live.label, description: content.admin.help.sections.typography.items.live.desc }
            ]
        },
        {
            icon: ToggleLeft,
            title: content.admin.help.sections.visibility.title,
            description: content.admin.help.sections.visibility.description,
            items: [
                { label: content.admin.help.sections.visibility.items.active.label, description: content.admin.help.sections.visibility.items.active.desc },
                { label: content.admin.help.sections.visibility.items.inactive.label, description: content.admin.help.sections.visibility.items.inactive.desc },
                { label: content.admin.help.sections.visibility.items.location.label, description: content.admin.help.sections.visibility.items.location.desc }
            ]
        },
        {
            icon: ShoppingCart,
            title: content.admin.help.sections.orders.title,
            description: content.admin.help.sections.orders.description,
            image: "/admin-guide/orders.png",
            items: [
                { label: content.admin.help.sections.orders.items.filtering.label, description: content.admin.help.sections.orders.items.filtering.desc },
                { label: content.admin.help.sections.orders.items.detail.label, description: content.admin.help.sections.orders.items.detail.desc },
                { label: content.admin.help.sections.orders.items.copy.label, description: content.admin.help.sections.orders.items.copy.desc },
                { label: content.admin.help.sections.orders.items.status.label, description: content.admin.help.sections.orders.items.status.desc },
                { label: content.admin.help.sections.orders.items.packeta.label, description: content.admin.help.sections.orders.items.packeta.desc },
                { label: content.admin.help.sections.orders.items.notifications.label, description: content.admin.help.sections.orders.items.notifications.desc }
            ]
        },
        {
            icon: BarChart,
            title: content.admin.help.sections.pricing.title,
            description: content.admin.help.sections.pricing.description,
            items: [
                { label: content.admin.help.sections.pricing.items.global.label, description: content.admin.help.sections.pricing.items.global.desc },
                { label: content.admin.help.sections.pricing.items.stats.label, description: content.admin.help.sections.pricing.items.stats.desc },
                { label: content.admin.help.sections.pricing.items.analysis.label, description: content.admin.help.sections.pricing.items.analysis.desc }
            ]
        },
        {
            icon: Gift,
            title: content.admin.help.sections.promos.title,
            description: content.admin.help.sections.promos.description,
            items: [
                { label: content.admin.help.sections.promos.items.creation.label, description: content.admin.help.sections.promos.items.creation.desc },
                { label: content.admin.help.sections.promos.items.popup.label, description: content.admin.help.sections.promos.items.popup.desc },
                { label: content.admin.help.sections.promos.items.rules.label, description: content.admin.help.sections.promos.items.rules.desc }
            ]
        },
        {
            icon: Package,
            title: content.admin.help.sections.inventory.title,
            description: content.admin.help.sections.inventory.description,
            image: "/admin-guide/inventory.png",
            items: [
                { label: content.admin.help.sections.inventory.items.add.label, description: content.admin.help.sections.inventory.items.add.desc },
                { label: content.admin.help.sections.inventory.items.minimum.label, description: content.admin.help.sections.inventory.items.minimum.desc }
            ]
        },
        {
            icon: Factory,
            title: content.admin.help.sections.manufacture.title,
            description: content.admin.help.sections.manufacture.description,
            image: "/admin-guide/manufacture.png",
            items: [
                { label: content.admin.help.sections.manufacture.items.alert.label, description: content.admin.help.sections.manufacture.items.alert.desc },
                { label: content.admin.help.sections.manufacture.items.edit.label, description: content.admin.help.sections.manufacture.items.edit.desc },
                { label: content.admin.help.sections.manufacture.items.notifications.label, description: content.admin.help.sections.manufacture.items.notifications.desc }
            ]
        },
        {
            icon: Save,
            title: content.admin.help.sections.saving.title,
            description: content.admin.help.sections.saving.description,
            items: [
                { label: content.admin.help.sections.saving.items.button.label, description: content.admin.help.sections.saving.items.button.desc },
                { label: content.admin.help.sections.saving.items.loading.label, description: content.admin.help.sections.saving.items.loading.desc },
                { label: content.admin.help.sections.saving.items.reset.label, description: content.admin.help.sections.saving.items.reset.desc }
            ]
        },
        {
            icon: ShieldCheck,
            title: content.admin.help.sections.security.title,
            description: content.admin.help.sections.security.description,
            items: [
                { label: content.admin.help.sections.security.items.magic.label, description: content.admin.help.sections.security.items.magic.desc },
                { label: content.admin.help.sections.security.items.detection.label, description: content.admin.help.sections.security.items.detection.desc },
                { label: content.admin.help.sections.security.items.supabase.label, description: content.admin.help.sections.security.items.supabase.desc }
            ]
        },
        {
            icon: Palette,
            title: content.admin.help.sections.design.title,
            description: content.admin.help.sections.design.description,
            items: [
                { label: content.admin.help.sections.design.items.palette.label, description: content.admin.help.sections.design.items.palette.desc },
                { label: content.admin.help.sections.design.items.charts.label, description: content.admin.help.sections.design.items.charts.desc },
                { label: content.admin.help.sections.design.items.readability.label, description: content.admin.help.sections.design.items.readability.desc }
            ]
        },
        {
            icon: Mail,
            title: content.admin.help.sections.marketing.title,
            description: content.admin.help.sections.marketing.description,
            items: [
                { label: content.admin.help.sections.marketing.items.campaigns.label, description: content.admin.help.sections.marketing.items.campaigns.desc },
                { label: content.admin.help.sections.marketing.items.progress.label, description: content.admin.help.sections.marketing.items.progress.desc }
            ]
        }
    ];

    return (
        <div className="space-y-12 pb-24">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-olive-dark uppercase italic tracking-tight font-display">{content.admin.help.title}</h1>
                    <p className="text-brand-muted font-bold uppercase tracking-widest text-[10px] mt-1">{content.admin.help.description}</p>
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
                                <p className="text-[10px] sm:text-xs text-olive/40 font-bold uppercase tracking-[0.2em]">{section.description}</p>
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
                                            <AccordionContent className="px-6 sm:px-8 pb-6 sm:pb-8 text-xs sm:text-sm text-olive/60 leading-relaxed font-bold">
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
                        <h3 className="text-xl sm:text-2xl font-black font-display uppercase italic tracking-tight">{content.admin.help.quickTips}</h3>
                        <p className="text-[10px] sm:text-xs text-white/40 font-bold uppercase tracking-[0.2em]">{content.admin.help.quickTipsDesc}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative z-10">
                    {[
                        { icon: BarChart, title: content.admin.help.tips.stats.title, desc: content.admin.help.tips.stats.desc },
                        { icon: Zap, title: content.admin.help.tips.fonts.title, desc: content.admin.help.tips.fonts.desc },
                        { icon: ShieldCheck, title: content.admin.help.tips.security.title, desc: content.admin.help.tips.security.desc }
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
