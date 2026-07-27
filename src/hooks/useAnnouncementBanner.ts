import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { BannerConfig, DEFAULT_BANNER } from '@/config/banner';

const SETTINGS_KEY = 'announcement_banner';

const parseBanner = (raw: unknown): BannerConfig | null => {
    try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (value && typeof value === 'object' && typeof (value as BannerConfig).type === 'string') {
            // sloučení s výchozími hodnotami – ať nechybí nově přidaná pole
            return { ...DEFAULT_BANNER, ...(value as Partial<BannerConfig>) } as BannerConfig;
        }
    } catch {
        // ignore – fallback níže
    }
    return null;
};

/**
 * Načte konfiguraci oznamovacího baneru z app_settings (klíč `announcement_banner`).
 * Fallback na DEFAULT_BANNER (vypnutý), když v DB nic není nebo se nepodaří načíst.
 */
export const useAnnouncementBanner = () => {
    const [banner, setBanner] = useState<BannerConfig>(DEFAULT_BANNER);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchBanner = useCallback(async () => {
        setLoading(true);
        try {
            if (!supabase) return;
            const { data, error } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', SETTINGS_KEY)
                .maybeSingle();
            if (error) {
                console.error('[banner] fetch error:', error.message);
                return;
            }
            const parsed = parseBanner(data?.value);
            if (parsed) setBanner(parsed);
        } catch (err) {
            console.error('[banner] unexpected fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBanner();
    }, [fetchBanner]);

    /** Uloží kompletní konfiguraci (admin). */
    const saveBanner = useCallback(async (next: BannerConfig): Promise<boolean> => {
        setSaving(true);
        try {
            if (!supabase) return false;
            const { error } = await supabase
                .from('app_settings')
                .upsert({ key: SETTINGS_KEY, value: JSON.stringify(next) }, { onConflict: 'key' });
            if (error) {
                console.error('[banner] save error:', error.message);
                return false;
            }
            setBanner(next);
            return true;
        } catch (err) {
            console.error('[banner] unexpected save error:', err);
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    return { banner, loading, saving, refresh: fetchBanner, saveBanner };
};
