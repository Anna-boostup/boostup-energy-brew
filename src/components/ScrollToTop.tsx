import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Global Scroll To Top Component
 * 
 * In React Router SPA applications, navigation doesn't trigger a full page reload,
 * causing the scroll position to persist across routes. 
 * This component listens for URL changes and resets scroll coordinates.
 */
export default function ScrollToTop() {
    const { pathname, hash } = useLocation();

    useEffect(() => {
        // Reset scroll to top on every route change, 
        // unless we have a hash anchor to reaching.
        if (!hash) {
            window.scrollTo(0, 0);
        } else {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [pathname, hash]);

    return null;
}
