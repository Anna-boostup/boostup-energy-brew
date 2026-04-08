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
import { Loader2, Save, RotateCcw, AlertTriangle, Info, Type, Eye, EyeOff, FileText } from 'lucide-react';
import { AVAILABLE_FONTS, FONT_WEIGHTS } from '@/hooks/useDynamicFonts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import StyledTextField from '@/components/admin/StyledTextField';
import type { TextStyle } from '@/lib/textStyles';

const ContentManagement = () => {
    const { contentCZ, contentEN, refreshContent } = useContent();
    const [editingLang, setEditingLang] = useState<'cs' | 'en'>('cs');
    
    // Select the base content based on editing language
    const currentContent = editingLang === 'cs' ? contentCZ : contentEN;
    
    const [localContent, setLocalContent] = useState(currentContent);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Update local state when context content changes or language switches
    React.useEffect(() => {
        setLocalContent(currentContent);
    }, [currentContent, editingLang]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateSiteContent(localContent, editingLang === 'en' ? 'en' : 'main');
            await refreshContent();
            toast.success(`Obsah (${editingLang === 'cs' ? 'CZ' : 'EN'}) byl úspěšně uložen`);
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error('Chyba při ukládání obsahu: ' + (error.message || 'Neznámá chyba'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        const langName = editingLang === 'cs' ? 'český' : 'anglický';
        if (!window.confirm(`Opravdu chcete resetovat veškerý ${langName} obsah na výchozí hodnoty? Tato akce je nevratná.`)) return;

        try {
            setIsResetting(true);
            await resetToDefaultContent(editingLang === 'en' ? 'en' : 'main');
            await refreshContent();
            toast.success(`Obsah (${editingLang === 'cs' ? 'CZ' : 'EN'}) byl resetován na výchozí hodnoty`);
        } catch (error: any) {
            toast.error('Chyba při resetování obsahu: ' + (error.message || 'Neznámá chyba'));
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
            {badgeVisible(badgeKey) ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
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
        // Save the current draft correctly to localStorage
        localStorage.setItem(`boostup_preview_content_${lang}`, JSON.stringify(localContent));
        toast.success("Náhled byl vygenerován");
        window.open(`/?preview=true&lang=${lang}`, '_blank');
    };

    return (
        <div className="space-y-12 pb-32 animate-in fade-in duration-1000">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 flex-wrap">
                <div className="space-y-1">
                    <h2 className="text-5xl font-black tracking-tighter text-slate-900 font-display uppercase italic">Content Engine</h2>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Správa vizuálního a textového obsahu webu</p>
                </div>

                <div className="flex flex-wrap items-center gap-6 w-full lg:w-auto">
                    <div className="flex items-center bg-slate-900 rounded-[2rem] p-1.5 shadow-2xl">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-12 px-8 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all duration-500 border-none ${
                                editingLang === 'cs' ? 'bg-primary text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                            onClick={() => setEditingLang('cs')}
                        >
                            🇨🇿 ČEŠTINA
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-12 px-8 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all duration-500 border-none ${
                                editingLang === 'en' ? 'bg-primary text-slate-900 shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'
                            }`}
                            onClick={() => setEditingLang('en')}
                        >
                            🇬🇧 ENGLISH
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-4 ml-auto">
                        <Button variant="outline" onClick={handlePreview} className="h-14 px-6 rounded-2xl bg-white border-slate-100 text-slate-900 font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-slate-50 hover:border-slate-200 transition-all gap-3">
                            <Eye className="h-5 w-5" />
                            Náhled
                        </Button>
                        <Button variant="outline" onClick={handleReset} disabled={isResetting || isSaving} className="h-14 px-6 rounded-2xl bg-white border-slate-100 text-slate-400 font-black uppercase text-[10px] tracking-widest shadow-sm hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all gap-3">
                            {isResetting ? <Loader2 className="h-5 w-5 animate-spin" /> : <RotateCcw className="h-5 w-5" />}
                            Resetovat
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving || isResetting} className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-black text-primary font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-[0.98] gap-3">
                            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            Uložit změny
                        </Button>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="hero" className="w-full space-y-12">
                <div className="p-2 bg-slate-100/50 backdrop-blur-md rounded-[2.5rem] w-full shadow-sm border border-white/50">
                    <TabsList className="bg-transparent h-auto p-1 gap-2 flex flex-wrap justify-center border-none">
                        {['hero', 'mission', 'ingredients', 'concept', 'cta', 'contact', 'flavors', 'footer', 'settings'].map((tab) => (
                            <TabsTrigger 
                                key={tab}
                                value={tab} 
                                className="px-6 py-4 rounded-[2rem] font-black uppercase text-[9px] tracking-[0.2em] text-slate-400 data-[state=active]:bg-slate-900 data-[state=active]:text-primary transition-all duration-500 border-none shadow-none"
                            >
                                {tab === 'hero' && 'Hero (Úvod)'}
                                {tab === 'mission' && 'Mise'}
                                {tab === 'ingredients' && 'Ingredience'}
                                {tab === 'concept' && '3B Koncept'}
                                {tab === 'cta' && 'CTA (Odběr)'}
                                {tab === 'contact' && 'Kontakt'}
                                {tab === 'flavors' && 'Příchutě'}
                                {tab === 'footer' && 'Patička'}
                                {tab === 'settings' && 'Nastavení'}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {/* HERO SECTION */}
                <TabsContent value="hero" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className="border border-white/40 shadow-xl rounded-[3rem] bg-white/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b border-slate-800 py-12 px-12">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/20 rounded-2xl">
                                    <Type className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black text-white font-display uppercase tracking-tight">Hlavní Hero Sekce</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest pl-1">Vizuální středobod vaší webové prezentace</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 space-y-10">
                            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                <BadgeToggle badgeKey="hero.announcement" label="Viditelnost oznamovacího banneru" />
                            </div>
                            <StyledTextField
                                label="Badge text (BRZY NA TRHU)"
                                value={localContent.hero.announcement}
                                onChange={(v) => updateField(['hero', 'announcement'], v)}
                                style={ts('hero.announcement')}
                                onStyleChange={(s) => updateStyle('hero.announcement', s)}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <StyledTextField
                                    label="Nadpis Část 1"
                                    value={localContent.hero.headline.part1}
                                    onChange={(v) => updateField(['hero', 'headline', 'part1'], v)}
                                    style={ts('hero.headline.part1')}
                                    onStyleChange={(s) => updateStyle('hero.headline.part1', s)}
                                />
                                <StyledTextField
                                    label="Nadpis Zvýrazněný"
                                    value={localContent.hero.headline.gradient}
                                    onChange={(v) => updateField(['hero', 'headline', 'gradient'], v)}
                                    style={ts('hero.headline.gradient')}
                                    onStyleChange={(s) => updateStyle('hero.headline.gradient', s)}
                                />
                                <StyledTextField
                                    label="Nadpis Část 2"
                                    value={localContent.hero.headline.part2}
                                    onChange={(v) => updateField(['hero', 'headline', 'part2'], v)}
                                    style={ts('hero.headline.part2')}
                                    onStyleChange={(s) => updateStyle('hero.headline.part2', s)}
                                />
                            </div>

                            <StyledTextField
                                label="Hlavní popis"
                                value={localContent.hero.description}
                                onChange={(v) => updateField(['hero', 'description'], v)}
                                style={ts('hero.description')}
                                onStyleChange={(s) => updateStyle('hero.description', s)}
                                multiline
                                rows={3}
                            />

                            <StyledTextField
                                label="Podnadpis pod tlačítky (Testimonial)"
                                value={localContent.hero.testimonial || ''}
                                onChange={(v) => updateField(['hero', 'testimonial'], v)}
                                style={ts('hero.testimonial')}
                                onStyleChange={(s) => updateStyle('hero.testimonial', s)}
                                placeholder="Zadejte text pod tlačítka..."
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
                                <StyledTextField
                                    label="Tlačítko Primární"
                                    value={localContent.hero.cta.primary}
                                    onChange={(v) => updateField(['hero', 'cta', 'primary'], v)}
                                    style={ts('hero.cta.primary')}
                                    onStyleChange={(s) => updateStyle('hero.cta.primary', s)}
                                />
                                <StyledTextField
                                    label="Tlačítko Sekundární"
                                    value={localContent.hero.cta.secondary}
                                    onChange={(v) => updateField(['hero', 'cta', 'secondary'], v)}
                                    style={ts('hero.cta.secondary')}
                                    onStyleChange={(s) => updateStyle('hero.cta.secondary', s)}
                                />
                                <StyledTextField
                                    label="Text Koncept 3B"
                                    value={localContent.hero.cta.concept3b}
                                    onChange={(v) => updateField(['hero', 'cta', 'concept3b'], v)}
                                    style={ts('hero.cta.concept3b')}
                                    onStyleChange={(s) => updateStyle('hero.cta.concept3b', s)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MISSION SECTION */}
                <TabsContent value="mission" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className="border border-white/40 shadow-xl rounded-[3rem] bg-white/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b border-slate-800 py-12 px-12">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/20 rounded-2xl">
                                    <FileText className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black text-white font-display uppercase tracking-tight">Naše Mise</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest pl-1">Sekce vyprávějící příběh vaší značky</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 space-y-10">
                            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                <BadgeToggle badgeKey="mission.badge" label="Viditelnost štítku (O NÁS)" />
                            </div>
                            <StyledTextField
                                label="Text štítku"
                                value={localContent.mission.badge}
                                onChange={(v) => updateField(['mission', 'badge'], v)}
                                style={ts('mission.badge')}
                                onStyleChange={(s) => updateStyle('mission.badge', s)}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <StyledTextField
                                    label="Nadpis Část 1"
                                    value={localContent.mission.headline.part1}
                                    onChange={(v) => updateField(['mission', 'headline', 'part1'], v)}
                                    style={ts('mission.headline.part1')}
                                    onStyleChange={(s) => updateStyle('mission.headline.part1', s)}
                                />
                                <StyledTextField
                                    label="Zvýrazněný text nadpisu"
                                    value={localContent.mission.headline.highlight}
                                    onChange={(v) => updateField(['mission', 'headline', 'highlight'], v)}
                                    style={ts('mission.headline.highlight')}
                                    onStyleChange={(s) => updateStyle('mission.headline.highlight', s)}
                                />
                            </div>
                            <div className="space-y-8 pt-8 border-t border-slate-100">
                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Obsahové odstavce příběhu</Label>
                                {localContent.mission.paragraphs.map((text, i) => (
                                    <StyledTextField
                                        key={i}
                                        label={`Blok příběhu ${i + 1}`}
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
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* INGREDIENTS SECTION */}
                <TabsContent value="ingredients" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className="border border-white/40 shadow-xl rounded-[3rem] bg-white/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b border-slate-800 py-12 px-12">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/20 rounded-2xl">
                                    <Beaker className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black text-white font-display uppercase tracking-tight">Vědecké Informace</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest pl-1">Detailní rozpis ingrediencí a jejich benefitů</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 space-y-12">
                            {Object.entries(localContent.ingredientDetails || {}).map(([key, details]: [string, any]) => (
                                <div key={key} className="space-y-8 p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm relative group overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 translate-x-12 -translate-y-12 rounded-full transition-transform duration-700 group-hover:scale-150 ${
                                        key === 'stimulants' ? 'bg-primary' :
                                        key === 'electrolytes' ? 'bg-blue-400' :
                                        key === 'adaptogens' ? 'bg-orange-500' :
                                        'bg-orange-500'
                                    }`} />
                                    <div className="flex items-center gap-4">
                                        <div className={`w-4 h-4 rounded-full shadow-lg ${
                                            key === 'stimulants' ? 'bg-primary' :
                                            key === 'electrolytes' ? 'bg-blue-400' :
                                            key === 'adaptogens' ? 'bg-orange-500' :
                                            'bg-orange-500'
                                        }`} />
                                        <h3 className="text-2xl font-black font-display uppercase tracking-tight text-slate-900">{details.title}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Název Kategorie</Label>
                                            <Input
                                                value={details.title}
                                                onChange={(e) => updateField(['ingredientDetails', key, 'title'], e.target.value)}
                                                className="h-14 rounded-2xl border-slate-200 font-extrabold text-slate-900 pl-6 focus-visible:ring-primary shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Vedlejší titulek</Label>
                                            <Input
                                                value={details.subtitle}
                                                onChange={(e) => updateField(['ingredientDetails', key, 'subtitle'], e.target.value)}
                                                className="h-14 rounded-2xl border-slate-200 font-extrabold text-slate-900 pl-6 focus-visible:ring-primary shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Shrnutí účinků</Label>
                                        <Textarea
                                            rows={3}
                                            value={details.description}
                                            onChange={(e) => updateField(['ingredientDetails', key, 'description'], e.target.value)}
                                            className="rounded-2xl border-slate-200 font-bold text-slate-700 p-6 focus-visible:ring-primary shadow-sm leading-relaxed"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                                        <div className="space-y-6">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 block">Klíčové Výhody (seznam)</Label>
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
                                                        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 pl-5 text-sm"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-6">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1 block">Specifické Látky (tagy)</Label>
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
                                                        className="h-12 rounded-xl border-slate-100 bg-slate-50/50 font-bold text-slate-700 pl-5 text-sm"
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CONCEPT SECTION */}
                <TabsContent value="concept" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className="border border-white/40 shadow-xl rounded-[3rem] bg-white/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b border-slate-800 py-12 px-12">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/20 rounded-2xl">
                                    <BarChart3 className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black text-white font-display uppercase tracking-tight">3B Koncept</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest pl-1">Hlavní pilíře výkonu a funkčnosti</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Hlavní Nadpis Sekce</Label>
                                    <Input
                                        value={localContent.concept3b.headline}
                                        onChange={(e) => updateField(['concept3b', 'headline'], e.target.value)}
                                        className="h-14 rounded-2xl border-slate-200 font-extrabold text-slate-900 pl-6 focus-visible:ring-primary shadow-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Text Tlačítka (CTA)</Label>
                                    <Input
                                        value={localContent.concept3b.cta}
                                        onChange={(e) => updateField(['concept3b', 'cta'], e.target.value)}
                                        className="h-14 rounded-2xl border-slate-200 font-extrabold text-slate-900 pl-6 focus-visible:ring-primary shadow-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Úvodní Popis Konceptu</Label>
                                <Textarea
                                    rows={3}
                                    value={localContent.concept3b.description}
                                    onChange={(e) => updateField(['concept3b', 'description'], e.target.value)}
                                    className="rounded-2xl border-slate-200 font-bold text-slate-700 p-6 focus-visible:ring-primary shadow-sm leading-relaxed"
                                />
                            </div>

                            <div className="space-y-10 pt-12 border-t border-slate-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-1.5 h-6 bg-primary rounded-full" />
                                    <h3 className="text-xl font-black font-display uppercase italic tracking-tight text-slate-900">Jednotlivé Pilíře (Karty)</h3>
                                </div>
                                {localContent.concept3b.concepts.map((concept, i) => (
                                    <div key={concept.id} className="p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100 space-y-10 group relative transition-all duration-500 hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50">
                                        <div className="absolute top-8 right-10">
                                            <span className="text-8xl font-black text-slate-900/5 select-none">{i + 1}</span>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <StyledTextField
                                                label="Klíčové slovo (Např. BRAIN)"
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
                                                label="Poutavý podnadpis"
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
                                                label="Výkonnostní statistika"
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
                                                label="Text na kartě (Limitovaný prostor)"
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
                                        <div className="space-y-6 pt-6 border-t border-slate-200">
                                            <div className="flex items-center justify-between">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 pl-1">Hlavní detailní text (Popup okno)</Label>
                                                <div className="flex items-center gap-4">
                                                    <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest hidden sm:block">TIP: Použijte <code>•</code> pro odrážku</p>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 rounded-xl bg-slate-900 text-primary font-black uppercase text-[9px] tracking-widest hover:bg-black"
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
                                                        + PŘIDAT ODRÁŽKU
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
                                                className="bg-white border-slate-200"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CTA SECTION */}
                <TabsContent value="cta" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className="border border-white/40 shadow-xl rounded-[3rem] bg-white/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b border-slate-800 py-12 px-12">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/20 rounded-2xl">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black text-white font-display uppercase tracking-tight">Akční Výzva (CTA)</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest pl-1">Sekce pro konverzi návštěvníků v odběratele</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 space-y-10">
                            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                <BadgeToggle badgeKey="cta.badge" label="Viditelnost konverzního badge" />
                            </div>
                            <StyledTextField
                                label="Text badge"
                                value={localContent.cta.badge}
                                onChange={(v) => updateField(['cta', 'badge'], v)}
                                style={ts('cta.badge')}
                                onStyleChange={(s) => updateStyle('cta.badge', s)}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <StyledTextField
                                    label="Hlavní nadpis CTA"
                                    value={localContent.cta.headline.part1}
                                    onChange={(v) => updateField(['cta', 'headline', 'part1'], v)}
                                    style={ts('cta.headline.part1')}
                                    onStyleChange={(s) => updateStyle('cta.headline.part1', s)}
                                />
                                <StyledTextField
                                    label="Zvýrazněný text (Gradient)"
                                    value={localContent.cta.headline.highlight}
                                    onChange={(v) => updateField(['cta', 'headline', 'highlight'], v)}
                                    style={ts('cta.headline.highlight')}
                                    onStyleChange={(s) => updateStyle('cta.headline.highlight', s)}
                                />
                            </div>
                            <StyledTextField
                                label="Doplňující text pod nadpisem"
                                value={localContent.cta.description}
                {/* CONTACT SECTION */}
                <TabsContent value="contact" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className="border border-white/40 shadow-xl rounded-[3rem] bg-white/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b border-slate-800 py-12 px-12">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/20 rounded-2xl">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black text-white font-display uppercase tracking-tight">Kontakt & Informace</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest pl-1">Kontaktní údaje a lokace firmy</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h3 className="text-lg font-black font-display uppercase italic tracking-tight text-slate-900">Základní Kontakt</h3>
                                    </div>
                                    <StyledTextField
                                        label="Emailová adresa"
                                        value={localContent.contact.info.email}
                                        onChange={(v) => updateField(['contact', 'info', 'email'], v)}
                                        style={ts('contact.info.email')}
                                        onStyleChange={(s) => updateStyle('contact.info.email', s)}
                                    />
                                    <StyledTextField
                                        label="Telefonní číslo"
                                        value={localContent.contact.info.phone}
                                        onChange={(v) => updateField(['contact', 'info', 'phone'], v)}
                                        style={ts('contact.info.phone')}
                                        onStyleChange={(s) => updateStyle('contact.info.phone', s)}
                                    />
                                </div>
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h3 className="text-lg font-black font-display uppercase italic tracking-tight text-slate-900">Adresa Sídla</h3>
                                    </div>
                                    <StyledTextField
                                        label="Ulice a č.p."
                                        value={localContent.contact.info.address.street}
                                        onChange={(v) => updateField(['contact', 'info', 'address', 'street'], v)}
                                        style={ts('contact.info.address.street')}
                                        onStyleChange={(s) => updateStyle('contact.info.address.street', s)}
                                    />
                                    <StyledTextField
                                        label="Město a PSČ"
                                        value={localContent.contact.info.address.city}
                                        onChange={(v) => updateField(['contact', 'info', 'address', 'city'], v)}
                                        style={ts('contact.info.address.city')}
                                        onStyleChange={(s) => updateStyle('contact.info.address.city', s)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FLAVORS SECTION */}
                <TabsContent value="flavors" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className="border border-white/40 shadow-xl rounded-[3rem] bg-white/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b border-slate-800 py-12 px-12">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/20 rounded-2xl">
                                    <Zap className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black text-white font-display uppercase tracking-tight">Katalog Příchutí</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest pl-1">Správa parametrů a specifikací jednotlivých produktů</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 space-y-12">
                            {Object.entries(localContent.flavors || {}).map(([key, flavor]: [string, any]) => (
                                <div key={key} className="p-10 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm space-y-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-primary text-2xl font-black shadow-xl">
                                                {flavor.name.charAt(0)}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-black font-display uppercase tracking-tight text-slate-900">{flavor.name}</h3>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 inline-block">{flavor.tagline}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kód:</span>
                                                <span className="text-xs font-black text-slate-900 uppercase">{key}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-slate-100">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Název příchutě</Label>
                                            <Input
                                                value={flavor.name}
                                                onChange={(e) => updateField(['flavors', key, 'name'], e.target.value)}
                                                className="h-12 rounded-xl border-slate-200 font-bold text-slate-900 focus-visible:ring-primary shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-3 lg:col-span-2">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Slogan (Tagline)</Label>
                                            <Input
                                                value={flavor.tagline}
                                                onChange={(e) => updateField(['flavors', key, 'tagline'], e.target.value)}
                                                className="h-12 rounded-xl border-slate-200 font-bold text-slate-900 focus-visible:ring-primary shadow-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-4 bg-slate-900 rounded-full" />
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">Detailní Specifikace & Nutriční Hodnoty</Label>
                                        </div>
                                        <Tabs defaultValue="nutrition" className="w-full">
                                            <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-auto flex flex-wrap gap-1 border border-slate-200/50 mb-6">
                                                <TabsTrigger value="nutrition" className="flex-1 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-primary transition-all">Nutrice</TabsTrigger>
                                                <TabsTrigger value="vitamins" className="flex-1 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-primary transition-all">Vitamíny</TabsTrigger>
                                                <TabsTrigger value="active" className="flex-1 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-primary transition-all">Ostatní</TabsTrigger>
                                            </TabsList>

                                            {/* Nutrition Editor */}
                                            <TabsContent value="nutrition" className="space-y-4 mt-0 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                <div className="grid grid-cols-12 gap-4 px-2 mb-2">
                                                    <Label className="col-span-4 text-[9px] font-black uppercase tracking-widest text-slate-300">Položka</Label>
                                                    <Label className="col-span-3 text-[9px] font-black uppercase tracking-widest text-slate-300 text-right">na 100g</Label>
                                                    <Label className="col-span-3 text-[9px] font-black uppercase tracking-widest text-slate-300 text-right">na porci</Label>
                                                    <Label className="col-span-2 text-[9px] font-black uppercase tracking-widest text-slate-300 text-right">RHP (%)</Label>
                                                </div>
                                                {(flavor.fullSpecs?.nutrition || []).map((row: any, i: number) => (
                                                    <div key={i} className="grid grid-cols-12 gap-3 items-center group transition-all">
                                                        <Input 
                                                            className="col-span-4 h-10 rounded-lg border-slate-200 bg-white text-[11px] font-bold group-hover:border-slate-300 transition-colors" 
                                                            value={row.label} 
                                                            onChange={(e) => {
                                                                const news = [...flavor.fullSpecs.nutrition];
                                                                news[i] = { ...news[i], label: e.target.value };
                                                                updateField(['flavors', key, 'fullSpecs', 'nutrition'], news);
                                                            }}
                                                        />
                                                        <Input 
                                                            className="col-span-3 h-10 rounded-lg border-slate-200 bg-white text-[11px] font-bold text-right hover:border-slate-300" 
                                                            value={row.per100} 
                                                            onChange={(e) => {
                                                                const news = [...flavor.fullSpecs.nutrition];
                                                                news[i] = { ...news[i], per100: e.target.value };
                                                                updateField(['flavors', key, 'fullSpecs', 'nutrition'], news);
                                                            }}
                                                        />
                                                        <Input 
                                                            className="col-span-3 h-10 rounded-lg border-primary/20 bg-primary/5 text-[11px] font-black text-slate-900 text-right hover:border-primary/40 transition-colors" 
                                                            value={row.perPortion} 
                                                            onChange={(e) => {
                                                                const news = [...flavor.fullSpecs.nutrition];
                                                                news[i] = { ...news[i], perPortion: e.target.value };
                                                                updateField(['flavors', key, 'fullSpecs', 'nutrition'], news);
                                                            }}
                                                        />
                                                        <Input 
                                                            className="col-span-2 h-10 rounded-lg border-slate-200 bg-white text-[10px] font-black text-slate-400 text-right hover:border-slate-300" 
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
                                            <TabsContent value="vitamins" className="space-y-4 mt-0 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                <div className="flex justify-between items-center px-2 mb-4">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">Přehled Mikronutrientů</Label>
                                                    <Button 
                                                        variant="outline" size="sm" className="h-8 rounded-xl bg-slate-900 text-primary font-black uppercase text-[9px] tracking-widest hover:bg-black gap-2"
                                                        onClick={() => {
                                                            const current = flavor.fullSpecs?.vitamins || [];
                                                            updateField(['flavors', key, 'fullSpecs', 'vitamins'], [...current, { label: "", per100: "", perPortion: "", rhp: "" }]);
                                                        }}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        Přidat řádek
                                                    </Button>
                                                </div>
                                                {(flavor.fullSpecs?.vitamins || []).map((row: any, i: number) => (
                                                    <div key={i} className="grid grid-cols-12 gap-3 items-center group transition-all">
                                                        <Input className="col-span-4 h-10 rounded-lg border-slate-200 bg-white text-[11px] font-bold group-hover:border-slate-300 transition-colors" value={row.label} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.vitamins]; news[i] = { ...news[i], label: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'vitamins'], news);
                                                        }} />
                                                        <Input className="col-span-3 h-10 rounded-lg border-slate-200 bg-white text-[11px] font-bold text-right hover:border-slate-300" value={row.per100} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.vitamins]; news[i] = { ...news[i], per100: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'vitamins'], news);
                                                        }} />
                                                        <Input className="col-span-3 h-10 rounded-lg border-primary/20 bg-primary/5 text-[11px] font-black text-slate-900 text-right hover:border-primary/40 transition-colors" value={row.perPortion} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.vitamins]; news[i] = { ...news[i], perPortion: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'vitamins'], news);
                                                        }} />
                                                        <Input className="col-span-2 h-10 rounded-lg border-slate-200 bg-white text-[10px] font-black text-slate-400 text-right hover:border-slate-300" value={row.rhp} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.vitamins]; news[i] = { ...news[i], rhp: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'vitamins'], news);
                                                        }} />
                                                    </div>
                                                ))}
                                            </TabsContent>

                                            {/* Active Substances Editor */}
                                            <TabsContent value="active" className="space-y-4 mt-0 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                <div className="flex justify-between items-center px-2 mb-4">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">Ostatní účinné látky</Label>
                                                    <Button 
                                                        variant="outline" size="sm" className="h-8 rounded-xl bg-slate-900 text-primary font-black uppercase text-[9px] tracking-widest hover:bg-black gap-2"
                                                        onClick={() => {
                                                            const current = flavor.fullSpecs?.activeSubstances || [];
                                                            updateField(['flavors', key, 'fullSpecs', 'activeSubstances'], [...current, { label: "", per100: "", perPortion: "" }]);
                                                        }}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                        Přidat řádek
                                                    </Button>
                                                </div>
                                                {(flavor.fullSpecs?.activeSubstances || []).map((row: any, i: number) => (
                                                    <div key={i} className="grid grid-cols-12 gap-3 items-center group transition-all">
                                                        <Input className="col-span-6 h-10 rounded-lg border-slate-200 bg-white text-[11px] font-bold group-hover:border-slate-300 transition-colors" value={row.label} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.activeSubstances]; news[i] = { ...news[i], label: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'activeSubstances'], news);
                                                        }} />
                                                        <Input className="col-span-3 h-10 rounded-lg border-slate-200 bg-white text-[11px] font-bold text-right hover:border-slate-300" value={row.per100} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.activeSubstances]; news[i] = { ...news[i], per100: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'activeSubstances'], news);
                                                        }} />
                                                        <Input className="col-span-3 h-10 rounded-lg border-primary/20 bg-primary/5 text-[11px] font-black text-slate-900 text-right hover:border-primary/40 transition-colors" value={row.perPortion} onChange={(e) => {
                                                            const news = [...flavor.fullSpecs.activeSubstances]; news[i] = { ...news[i], perPortion: e.target.value }; updateField(['flavors', key, 'fullSpecs', 'activeSubstances'], news);
                                                        }} />
                                                    </div>
                                                ))}
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FOOTER SECTION */}
                <TabsContent value="footer" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className="border border-white/40 shadow-xl rounded-[3rem] bg-white/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b border-slate-800 py-12 px-12">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/20 rounded-2xl">
                                    <Layout className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black text-white font-display uppercase tracking-tight">Patička (Footer)</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest pl-1">Upravte copyright and značkový popis ve spodní části webu</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 space-y-10">
                            <StyledTextField
                                label="Krátký popis značky"
                                value={localContent.footer.brand.description}
                                onChange={(v) => updateField(['footer', 'brand', 'description'], v)}
                                style={ts('footer.brand.description')}
                                onStyleChange={(s) => updateStyle('footer.brand.description', s)}
                                multiline
                                rows={3}
                            />
                            <StyledTextField
                                label="Copyright text"
                                value={localContent.footer.bottom.copyright}
                                onChange={(v) => updateField(['footer', 'bottom', 'copyright'], v)}
                                style={ts('footer.bottom.copyright')}
                                onStyleChange={(s) => updateStyle('footer.bottom.copyright', s)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SETTINGS SECTION */}
                <TabsContent value="settings" className="mt-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <Card className="border border-white/40 shadow-xl rounded-[3rem] bg-white/50 backdrop-blur-sm overflow-hidden">
                        <CardHeader className="bg-slate-900 border-b border-slate-800 py-12 px-12">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/20 rounded-2xl">
                                    <Settings2 className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black text-white font-display uppercase tracking-tight">Globální Nastavení</CardTitle>
                            </div>
                            <CardDescription className="text-slate-400 font-bold text-xs uppercase tracking-widest pl-1">Ovládání globálních funkcí a behaviorálních prvků</CardDescription>
                        </CardHeader>
                        <CardContent className="p-12 space-y-10">
                            <div className="flex items-center justify-between p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm group transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
                                <div className="space-y-1">
                                    <Label className="text-lg font-black font-display uppercase tracking-tight text-slate-900">Slevový Pop-up (Engagement)</Label>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                        Zobrazit vyskakovací okno s nabídkou slevy při první návštěvě.
                                    </p>
                                </div>
                                <Switch
                                    id="showDiscountPopup"
                                    checked={localContent.showDiscountPopup}
                                    onCheckedChange={(checked) => updateField(['showDiscountPopup'], checked)}
                                    className="data-[state=checked]:bg-primary scale-125"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col md:flex-row gap-8 items-center text-center md:text-left group transition-all duration-700 hover:scale-[1.01]">
                <div className="p-5 bg-primary/10 rounded-3xl border border-primary/20 shrink-0 animate-pulse group-hover:bg-primary/20 transition-all">
                    <AlertTriangle className="h-8 w-8 text-primary" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-white font-black font-display uppercase tracking-widest text-xl italic">Nezapomeňte uložít změny!</h4>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                        Veškeré úpravy v tomto engine se stanou aktivními až po kliknutí na 
                        <span className="text-primary font-black mx-2 border-b border-primary/30">ULOŽIT ZMĚNY</span> 
                        v horní části ovládacího panelu.
                    </p>
                </div>
            </div>

            <div className="p-8 bg-white/30 backdrop-blur-md rounded-[2.5rem] border border-white/50 text-slate-500 flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                <div className="p-5 bg-white rounded-3xl shadow-sm border border-slate-100 shrink-0">
                    <Info className="h-8 w-8 text-slate-400" />
                </div>
                <div className="space-y-1">
                    <h4 className="text-slate-900 font-black font-display uppercase tracking-widest text-sm italic">Systémové Info</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest leading-loose">
                        Změny se po uložení projeví okamžitě na celém webu. Pokud dojde k neočekávané chybě synchronizace, 
                        systém se automaticky přepne do záložního režimu a načte statický obsah.
                    </p>
                </div>
            </div>
        </div >
    );
};

export default ContentManagement;
