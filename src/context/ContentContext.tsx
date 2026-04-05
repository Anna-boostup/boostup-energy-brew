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
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { language } = useLanguage();
    const [dbContent, setDbContent] = useState<Partial<SiteContent> | null>(null);
    const [loading, setLoading] = useState(true);

    // Derive displayed content from DB content + language overrides
    const content: SiteContent = React.useMemo(() => {
        const base = language === 'en'
            ? { ...SITE_CONTENT, ...SITE_CONTENT_EN }
            : SITE_CONTENT;

        if (!dbContent) return base;

        return {
            ...base,
            ...dbContent,
            hero: { ...base.hero, ...(dbContent.hero || {}) },
            mission: { ...base.mission, ...(dbContent.mission || {}) },
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
    }, [language, dbContent]);

    const fetchContent = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('site_content')
                .select('content')
                .eq('id', 'main')
                .single();

            if (error) {
                if (error.code !== 'PGRST116') { // PGRST116 is "no rows found"
                    console.error('Error fetching site content:', error);
                }
                return;
            }

            if (data?.content) {
                setDbContent(data.content);
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
        refreshContent: fetchContent
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
