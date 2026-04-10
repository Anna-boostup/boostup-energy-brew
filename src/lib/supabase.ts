
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("FATAL: Supabase credentials missing during initialization! Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
}

/**
 * Safe Supabase Proxy Stub
 * 
 * Instead of returning null when environment variables are missing (which causes 
 * 'TypeError: cannot read property X of null'), we return a Proxy that logs 
 * warnings but doesn't crash the application.
 */
const createSafeStub = (path = 'supabase'): any => {
    const stub: any = new Proxy(() => {}, {
        get: (_target, prop) => {
            if (prop === 'then') return undefined; // Avoid proxying Promises incorrectly
            return createSafeStub(`${path}.${String(prop)}`);
        },
        apply: (_target, _thisArg, _args) => {
            console.warn(`SupabaseStub: Attempted to call [${path}()]. Client is uninitialized.`);
            
            // Mock common return patterns to satisfy most callers
            if (path.includes('auth.onAuthStateChange')) {
                return { data: { subscription: { unsubscribe: () => {} } } };
            }
            if (path.includes('auth.getSession') || path.includes('auth.getUser')) {
                return Promise.resolve({ data: { session: null, user: null }, error: null });
            }
            if (path.includes('.channel')) {
                return { on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }), subscribe: () => ({ unsubscribe: () => {} }) };
            }
            
            // Default no-op async response for .from().select() etc.
            return Promise.resolve({ data: null, error: null });
        }
    });
    return stub;
};

export const supabase = (supabaseUrl && supabaseAnonKey) 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createSafeStub();
