/**
 * Konfigurace doručovacích zemí, měn a PÁSMOVÉ dopravy.
 *
 * Zdroj pravdy pro ceny produktů je CZK. Pro zahraničí se cena produktu přepočítá
 * kurzem `rate` (CZK→měna) a zaokrouhlí na `rounding`.
 *
 * Doprava je PÁSMOVÁ podle počtu lahví v košíku (balení × ks), protože Zásilkovna
 * účtuje dle hmotnosti (u výdejního místa i na adresu). Ceny pásem a práh dopravy
 * zdarma se zadávají PŘÍMO v měně dané země.
 *
 * Konfigurace se ukládá do Supabase (app_settings, klíč `shipping_countries`) jako JSON
 * a je editovatelná v adminu. Tento objekt je výchozí seed / fallback.
 */

export type DeliveryMethodId = 'personal' | 'zasilkovna' | 'courier';

/** Jedno cenové pásmo dopravy. */
export interface ShippingTier {
    /** Horní hranice počtu lahví (včetně) pro toto pásmo. null = „a více" (poslední pásmo). */
    maxBottles: number | null;
    /** Cena dopravy v měně země. */
    price: number;
}

export interface ShippingCountry {
    code: string;
    packetaCode: string;
    stripeCountry: string;
    name: string;
    nameEn: string;
    enabled: boolean;
    currency: string;
    currencySymbol: string;
    stripeCurrency: string;
    rate: number;
    rounding: number;
    freeShippingThreshold: number | null;
    /** Pásma dopravy per metoda. Prázdné/neuvedené pole = metoda pro tuto zemi není dostupná. */
    methods: Partial<Record<DeliveryMethodId, ShippingTier[]>>;
}

export const DEFAULT_SHIPPING_COUNTRIES: ShippingCountry[] = [
    {
        code: 'CZ', packetaCode: 'cz', stripeCountry: 'CZ',
        name: 'Česká republika', nameEn: 'Czech Republic',
        enabled: true,
        currency: 'CZK', currencySymbol: 'Kč', stripeCurrency: 'czk',
        rate: 1, rounding: 1,
        freeShippingThreshold: 1500,
        methods: {
            personal: [{ maxBottles: null, price: 0 }],
            zasilkovna: [{ maxBottles: 12, price: 79 }, { maxBottles: 36, price: 109 }, { maxBottles: null, price: 139 }],
            courier: [{ maxBottles: 6, price: 99 }, { maxBottles: 24, price: 139 }, { maxBottles: null, price: 189 }],
        },
    },
    {
        code: 'SK', packetaCode: 'sk', stripeCountry: 'SK',
        name: 'Slovensko', nameEn: 'Slovakia',
        enabled: true,
        currency: 'EUR', currencySymbol: '€', stripeCurrency: 'eur',
        rate: 0.040, rounding: 0.10,
        freeShippingThreshold: 60,
        methods: {
            zasilkovna: [{ maxBottles: 12, price: 3.90 }, { maxBottles: 36, price: 5.90 }, { maxBottles: null, price: 7.90 }],
            courier: [{ maxBottles: 6, price: 4.90 }, { maxBottles: 24, price: 6.90 }, { maxBottles: null, price: 8.90 }],
        },
    },
    {
        code: 'PL', packetaCode: 'pl', stripeCountry: 'PL',
        name: 'Polsko', nameEn: 'Poland', enabled: false,
        currency: 'PLN', currencySymbol: 'zł', stripeCurrency: 'pln',
        rate: 0.17, rounding: 1, freeShippingThreshold: 250,
        methods: {
            zasilkovna: [{ maxBottles: 12, price: 19 }, { maxBottles: 36, price: 25 }, { maxBottles: null, price: 32 }],
            courier: [{ maxBottles: 6, price: 25 }, { maxBottles: 24, price: 32 }, { maxBottles: null, price: 42 }],
        },
    },
    {
        code: 'HU', packetaCode: 'hu', stripeCountry: 'HU',
        name: 'Maďarsko', nameEn: 'Hungary', enabled: false,
        currency: 'HUF', currencySymbol: 'Ft', stripeCurrency: 'huf',
        rate: 16, rounding: 10, freeShippingThreshold: 24000,
        methods: {
            zasilkovna: [{ maxBottles: 12, price: 1500 }, { maxBottles: 36, price: 2200 }, { maxBottles: null, price: 2900 }],
            courier: [{ maxBottles: 6, price: 1900 }, { maxBottles: 24, price: 2600 }, { maxBottles: null, price: 3500 }],
        },
    },
    {
        code: 'RO', packetaCode: 'ro', stripeCountry: 'RO',
        name: 'Rumunsko', nameEn: 'Romania', enabled: false,
        currency: 'RON', currencySymbol: 'lei', stripeCurrency: 'ron',
        rate: 0.20, rounding: 1, freeShippingThreshold: 300,
        methods: {
            zasilkovna: [{ maxBottles: 12, price: 22 }, { maxBottles: 36, price: 30 }, { maxBottles: null, price: 40 }],
            courier: [{ maxBottles: 6, price: 28 }, { maxBottles: 24, price: 38 }, { maxBottles: null, price: 50 }],
        },
    },
    {
        code: 'AT', packetaCode: 'at', stripeCountry: 'AT',
        name: 'Rakousko', nameEn: 'Austria', enabled: false,
        currency: 'EUR', currencySymbol: '€', stripeCurrency: 'eur',
        rate: 0.040, rounding: 0.10, freeShippingThreshold: 60,
        methods: {
            zasilkovna: [{ maxBottles: 12, price: 4.90 }, { maxBottles: 36, price: 6.90 }, { maxBottles: null, price: 8.90 }],
            courier: [{ maxBottles: 6, price: 6.90 }, { maxBottles: 24, price: 8.90 }, { maxBottles: null, price: 11.90 }],
        },
    },
    {
        code: 'DE', packetaCode: 'de', stripeCountry: 'DE',
        name: 'Německo', nameEn: 'Germany', enabled: false,
        currency: 'EUR', currencySymbol: '€', stripeCurrency: 'eur',
        rate: 0.040, rounding: 0.10, freeShippingThreshold: 60,
        methods: {
            zasilkovna: [{ maxBottles: 12, price: 4.90 }, { maxBottles: 36, price: 6.90 }, { maxBottles: null, price: 8.90 }],
            courier: [{ maxBottles: 6, price: 6.90 }, { maxBottles: 24, price: 8.90 }, { maxBottles: null, price: 11.90 }],
        },
    },
];

