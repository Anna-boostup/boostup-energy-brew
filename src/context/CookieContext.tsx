import React, { createContext, useContext, useEffect, useState } from 'react';

type ConsentSettings = {
    necessary: boolean; // Always true
    analytics: boolean;
    marketing: boolean;
    preferences: boolean; // Left for future use
};

interface CookieContextType {
    consent: ConsentSettings | null; // null means user hasn't made a choice yet
    hasResponded: boolean;
    acceptAll: () => void;
    rejectAll: () => void;
    savePreferences: (settings: ConsentSettings) => void;
}

const defaultConsent: ConsentSettings = {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
};

const CONSENT_KEY = 'boostup_cookie_consent';

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export const CookieProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [consent, setConsent] = useState<ConsentSettings | null>(null);
    const [hasResponded, setHasResponded] = useState(false);

    useEffect(() => {
        // Check if consent has already been given on mount
        const savedConsent = localStorage.getItem(CONSENT_KEY);
        if (savedConsent) {
            try {
                const parsed = JSON.parse(savedConsent);
                setConsent({
                    ...defaultConsent,
                    ...parsed,
                    necessary: true, // Force necessary true
                });
                setHasResponded(true);
            } catch (e) {
                console.error('Failed to parse cookie consent from local storage', e);
            }
        }
    }, []);

    const saveToStorage = (settings: ConsentSettings) => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(settings));
        setConsent(settings);
        setHasResponded(true);
    };

    const acceptAll = () => {
        saveToStorage({
            necessary: true,
            analytics: true,
            marketing: true,
            preferences: true,
        });
    };

    const rejectAll = () => {
        saveToStorage({
            necessary: true,
            analytics: false,
            marketing: false,
            preferences: false,
        });
    };

    const savePreferences = (settings: ConsentSettings) => {
        saveToStorage({ ...settings, necessary: true });
    };

    return (
        <CookieContext.Provider
            value={{
                consent,
                hasResponded,
                acceptAll,
                rejectAll,
                savePreferences,
            }}
        >
            {children}
        </CookieContext.Provider>
    );
};

export const useCookieConsent = () => {
    const context = useContext(CookieContext);
    if (context === undefined) {
        throw new Error('useCookieConsent must be used within a CookieProvider');
    }
    return context;
};
