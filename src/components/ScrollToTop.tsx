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
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
