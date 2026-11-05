import { test, expect } from './fixtures';

/**
 * Mobilní vykreslení textů
 *
 * Projde veřejné stránky na mobilních šířkách a nahlásí:
 *
 * Rozměry (texty se nevejdou):
 *  - pretece-stranka / mimo-viewport — text utíká vodorovně mimo displej,
 *  - oriznuty-text-x — vodorovně oříznutý text bez výpustky „…“,
 *  - oriznuty-text-y — svisle oříznutý text (např. nadpis v boxu s pevnou výškou).
 *
 * Písmo (texty vypadají špatně — typicky česká diakritika):
 *  - pismo-bez-ceskych-znaku — webfont nemá glyf pro český znak, prohlížeč ho
 *    vykreslí náhradním (systémovým) písmem → znak vypadá jinak než okolní text,
 *  - tucny-rez-bez-ceskych-znaku — pro tučný text existuje jen netučný řez
 *    s českými znaky; prohlížeč tučnost jen napodobí nebo spadne na náhradní
 *    písmo → „ě“ v nadpisu vypadá netučně / jinak,
 *  - pismo-nenacteno — webfont použitý na stránce se vůbec nenačetl.
 *
 * Záměrné ořezy test neřeší: `text-overflow: ellipsis` a `line-clamp` se přeskakují,
 * stejně jako obsah uvnitř vodorovných karuselů (předek s overflow-x: auto/scroll).
 * Když je ořez záměrný a bez výpustky, označ prvek atributem `data-allow-text-clip`
 * a test ho (i s potomky) vynechá.
 */

const PATHS = [
    '/',
    '/blog',
    '/login',
    '/register',
    '/checkout',
    '/obchodni-podminky',
    '/doprava-a-platba',
    '/reklamace',
];

// 360 = běžný Android, 390 = iPhone 12–15; menší šířky už reálně skoro nikdo nemá
const WIDTHS = [360, 390];

type TextIssue = { type: string; selector: string; text: string; detail: string };

