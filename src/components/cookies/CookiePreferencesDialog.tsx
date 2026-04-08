import React from 'react';
import { ShieldCheck, BarChart, Settings2, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface CookiePreferencesDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    draftPreferences: {
        analytics: boolean;
        marketing: boolean;
        preferences: boolean;
    };
    setDraftPreferences: (prefs: any) => void;
    handleSaveDraft: () => void;
    handleAcceptAll: () => void;
    handleRejectAll: () => void;
}

export const CookiePreferencesDialog: React.FC<CookiePreferencesDialogProps> = ({
    isOpen,
    onOpenChange,
    draftPreferences,
    setDraftPreferences,
    handleSaveDraft,
    handleAcceptAll,
    handleRejectAll
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl bg-background border-border/50 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle className="font-display font-black text-2xl tracking-wider uppercase flex items-center gap-2">
                        <Settings2 className="w-6 h-6 text-primary" />
                        Nastavení cookies
                    </DialogTitle>
                    <DialogDescription className="text-base mt-2">
                        Zde si můžete podrobněji vybrat, ke kterým typům údajů nám dáte přístup. Vaše volba se aplikuje na celý web a platí pro toto zařízení.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Necessary */}
                    <div className="flex flex-col gap-2 p-4 rounded-xl border border-primary/20 bg-primary/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                <h4 className="font-bold text-lg text-foreground">Nezbytné cookies</h4>
                            </div>
                            <div className="text-sm font-bold text-primary uppercase tracking-widest px-3 py-1 bg-primary/20 rounded-full">
                                Vždy aktivní
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Tyto cookies jsou zásadní pro správné fungování webu. Umožňují vám vkládat produkty do košíku, bezpečně se přihlašovat a dokončovat nákupy. Bez nich e-shop nemůže fungovat a nelze je vypnout.
                        </p>
                    </div>

                    {/* Analytics */}
                    <div className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 transition-colors hover:border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <BarChart className="w-5 h-5 text-foreground" />
                                <h4 className="font-bold text-lg text-foreground">Analytické cookies</h4>
                            </div>
                            <Switch
                                checked={draftPreferences.analytics}
                                onCheckedChange={(c) => setDraftPreferences({ ...draftPreferences, analytics: c })}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Pomáhají nám porozumět, jak návštěvníci používají náš web. Zjišťujeme pomocí nich například počet návštěvníků a zdroje návštěvnosti, díky čemuž můžeme stránky lépe vylepšit a uzpůsobit. Veškerá data jsou shromažďována anonymně.
                        </p>
                    </div>

                    {/* Marketing */}
                    <div className="flex flex-col gap-2 p-4 rounded-xl border border-border/50 transition-colors hover:border-border">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-foreground" />
                                <h4 className="font-bold text-lg text-foreground">Marketingové cookies</h4>
                            </div>
                            <Switch
                                checked={draftPreferences.marketing}
                                onCheckedChange={(c) => setDraftPreferences({ ...draftPreferences, marketing: c })}
                                className="data-[state=checked]:bg-primary"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Tyto cookies používáme my a naši reklamní partneři (např. Meta, Seznam Sklik) k tomu, abychom vám na internetu zobrazovali relevantní reklamu, která vás skutečně zajímá, a případně měřili úspěšnost našich reklamních kampaní.
                        </p>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-3 mt-4">
                    <Button
                        variant="ghost"
                        onClick={handleRejectAll}
                        className="w-full sm:w-auto font-bold"
                    >
                        Zamítnout vše
                    </Button>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto ml-auto">
                        <Button
                            variant="outline"
                            onClick={handleSaveDraft}
                            className="w-full sm:w-auto font-bold border-primary text-primary hover:bg-primary/10"
                        >
                            Uložit výběr
                        </Button>
                        <Button
                            onClick={handleAcceptAll}
                            className="w-full sm:w-auto font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            Přijmout vše
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
