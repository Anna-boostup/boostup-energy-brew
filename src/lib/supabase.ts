import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Enhanced Universal Chainable Thenable Proxy.
 * 
 * 1. Returns itself for any property/method access.
 * 2. Provides context-aware mock data based on the method path.
 * 3. Prevents "Cannot read property 'x' of undefined" during destructuring.
 */
const createUniversalStub = (path = 'supabase'): any => {
    const stub: any = (..._args: any[]) => {
        // Specific return for sync subscription listeners
        if (path.endsWith('onAuthStateChange')) {
            return { data: { subscription: { unsubscribe: () => {} } }, error: null };
        }
        return createUniversalStub(`${path}()`);
    };

    return new Proxy(stub, {
        get: (_target, prop) => {
            // Handle Promise resolution (await / .then)
            if (prop === 'then') {
                return (onFulfilled: any) => {
                    let mockResult: any = { data: [], error: null, count: 0 };
                    
                    const p = path.toLowerCase();
                    if (p.includes('getsession') || p.includes('getuser') || p.includes('auth.')) {
                        // Auth Context expects nested data.session or data.user
                        mockResult = { data: { session: null, user: null }, error: null };
                    } else if (p.includes('.single')) {
                        // single() expects data to be an object or null, not an array
                        mockResult = { data: null, error: null };
                    } else if (p.includes('signout')) {
                        mockResult = { error: null };
                    }

                    return Promise.resolve(onFulfilled ? onFulfilled(mockResult) : mockResult);
                };
            }

            if (typeof prop === 'string') {
                if (prop === 'toJSON' || prop === 'constructor') return undefined;
                return createUniversalStub(`${path}.${prop}`);
            }
            
            return undefined;
        }
    });
};

// Guard against poisoned variables or missing config
const isConfigValid = !!(supabaseUrl && 
                      supabaseAnonKey && 
                      supabaseUrl.startsWith('http') && 
                      !supabaseUrl.endsWith('"'));

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

if (!isConfigValid) {
    console.warn("--- SUPABASE CONFIGURATION WARNING ---");
    console.warn("VITE_SUPABASE_URL:", supabaseUrl ? "Present (Starts with http: " + supabaseUrl.startsWith('http') + ")" : "MISSING");
    console.warn("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey ? "Present" : "MISSING");
    console.warn("Fallback to createUniversalStub() is active.");
    
    // In production or preview environments, we want to know definitively if config is broken
    if (!isLocal) {
        console.error("CRITICAL: Supabase configuration is invalid in a non-local environment!");
    }
}

export const supabase = isConfigValid 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : createUniversalStub();
