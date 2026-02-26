import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/context/CookieContext";
import { X, Cookie, ShieldCheck, BarChart3, Settings2, Info } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export function CookieBanner() {
    const { hasResponded, acceptAll, rejectAll, savePreferences, consent } = useCookieConsent();
    const [showBanner, setShowBanner] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    // Draft state for the details modal
    const [draftPreferences, setDraftPreferences] = useState({
        analytics: false,
        marketing: false,
        preferences: false,
    });

    useEffect(() => {
        // Delay showing the banner slightly for a better UX, only if they haven't responded
        const timer = setTimeout(() => {
            if (!hasResponded) {
                setShowBanner(true);
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [hasResponded]);

    // Sync draft state when modal opens
    useEffect(() => {
        if (showDetails) {
            setDraftPreferences({
                analytics: consent?.analytics || false,
                marketing: consent?.marketing || false,
                preferences: consent?.preferences || false,
            });
        }
    }, [showDetails, consent]);

    if (!showBanner || hasResponded) return null;

    const handleAcceptAll = () => {
        acceptAll();
        setShowBanner(false);
    };

    const handleRejectAll = () => {
        rejectAll();
        setShowBanner(false);
    };

    const handleSaveDraft = () => {
        savePreferences({
            necessary: true,
            analytics: draftPreferences.analytics,
            marketing: draftPreferences.marketing,
            preferences: draftPreferences.preferences,
        });
        setShowDetails(false);
        setShowBanner(false);
    };

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 sm:px-12 pb-12 sm:pb-8 flex justify-center pointer-events-none">
                <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6 md:p-8 max-w-4xl w-full pointer-events-auto flex flex-col md:flex-row gap-6 md:items-center animate-in slide-in-from-bottom-10 fade-in duration-500">
                    <div className="flex-1 space-y-3 relative">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/20 p-2 rounded-full">
                                <Cookie className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-display font-black text-xl md:text-2xl uppercase tracking-wider text-foreground">
                                Ochrana soukromí a cookies
                            </h3>
                        </div>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                            Na našem webu používáme soubory cookies a podobné technologie.
                            Některé z nich jsou nezbytné pro správné fungování košíku a e-shopu.
                            Jiné nám pomáhají web vylepšovat (analytické cookies) nebo Vám zobrazovat
                            relevantnější nabídky (marketingové cookies). Souhlasíte s jejich použitím?
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 min-w-[280px]">
                        <Button
                            variant="default"
                            className="w-full font-bold h-11 border-b-4 border-primary/40 active:border-b-0 hover:translate-y-[-2px] active:translate-y-[2px] transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={handleAcceptAll}
                        >
                            Přijmout vše
                        </Button>
                        <div className="flex gap-3 w-full">
                            <Button
                                variant="outline"
                                className="w-full flex-1 font-bold h-11 text-foreground"
                                onClick={() => setShowDetails(true)}
                            >
                                <Settings2 className="w-4 h-4 mr-2" />
                                Nastavení
                            </Button>
                            <Button
                                variant="ghost"
                                className="w-full flex-1 font-bold h-11 text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                                onClick={handleRejectAll}
                            >
                                Pouze nezbytné
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detail Preferences Modal */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
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
                                    <BarChart3 className="w-5 h-5 text-foreground" />
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
        </>
    );
}
