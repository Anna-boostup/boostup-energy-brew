import { FLAVORS, type FlavorType } from "./product-data";

/**
 * Barevné světy příchutí pro hero ("Flavor Orbit").
 * Pouze brandové barvy z grafického manuálu; jeden aktivní svět najednou.
 *
 * Ověřené kontrasty (WCAG):
 *  - #E0E561 na #3F532E a naopak = 6.25:1 (AA)
 *  - #FFFFFF na #BB2E4A = 5.83:1 (AA, běžný text)
 *  - #E0E561 na #BB2E4A = 4.32:1 (jen velké nadpisy, nikdy malý text)
 *  - #3F532E na #CAD44E = 5.24:1 (AA)
 */
export interface FlavorTheme {
  id: FlavorType;
  /** Název z produktových dat (zachovává stávající názvy produktů) */
  name: string;
  /** Hlavní plocha hero */
  base: string;
  /** Hlavní barva textu na ploše */
  text: string;
  /** Barva zvýrazněné části nadpisu (velký text) */
  headlineAccent: string;
  /** Podtržení / linky pod zvýrazněním */
  underline: string;
  /** Dekorativní plochy a tvary */
  decorative: string;
  /** Jemný akcent: CTA a aktivní stav přepínače */
  ctaBg: string;
  ctaText: string;
  /** Identita příchutě: tečka u názvu v přepínači */
  dot: string;
  /** Obrázky renderu lahve (public/hero) */
  image: { lg: string; sm: string };
}

const nameOf = (id: FlavorType) => FLAVORS.find((f) => f.id === id)?.name ?? id.toUpperCase();

export const FLAVOR_THEMES: Record<FlavorType, FlavorTheme> = {
  silky: {
    id: "silky",
    name: nameOf("silky"),
    base: "#3F532E",
    text: "#E0E561",
    headlineAccent: "#E0E561",
    underline: "#E0E561",
    decorative: "#33522F",
    ctaBg: "#E0E561",
    ctaText: "#3F532E",
    dot: "#3F532E",
    image: { lg: "/hero/silky-lg.webp", sm: "/hero/silky-sm.webp" },
  },
  lemon: {
    id: "lemon",
    name: nameOf("lemon"),
    base: "#E0E561",
    text: "#3F532E",
    headlineAccent: "#3F532E",
    underline: "#C56232",
    decorative: "#CAD44E",
    ctaBg: "#3F532E",
    ctaText: "#E0E561",
    dot: "#E0E561",
    image: { lg: "/hero/lemon-lg.webp", sm: "/hero/lemon-sm.webp" },
  },
  red: {
    id: "red",
    name: nameOf("red"),
    base: "#BB2E4A",
    text: "#FFFFFF",
    headlineAccent: "#E0E561",
    underline: "#E0E561",
    decorative: "#C56232",
    ctaBg: "#E0E561",
    ctaText: "#3F532E",
    dot: "#BB2E4A",
    image: { lg: "/hero/red-lg.webp", sm: "/hero/red-sm.webp" },
  },
};

/** Pořadí v přepínači */
export const FLAVOR_ORDER: FlavorType[] = ["silky", "lemon", "red"];

export const HERO_IMAGE_SIZES = "(max-width: 1023px) 250px, 380px";
