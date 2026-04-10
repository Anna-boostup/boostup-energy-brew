import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * A "Universal Chainable Thenable" Proxy.
 * 
 * 1. Returns itself for any property access (.from, .select, .auth, etc.)
 * 2. Returns itself for any function call (.eq(), .in(), etc.)
 * 3. Acts as a Promise (has .then) that resolves to safe empty data.
 * 
 * This prevents TypeErrors in deep chains like `supabase.from().select().in().then()`
 * and ensures that `await` calls always resolve instead of hanging.
 */
const createUniversalStub = (path = 'supabase'): any => {
    // The stub must be a function so it can be called (e.g., .from('table'))
    const stub: any = (...args: any[]) => {
        // Specific return for subscription listeners
        if (path.endsWith('onAuthStateChange')) {
            return { data: { subscription: { unsubscribe: () => {} } }, error: null };
        }
        return createUniversalStub(`${path}()`);
    };

    return new Proxy(stub, {
        get: (target, prop) => {
            // Handle Promise resolution (await / .then)
            if (prop === 'then') {
                return (onFulfilled: any) => {
                    const mockResult = { 
                        data: [], 
                        error: null, 
                        session: null, 
                        user: null, 
                        profile: null,
                        count: 0
                    };
                    return Promise.resolve(onFulfilled ? onFulfilled(mockResult) : mockResult);
                };
            }

            // Standard property access
            if (typeof prop === 'string') {
                // Avoid proxying internal JS symbols or common non-query props
                if (prop === 'toJSON' || prop === 'constructor') return undefined;
                return createUniversalStub(`${path}.${prop}`);
            }
            
            return undefined;
        }
    });
};

// Use the real Supabase client if URL and Key are present; otherwise, use the Universal Stub.
export const supabase = (supabaseUrl && supabaseAnonKey) 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : createUniversalStub();