/** Běží v prohlížeči: najde texty, které se nevejdou, jsou oříznuté, nebo se kreslí špatným písmem. */
const auditTextRendering = (): TextIssue[] => {
    const issues: TextIssue[] = [];
    const vw = document.documentElement.clientWidth;
    const flagged = new Set<Element>();
    const DIACRITICS = /[ěščřžýáíéúůťďňóĚŠČŘŽÝÁÍÉÚŮŤĎŇÓ]/;

    const shortSelector = (el: Element): string => {
        const own = (e: Element) => {
            let s = e.tagName.toLowerCase();
            if (e.id) s += `#${e.id}`;
            const cls = (typeof e.className === 'string' ? e.className : '')
                .split(/\s+/).filter(Boolean).slice(0, 2).join('.');
            if (cls) s += `.${cls}`;
            const testId = e.getAttribute('data-testid');
            if (testId) s += `[data-testid=${testId}]`;
            return s;
        };
        return el.parentElement ? `${own(el.parentElement)} > ${own(el)}` : own(el);
    };

    const inHorizontalScroller = (el: Element): boolean => {
        for (let p = el.parentElement; p; p = p.parentElement) {
            const o = getComputedStyle(p).overflowX;
            if (o === 'auto' || o === 'scroll') return true;
        }
        return false;
    };

    // --- audit písma: načtené @font-face řezy podle rodiny ---

    const normFamily = (s: string) => s.replace(/['"]/g, '').trim().toLowerCase();
    const facesByFamily = new Map<string, FontFace[]>();
    document.fonts.forEach((f) => {
        const key = normFamily(f.family);
        if (!facesByFamily.has(key)) facesByFamily.set(key, []);
        facesByFamily.get(key)!.push(f);
    });

    /** Deklarovaný unicode-range řezu pokrývá daný znak? (Google Fonts deklaruje přesně po subsetech) */
    const rangeCovers = (face: FontFace, code: number): boolean =>
        face.unicodeRange.split(/\s*,\s*/).some((r) => {
            const m = r.trim().match(/^U\+([0-9A-Fa-f?]+)(?:-([0-9A-Fa-f]+))?$/i);
            if (!m) return false;
            if (m[1].includes('?')) {
                const lo = parseInt(m[1].replace(/\?/g, '0'), 16);
                const hi = parseInt(m[1].replace(/\?/g, 'F'), 16);
                return code >= lo && code <= hi;
            }
            const lo = parseInt(m[1], 16);
            const hi = m[2] ? parseInt(m[2], 16) : lo;
            return code >= lo && code <= hi;
        });

    /**
     * Ověření přes canvas: vykreslí se znak daným písmem v dané váze, nebo spadne
     * na náhradní font? Canvas používá stejný výběr řezů jako stránka, takže měří
     * skutečný stav — i případ, kdy tučný řez znak nemá a netučný ano.
     */
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const glyphRenders = (familyCss: string, weight: number, ch: string): boolean => {
        if (!ctx) return true; // bez canvasu nic netvrdíme
        const w = (font: string) => { ctx.font = font; return ctx.measureText(ch).width; };
        const inFam1 = w(`${weight} 32px ${familyCss}, monospace`);
        const fall1 = w(`${weight} 32px monospace`);
        const inFam2 = w(`${weight} 32px ${familyCss}, serif`);
        const fall2 = w(`${weight} 32px serif`);
        // Znak měřený stejně jako v obou náhradních písmech = rodina ho v této váze nemá.
        return !(Math.abs(inFam1 - fall1) < 0.01 && Math.abs(inFam2 - fall2) < 0.01);
    };

    const fontIssueKeys = new Set<string>(); // ať stejný problém nehlásíme pro každý odstavec zvlášť

    // --- celostránkové přetečení ---

    if (document.documentElement.scrollWidth > vw + 1) {
        issues.push({
            type: 'pretece-stranka',
            selector: 'html',
            text: '',
            detail: `scrollWidth ${document.documentElement.scrollWidth}px > viewport ${vw}px`,
        });
    }

    for (const el of Array.from(document.querySelectorAll('body *'))) {
        if (issues.length >= 20) break; // víc než dost na jeden report
        if (el.closest('[data-allow-text-clip]')) continue;

        // zajímají nás jen prvky s vlastním textem (ne pouhé obaly)
        const ownText = Array.from(el.childNodes)
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => n.textContent ?? '')
            .join(' ')
            .trim();
        if (ownText.length < 2) continue;

        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;

        const rect = el.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) continue;

        const text = ownText.replace(/\s+/g, ' ').slice(0, 60);
        const lineClamp = (cs as CSSStyleDeclaration & { webkitLineClamp?: string }).webkitLineClamp;
        const hasEllipsis = cs.textOverflow === 'ellipsis' || (lineClamp !== undefined && lineClamp !== 'none');

        // --- 1) rozměry ---

        // text částečně vyčnívá z displeje (celé off-canvas prvky, např. zavřené menu, neřešíme)
        const partlyOffRight = rect.right > vw + 1 && rect.left < vw;
        const partlyOffLeft = rect.left < -1 && rect.right > 0;
        if ((partlyOffRight || partlyOffLeft) && !inHorizontalScroller(el)) {
            if (!(el.parentElement && flagged.has(el.parentElement))) {
                flagged.add(el);
                issues.push({
                    type: 'mimo-viewport',
                    selector: shortSelector(el),
                    text,
                    detail: `left ${Math.round(rect.left)}px, right ${Math.round(rect.right)}px, viewport ${vw}px`,
                });
            }
        } else {
            const clipsX = cs.overflowX === 'hidden' || cs.overflowX === 'clip';
            const clipsY = cs.overflowY === 'hidden' || cs.overflowY === 'clip';
            if (clipsX && !hasEllipsis && el.scrollWidth > el.clientWidth + 2) {
                issues.push({
                    type: 'oriznuty-text-x',
                    selector: shortSelector(el),
                    text,
                    detail: `obsah ${el.scrollWidth}px se nevejde do ${el.clientWidth}px`,
                });
            } else if (clipsY && !hasEllipsis && el.scrollHeight > el.clientHeight + 4) {
                issues.push({
                    type: 'oriznuty-text-y',
                    selector: shortSelector(el),
                    text,
                    detail: `obsah ${el.scrollHeight}px se nevejde do ${el.clientHeight}px`,
                });
            }
        }

        // --- 2) písmo a česká diakritika ---

        const diaMatch = ownText.match(DIACRITICS);
        if (!diaMatch) continue;

        const famRaw = (cs.fontFamily.split(',')[0] ?? '').replace(/['"]/g, '').trim();
        const family = normFamily(famRaw);
        const faces = facesByFamily.get(family);
        if (!faces || faces.length === 0) continue; // systémové písmo — glyfy řeší OS

        const wantedWeight = parseInt(cs.fontWeight, 10) || 400;
        const ch = diaMatch[0];
        const code = ch.codePointAt(0)!;
        const issueKey = `${family}|${wantedWeight}|${ch}`;
        if (fontIssueKeys.has(issueKey)) continue;

        const loaded = faces.filter((f) => f.status === 'loaded');
        if (loaded.length === 0) {
            fontIssueKeys.add(issueKey);
            issues.push({
                type: 'pismo-nenacteno',
                selector: shortSelector(el),
                text,
                detail: `písmo "${family}" má ${faces.length} řezů, ale žádný se nenačetl (status: ${faces.map((f) => f.status).join(', ')})`,
            });
            continue;
        }

        const quoted = `"${famRaw}"`;
        if (!glyphRenders(quoted, wantedWeight, ch)) {
            fontIssueKeys.add(issueKey);
            const coveredBy = loaded
                .filter((f) => rangeCovers(f, code))
                .map((f) => f.weight)
                .join(', ');
            if (wantedWeight >= 600 && glyphRenders(quoted, 400, ch)) {
                issues.push({
                    type: 'tucny-rez-bez-ceskych-znaku',
                    selector: shortSelector(el),
                    text,
                    detail: `znak „${ch}“ (U+${code.toString(16).toUpperCase()}) má písmo "${family}" jen v netučném řezu — ve váze ${wantedWeight} se kreslí náhradním písmem`,
                });
            } else {
                issues.push({
                    type: 'pismo-bez-ceskych-znaku',
                    selector: shortSelector(el),
                    text,
                    detail: `písmo "${family}" ve váze ${wantedWeight} znak „${ch}“ (U+${code.toString(16).toUpperCase()}) neobsahuje — kreslí se náhradním písmem (řezy deklarující znak: ${coveredBy || 'žádný'})`,
                });
            }
        }
    }

    return issues;
};

test.describe('Mobilní vykreslení textů', () => {
    for (const path of PATHS) {
        test(`Texty na ${path} se vejdou na displej a kreslí se správným písmem`, async ({ page }) => {
            const found: string[] = [];

            for (const width of WIDTHS) {
                await page.setViewportSize({ width, height: 844 });
                await page.goto(path);
                await page.waitForLoadState('networkidle');

                // projet stránku po obrazovkách, ať se donačte lazy obsah a animace doběhnou
                await page.evaluate(async () => {
                    const step = window.innerHeight;
                    for (let y = 0; y <= document.body.scrollHeight; y += step) {
                        window.scrollTo(0, y);
                        await new Promise((r) => setTimeout(r, 100));
                    }
                    window.scrollTo(0, 0);
                });
                await page.evaluate(() => document.fonts.ready);

                const issues = await page.evaluate(auditTextRendering);
                for (const i of issues) {
                    found.push(`[${width}px] ${i.type}: ${i.selector} — „${i.text}“ (${i.detail})`);
                }
            }

            expect
                .soft(found, `Problémy s textem na ${path}:\n${found.join('\n')}`)
                .toEqual([]);
        });
    }
});
