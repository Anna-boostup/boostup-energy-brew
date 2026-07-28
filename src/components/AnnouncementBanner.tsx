import { useState, useEffect } from "react";
import { X, Info, Wrench, AlertTriangle, Tag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAnnouncementBanner } from "@/hooks/useAnnouncementBanner";
import { useLocation } from "react-router-dom";
import {
    BANNER_STYLES,
    BannerType,
    bannerText,
    bannerLinkLabel,
    bannerDismissKey,
    isBannerActive,
} from "@/config/banner";

const TYPE_ICON: Record<BannerType, React.ComponentType<{ className?: string }>> = {
    info: Info,
    maintenance: Wrench,
    warning: AlertTriangle,
    promo: Tag,
};

const isExternal = (url: string) => /^https?:\/\//i.test(url);

export function AnnouncementBanner() {
    const { language } = useLanguage();
    const { banner, loading } = useAnnouncementBanner();
    const location = useLocation();
    const [dismissed, setDismissed] = useState(false);
    const [now, setNow] = useState(() => new Date());

    const dismissKey = bannerDismissKey(banner);

    // Při zapnutém plánu tikáme čas, ať se banner sám objeví/zmizí bez reloadu.
    useEffect(() => {
        if (!banner.scheduleEnabled) return;
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
    }, [banner.scheduleEnabled]);

    // Zjisti, zda uživatel tenhle (konkrétní) banner už zavřel.
    useEffect(() => {
        if (!banner.dismissible) {
            setDismissed(false);
            return;
        }
        try {
            setDismissed(localStorage.getItem(dismissKey) === '1');
        } catch {
            setDismissed(false);
        }
    }, [dismissKey, banner.dismissible]);

    const text = bannerText(banner, language);
    // Jen na úvodní (hero) stránce – ne v adminu ani na dalších stránkách.
    const show = !loading && !dismissed && location.pathname === '/' && isBannerActive(banner, now) && !!text;

    if (!show) return null;

    const style = BANNER_STYLES[banner.type] || BANNER_STYLES.info;
    const Icon = TYPE_ICON[banner.type] || Info;
    const hasLink = !!banner.linkUrl;
    const linkLabel = bannerLinkLabel(banner, language);
    const external = isExternal(banner.linkUrl);

    const handleDismiss = () => {
        setDismissed(true);
        try {
            localStorage.setItem(dismissKey, '1');
        } catch {
            // localStorage nedostupné – jen skryjeme pro tuto session
        }
    };

    return (
        // Plovoucí (nemodální) dialogová karta nad hero sekcí – web zůstává ovladatelný.
        <div className="fixed top-[88px] left-1/2 -translate-x-1/2 z-[90] w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-top-2 duration-300">
            <div
                role="status"
                className={`rounded-2xl border shadow-2xl ${style.container}`}
            >
                <div className="px-5 py-4 flex items-start gap-3 text-sm leading-relaxed">
                    <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                        <span>{text}</span>
                        {hasLink && (
                            <a
                                href={banner.linkUrl}
                                {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                className={`ml-1 font-semibold ${style.link}`}
                            >
                                {linkLabel}
                            </a>
                        )}
                    </div>
                    {banner.dismissible && (
                        <button
                            type="button"
                            onClick={handleDismiss}
                            aria-label={language === 'en' ? 'Dismiss' : 'Zavřít'}
                            className="shrink-0 -mr-1.5 -mt-1.5 p-1.5 rounded-lg hover:bg-black/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
