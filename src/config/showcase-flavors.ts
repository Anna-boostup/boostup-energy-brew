export type ShowcaseFlavorId = "apple-ginger" | "apple-cinnamon" | "blackcurrant" | "raspberry";

export interface ShowcaseFlavor {
  id: ShowcaseFlavorId;
  name: string;
  base: string;
  text: string;
  accent: string;
  ctaBg: string;
  ctaText: string;
  crop: { x: "0%" | "-100%"; y: "0%" | "-100%" };
}

export const SHOWCASE_FLAVORS: Record<ShowcaseFlavorId, ShowcaseFlavor> = {
  "apple-ginger": {
    id: "apple-ginger", name: "Jablko & zázvor", base: "#183817", text: "#E5E95C", accent: "#F4F6A8", ctaBg: "#E5E95C", ctaText: "#183817", crop: { x: "0%", y: "0%" },
  },
  "apple-cinnamon": {
    id: "apple-cinnamon", name: "Jablko & skořice", base: "#632008", text: "#FFE4A0", accent: "#FFB84E", ctaBg: "#FFE4A0", ctaText: "#632008", crop: { x: "-100%", y: "0%" },
  },
  blackcurrant: {
    id: "blackcurrant", name: "Černý rybíz", base: "#32133A", text: "#F0B6FF", accent: "#E47AF3", ctaBg: "#F0B6FF", ctaText: "#32133A", crop: { x: "0%", y: "-100%" },
  },
  raspberry: {
    id: "raspberry", name: "Malina", base: "#67102A", text: "#FFD3DC", accent: "#FF5D80", ctaBg: "#FFD3DC", ctaText: "#67102A", crop: { x: "-100%", y: "-100%" },
  },
};

export const SHOWCASE_FLAVOR_ORDER: ShowcaseFlavorId[] = ["apple-ginger", "apple-cinnamon", "blackcurrant", "raspberry"];
