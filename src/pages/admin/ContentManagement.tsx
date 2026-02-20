import React, { useState } from 'react';
import { useContent } from '@/context/ContentContext';
import { updateSiteContent } from '@/lib/cms';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Save, RotateCcw } from 'lucide-react';

const ContentManagement = () => {
    const { content, refreshContent } = useContent();
    const [localContent, setLocalContent] = useState(content);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            await updateSiteContent(localContent);
            await refreshContent();
            toast.success('Obsah byl úspěšně uložen');
        } catch (error) {
            toast.error('Chyba při ukládání obsahu');
        } finally {
            setIsSaving(false);
        }
    };

    const updateHero = (field: string, value: string) => {
        setLocalContent({
            ...localContent,
            hero: {
                ...localContent.hero,
                [field]: value
            }
        });
    };

    const updateHeroHeadline = (field: string, value: string) => {
        setLocalContent({
            ...localContent,
            hero: {
                ...localContent.hero,
                headline: {
                    ...localContent.hero.headline,
                    [field]: value
                }
            }
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Správa obsahu</h2>
                    <p className="text-muted-foreground">Upravte texty na webu v reálném čase.</p>
                </div>
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Uložit změny
                </Button>
            </div>

            <div className="grid gap-6">
                {/* HERO SECTION */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hero Sekce (Úvod)</CardTitle>
                        <CardDescription>Hlavní texty na úvodní straně.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="hero-announcement">Announcement (Brzy na trhu)</Label>
                            <Input
                                id="hero-announcement"
                                value={localContent.hero.announcement}
                                onChange={(e) => updateHero('announcement', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="headline-1">Nadpis Část 1</Label>
                                <Input
                                    id="headline-1"
                                    value={localContent.hero.headline.part1}
                                    onChange={(e) => updateHeroHeadline('part1', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="headline-gradient">Nadpis Gradient (Zvýrazněný)</Label>
                                <Input
                                    id="headline-gradient"
                                    value={localContent.hero.headline.gradient}
                                    onChange={(e) => updateHeroHeadline('gradient', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="headline-2">Nadpis Část 2</Label>
                                <Input
                                    id="headline-2"
                                    value={localContent.hero.headline.part2}
                                    onChange={(e) => updateHeroHeadline('part2', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="hero-description">Popis (Description)</Label>
                            <Textarea
                                id="hero-description"
                                rows={3}
                                value={localContent.hero.description}
                                onChange={(e) => updateHero('description', e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* INFO ABOUT FALLBACK */}
                <div className="p-4 bg-secondary/50 rounded-lg border border-border text-sm text-balance leading-relaxed text-muted-foreground flex gap-3 items-start">
                    <RotateCcw className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>
                        Změny se po uložení projeví okamžitě na celém webu. Pokud dojde k chybě načítání z databáze,
                        web automaticky použije původní texty ze souboru <code>site-content.ts</code>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ContentManagement;
