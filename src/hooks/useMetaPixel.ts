import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCookieConsent } from "@/context/CookieContext";

declare global {
  interface Window {
    fbq: any;
  }
}

const PIXEL_ID = "957694656773231";

/**
 * useMetaPixel Hook
 * Manages Meta Pixel initialization and PageView tracking based on marketing cookie consent.
 */
export const useMetaPixel = () => {
  const location = useLocation();
  const { consent } = useCookieConsent();

  useEffect(() => {
    // Only proceed if marketing consent is explicitly granted
    if (!consent?.marketing) return;

    // Safety check for fbq function existence (loaded from index.html)
    if (typeof window.fbq !== 'function') {
        console.warn('Meta Pixel (fbq) not found on window object.');
        return;
    }

    try {
        // Initialize if not already done (Facebook SDK handles multiple inits usually, but better safe)
        // We use a flag to prevent multiple inits in the same session, although fbq usually handles it
        const isInitialized = (window as any)._fbq_initialized;
        
        if (!isInitialized) {
            window.fbq('init', PIXEL_ID);
            (window as any)._fbq_initialized = true;
            console.log('[Meta Pixel] Initialized with ID:', PIXEL_ID);
        }

        // Track PageView on every route change
        window.fbq('track', 'PageView');
        console.log('[Meta Pixel] PageView tracked:', location.pathname);

    } catch (error) {
        console.error('[Meta Pixel] Tracking failed:', error);
    }
  }, [location.pathname, consent?.marketing]);
};
