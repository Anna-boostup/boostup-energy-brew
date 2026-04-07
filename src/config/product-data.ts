
export type FlavorType = "lemon" | "red" | "silky";

export interface FlavorConfig {
    id: FlavorType;
    name: string;
    color: string;
    bgColor: string;
    borderColor: string;
    textColor: string;
    description: string;
    ingredients: string;
    labels: string[];
}

export const FLAVORS: FlavorConfig[] = [
    {
        id: "lemon",
        name: "LEMON BLAST",
        color: "from-lime to-lime-dark",
        bgColor: "bg-lime",
        borderColor: "border-lime",
        textColor: "text-foreground",
        description: "Citrusová svěžest a energie pro jasnou a soustředěnou mysl",
        ingredients: "Voda, citronová šťáva (15%), kofein (150mg/shot), L-theanin, vitamín B6, B12, stévie, přírodní aroma.",
        labels: ["Bez cukru", "Vegan", "Energie"]
    },
    {
        id: "red",
        name: "RED RUSH",
        color: "from-terracotta to-terracotta-dark",
        bgColor: "bg-terracotta",
        borderColor: "border-terracotta",
        textColor: "text-cream",
        description: "Červené ovoce a guarana pro tvůj rychlý a efektivní start",
        ingredients: "Voda, šťáva z červeného ovoce, guarana extrakt, kofein (120mg/shot), vitamín C, stévie.",
        labels: ["Vitamíny", "Rychlý nástup", "Výkon"]
    },
    {
        id: "silky",
        name: "SILKY LEAF",
        color: "from-olive to-olive-dark",
        bgColor: "bg-olive",
        borderColor: "border-olive",
        textColor: "text-cream",
        description: "Jemný zelený čaj a meduňka pro dlouhotrvající a klidnou energii",
        ingredients: "Voda, extrakt ze zeleného čaje, meduňka, L-theanin, přírodní sladidla.",
        labels: ["Antioxidanty", "Klidná síla", "Soustředění"]
    }
];

export const PACK_SIZES = [3, 12, 21] as const;
