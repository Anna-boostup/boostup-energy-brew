import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCookieConsent } from "@/context/CookieContext";
import { Cookie, Settings2 } from "lucide-react";
import { CookiePreferencesDialog } from "./cookies/CookiePreferencesDialog";

export function CookieBanner() {
    const { hasResponded, acceptAll, rejectAll, savePreferences, consent } = useCookieConsent();
    const [showBanner, setShowBanner] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        console.log('CookieContext: hasResponded status:', hasResponded);
    }, [hasResponded]);

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
        }, 300);
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
            <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6 sm:px-12 pb-12 sm:pb-8 flex justify-center pointer-events-none">
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

            <CookiePreferencesDialog
                isOpen={showDetails}
                onOpenChange={setShowDetails}
                draftPreferences={draftPreferences}
                setDraftPreferences={setDraftPreferences}
                handleSaveDraft={handleSaveDraft}
                handleAcceptAll={handleAcceptAll}
                handleRejectAll={handleRejectAll}
            />
        </>
    );
}
