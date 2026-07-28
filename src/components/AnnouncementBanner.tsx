import { useState, useEffect } from "react";
import { X, Info, Wrench, AlertTriangle, Tag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAnnouncementBanner } from "@/hooks/useAnnouncementBanner";
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
    const show = !loading && !dismissed && isBannerActive(banner, now) && !!text;

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
        <div
            role="status"
            className={`fixed top-[72px] left-0 right-0 z-[90] border-b shadow-md ${style.container}`}
        >
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3 text-sm">
                <Icon className="w-4 h-4 shrink-0" />
                <div className="flex-1 min-w-0 text-center sm:text-left">
                    <span>{text}</span>
                    {hasLink && (
                        <a
                            href={banner.linkUrl}
                            {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                            className={`ml-2 font-semibold ${style.link}`}
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
                        className="shrink-0 p-1 rounded hover:bg-black/10 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
