import type { CSSProperties } from 'react';

export interface TextStyle {
    fontSize?: string;
    fontWeight?: string;
    fontStyle?: string;
    fontFamily?: string;
}

export const DEFAULT_TEXT_STYLE: TextStyle = {
    fontSize: '',
    fontWeight: '',
    fontStyle: 'normal',
    fontFamily: 'Poppins',
};

/**
 * Reads textStyles[path] from content and returns a React CSSProperties object.
 * Falls back to empty (browser defaults) if no style is set.
 */
export function getTextStyle(content: any, path: string): CSSProperties {
    const styles: TextStyle = content?.textStyles?.[path] ?? {};
    const css: CSSProperties = {};

    if (styles.fontFamily) css.fontFamily = `"${styles.fontFamily}", system-ui, sans-serif`;
    if (styles.fontSize) css.fontSize = `${styles.fontSize}px`;
    if (styles.fontWeight) css.fontWeight = styles.fontWeight as any;
    if (styles.fontStyle) css.fontStyle = styles.fontStyle as any;

    return css;
}

/**
 * Returns true if the badge at key is visible (defaults to true if not set).
 */
export function isBadgeVisible(content: any, key: string): boolean {
    const badgeVisible = content?.badgeVisible ?? {};
    return badgeVisible[key] !== false;
}
