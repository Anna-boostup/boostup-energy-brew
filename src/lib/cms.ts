import { supabase } from './supabase';
import { SITE_CONTENT } from '@/config/site-content';

type SiteContent = typeof SITE_CONTENT;

export const updateSiteContent = async (newContent: SiteContent) => {
    const { data, error } = await supabase
        .from('site_content')
        .upsert({
            id: 'main',
            content: newContent,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error updating site content:', error);
        throw error;
    }

    return data;
};

/**
 * Reset content to default from code
 */
export const resetToDefaultContent = async () => {
    return updateSiteContent(SITE_CONTENT);
};
