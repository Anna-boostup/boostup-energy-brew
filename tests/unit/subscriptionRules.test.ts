import { describe, it, expect } from 'vitest';
import {
    MIN_DAYS_BEFORE,
    daysUntil,
    totalBottles,
    isSameCalendarMonth,
    checkModifiable,
    checkDateChange,
    checkShippingChange,
    type SubscriptionLike,
} from '../../api/_lib/subscriptionRules';

// Pevný "teď" pro deterministické testy: 15. 7. 2026, 12:00 UTC
const NOW = new Date('2026-07-15T12:00:00.000Z').getTime();
const inDays = (n: number) => new Date(NOW + n * 86400000).toISOString();

const baseSub = (over: Partial<SubscriptionLike> = {}): SubscriptionLike => ({
    status: 'active',
    stripe_subscription_id: 'sub_123',
    next_delivery_date: inDays(20),
    last_date_change_at: null,
    last_shipping_change_at: null,
    items: [],
    ...over,
});

describe('daysUntil', () => {
    it('vrací null pro prázdné / neplatné datum', () => {
        expect(daysUntil(null, NOW)).toBeNull();
        expect(daysUntil(undefined, NOW)).toBeNull();
        expect(daysUntil('', NOW)).toBeNull();
        expect(daysUntil('nesmysl', NOW)).toBeNull();
    });
    it('počítá celé dny do budoucího data', () => {
        expect(daysUntil(inDays(10), NOW)).toBe(10);
        expect(daysUntil(inDays(5), NOW)).toBe(5);
    });
    it('vrací záporné číslo pro minulé datum', () => {
        expect(daysUntil(inDays(-3), NOW)).toBe(-3);
    });
});

describe('totalBottles', () => {
    it('počítá balení podle přípony SKU (× množství)', () => {
        expect(totalBottles([{ sku: 'BUP-LEMON-12', quantity: 2 }])).toBe(24);
    });
    it('bere pack=1, když SKU nekončí číslem', () => {
        expect(totalBottles([{ sku: 'BUP', quantity: 3 }])).toBe(3);
    });
    it('počítá mix konfiguraci (součet příchutí × množství)', () => {
        expect(totalBottles([{ mixConfiguration: { lemon: 2, red: 1, silky: 0 }, quantity: 2 }])).toBe(6);
    });
    it('padá zpět na quantity bez sku i mixu', () => {
        expect(totalBottles([{ quantity: 4 }])).toBe(4);
    });
    it('sčítá více položek a zvládá prázdné/neplatné vstupy', () => {
        expect(totalBottles([{ sku: 'X-6', quantity: 1 }, { quantity: 2 }])).toBe(8);
        expect(totalBottles([])).toBe(0);
        expect(totalBottles(null)).toBe(0);
        expect(totalBottles(undefined)).toBe(0);
    });
});

describe('isSameCalendarMonth', () => {
    it('true pro stejný kalendářní měsíc', () => {
        expect(isSameCalendarMonth(inDays(3), NOW)).toBe(true);
    });
    it('false pro jiný měsíc', () => {
        expect(isSameCalendarMonth('2026-06-30T12:00:00.000Z', NOW)).toBe(false);
        expect(isSameCalendarMonth('2026-08-01T12:00:00.000Z', NOW)).toBe(false);
    });
    it('false pro prázdné / neplatné datum', () => {
        expect(isSameCalendarMonth(null, NOW)).toBe(false);
        expect(isSameCalendarMonth('nesmysl', NOW)).toBe(false);
    });
});

describe('checkModifiable (společná pravidla)', () => {
    it('projde u aktivního, napojeného předplatného s dostatečným předstihem', () => {
        expect(checkModifiable(baseSub(), NOW)).toEqual({ ok: true });
    });
    it('projde i když není nastavené datum odeslání', () => {
        expect(checkModifiable(baseSub({ next_delivery_date: null }), NOW).ok).toBe(true);
    });
    it('zamítne již zrušené předplatné', () => {
        const r = checkModifiable(baseSub({ status: 'cancelled' }), NOW);
        expect(r.ok).toBe(false);
        expect(r.status).toBe(400);
        expect(r.error).toMatch(/zrušené/);
    });
    it('zamítne bez napojení na platby', () => {
        const r = checkModifiable(baseSub({ stripe_subscription_id: null }), NOW);
        expect(r.ok).toBe(false);
        expect(r.error).toMatch(/napojení na platby/);
    });
    it(`zamítne změnu méně než ${MIN_DAYS_BEFORE} dní před odesláním`, () => {
        const r = checkModifiable(baseSub({ next_delivery_date: inDays(4) }), NOW);
        expect(r.ok).toBe(false);
        expect(r.error).toMatch(/nejpozději/);
    });
    it('projde přesně na hranici 5 dní', () => {
        expect(checkModifiable(baseSub({ next_delivery_date: inDays(5) }), NOW).ok).toBe(true);
    });
});

describe('checkDateChange (změna data odeslání)', () => {
    it('projde s platným novým datem a bez změny v tomto měsíci', () => {
        expect(checkDateChange(baseSub(), inDays(10), NOW)).toEqual({ ok: true });
    });
    it('zamítne druhou změnu ve stejném kalendářním měsíci', () => {
        const r = checkDateChange(baseSub({ last_date_change_at: inDays(-2) }), inDays(10), NOW);
        expect(r.ok).toBe(false);
        expect(r.error).toMatch(/jednou za kalendářní měsíc/);
    });
    it('zamítne nové datum dříve než 5 dní', () => {
        const r = checkDateChange(baseSub(), inDays(3), NOW);
        expect(r.ok).toBe(false);
        expect(r.error).toMatch(/alespoň/);
    });
    it('zamítne prázdné / neplatné nové datum', () => {
        expect(checkDateChange(baseSub(), null, NOW).ok).toBe(false);
        expect(checkDateChange(baseSub(), 'nesmysl', NOW).ok).toBe(false);
    });
});

describe('checkShippingChange (změna dopravy)', () => {
    it('projde s platnou metodou a bez změny v tomto měsíci', () => {
        expect(checkShippingChange(baseSub(), 'zasilkovna', NOW)).toEqual({ ok: true });
        expect(checkShippingChange(baseSub(), 'personal', NOW).ok).toBe(true);
        expect(checkShippingChange(baseSub(), 'courier', NOW).ok).toBe(true);
    });
    it('zamítne druhou změnu dopravy ve stejném měsíci', () => {
        const r = checkShippingChange(baseSub({ last_shipping_change_at: inDays(-1) }), 'courier', NOW);
        expect(r.ok).toBe(false);
        expect(r.error).toMatch(/jednou za kalendářní měsíc/);
    });
    it('zamítne neplatnou metodu dopravy', () => {
        const r = checkShippingChange(baseSub(), 'dron', NOW);
        expect(r.ok).toBe(false);
        expect(r.error).toMatch(/Neplatný způsob dopravy/);
    });
    it('zamítne prázdnou metodu', () => {
        expect(checkShippingChange(baseSub(), null, NOW).ok).toBe(false);
        expect(checkShippingChange(baseSub(), '', NOW).ok).toBe(false);
    });
});
