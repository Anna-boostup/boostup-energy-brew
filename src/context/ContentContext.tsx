import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SITE_CONTENT } from '@/config/site-content';

type SiteContent = typeof SITE_CONTENT;

interface ContentContextType {
    content: SiteContent;
    loading: boolean;
    refreshContent: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<SiteContent>(SITE_CONTENT);
    const [loading, setLoading] = useState(true);

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
                const dbContent = data.content;

                // Deep merge helper (simple version for this specific structure)
                const mergedHero = {
                    ...SITE_CONTENT.hero,
                    ...(dbContent.hero || {})
                };

                const mergedMission = {
                    ...SITE_CONTENT.mission,
                    ...(dbContent.mission || {})
                };

                const mergedCTA = {
                    ...SITE_CONTENT.cta,
                    ...(dbContent.cta || {})
                };

                const mergedContact = {
                    ...SITE_CONTENT.contact,
                    ...(dbContent.contact || {})
                };

                const mergedFooter = {
                    ...SITE_CONTENT.footer,
                    ...(dbContent.footer || {})
                };

                const mergedFlavors = { ...SITE_CONTENT.flavors };
                if (dbContent.flavors) {
                    Object.keys(dbContent.flavors).forEach(key => {
                        if (mergedFlavors[key]) {
                            mergedFlavors[key] = {
                                ...mergedFlavors[key],
                                ...dbContent.flavors[key]
                            };
                        } else {
                            mergedFlavors[key] = dbContent.flavors[key];
                        }
                    });
                }

                const mergedTypography = {
                    ...SITE_CONTENT.typography,
                    ...(dbContent.typography || {})
                };

                const mergedTextStyles = {
                    ...SITE_CONTENT.textStyles,
                    ...(dbContent.textStyles || {})
                };

                const mergedBadgeVisible = {
                    ...SITE_CONTENT.badgeVisible,
                    ...(dbContent.badgeVisible || {})
                };

                setContent({
                    ...SITE_CONTENT,
                    ...dbContent,
                    hero: mergedHero,
                    mission: mergedMission,
                    cta: mergedCTA,
                    contact: mergedContact,
                    footer: mergedFooter,
                    flavors: mergedFlavors,
                    typography: mergedTypography,
                    textStyles: mergedTextStyles,
                    badgeVisible: mergedBadgeVisible,
                });
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
