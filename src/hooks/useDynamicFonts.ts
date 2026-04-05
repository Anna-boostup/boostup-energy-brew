import { useEffect } from 'react';
import { useContent } from '@/context/ContentContext';

// List of popular Google Fonts available in the picker
export const AVAILABLE_FONTS = [
    { name: 'Poppins', weights: [300, 400, 500, 600, 700, 800, 900] },
    { name: 'Inter', weights: [300, 400, 500, 600, 700, 800, 900] },
    { name: 'Outfit', weights: [300, 400, 500, 600, 700, 800, 900] },
    { name: 'Raleway', weights: [300, 400, 500, 600, 700, 800, 900] },
    { name: 'Montserrat', weights: [300, 400, 500, 600, 700, 800, 900] },
    { name: 'Oswald', weights: [300, 400, 500, 600, 700] },
    { name: 'Bebas Neue', weights: [400] },
    { name: 'Playfair Display', weights: [400, 500, 600, 700, 800, 900] },
    { name: 'Lora', weights: [400, 500, 600, 700] },
    { name: 'DM Sans', weights: [300, 400, 500, 600, 700] },
    { name: 'Nunito', weights: [300, 400, 500, 600, 700, 800, 900] },
    { name: 'Source Sans 3', weights: [300, 400, 500, 600, 700, 900] },
    { name: 'Roboto', weights: [300, 400, 500, 700, 900] },
];

export const FONT_WEIGHTS = [
    { label: '100 – Thin', value: '100' },
    { label: '200 – Extra Light', value: '200' },
    { label: '300 – Light', value: '300' },
    { label: '400 – Regular', value: '400' },
    { label: '500 – Medium', value: '500' },
    { label: '600 – Semi Bold', value: '600' },
    { label: '700 – Bold', value: '700' },
    { label: '800 – Extra Bold', value: '800' },
    { label: '900 – Black', value: '900' },
];

/**
 * Builds a Google Fonts URL for the given font families.
 */
function buildGoogleFontsUrl(fonts: string[]): string {
    const unique = [...new Set(fonts)];
    const families = unique
        .map((name) => {
            const spec = AVAILABLE_FONTS.find((f) => f.name === name);
            if (!spec) return `family=${encodeURIComponent(name)}`;
            const weightsParam = spec.weights.join(';');
            return `family=${encodeURIComponent(name)}:ital,wght@0,${weightsParam.split(';').join(';0,')};1,${weightsParam}`;
        })
        .join('&');
    return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/**
 * Hook that reads typography settings from ContentContext and:
 * 1. Loads the Google Fonts stylesheet dynamically
 * 2. Applies CSS custom properties to :root
 */
export function useDynamicFonts() {
    const { content } = useContent();
    const typo = (content as any).typography || {};

    const headingFont = typo.headingFont || 'Poppins';
    const bodyFont = typo.bodyFont || 'Poppins';
    const headingWeight = typo.headingWeight || '800';
    const bodyWeight = typo.bodyWeight || '400';
    const headingLetterSpacing = typo.headingLetterSpacing || '0.05em';
    const bodyLetterSpacing = typo.bodyLetterSpacing || '0em';
    const headingLineHeight = typo.headingLineHeight || '1.1';
    const bodyLineHeight = typo.bodyLineHeight || '1.6';
    const baseFontSize = typo.baseFontSize || '16';

    // Load Google Fonts
    useEffect(() => {
        const fontsToLoad = [headingFont, bodyFont].filter(Boolean);
        if (!fontsToLoad.length) return;

        const id = 'dynamic-google-fonts';
        let link = document.getElementById(id) as HTMLLinkElement | null;
        if (!link) {
            link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            document.head.appendChild(link);
        }
        link.href = buildGoogleFontsUrl(fontsToLoad);
    }, [headingFont, bodyFont]);

    // Apply CSS custom properties to :root
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--font-heading', `"${headingFont}", system-ui, sans-serif`);
        root.style.setProperty('--font-body', `"${bodyFont}", system-ui, sans-serif`);
        root.style.setProperty('--font-weight-heading', headingWeight);
        root.style.setProperty('--font-weight-body', bodyWeight);
        root.style.setProperty('--letter-spacing-heading', headingLetterSpacing);
        root.style.setProperty('--letter-spacing-body', bodyLetterSpacing);
        root.style.setProperty('--line-height-heading', headingLineHeight);
        root.style.setProperty('--line-height-body', bodyLineHeight);
        root.style.setProperty('--font-size-base', `${baseFontSize}px`);
    }, [
        headingFont, bodyFont, headingWeight, bodyWeight,
        headingLetterSpacing, bodyLetterSpacing,
        headingLineHeight, bodyLineHeight, baseFontSize,
    ]);
}
