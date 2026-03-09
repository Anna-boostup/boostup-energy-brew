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
import { Loader2, Save, RotateCcw, AlertTriangle, Info, Type, Eye, EyeOff } from 'lucide-react';
import { AVAILABLE_FONTS, FONT_WEIGHTS } from '@/hooks/useDynamicFonts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import StyledTextField from '@/components/admin/StyledTextField';
import type { TextStyle } from '@/lib/textStyles';

const ContentManagement = () => {
    const { content, refreshContent } = useContent();
    const [localContent, setLocalContent] = useState(content);
    const [isSaving, setIsSaving] = useState(false);
    const [isResetting, setIsResetting] = useState(false);

    // Update local state when context content changes (e.g. after refresh)
    React.useEffect(() => {
        setLocalContent(content);
    }, [content]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateSiteContent(localContent);
            await refreshContent();
            toast.success('Obsah byl úspěšně uložen');
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error('Chyba při ukládání obsahu: ' + (error.message || 'Neznámá chyba'));
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Opravdu chcete resetovat veškerý obsah na výchozí hodnoty? Tato akce je nevratná.')) return;

        try {
            setIsResetting(true);
            await resetToDefaultContent();
            await refreshContent();
            toast.success('Obsah byl resetován na výchozí hodnoty');
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

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Správa obsahu</h2>
                    <p className="text-muted-foreground">Upravte texty na webu v reálném čase.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset} disabled={isResetting || isSaving} className="gap-2">
                        {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                        Resetovat
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || isResetting} className="gap-2 px-8">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Uložit změny
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="hero" className="w-full">
                <TabsList className="bg-muted p-1 mb-6 flex flex-wrap h-auto gap-1">
                    <TabsTrigger value="hero">Hero (Úvod)</TabsTrigger>
                    <TabsTrigger value="mission">Mise</TabsTrigger>
                    <TabsTrigger value="ingredients">Ingredience</TabsTrigger>
                    <TabsTrigger value="concept">3B Koncept</TabsTrigger>
                    <TabsTrigger value="cta">CTA (Odběr)</TabsTrigger>
                    <TabsTrigger value="contact">Kontakt</TabsTrigger>
                    <TabsTrigger value="flavors">Příchutě</TabsTrigger>
                    <TabsTrigger value="footer">Patička</TabsTrigger>
                </TabsList>

                {/* HERO SECTION */}
                <TabsContent value="hero">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hero Sekce</CardTitle>
                            <CardDescription>Hlavní texty na úvodní straně v horní části.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <BadgeToggle badgeKey="hero.announcement" label="Zobrazit badge (BRZY NA TRHU)" />
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
                <TabsContent value="mission">
                    <Card>
                        <CardHeader>
                            <CardTitle>Naše Mise</CardTitle>
                            <CardDescription>Upravte texty v sekci "O nás".</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <BadgeToggle badgeKey="mission.badge" label="Zobrazit badge (O NÁS)" />
                            <StyledTextField
                                label="Badge text (O NÁS)"
                                value={localContent.mission.badge}
                                onChange={(v) => updateField(['mission', 'badge'], v)}
                                style={ts('mission.badge')}
                                onStyleChange={(s) => updateStyle('mission.badge', s)}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <StyledTextField
                                    label="Nadpis Část 1"
                                    value={localContent.mission.headline.part1}
                                    onChange={(v) => updateField(['mission', 'headline', 'part1'], v)}
                                    style={ts('mission.headline.part1')}
                                    onStyleChange={(s) => updateStyle('mission.headline.part1', s)}
                                />
                                <StyledTextField
                                    label="Nadpis Zvýrazněný"
                                    value={localContent.mission.headline.highlight}
                                    onChange={(v) => updateField(['mission', 'headline', 'highlight'], v)}
                                    style={ts('mission.headline.highlight')}
                                    onStyleChange={(s) => updateStyle('mission.headline.highlight', s)}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label>Odstavce mise</Label>
                                {localContent.mission.paragraphs.map((text, i) => (
                                    <StyledTextField
                                        key={i}
                                        label={`Odstavec ${i + 1}`}
                                        value={text}
                                        onChange={(v) => {
                                            const newParas = [...localContent.mission.paragraphs];
                                            newParas[i] = v;
                                            updateField(['mission', 'paragraphs'], newParas);
                                        }}
                                        style={ts(`mission.paragraph.${i}`)}
                                        onStyleChange={(s) => updateStyle(`mission.paragraph.${i}`, s)}
                                        multiline
                                        rows={2}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* INGREDIENTS SECTION */}
                <TabsContent value="ingredients">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detaily ingrediencí (Popup)</CardTitle>
                            <CardDescription>Upravte texty, které se zobrazí v modálním okně po kliknutí na pilulky v sekci Hero.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-12">
                            {Object.entries(localContent.ingredientDetails || {}).map(([key, details]: [string, any]) => (
                                <div key={key} className="space-y-6 p-6 rounded-xl bg-secondary/20 border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${key === 'stimulants' ? 'bg-lime' :
                                            key === 'electrolytes' ? 'bg-blue-400' :
                                                key === 'adaptogens' ? 'bg-terracotta' :
                                                    'bg-orange'
                                            }`} />
                                        <h3 className="text-xl font-bold capitalize">{details.title}</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Název (Title)</Label>
                                            <Input
                                                value={details.title}
                                                onChange={(e) => updateField(['ingredientDetails', key, 'title'], e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Podnadpis (Subtitle)</Label>
                                            <Input
                                                value={details.subtitle}
                                                onChange={(e) => updateField(['ingredientDetails', key, 'subtitle'], e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label>Hlavní popis</Label>
                                        <Textarea
                                            rows={2}
                                            value={details.description}
                                            onChange={(e) => updateField(['ingredientDetails', key, 'description'], e.target.value)}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <Label className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Benefity (odrážky)</Label>
                                            {details.benefits.map((benefit: string, i: number) => (
                                                <Input
                                                    key={i}
                                                    value={benefit}
                                                    onChange={(e) => {
                                                        const newBenefits = [...details.benefits];
                                                        newBenefits[i] = e.target.value;
                                                        updateField(['ingredientDetails', key, 'benefits'], newBenefits);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Obsažené látky (tagy)</Label>
                                            {details.ingredients.map((ing: string, i: number) => (
                                                <Input
                                                    key={i}
                                                    value={ing}
                                                    onChange={(e) => {
                                                        const newIngs = [...details.ingredients];
                                                        newIngs[i] = e.target.value;
                                                        updateField(['ingredientDetails', key, 'ingredients'], newIngs);
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CONCEPT SECTION */}
                <TabsContent value="concept">
                    <Card>
                        <CardHeader>
                            <CardTitle>Koncept 3B</CardTitle>
                            <CardDescription>Tři hlavní pilíře BoostUp.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Nadpis</Label>
                                    <Input
                                        value={localContent.concept3b.headline}
                                        onChange={(e) => updateField(['concept3b', 'headline'], e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Tlačítko (CTA)</Label>
                                    <Input
                                        value={localContent.concept3b.cta}
                                        onChange={(e) => updateField(['concept3b', 'cta'], e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Popis sekce</Label>
                                <Textarea
                                    rows={2}
                                    value={localContent.concept3b.description}
                                    onChange={(e) => updateField(['concept3b', 'description'], e.target.value)}
                                />
                            </div>

                            <div className="space-y-6 pt-6 border-t">
                                {localContent.concept3b.concepts.map((concept, i) => (
                                    <div key={concept.id} className="p-4 rounded-lg bg-secondary/30 space-y-4">
                                        <div className="font-bold text-lg mb-4">{concept.title}</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <StyledTextField
                                                label="Název (Např. BRAIN)"
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
                                                label="Podnadpis"
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
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <StyledTextField
                                                label="Statistiky (Puk v rohu)"
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
                                                label="Krátký popis (Karta)"
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
                                        <div className="space-y-4">
                                            <StyledTextField
                                                label="Hlavní text v Popup okně (Detail)"
                                                value={concept.fullDescription}
                                                onChange={(v) => {
                                                    const newConcepts = [...localContent.concept3b.concepts];
                                                    newConcepts[i] = { ...newConcepts[i], fullDescription: v };
                                                    updateField(['concept3b', 'concepts'], newConcepts);
                                                }}
                                                style={ts(`concept3b.${concept.id}.fullDescription`)}
                                                onStyleChange={(s) => updateStyle(`concept3b.${concept.id}.fullDescription`, s)}
                                                multiline
                                                rows={8}
                                            />
                                            <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                                                <div className="text-[11px] text-muted-foreground space-y-1">
                                                    <p>• Pro <strong>odrážku</strong> začněte řádek znakem <code>•</code> (Alt + 0149)</p>
                                                    <p>• Pro <strong>tučné písmo</strong> použijte <code>**text**</code></p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 text-[11px] font-bold gap-2"
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
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CTA SECTION */}
                <TabsContent value="cta">
                    <Card>
                        <CardHeader>
                            <CardTitle>Newsletter / Odběr</CardTitle>
                            <CardDescription>Sekce pro přihlášení k testerům a launchi.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <BadgeToggle badgeKey="cta.badge" label="Zobrazit badge" />
                            <StyledTextField
                                label="Badge text"
                                value={localContent.cta.badge}
                                onChange={(v) => updateField(['cta', 'badge'], v)}
                                style={ts('cta.badge')}
                                onStyleChange={(s) => updateStyle('cta.badge', s)}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <StyledTextField
                                    label="Nadpis Část 1"
                                    value={localContent.cta.headline.part1}
                                    onChange={(v) => updateField(['cta', 'headline', 'part1'], v)}
                                    style={ts('cta.headline.part1')}
                                    onStyleChange={(s) => updateStyle('cta.headline.part1', s)}
                                />
                                <StyledTextField
                                    label="Zvýrazněný text"
                                    value={localContent.cta.headline.highlight}
                                    onChange={(v) => updateField(['cta', 'headline', 'highlight'], v)}
                                    style={ts('cta.headline.highlight')}
                                    onStyleChange={(s) => updateStyle('cta.headline.highlight', s)}
                                />
                            </div>
                            <StyledTextField
                                label="Popis"
                                value={localContent.cta.description}
                                onChange={(v) => updateField(['cta', 'description'], v)}
                                style={ts('cta.description')}
                                onStyleChange={(s) => updateStyle('cta.description', s)}
                                multiline
                                rows={2}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* CONTACT SECTION */}
                <TabsContent value="contact">
                    <Card>
                        <CardHeader>
                            <CardTitle>Kontaktní Informace</CardTitle>
                            <CardDescription>Email, telefon a adresa společnosti.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <BadgeToggle badgeKey="contact.title" label="Zobrazit badge (KONTAKT)" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <StyledTextField
                                    label="Email"
                                    value={localContent.contact.info.email.value}
                                    onChange={(v) => updateField(['contact', 'info', 'email', 'value'], v)}
                                    style={ts('contact.info.email')}
                                    onStyleChange={(s) => updateStyle('contact.info.email', s)}
                                />
                                <StyledTextField
                                    label="Telefon"
                                    value={localContent.contact.info.phone.value}
                                    onChange={(v) => updateField(['contact', 'info', 'phone', 'value'], v)}
                                    style={ts('contact.info.phone')}
                                    onStyleChange={(s) => updateStyle('contact.info.phone', s)}
                                />
                            </div>
                            <StyledTextField
                                label="Adresa Řádek 1"
                                value={localContent.contact.info.address.value.line1}
                                onChange={(v) => updateField(['contact', 'info', 'address', 'value', 'line1'], v)}
                                style={ts('contact.address.line1')}
                                onStyleChange={(s) => updateStyle('contact.address.line1', s)}
                            />
                            <StyledTextField
                                label="Adresa Řádek 2"
                                value={localContent.contact.info.address.value.line2}
                                onChange={(v) => updateField(['contact', 'info', 'address', 'value', 'line2'], v)}
                                style={ts('contact.address.line2')}
                                onStyleChange={(s) => updateStyle('contact.address.line2', s)}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FLAVORS SECTION */}
                <TabsContent value="flavors">
                    <Card>
                        <CardHeader>
                            <CardTitle>Správa Příchutí & Štítků</CardTitle>
                            <CardDescription>Upravte názvy, popisy a štítky pro jednotlivé varianty BoostUp.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-12">
                            {Object.entries(localContent.flavors || {}).map(([key, flavor]: [string, any]) => (
                                <div key={key} className="space-y-6 p-6 rounded-xl bg-secondary/20 border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-3 h-3 rounded-full ${key === 'lemon' ? 'bg-lime' :
                                            key === 'red' ? 'bg-terracotta' :
                                                'bg-olive'
                                            }`} />
                                        <h3 className="text-xl font-bold uppercase">{flavor.name}</h3>
                                    </div>

                                    <div className="grid gap-4">
                                        <div className="grid gap-2">
                                            <Label>Název příchutě</Label>
                                            <Input
                                                value={flavor.name}
                                                onChange={(e) => updateField(['flavors', key, 'name'], e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Krátký popis</Label>
                                            <Textarea
                                                rows={2}
                                                value={flavor.description}
                                                onChange={(e) => updateField(['flavors', key, 'description'], e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-muted-foreground uppercase text-[10px] font-black tracking-widest">Štítky (Tagy)</Label>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-[10px] font-bold"
                                                onClick={() => {
                                                    const newLabels = [...(flavor.labels || []), "Nový štítek"];
                                                    updateField(['flavors', key, 'labels'], newLabels);
                                                }}
                                            >
                                                + PŘIDAT ŠTÍTEK
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                            {(flavor.labels || []).map((label: string, i: number) => (
                                                <div key={i} className="flex gap-2">
                                                    <Input
                                                        value={label}
                                                        onChange={(e) => {
                                                            const newLabels = [...flavor.labels];
                                                            newLabels[i] = e.target.value;
                                                            updateField(['flavors', key, 'labels'], newLabels);
                                                        }}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => {
                                                            const newLabels = flavor.labels.filter((_: any, index: number) => index !== i);
                                                            updateField(['flavors', key, 'labels'], newLabels);
                                                        }}
                                                    >
                                                        <RotateCcw className="h-4 w-4 rotate-45" /> {/* Use RotateCcw as an "X" for simplicity or cross icon if available */}
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* FOOTER SECTION */}
                <TabsContent value="footer">
                    <Card>
                        <CardHeader>
                            <CardTitle>Patička Webové Stránky</CardTitle>
                            <CardDescription>Upravte copyright a kontaktní údaje v patičce.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <StyledTextField
                                label="Brand popis"
                                value={localContent.footer.brand.description}
                                onChange={(v) => updateField(['footer', 'brand', 'description'], v)}
                                style={ts('footer.brand.description')}
                                onStyleChange={(s) => updateStyle('footer.brand.description', s)}
                                multiline
                                rows={2}
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
            </Tabs>

            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800 flex gap-3 items-start">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                    <strong>Pozor:</strong> Nezapomeňte změny uložit tlačítkem v horní části stránky.
                    Bez uložení se změny po obnovení stránky ztratí.
                </p>
            </div>

            <div className="p-4 bg-secondary/50 rounded-lg border border-border text-sm text-balance leading-relaxed text-muted-foreground flex gap-3 items-start">
                <Info className="h-4 w-4 mt-0.5 shrink-0" />
                <p>
                    Změny se po uložení projeví okamžitě na celém webu. Pokud dojde k chybě načítání z databáze,
                    web automaticky použije původní texty ze souboru <code>site-content.ts</code>.
                </p>
            </div>
        </div >
    );
};

export default ContentManagement;
