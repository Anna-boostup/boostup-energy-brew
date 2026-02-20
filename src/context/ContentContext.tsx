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
                if (error.code !== 'PGRST116') { // PGRST116 is "no rows found", which is expected if first run
                    console.error('Error fetching site content:', error);
                }
            } else if (data?.content) {
                // Merge with local content to ensure any new keys in code are present
                // even if DB is slightly behind
                setContent({
                    ...SITE_CONTENT,
                    ...data.content
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

    return (
        <ContentContext.Provider value={{ content, loading, refreshContent: fetchContent }}>
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
