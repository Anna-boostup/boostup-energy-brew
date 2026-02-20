import React, { useState } from 'react';
import { useContent } from '@/context/ContentContext';
import { updateSiteContent, resetToDefaultContent } from '@/lib/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw, AlertTriangle, Info } from 'lucide-react';

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
                    <TabsTrigger value="concept">3B Koncept</TabsTrigger>
                    <TabsTrigger value="cta">CTA (Odběr)</TabsTrigger>
                    <TabsTrigger value="contact">Kontakt</TabsTrigger>
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
                            <div className="grid gap-2">
                                <Label htmlFor="hero-announcement">Badge (Brzy na trhu)</Label>
                                <Input
                                    id="hero-announcement"
                                    value={localContent.hero.announcement}
                                    onChange={(e) => updateField(['hero', 'announcement'], e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="grid gap-2">
                                    <Label>Nadpis Část 1</Label>
                                    <Input
                                        value={localContent.hero.headline.part1}
                                        onChange={(e) => updateField(['hero', 'headline', 'part1'], e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Nadpis Zvýrazněný</Label>
                                    <Input
                                        value={localContent.hero.headline.gradient}
                                        onChange={(e) => updateField(['hero', 'headline', 'gradient'], e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Nadpis Část 2</Label>
                                    <Input
                                        value={localContent.hero.headline.part2}
                                        onChange={(e) => updateField(['hero', 'headline', 'part2'], e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="hero-description">Hlavní popis</Label>
                                <Textarea
                                    id="hero-description"
                                    rows={3}
                                    value={localContent.hero.description}
                                    onChange={(e) => updateField(['hero', 'description'], e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
                                <div className="grid gap-2">
                                    <Label>Tlačítko Primární</Label>
                                    <Input
                                        value={localContent.hero.cta.primary}
                                        onChange={(e) => updateField(['hero', 'cta', 'primary'], e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Tlačítko Sekundární</Label>
                                    <Input
                                        value={localContent.hero.cta.secondary}
                                        onChange={(e) => updateField(['hero', 'cta', 'secondary'], e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Text Koncept 3B</Label>
                                    <Input
                                        value={localContent.hero.cta.concept3b}
                                        onChange={(e) => updateField(['hero', 'cta', 'concept3b'], e.target.value)}
                                    />
                                </div>
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
                            <div className="grid gap-2">
                                <Label>Badge (O nás)</Label>
                                <Input
                                    value={localContent.mission.badge}
                                    onChange={(e) => updateField(['mission', 'badge'], e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Nadpis Část 1</Label>
                                    <Input
                                        value={localContent.mission.headline.part1}
                                        onChange={(e) => updateField(['mission', 'headline', 'part1'], e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Nadpis Zvýrazněný</Label>
                                    <Input
                                        value={localContent.mission.headline.highlight}
                                        onChange={(e) => updateField(['mission', 'headline', 'highlight'], e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <Label>Odstavce mise</Label>
                                {localContent.mission.paragraphs.map((text, i) => (
                                    <Textarea
                                        key={i}
                                        rows={2}
                                        value={text}
                                        onChange={(e) => {
                                            const newParas = [...localContent.mission.paragraphs];
                                            newParas[i] = e.target.value;
                                            updateField(['mission', 'paragraphs'], newParas);
                                        }}
                                    />
                                ))}
                            </div>
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
                                        <div className="font-bold text-lg">{concept.title}</div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="grid gap-2">
                                                <Label>Podnadpis</Label>
                                                <Input
                                                    value={concept.subtitle}
                                                    onChange={(e) => {
                                                        const newConcepts = [...localContent.concept3b.concepts];
                                                        newConcepts[i] = { ...newConcepts[i], subtitle: e.target.value };
                                                        updateField(['concept3b', 'concepts'], newConcepts);
                                                    }}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label>Statistiky</Label>
                                                <Input
                                                    value={concept.stats}
                                                    onChange={(e) => {
                                                        const newConcepts = [...localContent.concept3b.concepts];
                                                        newConcepts[i] = { ...newConcepts[i], stats: e.target.value };
                                                        updateField(['concept3b', 'concepts'], newConcepts);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Krátký popis</Label>
                                            <Input
                                                value={concept.description}
                                                onChange={(e) => {
                                                    const newConcepts = [...localContent.concept3b.concepts];
                                                    newConcepts[i] = { ...newConcepts[i], description: e.target.value };
                                                    updateField(['concept3b', 'concepts'], newConcepts);
                                                }}
                                            />
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
                            <div className="grid gap-2">
                                <Label>Badge text</Label>
                                <Input
                                    value={localContent.cta.badge}
                                    onChange={(e) => updateField(['cta', 'badge'], e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Nadpis Část 1</Label>
                                    <Input
                                        value={localContent.cta.headline.part1}
                                        onChange={(e) => updateField(['cta', 'headline', 'part1'], e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Zvýrazněný text</Label>
                                    <Input
                                        value={localContent.cta.headline.highlight}
                                        onChange={(e) => updateField(['cta', 'headline', 'highlight'], e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Popis</Label>
                                <Textarea
                                    rows={2}
                                    value={localContent.cta.description}
                                    onChange={(e) => updateField(['cta', 'description'], e.target.value)}
                                />
                            </div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Email</Label>
                                    <Input
                                        value={localContent.contact.info.email.value}
                                        onChange={(e) => updateField(['contact', 'info', 'email', 'value'], e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Telefon</Label>
                                    <Input
                                        value={localContent.contact.info.phone.value}
                                        onChange={(e) => updateField(['contact', 'info', 'phone', 'value'], e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Adresa Řádek 1</Label>
                                <Input
                                    value={localContent.contact.info.address.value.line1}
                                    onChange={(e) => updateField(['contact', 'info', 'address', 'value', 'line1'], e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Adresa Řádek 2</Label>
                                <Input
                                    value={localContent.contact.info.address.value.line2}
                                    onChange={(e) => updateField(['contact', 'info', 'address', 'value', 'line2'], e.target.value)}
                                />
                            </div>
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
                            <div className="grid gap-2">
                                <Label>Brand popis</Label>
                                <Textarea
                                    rows={2}
                                    value={localContent.footer.brand.description}
                                    onChange={(e) => updateField(['footer', 'brand', 'description'], e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Copyright text</Label>
                                <Input
                                    value={localContent.footer.bottom.copyright}
                                    onChange={(e) => updateField(['footer', 'bottom', 'copyright'], e.target.value)}
                                />
                            </div>
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
        </div>
    );
};

export default ContentManagement;
