import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
    ShippingCountry,
    DEFAULT_SHIPPING_COUNTRIES,
} from '@/config/shipping';

const SETTINGS_KEY = 'shipping_countries';

const parseCountries = (raw: unknown): ShippingCountry[] | null => {
    try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(value) && value.length > 0 && value.every(c => c && typeof c.code === 'string')) {
            return value as ShippingCountry[];
        }
    } catch {
        // ignore – fallback níže
    }
    return null;
};

/**
 * Načte konfiguraci doručovacích zemí z app_settings (klíč `shipping_countries`).
 * Fallback na DEFAULT_SHIPPING_COUNTRIES, když v DB nic není nebo se nepodaří načíst.
 */
export const useShippingCountries = () => {
    const [countries, setCountries] = useState<ShippingCountry[]>(DEFAULT_SHIPPING_COUNTRIES);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchCountries = useCallback(async () => {
        setLoading(true);
        try {
            if (!supabase) return;
            const { data, error } = await supabase
                .from('app_settings')
                .select('value')
                .eq('key', SETTINGS_KEY)
                .maybeSingle();
            if (error) {
                console.error('[shipping] fetch error:', error.message);
                return;
            }
            const parsed = parseCountries(data?.value);
            if (parsed) setCountries(parsed);
        } catch (err) {
            console.error('[shipping] unexpected fetch error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCountries();
    }, [fetchCountries]);

    /** Uloží kompletní konfiguraci (admin). */
    const saveCountries = useCallback(async (next: ShippingCountry[]): Promise<boolean> => {
        setSaving(true);
        try {
            if (!supabase) return false;
            const { error } = await supabase
                .from('app_settings')
                .upsert({ key: SETTINGS_KEY, value: JSON.stringify(next) }, { onConflict: 'key' });
            if (error) {
                console.error('[shipping] save error:', error.message);
                return false;
            }
            setCountries(next);
            return true;
        } catch (err) {
            console.error('[shipping] unexpected save error:', err);
            return false;
        } finally {
            setSaving(false);
        }
    }, []);

    const enabledCountries = countries.filter(c => c.enabled);

    return { countries, enabledCountries, loading, saving, refresh: fetchCountries, saveCountries };
};
