/**
 * Konfigurace oznamovacího baneru (údržba, upozornění, akce).
 *
 * Banner se zobrazuje nahoře na veřejných stránkách. Text je dvojjazyčný (CZ/EN),
 * má volitelný odkaz a lze ho zavřít křížkem – zavření se pamatuje v prohlížeči
 * (localStorage) a je vázané na obsah baneru, takže NOVÉ oznámení se zobrazí znovu
 * i uživateli, který předchozí banner zavřel.
 *
 * Konfigurace se ukládá do Supabase (app_settings, klíč `announcement_banner`) jako
 * JSON a je editovatelná v adminu. Tento objekt je výchozí seed / fallback.
 */

export type BannerType = 'info' | 'maintenance' | 'warning' | 'promo';

export interface BannerConfig {
    /** Zapnout/vypnout zobrazení baneru na webu. */
    enabled: boolean;
    /** Typ určuje barvu a výchozí ikonu. */
    type: BannerType;
    /** Text oznámení – česky. */
    textCs: string;
    /** Text oznámení – anglicky. */
    textEn: string;
    /** Volitelný odkaz (URL). Prázdné = bez odkazu. */
    linkUrl: string;
    /** Popisek odkazu – česky. */
    linkLabelCs: string;
    /** Popisek odkazu – anglicky. */
    linkLabelEn: string;
    /** Povolit zavření křížkem. */
    dismissible: boolean;
}

export const DEFAULT_BANNER: BannerConfig = {
    enabled: false,
    type: 'info',
    textCs: '',
    textEn: '',
    linkUrl: '',
    linkLabelCs: '',
    linkLabelEn: '',
    dismissible: true,
};

/** Vizuální styl (Tailwind třídy) pro každý typ baneru. */
export interface BannerStyle {
    /** Pozadí + text + border. */
    container: string;
    /** Třída pro odkaz (podtržení / barva). */
    link: string;
    /** Popisek typu pro admin náhled. */
    labelCs: string;
    labelEn: string;
}

export const BANNER_STYLES: Record<BannerType, BannerStyle> = {
    info: {
        container: 'bg-blue-600 text-white border-blue-700',
        link: 'underline underline-offset-2 hover:text-blue-100',
        labelCs: 'Informace', labelEn: 'Info',
    },
    maintenance: {
        container: 'bg-slate-800 text-white border-slate-900',
        link: 'underline underline-offset-2 hover:text-slate-200',
        labelCs: 'Údržba', labelEn: 'Maintenance',
    },
    warning: {
        container: 'bg-amber-500 text-black border-amber-600',
        link: 'underline underline-offset-2 hover:text-amber-900',
        labelCs: 'Upozornění', labelEn: 'Warning',
    },
    promo: {
        container: 'bg-emerald-600 text-white border-emerald-700',
        link: 'underline underline-offset-2 hover:text-emerald-100',
        labelCs: 'Akce', labelEn: 'Promo',
    },
};

/** Vrátí text baneru podle jazyka (fallback na druhý jazyk, když je jeden prázdný). */
export const bannerText = (cfg: BannerConfig, lang: 'cs' | 'en'): string => {
    if (lang === 'en') return cfg.textEn || cfg.textCs;
    return cfg.textCs || cfg.textEn;
};

/** Vrátí popisek odkazu podle jazyka (fallback na URL, když popisek chybí). */
export const bannerLinkLabel = (cfg: BannerConfig, lang: 'cs' | 'en'): string => {
    if (lang === 'en') return cfg.linkLabelEn || cfg.linkLabelCs || cfg.linkUrl;
    return cfg.linkLabelCs || cfg.linkLabelEn || cfg.linkUrl;
};

/**
 * Stabilní „otisk" obsahu baneru pro localStorage klíč zavření.
 * Když se změní text / typ / odkaz, otisk se změní a banner se zobrazí znovu.
 */
export const bannerDismissKey = (cfg: BannerConfig): string => {
    const raw = [cfg.type, cfg.textCs, cfg.textEn, cfg.linkUrl].join('|');
    // jednoduchý hash (djb2) – ať klíč není zbytečně dlouhý
    let hash = 5381;
    for (let i = 0; i < raw.length; i++) {
        hash = ((hash << 5) + hash + raw.charCodeAt(i)) | 0;
    }
    return `boostup-banner-dismissed-${(hash >>> 0).toString(36)}`;
};
