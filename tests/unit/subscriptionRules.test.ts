import { describe, it, expect } from 'vitest';
import {
    MIN_DAYS_BEFORE,
    daysUntil,
    totalBottles,
    isSameCalendarMonth,
    checkModifiable,
    checkDateChange,
    checkShippingChange,
    mapStripeStatus,
    mapInterval,
    isRenewalInvoice,
    isRenewalProcessed,
    computeRequiredStock,
    checkPauseResume,
    buildRenewalPlan,
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


describe('mapStripeStatus', () => {
    it('active bez pauzy → active', () => {
        expect(mapStripeStatus('active', false)).toBe('active');
        expect(mapStripeStatus('trialing', false)).toBe('active');
    });
    it('pause_collection → paused (i u active)', () => {
        expect(mapStripeStatus('active', true)).toBe('paused');
        expect(mapStripeStatus(undefined, true)).toBe('paused');
    });
    it('canceled/cancelled → cancelled (má přednost)', () => {
        expect(mapStripeStatus('canceled', false)).toBe('cancelled');
        expect(mapStripeStatus('cancelled', true)).toBe('cancelled');
    });
});

describe('mapInterval', () => {
    it('>= 2 měsíce → bimonthly, jinak monthly', () => {
        expect(mapInterval(1)).toBe('monthly');
        expect(mapInterval(2)).toBe('bimonthly');
        expect(mapInterval(3)).toBe('bimonthly');
        expect(mapInterval(undefined)).toBe('monthly');
        expect(mapInterval(null)).toBe('monthly');
    });
});

describe('isRenewalInvoice', () => {
    it('jen subscription_cycle je obnova', () => {
        expect(isRenewalInvoice('subscription_cycle')).toBe(true);
        expect(isRenewalInvoice('subscription_create')).toBe(false);
        expect(isRenewalInvoice('manual')).toBe(false);
        expect(isRenewalInvoice(undefined)).toBe(false);
    });
});

describe('isRenewalProcessed (idempotence obnovy)', () => {
    it('stejné invoice id → už zpracováno', () => {
        expect(isRenewalProcessed('in_1', 'in_1')).toBe(true);
    });
    it('různé / prázdné → nezpracováno', () => {
        expect(isRenewalProcessed('in_1', 'in_2')).toBe(false);
        expect(isRenewalProcessed(null, 'in_1')).toBe(false);
        expect(isRenewalProcessed('in_1', null)).toBe(false);
        expect(isRenewalProcessed(undefined, undefined)).toBe(false);
    });
});

describe('computeRequiredStock', () => {
    it('SKU s příchutí a balením (× množství)', () => {
        expect(computeRequiredStock([{ sku: 'BUP-LEMON-12', quantity: 2 }])).toEqual({ lemon: 24, red: 0, silky: 0 });
        expect(computeRequiredStock([{ sku: 'X-RED-6', quantity: 1 }])).toEqual({ lemon: 0, red: 6, silky: 0 });
    });
    it('SKU bez čísla balení → pack = 1', () => {
        expect(computeRequiredStock([{ sku: 'boost-silky', quantity: 2 }])).toEqual({ lemon: 0, red: 0, silky: 2 });
    });
    it('mix konfigurace (součet příchutí × množství)', () => {
        expect(computeRequiredStock([{ mixConfiguration: { lemon: 1, red: 2, silky: 0 }, quantity: 3 }])).toEqual({ lemon: 3, red: 6, silky: 0 });
    });
    it('SKU bez rozpoznané příchuti se ignoruje', () => {
        expect(computeRequiredStock([{ sku: 'MERCH-TSHIRT-1', quantity: 5 }])).toEqual({ lemon: 0, red: 0, silky: 0 });
    });
    it('sčítá více položek a zvládá prázdné vstupy', () => {
        expect(computeRequiredStock([{ sku: 'A-LEMON-2', quantity: 1 }, { mixConfiguration: { lemon: 0, red: 1, silky: 1 }, quantity: 2 }]))
            .toEqual({ lemon: 2, red: 2, silky: 2 });
        expect(computeRequiredStock([])).toEqual({ lemon: 0, red: 0, silky: 0 });
        expect(computeRequiredStock(null)).toEqual({ lemon: 0, red: 0, silky: 0 });
    });
});

describe('checkPauseResume (přerušit / obnovit)', () => {
    const sub = (o: Partial<SubscriptionLike> = {}): SubscriptionLike => ({ status: 'active', stripe_subscription_id: 'sub_1', ...o });
    it('projde u aktivního napojeného předplatného', () => {
        expect(checkPauseResume(sub())).toEqual({ ok: true });
        expect(checkPauseResume(sub({ status: 'paused' })).ok).toBe(true);
    });
    it('zamítne zrušené', () => {
        const r = checkPauseResume(sub({ status: 'cancelled' }));
        expect(r.ok).toBe(false); expect(r.error).toMatch(/zrušené/);
    });
    it('zamítne bez napojení na platby', () => {
        const r = checkPauseResume(sub({ stripe_subscription_id: null }));
        expect(r.ok).toBe(false); expect(r.error).toMatch(/napojení na platby/);
    });
});


describe('buildRenewalPlan (obnova → sklad + objednávka)', () => {
    const NOW = '2026-07-15T00:00:00.000Z';
    it('sestaví skladové pohyby a objednávku z položek + faktury', () => {
        const sub = { items: [{ sku: 'A-LEMON-2', quantity: 3 }], delivery_info: { firstName: 'Jan', lastName: 'Novák', deliveryMethod: 'courier' }, email: 'jan@x.cz', shipping_price: 120 };
        const plan = buildRenewalPlan(sub, { id: 'in_9', amount_paid: 74900 }, NOW, 'BUP123');
        expect(plan.stockMovements).toEqual([{ sku: 'lemon', amount: 6, note: 'Předplatné – obnova in_9' }]);
        expect(plan.order).toEqual({
            id: 'BUP123', date: NOW,
            customer: { name: 'Jan Novák', email: 'jan@x.cz' },
            delivery_info: { firstName: 'Jan', lastName: 'Novák', deliveryMethod: 'courier' },
            items: [{ sku: 'A-LEMON-2', quantity: 3 }],
            total: 749, status: 'paid', is_subscription_order: true,
        });
    });
    it('total padá na shipping_price, když faktura nemá amount_paid', () => {
        const plan = buildRenewalPlan({ items: [], delivery_info: {}, email: 'a@b.cz', shipping_price: 99 }, { id: 'in_1' }, NOW, 'BUP1');
        expect(plan.order.total).toBe(99);
        expect(plan.stockMovements).toEqual([]);
    });
    it('jméno padá na e-mail, když v delivery_info chybí', () => {
        const plan = buildRenewalPlan({ items: [], delivery_info: {}, email: 'x@y.cz' }, { id: 'in_2', amount_paid: 0 }, NOW, 'BUP2');
        expect(plan.order.customer.name).toBe('x@y.cz');
        expect(plan.order.total).toBe(0);
    });
    it('mix konfigurace → více skladových pohybů', () => {
        const plan = buildRenewalPlan({ items: [{ mixConfiguration: { lemon: 1, red: 1, silky: 0 }, quantity: 2 }] }, { id: 'in_3', amount_paid: 1000 }, NOW, 'BUP3');
        expect(plan.stockMovements).toEqual([
            { sku: 'lemon', amount: 2, note: 'Předplatné – obnova in_3' },
            { sku: 'red', amount: 2, note: 'Předplatné – obnova in_3' },
        ]);
    });
});