/** Přepočet ceny z CZK do měny země + zaokrouhlení. */
export const convertPrice = (czkAmount: number, country: ShippingCountry): number => {
    const step = country.rounding > 0 ? country.rounding : 1;
    const rounded = Math.round((czkAmount * country.rate) / step) * step;
    return Math.round(rounded * 100) / 100;
};

/** Formát ceny s měnou země. */
export const formatMoney = (amount: number, country: ShippingCountry): string => {
    const decimals = country.rounding < 1 ? 2 : 0;
    const value = amount.toFixed(decimals).replace('.', ',');
    return `${value} ${country.currencySymbol}`;
};

/** Počet lahví v košíku = balení (pack) × počet kusů. */
export const bottlesInCart = (items: Array<{ pack?: number; quantity?: number }>): number =>
    items.reduce((n, it) => n + (it.pack || 1) * (it.quantity || 1), 0);

/** Cena z pásem podle počtu lahví. */
export const tierPrice = (tiers: ShippingTier[] | undefined, bottles: number): number => {
    if (!tiers || tiers.length === 0) return 0;
    const sorted = [...tiers].sort((a, b) => (a.maxBottles ?? Infinity) - (b.maxBottles ?? Infinity));
    for (const t of sorted) {
        if (t.maxBottles === null || bottles <= t.maxBottles) return t.price;
    }
    return sorted[sorted.length - 1].price;
};

/** Je metoda v dané zemi dostupná (má aspoň jedno pásmo)? */
export const isMethodAvailable = (country: ShippingCountry, method: DeliveryMethodId): boolean => {
    const t = country.methods[method];
    return Array.isArray(t) && t.length > 0;
};

/**
 * Cena dopravy v měně země.
 * @param totalBottles počet lahví v košíku
 * @param cartTotalInCurrency mezisoučet košíku přepočtený do měny země
 * @param freeByRule doprava zdarma z jiného pravidla (např. balení 21 ks)
 */
export const getShippingCost = (
    country: ShippingCountry,
    method: DeliveryMethodId,
    totalBottles: number,
    cartTotalInCurrency: number,
    freeByRule = false,
): number => {
    const tiers = country.methods[method];
    if (!tiers || tiers.length === 0) return 0;
    const base = tierPrice(tiers, totalBottles);
    if (base === 0) return 0;
    const freeByThreshold = country.freeShippingThreshold !== null && cartTotalInCurrency >= country.freeShippingThreshold;
    if (freeByRule || freeByThreshold) return 0;
    return base;
};

export const findCountry = (countries: ShippingCountry[], code: string): ShippingCountry | undefined =>
    countries.find(c => c.code === code);
