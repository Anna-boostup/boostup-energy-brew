import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export const SUBSCRIPTION_DISCOUNT_KEY = 'subscription_discount_pct';
export const DEFAULT_SUBSCRIPTION_DISCOUNT = 15;

/** Načte procentuální slevu předplatného z app_settings (fallback 15 %). */
export const useSubscriptionDiscount = () => {
    const [pct, setPct] = useState<number>(DEFAULT_SUBSCRIPTION_DISCOUNT);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                if (!supabase) return;
                const { data } = await supabase.from('app_settings').select('value').eq('key', SUBSCRIPTION_DISCOUNT_KEY).maybeSingle();
                if (!active) return;
                const raw = data?.value;
                if (raw !== undefined && raw !== null) {
                    let parsed = NaN;
                    try { parsed = Number(JSON.parse(raw as string)); } catch { parsed = Number(raw); }
                    if (!isNaN(parsed) && parsed >= 0 && parsed <= 90) setPct(parsed);
                }
            } catch { /* fallback na default */ }
            finally { if (active) setLoading(false); }
        })();
        return () => { active = false; };
    }, []);

    return { pct, loading };
};
