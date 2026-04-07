import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SITE_CONTENT } from '@/config/site-content';
import { SITE_CONTENT_EN } from '@/config/site-content-en';
import { useLanguage } from '@/context/LanguageContext';

type SiteContent = typeof SITE_CONTENT;

interface ContentContextType {
    content: SiteContent;
    loading: boolean;
    refreshContent: () => Promise<void>;
    // Raw language versions for CMS editing
    contentCZ: SiteContent;
    contentEN: SiteContent;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

const mergeContent = (base: SiteContent, dbContent: Partial<SiteContent> | null): SiteContent => {
    if (!dbContent) return base;
    return {
        ...base,
        ...dbContent,
        hero: { ...base.hero, ...(dbContent.hero || {}) },
        mission: { ...base.mission, ...(dbContent.mission || {}) },
        social: base.social,
        cta: { ...base.cta, ...(dbContent.cta || {}) },
        contact: { ...base.contact, ...(dbContent.contact || {}) },
        footer: { ...base.footer, ...(dbContent.footer || {}) },
        flavors: (() => {
            const merged = { ...base.flavors };
            if (dbContent.flavors) {
                Object.keys(dbContent.flavors).forEach(key => {
                    if (merged[key]) {
                        merged[key] = { ...merged[key], ...dbContent.flavors![key] };
                    } else {
                        merged[key] = dbContent.flavors![key];
                    }
                });
            }
            return merged;
        })(),
        typography: { ...base.typography, ...(dbContent.typography || {}) },
        textStyles: { ...base.textStyles, ...(dbContent.textStyles || {}) },
        badgeVisible: { ...base.badgeVisible, ...(dbContent.badgeVisible || {}) },
        pricing: { ...base.pricing, ...(dbContent.pricing || {}) },
    };
};

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { language } = useLanguage();
    const [dbContentCZ, setDbContentCZ] = useState<Partial<SiteContent> | null>(null);
    const [dbContentEN, setDbContentEN] = useState<Partial<SiteContent> | null>(null);
    const [loading, setLoading] = useState(true);
    const [previewContent, setPreviewContent] = useState<Partial<SiteContent> | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('preview') === 'true') {
                const lang = urlParams.get('lang') || 'cs';
                try {
                    const item = localStorage.getItem(`boostup_preview_content_${lang}`);
                    if (item) {
                        setPreviewContent(JSON.parse(item));
                        console.log("Preview mode activated with local draft");
                    }
                } catch (e) {
                    console.error("Preview content parse error:", e);
                }
            }
        }
    }, []);

    const baseCZ = SITE_CONTENT;
    const baseEN = { ...SITE_CONTENT, ...SITE_CONTENT_EN } as SiteContent;

    const contentCZ = React.useMemo(() => mergeContent(baseCZ, dbContentCZ), [baseCZ, dbContentCZ]);
    const contentEN = React.useMemo(() => mergeContent(baseEN, dbContentEN), [baseEN, dbContentEN]);

    const activeContentBase = language === 'en' ? contentEN : contentCZ;
    const content = previewContent ? (previewContent as SiteContent) : activeContentBase;

    const fetchContent = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_content')
                .select('id, content')
                .in('id', ['main', 'en']);

            if (error) {
                console.error('Error fetching site content:', error);
                return;
            }

            if (data) {
                const czData = data.find(d => d.id === 'main')?.content;
                const enData = data.find(d => d.id === 'en')?.content;
                if (czData) setDbContentCZ(czData);
                if (enData) setDbContentEN(enData);
            }
        } catch (err) {
            console.error('Unexpected error fetching content:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, []);

    const value = {
        content,
        loading,
        refreshContent: fetchContent,
        contentCZ,
        contentEN
    };

    return (
        <ContentContext.Provider value={value}>
            {children}
        </ContentContext.Provider>
    );
};

export const useContent = () => {
    const context = useContext(ContentContext);
    if (context === undefined) {
        throw new Error('useContent must be used within a ContentProvider');
    }
    return context;
};
