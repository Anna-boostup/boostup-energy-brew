import React, { useState } from 'react';
import { useContent } from '@/context/ContentContext';
import { updateSiteContent, resetToDefaultContent } from '@/lib/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw, AlertTriangle, Info, Type, Eye, EyeOff, FileText, Beaker, BarChart, Mail, MapPin, Layout, Settings2, Zap, Plus } from 'lucide-react';
import { AVAILABLE_FONTS, FONT_WEIGHTS } from '@/hooks/useDynamicFonts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import StyledTextField from '@/components/admin/StyledTextField';
import type { TextStyle } from '@/lib/textStyles';

const ContentManagement = () => {
    const { content, contentCZ, contentEN, refreshContent } = useContent();
    const [editingLang, setEditingLang] = useState<'cs' | 'en'>('cs');
    
    // Select the base content based on editing language
    const currentContent = editingLang === 'cs' ? contentCZ : contentEN;
    
    const [localContent, setLocalContent] = useState(currentContent);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Update local state when context content changes or language switches
    React.useEffect(() => {
        if (currentContent) setLocalContent(currentContent);
    }, [currentContent, editingLang]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateSiteContent(localContent, editingLang === 'en' ? 'en' : 'main');
            await refreshContent();
            toast.success(`${content.admin.contentManager.saveSuccess}`);
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error(error.message || content.admin.general.error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm(content.admin.contentManager.resetConfirm)) return;

        try {
            setIsResetting(true);
            await resetToDefaultContent(editingLang === 'en' ? 'en' : 'main');
            await refreshContent();
            toast.success(content.admin.contentManager.resetSuccess);
        } catch (error: any) {
            toast.error(error.message || content.admin.general.error);
        } finally {
            setIsResetting(false);
        }
    };

    const updateField = (path: string[], value: any) => {
        const newContent = JSON.parse(JSON.stringify(localContent));
        let current = newContent;
        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;
        setLocalContent(newContent);
    };

    // Helper: read textStyle for a field path
    const ts = (path: string): TextStyle => (localContent as any).textStyles?.[path] ?? {};

    // Helper: update textStyle for a field path
    const updateStyle = (path: string, style: TextStyle) => {
        const newContent = JSON.parse(JSON.stringify(localContent));
        if (!newContent.textStyles) newContent.textStyles = {};
        newContent.textStyles[path] = style;
        setLocalContent(newContent);
    };

    // Helper: get badge visibility
    const badgeVisible = (key: string): boolean => {
        return (localContent as any).badgeVisible?.[key] !== false;
    };

    // Helper: toggle badge visibility
    const toggleBadge = (key: string, visible: boolean) => {
        const newContent = JSON.parse(JSON.stringify(localContent));
        if (!newContent.badgeVisible) newContent.badgeVisible = {};
        newContent.badgeVisible[key] = visible;
        setLocalContent(newContent);
    };

    // Component: badge visibility toggle
    const BadgeToggle = ({ badgeKey, label }: { badgeKey: string; label: string }) => (
        <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-lg border border-border">
            {badgeVisible(badgeKey) ? <Eye className="h-4 w-4 text-white" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
            <Label className="flex-1 cursor-pointer" htmlFor={`badge-${badgeKey}`}>{label}</Label>
            <Switch
                id={`badge-${badgeKey}`}
                checked={badgeVisible(badgeKey)}
                onCheckedChange={(v) => toggleBadge(badgeKey, v)}
            />
        </div>
    );

    const handlePreview = () => {
        const lang = editingLang;
        localStorage.setItem(`boostup_preview_content_${lang}`, JSON.stringify(localContent));
        toast.success(content.admin.contentManager.previewGenerated);
        window.open(`/?preview=true&lang=${lang}`, '_blank');
    };

    // Guard: waiting for content to load from database
    if (!localContent) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex items-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                    <span className="font-black uppercase tracking-[0.3em] text-sm text-olive-dark">{content.admin.contentManager.loading}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-32 animate-in fade-in duration-1000">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 flex-wrap">
                <div className="space-y-3">
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-olive-dark font-display uppercase italic leading-none">{content.admin.contentManager.title}</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                        <p className="text-brand-muted font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px] leading-none">{content.admin.contentManager.description}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
                    <div className="flex items-center bg-olive-dark rounded-[2rem] p-1.5 shadow-2xl">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-12 px-8 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all duration-500 border-none ${
                                editingLang === 'cs' ? 'bg-lime text-olive-dark shadow-xl' : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                            onClick={() => setEditingLang('cs')}
                        >
                            {content.admin.contentManager.langCZ}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-12 px-8 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all duration-500 border-none ${
                                editingLang === 'en' ? 'bg-lime text-olive-dark shadow-xl' : 'text-white/50 hover:text-white hover:bg-white/5'
                            }`}
                            onClick={() => setEditingLang('en')}
                        >
                            {content.admin.contentManager.langEN}
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-3 sm:gap-4 ml-auto w-full lg:w-auto">
                        <Button variant="outline" onClick={handlePreview} className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl bg-white border-olive/10 text-olive-dark font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-xl shadow-olive/5 hover:bg-olive hover:text-white hover:border-olive transition-all gap-2 sm:gap-3 flex-1 sm:flex-initial">
                            <Eye className="h-4 sm:h-5 w-4 sm:w-5" />
                            {content.admin.contentManager.preview}
                        </Button>
                        <Button variant="outline" onClick={handleReset} disabled={isResetting || isSaving} className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl bg-white border-olive/10 text-olive/40 font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-xl shadow-olive/5 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all gap-2 sm:gap-3 flex-1 sm:flex-initial">
                            {isResetting ? <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" /> : <RotateCcw className="h-4 sm:h-5 w-4 sm:w-5" />}
                            {content.admin.contentManager.reset}
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving || isResetting} className="h-12 sm:h-14 px-8 sm:px-12 rounded-2xl bg-olive-dark hover:bg-black text-white font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] shadow-2xl shadow-olive-dark/20 transition-all hover:scale-[1.02] active:scale-[0.98] gap-2 sm:gap-3 w-full sm:w-auto">
                            {isSaving ? <Loader2 className="h-4 sm:h-5 w-4 sm:w-5 animate-spin" /> : <Save className="h-4 sm:h-5 w-4 sm:w-5" />}
                            {content.admin.contentManager.save}
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="hero" className="w-full space-y-12">
                <div className="p-3 glass-card rounded-[3rem] w-full shadow-2xl border-none">
                    <TabsList className="bg-transparent h-auto p-1 gap-2 flex flex-wrap justify-center border-none">
                        {['hero', 'mission', 'ingredients', 'concept', 'cta', 'contact', 'flavors', 'footer', 'settings'].map((tab) => (
                            <TabsTrigger 
                                key={tab}
                                value={tab} 
                                className="px-8 py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] text-olive/40 data-[state=active]:bg-olive-dark data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-olive-dark/20 transition-all duration-500 border-none"
                            >
                                {content.admin.contentManager.tabs[tab as keyof typeof content.admin.contentManager.tabs]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* HERO SECTION */}
                <TabsContent value="hero" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="glass-card rounded-[3rem] overflow-hidden border-none shadow-2xl">
                        <div className="bg-olive-dark py-8 px-6 sm:py-12 sm:px-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                <div className="p-3 sm:p-4 bg-lime/10 rounded-2xl border border-lime/20">
                                    <Type className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight italic">{content.admin.contentManager.sections.hero.title}</h3>
                                    <p className="text-white/40 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] mt-2">{content.admin.contentManager.sections.hero.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 sm:p-12 space-y-8 sm:space-y-12">
                            <div className="bg-olive-dark/5 p-10 rounded-[2.5rem] border border-olive/5">
                                <BadgeToggle badgeKey="hero.announcement" label={content.admin.contentManager.sections.hero.visibility} />
                            </div>
                            <StyledTextField
                                label={content.admin.contentManager.sections.hero.badge}
                                value={localContent.hero.announcement}
                                onChange={(v) => updateField(['hero', 'announcement'], v)}
                                style={ts('hero.announcement')}
                                onStyleChange={(s) => updateStyle('hero.announcement', s)}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StyledTextField
                                    label={content.admin.contentManager.sections.hero.headlinePart1}
                                    value={localContent.hero.headline.part1}
                                    onChange={(v) => updateField(['hero', 'headline', 'part1'], v)}
                                    style={ts('hero.headline.part1')}
                                    onStyleChange={(s) => updateStyle('hero.headline.part1', s)}
                                />
                                <StyledTextField
                                    label={content.admin.contentManager.sections.hero.headlineGradient}
                                    value={localContent.hero.headline.gradient}
                                    onChange={(v) => updateField(['hero', 'headline', 'gradient'], v)}
                                    style={ts('hero.headline.gradient')}
                                    onStyleChange={(s) => updateStyle('hero.headline.gradient', s)}
                                />
                                <StyledTextField
                                    label={content.admin.contentManager.sections.hero.headlinePart2}
                                    value={localContent.hero.headline.part2}
                                    onChange={(v) => updateField(['hero', 'headline', 'part2'], v)}
                                    style={ts('hero.headline.part2')}
                                    onStyleChange={(s) => updateStyle('hero.headline.part2', s)}
                                />
                            </div>

                            <StyledTextField
                                label={content.admin.contentManager.sections.hero.description}
                                value={localContent.hero.description}
                                onChange={(v) => updateField(['hero', 'description'], v)}
                                style={ts('hero.description')}
                                onStyleChange={(s) => updateStyle('hero.description', s)}
                                multiline
                                rows={3}
                            />

                            <StyledTextField
                                label={content.admin.contentManager.sections.hero.testimonial}
                                value={localContent.hero.testimonial || ''}
                                onChange={(v) => updateField(['hero', 'testimonial'], v)}
                                style={ts('hero.testimonial')}
                                onStyleChange={(s) => updateStyle('hero.testimonial', s)}
                                placeholder={content.admin.contentManager.sections.hero.placeholder}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-olive/5 pt-10">
                                <StyledTextField
                                    label={content.admin.contentManager.sections.hero.ctaPrimary}
                                    value={localContent.hero.cta.primary}
                                    onChange={(v) => updateField(['hero', 'cta', 'primary'], v)}
                                    style={ts('hero.cta.primary')}
                                    onStyleChange={(s) => updateStyle('hero.cta.primary', s)}
                                />
                                <StyledTextField
                                    label={content.admin.contentManager.sections.hero.ctaSecondary}
                                    value={localContent.hero.cta.secondary}
                                    onChange={(v) => updateField(['hero.cta.secondary'], v)}
                                    style={ts('hero.cta.secondary')}
                                    onStyleChange={(s) => updateStyle('hero.cta.secondary', s)}
                                />
                                <StyledTextField
                                    label={content.admin.contentManager.sections.hero.cta3b}
                                    value={localContent.hero.cta.concept3b}
                                    onChange={(v) => updateField(['hero', 'cta', 'concept3b'], v)}
                                    style={ts('hero.cta.concept3b')}
                                    onStyleChange={(s) => updateStyle('hero.cta.concept3b', s)}
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* MISSION SECTION */}
                <TabsContent value="mission" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="glass-card rounded-[3rem] overflow-hidden border-none shadow-2xl">
                        <div className="bg-olive-dark py-8 px-6 sm:py-12 sm:px-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                <div className="p-3 sm:p-4 bg-lime/10 rounded-2xl border border-lime/20">
                                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight italic">{content.admin.contentManager.sections.mission.title}</h3>
                                    <p className="text-white/40 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] mt-2">{content.admin.contentManager.sections.mission.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 sm:p-12 space-y-8 sm:space-y-12">
                            <div className="bg-olive-dark/5 p-10 rounded-[2.5rem] border border-olive/5">
                                <BadgeToggle badgeKey="mission.badge" label={content.admin.contentManager.sections.mission.visibility} />
                            </div>
                            <StyledTextField
                                label={content.admin.contentManager.sections.mission.badge}
                                value={localContent.mission.badge}
                                onChange={(v) => updateField(['mission', 'badge'], v)}
                                style={ts('mission.badge')}
                                onStyleChange={(s) => updateStyle('mission.badge', s)}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <StyledTextField
                                    label={content.admin.contentManager.sections.mission.headlinePart1}
                                    value={localContent.mission.headline.part1}
                                    onChange={(v) => updateField(['mission', 'headline', 'part1'], v)}
                                    style={ts('mission.headline.part1')}
                                    onStyleChange={(s) => updateStyle('mission.headline.part1', s)}
                                />
                                <StyledTextField
                                    label={content.admin.contentManager.sections.mission.highlight}
                                    value={localContent.mission.headline.highlight}
                                    onChange={(v) => updateField(['mission', 'headline', 'highlight'], v)}
                                    style={ts('mission.headline.highlight')}
                                    onStyleChange={(s) => updateStyle('mission.headline.highlight', s)}
                                />
                            </div>
                            <div className="space-y-8 pt-8 border-t border-background">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/40 pl-1">{content.admin.contentManager.sections.mission.paragraphs}</Label>
                                {localContent.mission.paragraphs.map((text, i) => (
                                    <StyledTextField
                                        key={i}
                                        label={`${content.admin.contentManager.sections.mission.paragraphLabel} ${i + 1}`}
                                        value={text}
                                        onChange={(v) => {
                                            const newParas = [...localContent.mission.paragraphs];
                                            newParas[i] = v;
                                            updateField(['mission', 'paragraphs'], newParas);
                                        }}
                                        style={ts(`mission.paragraph.${i}`)}
                                        onStyleChange={(s) => updateStyle(`mission.paragraph.${i}`, s)}
                                        multiline
                                        rows={3}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* INGREDIENTS SECTION */}
                <TabsContent value="ingredients" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="glass-card rounded-[3rem] overflow-hidden border-none shadow-2xl">
                        <div className="bg-olive-dark py-8 px-6 sm:py-12 sm:px-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                <div className="p-3 sm:p-4 bg-lime/10 rounded-2xl border border-lime/20">
                                    <Beaker className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight italic">{content.admin.contentManager.sections.ingredients.title}</h3>
                                    <p className="text-white/40 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] mt-2">{content.admin.contentManager.sections.ingredients.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 sm:p-12 space-y-8 sm:space-y-12">
                            {Object.entries(localContent.ingredientDetails || {}).map(([key, details]: [string, any]) => (
                                <div key={key} className="space-y-8 p-10 rounded-[2.5rem] bg-white border border-background shadow-sm relative group overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 translate-x-12 -translate-y-12 rounded-full transition-transform duration-700 group-hover:scale-150 ${
                                        key === 'stimulants' ? 'bg-primary' :
                                        key === 'electrolytes' ? 'bg-[#dfdf57]' :
                                        key === 'adaptogens' ? 'bg-orange-500' :
                                        'bg-orange-500'
                                    }`} />
                                    <div className="flex items-center gap-4">
                                        <div className={`w-4 h-4 rounded-full shadow-lg ${
                                            key === 'stimulants' ? 'bg-primary' :
                                            key === 'electrolytes' ? 'bg-[#dfdf57]' :
                                            key === 'adaptogens' ? 'bg-orange-500' :
                                            'bg-orange-500'
                                        }`} />
                                        <h3 className="text-2xl font-black font-display uppercase tracking-tight text-olive-dark">{details.title}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-olive/40 pl-1">{content.admin.contentManager.sections.ingredients.category}</Label>
                                            <Input
                                                value={details.title}
                                                onChange={(e) => updateField(['ingredientDetails', key, 'title'], e.target.value)}
                                                className="h-14 rounded-2xl border-olive/10 font-extrabold text-olive-dark pl-6 focus-visible:ring-primary shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-olive/40 pl-1">{content.admin.contentManager.sections.ingredients.subtitle}</Label>
                                            <Input
                                                value={details.subtitle}
                                                onChange={(e) => updateField(['ingredientDetails', key, 'subtitle'], e.target.value)}
                                                className="h-14 rounded-2xl border-olive/10 font-extrabold text-olive-dark pl-6 focus-visible:ring-primary shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-olive/40 pl-1">{content.admin.contentManager.sections.ingredients.summary}</Label>
                                        <Textarea
                                            rows={3}
                                            value={details.description}
                                            onChange={(e) => updateField(['ingredientDetails', key, 'description'], e.target.value)}
                                            className="rounded-2xl border-olive/10 font-bold text-olive p-6 focus-visible:ring-primary shadow-sm leading-relaxed"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                                        <div className="space-y-6">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-olive/40 pl-1 block">{content.admin.contentManager.sections.ingredients.benefits}</Label>
                                            <div className="space-y-3">
                                                {details.benefits.map((benefit: string, i: number) => (
                                                    <Input
                                                        key={i}
                                                        value={benefit}
                                                        onChange={(e) => {
                                                            const newBenefits = [...details.benefits];
                                                            newBenefits[i] = e.target.value;
                                                            updateField(['ingredientDetails', key, 'benefits'], newBenefits);
                                                        }}
                                                        className="h-12 rounded-xl border-background bg-background/50 font-bold text-olive pl-5 text-sm"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-olive/40 pl-1 block">{content.admin.contentManager.sections.ingredients.tags}</Label>
                                            <div className="space-y-3">
                                                {details.ingredients.map((ing: string, i: number) => (
                                                    <Input
                                                        key={i}
                                                        value={ing}
                                                        onChange={(e) => {
                                                            const newIngs = [...details.ingredients];
                                                            newIngs[i] = e.target.value;
                                                            updateField(['ingredientDetails', key, 'ingredients'], newIngs);
                                                        }}
                                                        className="h-12 rounded-xl border-background bg-background/50 font-bold text-olive pl-5 text-sm"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* CONCEPT SECTION */}
                <TabsContent value="concept" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="glass-card rounded-[3rem] overflow-hidden border-none shadow-2xl">
                        <div className="bg-olive-dark py-8 px-6 sm:py-12 sm:px-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                <div className="p-3 sm:p-4 bg-lime/10 rounded-2xl border border-lime/20">
                                    <BarChart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight italic">{content.admin.contentManager.sections.concept.title}</h3>
                                    <p className="text-white/40 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] mt-2">{content.admin.contentManager.sections.concept.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 sm:p-12 space-y-8 sm:space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-olive/40 pl-1">{content.admin.contentManager.sections.concept.headline}</Label>
                                    <Input
                                        value={localContent.concept3b.headline}
                                        onChange={(e) => updateField(['concept3b', 'headline'], e.target.value)}
                                        className="h-14 rounded-2xl border-olive/10 font-extrabold text-olive-dark pl-6 focus-visible:ring-primary shadow-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-olive/40 pl-1">{content.admin.contentManager.sections.concept.cta}</Label>
                                    <Input
                                        value={localContent.concept3b.cta}
                                        onChange={(e) => updateField(['concept3b', 'cta'], e.target.value)}
                                        className="h-14 rounded-2xl border-olive/10 font-extrabold text-olive-dark pl-6 focus-visible:ring-primary shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-olive/40 pl-1">{content.admin.contentManager.sections.concept.intro}</Label>
                                <Textarea
                                    rows={3}
                                    value={localContent.concept3b.description}
                                    onChange={(e) => updateField(['concept3b', 'description'], e.target.value)}
                                    className="rounded-2xl border-olive/10 font-bold text-olive p-6 focus-visible:ring-primary shadow-sm leading-relaxed"
                                />
                            </div>

                            <div className="space-y-10 pt-12 border-t border-background">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                    <h3 className="text-xl font-black font-display uppercase italic tracking-tight text-olive-dark">{content.admin.contentManager.sections.concept.pillars}</h3>
                                </div>
                                {localContent.concept3b.concepts.map((concept, i) => (
                                    <div key={concept.id} className="p-10 rounded-[2.5rem] bg-background border border-background space-y-10 group relative transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-olive/10/50">
                                        <div className="absolute top-8 right-10">
                                            <span className="text-8xl font-black text-olive-dark/5 select-none">{i + 1}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <StyledTextField
                                                label={content.admin.contentManager.sections.concept.pillarTitlePlaceholder}
                                                value={concept.title}
                                                onChange={(v) => {
                                                    const newConcepts = [...localContent.concept3b.concepts];
                                                    newConcepts[i] = { ...newConcepts[i], title: v };
                                                    updateField(['concept3b', 'concepts'], newConcepts);
                                                }}
                                                style={ts(`concept3b.${concept.id}.title`)}
                                                onStyleChange={(s) => updateStyle(`concept3b.${concept.id}.title`, s)}
                                            />
                                            <StyledTextField
                                                label={content.admin.contentManager.sections.concept.pillarSubtitle}
                                                value={concept.subtitle}
                                                onChange={(v) => {
                                                    const newConcepts = [...localContent.concept3b.concepts];
                                                    newConcepts[i] = { ...newConcepts[i], subtitle: v };
                                                    updateField(['concept3b', 'concepts'], newConcepts);
                                                }}
                                                style={ts(`concept3b.${concept.id}.subtitle`)}
                                                onStyleChange={(s) => updateStyle(`concept3b.${concept.id}.subtitle`, s)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <StyledTextField
                                                label={content.admin.contentManager.sections.concept.pillarStats}
                                                value={concept.stats}
                                                onChange={(v) => {
                                                    const newConcepts = [...localContent.concept3b.concepts];
                                                    newConcepts[i] = { ...newConcepts[i], stats: v };
                                                    updateField(['concept3b', 'concepts'], newConcepts);
                                                }}
                                                style={ts(`concept3b.${concept.id}.stats`)}
                                                onStyleChange={(s) => updateStyle(`concept3b.${concept.id}.stats`, s)}
                                            />
                                            <StyledTextField
                                                label={content.admin.contentManager.sections.concept.pillarDesc}
                                                value={concept.description}
                                                onChange={(v) => {
                                                    const newConcepts = [...localContent.concept3b.concepts];
                                                    newConcepts[i] = { ...newConcepts[i], description: v };
                                                    updateField(['concept3b', 'concepts'], newConcepts);
                                                }}
                                                style={ts(`concept3b.${concept.id}.description`)}
                                                onStyleChange={(s) => updateStyle(`concept3b.${concept.id}.description`, s)}
                                            />
                                        </div>
                                        <div className="space-y-6 pt-6 border-t border-olive/10">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-olive/40 pl-1">{content.admin.contentManager.sections.concept.pillarFullDesc}</Label>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-[10px] text-olive/20 font-bold uppercase tracking-widest hidden sm:block">{content.admin.contentManager.sections.concept.pillarTip}</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 rounded-xl bg-olive-dark text-white font-black uppercase text-[9px] tracking-widest hover:bg-black"
                                                        onClick={() => {
                                                            const newConcepts = [...localContent.concept3b.concepts];
                                                            const currentText = newConcepts[i].fullDescription.trim();
                                                            newConcepts[i] = {
                                                                ...newConcepts[i],
                                                                fullDescription: currentText + (currentText ? '\n' : '') + '• '
                                                            };
                                                            updateField(['concept3b', 'concepts'], newConcepts);
                                                        }}
                                                    >
                                                        {content.admin.contentManager.sections.concept.pillarAddBullet}
                                                    </Button>
                                                </div>
                                            </div>
                                            <StyledTextField
                                                label=""
                                                value={concept.fullDescription}
                                                onChange={(v) => {
                                                    const newConcepts = [...localContent.concept3b.concepts];
                                                    newConcepts[i] = { ...newConcepts[i], fullDescription: v };
                                                    updateField(['concept3b', 'concepts'], newConcepts);
                                                }}
                                                style={ts(`concept3b.${concept.id}.fullDescription`)}
                                                onStyleChange={(s) => updateStyle(`concept3b.${concept.id}.fullDescription`, s)}
                                                multiline
                                                rows={10}
                                                className="bg-white border-olive/10"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* CTA SECTION */}
                <TabsContent value="cta" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="glass-card rounded-[3rem] overflow-hidden border-none shadow-2xl">
                        <div className="bg-olive-dark py-8 px-6 sm:py-12 sm:px-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                <div className="p-3 sm:p-4 bg-lime/10 rounded-2xl border border-lime/20">
                                    <Mail className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                 <div>
                                    <h3 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight italic">{content.admin.contentManager.sections.cta.title}</h3>
                                    <p className="text-white/40 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] mt-2">{content.admin.contentManager.sections.cta.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 sm:p-12 space-y-8 sm:space-y-12">
                            <div className="bg-background p-8 rounded-[2rem] border border-background">
                                <BadgeToggle badgeKey="cta.badge" label={content.admin.contentManager.sections.cta.visibility} />
                            </div>
                            <StyledTextField
                                label={content.admin.contentManager.sections.cta.badge}
                                value={localContent.cta.badge}
                                onChange={(v) => updateField(['cta', 'badge'], v)}
                                style={ts('cta.badge')}
                                onStyleChange={(s) => updateStyle('cta.badge', s)}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <StyledTextField
                                    label={content.admin.contentManager.sections.cta.headline}
                                    value={localContent.cta.headline.part1}
                                    onChange={(v) => updateField(['cta', 'headline', 'part1'], v)}
                                    style={ts('cta.headline.part1')}
                                    onStyleChange={(s) => updateStyle('cta.headline.part1', s)}
                                />
                                <StyledTextField
                                    label={content.admin.contentManager.sections.cta.highlight}
                                    value={localContent.cta.headline.highlight}
                                    onChange={(v) => updateField(['cta', 'headline', 'highlight'], v)}
                                    style={ts('cta.headline.highlight')}
                                    onStyleChange={(s) => updateStyle('cta.headline.highlight', s)}
                                />
                            </div>
                            <StyledTextField
                                label={content.admin.contentManager.sections.cta.description}
                                value={localContent.cta.description}
                                onChange={(v) => updateField(['cta', 'description'], v)}
                                style={ts('cta.description')}
                                onStyleChange={(s) => updateStyle('cta.description', s)}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* CONTACT SECTION */}
                <TabsContent value="contact" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="glass-card rounded-[3rem] overflow-hidden border-none shadow-2xl">
                        <div className="bg-olive-dark py-8 px-6 sm:py-12 sm:px-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                <div className="p-3 sm:p-4 bg-lime/10 rounded-2xl border border-lime/20">
                                    <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight italic">{content.admin.contentManager.sections.contact.title}</h3>
                                    <p className="text-white/40 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] mt-2">{content.admin.contentManager.sections.contact.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 sm:p-12 space-y-8 sm:space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h3 className="text-lg font-black font-display uppercase italic tracking-tight text-olive-dark">{content.admin.contentManager.sections.contact.headline}</h3>
                                    </div>
                                    <StyledTextField
                                        label={content.admin.contentManager.sections.contact.email}
                                        value={localContent.contact.info.email}
                                        onChange={(v) => updateField(['contact', 'info', 'email'], v)}
                                        style={ts('contact.info.email')}
                                        onStyleChange={(s) => updateStyle('contact.info.email', s)}
                                    />
                                    <StyledTextField
                                        label={content.admin.contentManager.sections.contact.phone}
                                        value={localContent.contact.info.phone}
                                        onChange={(v) => updateField(['contact', 'info', 'phone'], v)}
                                        style={ts('contact.info.phone')}
                                        onStyleChange={(s) => updateStyle('contact.info.phone', s)}
                                    />
                                </div>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h3 className="text-lg font-black font-display uppercase italic tracking-tight text-olive-dark">{content.admin.contentManager.sections.contact.address}</h3>
                                    </div>
                                    <StyledTextField
                                        label={content.admin.contentManager.sections.contact.street}
                                        value={localContent.contact.info.address.street}
                                        onChange={(v) => updateField(['contact', 'info', 'address', 'street'], v)}
                                        style={ts('contact.info.address.street')}
                                        onStyleChange={(s) => updateStyle('contact.info.address.street', s)}
                                    />
                                    <StyledTextField
                                        label={content.admin.contentManager.sections.contact.city}
                                        value={localContent.contact.info.address.city}
                                        onChange={(v) => updateField(['contact', 'info', 'address', 'city'], v)}
                                        style={ts('contact.info.address.city')}
                                        onStyleChange={(s) => updateStyle('contact.info.address.city', s)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </TabsContent>

                {/* FLAVORS SECTION */}
                <TabsContent value="flavors" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="glass-card rounded-[3rem] overflow-hidden border-none shadow-2xl">
                        <div className="bg-olive-dark py-8 px-6 sm:py-12 sm:px-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center gap-4 sm:gap-6 relative z-10">
                                <div className="p-3 sm:p-4 bg-lime/10 rounded-2xl border border-lime/20">
                                    <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                                 <div>
                                    <h3 className="text-2xl sm:text-4xl font-black text-white font-display uppercase tracking-tight italic">{content.admin.contentManager.sections.flavors.sectionTitle}</h3>
                                    <p className="text-white/40 font-black text-[9px] sm:text-[10px] uppercase tracking-[0.4em] mt-2">{content.admin.contentManager.sections.flavors.sectionDesc}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 sm:p-12 space-y-8 sm:space-y-12">
                            {Object.entries(localContent.flavors || {}).map(([key, flavor]: [string, any]) => (
                                <div key={key} className="p-10 rounded-[2.5rem] bg-white border border-background shadow-sm space-y-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-olive-dark flex items-center justify-center text-white text-2xl font-black shadow-xl">
                                                {flavor.name.charAt(0)}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black font-display uppercase tracking-tight text-olive-dark">{flavor.name}</h3>
                                                <p className="text-[10px] font-black text-olive/40 uppercase tracking-widest leading-none bg-background px-3 py-1.5 rounded-full border border-background inline-block">{flavor.tagline}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="px-4 py-2 bg-background rounded-xl border border-background flex items-center gap-3">
                                                <span className="text-[10px] font-black text-olive/40 uppercase tracking-widest">{content.admin.contentManager.sections.flavors.code}:</span>
                                                <span className="text-xs font-black text-olive-dark uppercase">{key}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-background">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-olive/40 pl-1">{content.admin.contentManager.sections.flavors.name}</Label>
                                            <Input
                                                value={flavor.name}
                                                onChange={(e) => updateField(['flavors', key, 'name'], e.target.value)}
                                                className="h-12 rounded-xl border-olive/10 font-bold text-olive-dark focus-visible:ring-primary shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-3 lg:col-span-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-olive/40 pl-1">{content.admin.contentManager.sections.flavors.tagline}</Label>
                                            <Input
                                                value={flavor.tagline}
                                                onChange={(e) => updateField(['flavors', key, 'tagline'], e.target.value)}
                                                className="h-12 rounded-xl border-olive/10 font-bold text-olive-dark focus-visible:ring-primary shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-3 lg:col-span-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-olive/40 pl-1">{content.admin.contentManager.sections.flavors.description}</Label>
                                            <Textarea
                                                value={flavor.description || ''}
                                                onChange={(e) => updateField(['flavors', key, 'description'], e.target.value)}
                                                className="rounded-xl border-olive/10 font-medium text-olive-dark focus-visible:ring-primary shadow-sm resize-none"
                                                rows={2}
                                                placeholder={content.admin.contentManager.sections.flavors.descPlaceholder}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-4 bg-olive-dark rounded-full" />
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-olive-dark">{content.admin.contentManager.sections.flavors.specsTitle}</Label>
                                        </div>
                                        <Tabs defaultValue="nutrition" className="w-full">
                                            <TabsList className="bg-background/50 p-1 rounded-2xl h-auto flex flex-wrap gap-1 border border-olive/10/50 mb-6">
                                                <TabsTrigger value="nutrition" className="flex-1 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-olive-dark data-[state=active]:text-white transition-all">{content.admin.contentManager.sections.flavors.tabs.nutrition}</TabsTrigger>
                                                <TabsTrigger value="vitamins" className="flex-1 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-olive-dark data-[state=active]:text-white transition-all">{content.admin.contentManager.sections.flavors.tabs.vitamins}</TabsTrigger>
                                                <TabsTrigger value="active" className="flex-1 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-olive-dark data-[state=active]:text-white transition-all">{content.admin.contentManager.sections.flavors.tabs.active}</TabsTrigger>
                                            </TabsList>

                                            {/* Nutrition Editor */}
                                            <TabsContent value="nutrition" className="space-y-4 mt-0 bg-background p-6 rounded-2xl border border-background">
                                                <div className="grid grid-cols-12 gap-4 px-2 mb-2">
                                                    <Label className="col-span-4 text-[9px] font-black uppercase tracking-widest text-olive/20">{content.admin.contentManager.sections.flavors.table.item}</Label>
                                                    <Label className="col-span-3 text-[9px] font-black uppercase tracking-widest text-olive/20 text-right">{content.admin.contentManager.sections.flavors.table.per100}</Label>
                                                    <Label className="col-span-3 text-[9px] font-black uppercase tracking-widest text-olive/20 text-right">{content.admin.contentManager.sections.flavors.table.perPortion}</Label>
                                                    <Label className="col-span-2 text-[9px] font-black uppercase tracking-widest text-olive/20 text-right">{content.admin.contentManager.sections.flavors.table.rhp}</Label>
                                                </div>
                                                {(flavor.fullSpecs?.nutrition || []).map((row: any, i: number) => (
                                                    <div key={i} className="grid grid-cols-12 gap-3 items-center group transition-all">
                                                        <Input 
                                                            className="col-span-4 h-10 rounded-lg border-olive/10 bg-white text-[11px] font-bold group-hover:border-olive/20 transition-colors" 
                                                            value={row.label} 
                                                            onChange={(e) => {
                                                                const news = [...flavor.fullSpecs.nutrition];
                                                                news[i] = { ...news[i], label: e.target.value };
                                                                updateField(['flavors', key, 'fullSpecs', 'nutrition'], news);
                                                            }}
                                                        />
                                                        <Input 
                                                            className="col-span-3 h-10 rounded-lg border-olive/10 bg-white text-[11px] font-bold text-right hover:border-olive/20" 
                                                            value={row.per100} 
                                                            onChange={(e) => {
                                                                const news = [...flavor.fullSpecs.nutrition];
                                                                news[i] = { ...news[i], per100: e.target.value };
                                                                updateField(['flavors', key, 'fullSpecs', 'nutrition'], news);
                                                            }}
                                                        />
                                                        <Input 
                                                            className="col-span-3 h-10 rounded-lg border-primary/20 bg-primary/5 text-[11px] font-black text-olive-dark text-right hover:border-primary/40 transition-colors" 
                                                            value={row.perPortion} 
                                                            onChange={(e) => {
                                                                const news = [...flavor.fullSpecs.nutrition];
                                                                news[i] = { ...news[i], perPortion: e.target.value };
                                                                updateField(['flavors', key, 'fullSpecs', 'nutrition'], news);
                                                            }}
                                                        />
                                                        <Input 
                                                            className="col-span-2 h-10 rounded-lg border-olive/10 bg-white text-[10px] font-black text-olive/40 text-right hover:border-olive/20" 
                                                            value={row.rhp} 
                                                            onChange={(e) => {
                                                                const news = [...flavor.fullSpecs.nutrition];
                                                                news[i] = { ...news[i], rhp: e.target.value };
                                                                updateField(['flavors', key, 'fullSpecs', 'nutrition'], news);
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </TabsContent>

                                            {/* Vitamins Editor */}
                                            <TabsContent value="vitamins" className="space-y-4 mt-0 bg-background p-6 rounded-2xl border border-background">
                                                <div className="flex justify-between items-center px-2 mb-4">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-olive-dark italic">{content.admin.contentManager.sections.flavors.micronutrients}</Label>
                                                    <Button 
                                                        variant="outline" size="sm" className="h-8 rounded-xl bg-olive-dark text-white font-black uppercase text-[9px] tracking-widest hover:bg-black gap-2"
                                                        onClick={() => {
                                                            const current = flavor.fullSpecs?.vitamins || [];
                                                            updateField(['flavors', key, 'fullSpecs', 'vitamins'], [...current, { label: "", per100: "", perPortion: "", rhp: "" }]);
                                                        }}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        {content.admin.contentManager.sections.flavors.addRow}
                                                    </Button>
                                                </div>
                                                {(flavor.fullSpecs?.vitamins || []).map((row: any, i: number) => (
                                                    <div key={i} className="grid grid-cols-12 gap-3 items-center group transition-all">
                                                        <Input className="col-span-4 h-10 rounded-lg border-olive/10 bg-white text-[11px] font-bold group-hover:border-olive/20 transition-colors" value={row.label} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.vitamins]; news[i] = { ...news[i], label: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'vitamins'], news);
                                                        }} />
                                                        <Input className="col-span-3 h-10 rounded-lg border-olive/10 bg-white text-[11px] font-bold text-right hover:border-olive/20" value={row.per100} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.vitamins]; news[i] = { ...news[i], per100: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'vitamins'], news);
                                                        }} />
                                                        <Input className="col-span-3 h-10 rounded-lg border-primary/20 bg-primary/5 text-[11px] font-black text-olive-dark text-right hover:border-primary/40 transition-colors" value={row.perPortion} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.vitamins]; news[i] = { ...news[i], perPortion: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'vitamins'], news);
                                                        }} />
                                                        <Input className="col-span-2 h-10 rounded-lg border-olive/10 bg-white text-[10px] font-black text-olive/40 text-right hover:border-olive/20" value={row.rhp} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.vitamins]; news[i] = { ...news[i], rhp: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'vitamins'], news);
                                                        }} />
                                                    </div>
                                                ))}
                                            </TabsContent>

                                            {/* Active Substances Editor */}
                                            <TabsContent value="active" className="space-y-4 mt-0 bg-background p-6 rounded-2xl border border-background">
                                                <div className="flex justify-between items-center px-2 mb-4">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-olive-dark italic">{content.admin.contentManager.sections.flavors.activeSubstances}</Label>
                                                    <Button 
                                                        variant="outline" size="sm" className="h-8 rounded-xl bg-olive-dark text-white font-black uppercase text-[9px] tracking-widest hover:bg-black gap-2"
                                                        onClick={() => {
                                                            const current = flavor.fullSpecs?.activeSubstances || [];
                                                            updateField(['flavors', key, 'fullSpecs', 'activeSubstances'], [...current, { label: "", per100: "", perPortion: "" }]);
                                                        }}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        {content.admin.contentManager.sections.flavors.addRow}
                                                    </Button>
                                                </div>
                                                {(flavor.fullSpecs?.activeSubstances || []).map((row: any, i: number) => (
                                                    <div key={i} className="grid grid-cols-12 gap-3 items-center group transition-all">
                                                        <Input className="col-span-6 h-10 rounded-lg border-olive/10 bg-white text-[11px] font-bold group-hover:border-olive/20 transition-colors" value={row.label} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.activeSubstances]; news[i] = { ...news[i], label: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'activeSubstances'], news);
                                                        }} />
                                                        <Input className="col-span-3 h-10 rounded-lg border-olive/10 bg-white text-[11px] font-bold text-right hover:border-olive/20" value={row.per100} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.activeSubstances]; news[i] = { ...news[i], per100: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'activeSubstances'], news);
                                                        }} />
                                                        <Input className="col-span-3 h-10 rounded-lg border-primary/20 bg-primary/5 text-[11px] font-black text-olive-dark text-right hover:border-primary/40 transition-colors" value={row.perPortion} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.activeSubstances]; news[i] = { ...news[i], perPortion: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'activeSubstances'], news);
                                                        }} />
                                                    </div>
                                                ))}
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>

                {/* FOOTER SECTION */}
                <TabsContent value="footer" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="glass-card rounded-[3rem] overflow-hidden border-none shadow-2xl">
                        <div className="bg-olive-dark py-12 px-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="p-4 bg-lime/10 rounded-2xl border border-lime/20">
                                    <Layout className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-white font-display uppercase tracking-tight italic">{content.admin.contentManager.sections.footer.title}</h3>
                                    <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.4em] mt-2">{content.admin.contentManager.sections.footer.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-12 space-y-12">
                            <StyledTextField
                                label={content.admin.contentManager.sections.footer.brandLabel}
                                value={localContent.footer.brand.description}
                                onChange={(v) => updateField(['footer', 'brand', 'description'], v)}
                                style={ts('footer.brand.description')}
                                onStyleChange={(s) => updateStyle('footer.brand.description', s)}
                                multiline
                                rows={3}
                            />
                            <StyledTextField
                                label={content.admin.contentManager.sections.footer.copyrightLabel}
                                value={localContent.footer.bottom.copyright}
                                onChange={(v) => updateField(['footer', 'bottom', 'copyright'], v)}
                                style={ts('footer.bottom.copyright')}
                                onStyleChange={(s) => updateStyle('footer.bottom.copyright', s)}
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* SETTINGS SECTION */}
                <TabsContent value="settings" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <div className="glass-card rounded-[3rem] overflow-hidden border-none shadow-2xl">
                        <div className="bg-olive-dark py-12 px-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 blur-[100px] -translate-y-1/2 translate-x-1/3" />
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="p-4 bg-lime/10 rounded-2xl border border-lime/20">
                                    <Settings2 className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-white font-display uppercase tracking-tight italic">{content.admin.contentManager.sections.settings.title}</h3>
                                    <p className="text-white/40 font-black text-[10px] uppercase tracking-[0.4em] mt-2">{content.admin.contentManager.sections.settings.description}</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-12 space-y-12">
                            <div className="flex items-center justify-between p-8 rounded-[2rem] bg-white border border-background shadow-sm group transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
                                <div className="space-y-1">
                                    <Label className="text-lg font-black font-display uppercase tracking-tight text-olive-dark">{content.admin.contentManager.sections.settings.discountPopup}</Label>
                                    <p className="text-sm text-olive/40 font-bold uppercase tracking-widest text-[10px]">
                                        {content.admin.contentManager.sections.settings.discountPopupDesc}
                                    </p>
                                </div>
                                <Switch
                                    id="showDiscountPopup"
                                    checked={localContent.showDiscountPopup}
                                    onCheckedChange={(checked) => updateField(['showDiscountPopup'], checked)}
                                    className="data-[state=checked]:bg-primary scale-125"
                                />
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="p-10 bg-olive-dark rounded-[3rem] border border-olive/10 shadow-2xl flex flex-col md:flex-row gap-10 items-center text-center md:text-left group transition-all duration-700 hover:scale-[1.01]">
                <div className="p-6 bg-lime/10 rounded-3xl border border-lime/20 shrink-0 animate-pulse group-hover:bg-lime/20 transition-all">
                    <AlertTriangle className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-white font-black font-display uppercase tracking-wider text-2xl italic">{content.admin.contentManager.notices.saveWarning.title}</h4>
                    <p className="text-brand-muted font-black text-[10px] uppercase tracking-[0.3em] leading-relaxed">
                        {content.admin.contentManager.notices.saveWarning.description}
                    </p>
                </div>
            </div>

            <div className="p-10 glass-card rounded-[3rem] border-none shadow-xl text-olive/60 flex flex-col md:flex-row gap-10 items-center text-center md:text-left">
                <div className="p-6 bg-olive-dark rounded-3xl shadow-2xl shrink-0">
                    <Info className="h-10 w-10 text-white" />
                </div>
                <div className="space-y-2">
                    <h4 className="text-olive-dark font-black font-display uppercase tracking-widest text-base italic">{content.admin.contentManager.notices.systemInfo.title}</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed text-brand-muted">
                        {content.admin.contentManager.notices.systemInfo.description}
                    </p>
                </div>
            </div>
        </div >
    );
};

export default ContentManagement;
