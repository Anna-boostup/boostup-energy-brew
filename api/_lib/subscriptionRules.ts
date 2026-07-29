// Čisté (bez závislostí) pravidlové funkce pro správu předplatného.
// Sdílené mezi API handlery (subscription-manage) a unit testy.
// Všechny funkce přijímají volitelné `now` kvůli deterministickému testování.

export const MIN_DAYS_BEFORE = 5;
export const VALID_SHIPPING_METHODS = ['personal', 'zasilkovna', 'courier'] as const;
export type ShippingMethod = typeof VALID_SHIPPING_METHODS[number];

export interface SubscriptionLike {
    status?: string | null;
    stripe_subscription_id?: string | null;
    next_delivery_date?: string | null;
    last_date_change_at?: string | null;
    last_shipping_change_at?: string | null;
    items?: any[] | null;
}

export interface GuardResult {
    ok: boolean;
    error?: string;
    status?: number;
}

const OK: GuardResult = { ok: true };

/** Počet celých dní od `now` do zadaného data. null pro prázdné / neplatné datum. */
export function daysUntil(dateStr: string | null | undefined, now: number = Date.now()): number | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return Math.floor((d.getTime() - now) / 86400000);
}

/** Spočítá počet lahví z položek (mixConfiguration nebo přípona balení v SKU). */
export function totalBottles(items: any[] | null | undefined): number {
    let n = 0;
    for (const it of (items || [])) {
        const qty = Number(it?.quantity) || 0;
        if (it?.mixConfiguration) {
            n += ((Number(it.mixConfiguration.lemon) || 0) + (Number(it.mixConfiguration.red) || 0) + (Number(it.mixConfiguration.silky) || 0)) * qty;
        } else if (it?.sku) {
            const parts = String(it.sku).split('-');
            const pack = parseInt(parts[parts.length - 1]) || 1;
            n += qty * pack;
        } else {
            n += qty;
        }
    }
    return n;
}

/** True, pokud zadané ISO datum spadá do stejného kalendářního měsíce jako `now`. */
export function isSameCalendarMonth(iso: string | null | undefined, now: number = Date.now()): boolean {
    if (!iso) return false;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return false;
    const n = new Date(now);
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
}

/** Alias pro čitelnost na straně handleru. */
export const changedThisMonth = isSameCalendarMonth;

/** Společná pravidla pro jakoukoli změnu/zrušení předplatného. */
export function checkModifiable(sub: SubscriptionLike, now: number = Date.now()): GuardResult {
    if (sub.status === 'cancelled') return { ok: false, error: 'Předplatné je již zrušené.', status: 400 };
    if (!sub.stripe_subscription_id) return { ok: false, error: 'Předplatné nemá napojení na platby.', status: 400 };
    const dleft = daysUntil(sub.next_delivery_date, now);
    if (dleft !== null && dleft < MIN_DAYS_BEFORE) {
        return { ok: false, error: `Změny lze provést nejpozději ${MIN_DAYS_BEFORE} dní před odesláním.`, status: 400 };
    }
    return OK;
}

/** Pravidla pro změnu data odeslání: 1×/kalendářní měsíc a nové datum ≥ 5 dní. */
export function checkDateChange(sub: SubscriptionLike, newDate: string | null | undefined, now: number = Date.now()): GuardResult {
    if (isSameCalendarMonth(sub.last_date_change_at, now)) {
        return { ok: false, error: 'Datum odeslání lze změnit jen jednou za kalendářní měsíc.', status: 400 };
    }
    const nd = daysUntil(newDate, now);
    if (nd === null || nd < MIN_DAYS_BEFORE) {
        return { ok: false, error: `Nové datum musí být alespoň ${MIN_DAYS_BEFORE} dní od dneška.`, status: 400 };
    }
    return OK;
}

/** Pravidla pro změnu dopravy: 1×/kalendářní měsíc a platná metoda. */
export function checkShippingChange(sub: SubscriptionLike, method: string | null | undefined, now: number = Date.now()): GuardResult {
    if (isSameCalendarMonth(sub.last_shipping_change_at, now)) {
        return { ok: false, error: 'Způsob dopravy lze změnit jen jednou za kalendářní měsíc.', status: 400 };
    }
    if (!method || !VALID_SHIPPING_METHODS.includes(method as ShippingMethod)) {
        return { ok: false, error: 'Neplatný způsob dopravy.', status: 400 };
    }
    return OK;
}
