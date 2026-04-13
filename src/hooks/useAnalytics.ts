import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

/**
 * useAnalytics Hook
 * Automatically tracks page views and manages user sessions for native admin insights.
 */
export const useAnalytics = () => {
    const location = useLocation();

    useEffect(() => {
        // 1. Get or create session ID
        let sessionId = localStorage.getItem("boostup_session_id");
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem("boostup_session_id", sessionId);
        }

        // 2. Prevent logging on localhost or when supabase is broken
        const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        if (isLocal) return;

        // 3. Log the "view" event
        const logPageView = async () => {
            try {
                // We use a small delay to ensure page titles or other async data is ready if needed
                const { error } = await supabase
                    .from("analytics_events")
                    .insert({
                        event_type: "view",
                        page_path: location.pathname,
                        session_id: sessionId,
                        metadata: {
                            userAgent: navigator.userAgent,
                            referrer: document.referrer,
                            timestamp: new Date().toISOString()
                        }
                    });

                if (error) {
                    // Fail silently in production, we don't want to alert users about analytics issues
                    console.warn("Analytics error:", error.message);
                }
            } catch (err) {
                console.error("Critical analytics failure:", err);
            }
        };

        logPageView();
    }, [location.pathname]);
};
