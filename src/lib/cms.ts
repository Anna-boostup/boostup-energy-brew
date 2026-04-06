import { supabase } from './supabase';
import { SITE_CONTENT } from '@/config/site-content';
import { SITE_CONTENT_EN } from '@/config/site-content-en';

type SiteContent = typeof SITE_CONTENT;

export const updateSiteContent = async (newContent: SiteContent, targetId: 'main' | 'en' = 'main') => {
    const { data, error } = await supabase
        .from('site_content')
        .upsert({
            id: targetId,
            content: newContent,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error(`Error updating site content (${targetId}):`, error);
        throw error;
    }

    return data;
};

/**
 * Reset content to default from code
 */
export const resetToDefaultContent = async (targetId: 'main' | 'en' = 'main') => {
    const defaultContent = targetId === 'en' ? { ...SITE_CONTENT, ...SITE_CONTENT_EN } : SITE_CONTENT;
    return updateSiteContent(defaultContent as SiteContent, targetId);
};
