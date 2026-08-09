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
    applySubscriptionStatusEvent,
    applySubscriptionPaused,
    applySubscriptionDeleted,
    performPauseResume,
    executeRenewal,
    buildSubscriptionRecord,
    performCancel,
    performChangeDate,
    performChangeShipping,
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


// --- Integrační testy s falešnými klienty (ověřují skutečná volání Stripe/DB) ---
function fakeDb(rec: any[]) {
    return {
        from(table: string) {
            return {
                update(row: any) {
                    return { eq(col: string, val: any) { rec.push({ op: 'update', table, row, col, val }); return Promise.resolve({ error: null }); } };
                },
            };
        },
    };
}
function fakeStripe(rec: any[]) {
    return { subscriptions: { update: (id: string, payload: any) => { rec.push({ op: 'stripe.update', id, payload }); return Promise.resolve({}); } } };
}

describe('applySubscriptionStatusEvent (webhook customer.subscription.updated)', () => {
    it('pause_collection → paused a zapíše správný update do DB', async () => {
        const rec: any[] = [];
        const upd = await applySubscriptionStatusEvent(fakeDb(rec), { id: 'sub_1', status: 'active', pause_collection: { behavior: 'void' }, cancel_at_period_end: false, current_period_end: 1893456000 }, 'NOW');
        expect(upd.status).toBe('paused');
        expect(upd.cancel_at_period_end).toBe(false);
        expect(upd.current_period_end).toBe(new Date(1893456000 * 1000).toISOString());
        expect(rec).toEqual([{ op: 'update', table: 'subscriptions', row: upd, col: 'stripe_subscription_id', val: 'sub_1' }]);
    });
    it('canceled → cancelled, cancel_at_period_end se přenese', async () => {
        const rec: any[] = [];
        const upd = await applySubscriptionStatusEvent(fakeDb(rec), { id: 'sub_2', status: 'canceled', cancel_at_period_end: true, current_period_end: null }, 'NOW');
        expect(upd.status).toBe('cancelled');
        expect(upd.cancel_at_period_end).toBe(true);
        expect(upd.current_period_end).toBeNull();
    });
});

describe('applySubscriptionPaused / applySubscriptionDeleted (webhook)', () => {
    it('paused → status paused + zápis dle stripe_subscription_id', async () => {
        const rec: any[] = [];
        const upd = await applySubscriptionPaused(fakeDb(rec), 'sub_1', 'NOW');
        expect(upd).toEqual({ status: 'paused', updated_at: 'NOW' });
        expect(rec[0]).toEqual({ op: 'update', table: 'subscriptions', row: upd, col: 'stripe_subscription_id', val: 'sub_1' });
    });
    it('deleted → cancelled + cancelled_at', async () => {
        const rec: any[] = [];
        const upd = await applySubscriptionDeleted(fakeDb(rec), 'sub_9', 'NOW');
        expect(upd).toEqual({ status: 'cancelled', cancelled_at: 'NOW', updated_at: 'NOW' });
        expect(rec[0].val).toBe('sub_9');
    });
});

describe('performPauseResume (endpoint pause/resume)', () => {
    const sub = (o: any = {}) => ({ id: 'row1', status: 'active', stripe_subscription_id: 'sub_1', ...o });
    it('pause → Stripe pause_collection void + DB status paused (v pořadí)', async () => {
        const rec: any[] = [];
        const r = await performPauseResume(fakeStripe(rec), fakeDb(rec), sub(), 'pause', 'NOW');
        expect(r.status).toBe(200);
        expect(r.body.ok).toBe(true);
        expect(rec).toEqual([
            { op: 'stripe.update', id: 'sub_1', payload: { pause_collection: { behavior: 'void' } } },
            { op: 'update', table: 'subscriptions', row: { status: 'paused', updated_at: 'NOW' }, col: 'id', val: 'row1' },
        ]);
    });
    it('resume → Stripe pause_collection "" + DB status active', async () => {
        const rec: any[] = [];
        const r = await performPauseResume(fakeStripe(rec), fakeDb(rec), sub({ status: 'paused' }), 'resume', 'NOW');
        expect(r.status).toBe(200);
        expect(rec).toEqual([
            { op: 'stripe.update', id: 'sub_1', payload: { pause_collection: '' } },
            { op: 'update', table: 'subscriptions', row: { status: 'active', updated_at: 'NOW' }, col: 'id', val: 'row1' },
        ]);
    });
    it('zrušené předplatné → 400 a žádné volání Stripe/DB', async () => {
        const rec: any[] = [];
        const r = await performPauseResume(fakeStripe(rec), fakeDb(rec), sub({ status: 'cancelled' }), 'pause', 'NOW');
        expect(r.status).toBe(400);
        expect(rec).toEqual([]);
    });
    it('bez napojení na platby → 400', async () => {
        const rec: any[] = [];
        const r = await performPauseResume(fakeStripe(rec), fakeDb(rec), sub({ stripe_subscription_id: null }), 'resume', 'NOW');
        expect(r.status).toBe(400);
        expect(rec).toEqual([]);
    });
});


describe('executeRenewal (webhook invoice.paid → sklad + objednávka + idempotence)', () => {
    function fakeRenewalDb(rec: any[], subRow: any) {
        return {
            from(table: string) {
                return {
                    select() { return { eq() { return { maybeSingle() { return Promise.resolve({ data: subRow }); } }; } }; },
                    insert(row: any) { rec.push({ op: 'insert', table, row }); return Promise.resolve({ error: null }); },
                    update(row: any) { return { eq(col: string, val: any) { rec.push({ op: 'update', table, row, col, val }); return Promise.resolve({ error: null }); } }; },
                };
            },
            rpc(fn: string, args: any) { rec.push({ op: 'rpc', fn, args }); return Promise.resolve({ error: null }); },
        };
    }
    const fakeRenewalStripe = (periodEnd: number | null) => ({ subscriptions: { retrieve: () => Promise.resolve({ current_period_end: periodEnd }) } });

    it('zpracuje obnovu: odečte sklad, založí objednávku, označí fakturu', async () => {
        const rec: any[] = [];
        const subRow = { stripe_subscription_id: 'sub_1', last_invoice_id: null, items: [{ sku: 'A-LEMON-2', quantity: 3 }], delivery_info: { firstName: 'Jan', lastName: 'Novák', deliveryMethod: 'courier' }, email: 'jan@x.cz', shipping_price: 120 };
        const res = await executeRenewal({ supabase: fakeRenewalDb(rec, subRow), stripe: fakeRenewalStripe(1893456000) }, 'sub_1', { id: 'in_1', amount_paid: 74900 }, 'NOW', 'BUP1');
        expect(res.outcome).toBe('processed');
        expect(res.orderInserted).toBe(true);
        expect(rec).toEqual([
            { op: 'rpc', fn: 'handle_stock_movement', args: { p_sku: 'lemon', p_type: 'sale', p_amount: -6, p_note: 'Předplatné – obnova in_1' } },
            { op: 'insert', table: 'orders', row: {
                id: res.order!.id,
                customer_email: (res.order as any).customer.email,
                customer_name: (res.order as any).customer.name,
                total: res.order!.total,
                status: res.order!.status,
                items: res.order!.items,
                delivery_info: res.order!.delivery_info,
                is_subscription_order: true,
            } },
            { op: 'update', table: 'subscriptions', row: { last_invoice_id: 'in_1', current_period_end: new Date(1893456000 * 1000).toISOString(), updated_at: 'NOW' }, col: 'stripe_subscription_id', val: 'sub_1' },
        ]);
        expect(res.order!.total).toBe(749);
        expect(res.order!.is_subscription_order).toBe(true);
    });

    it('idempotence: stejná faktura → přeskočí, žádný sklad/objednávka', async () => {
        const rec: any[] = [];
        const subRow = { stripe_subscription_id: 'sub_1', last_invoice_id: 'in_1', items: [{ sku: 'A-LEMON-2', quantity: 3 }] };
        const res = await executeRenewal({ supabase: fakeRenewalDb(rec, subRow), stripe: fakeRenewalStripe(1) }, 'sub_1', { id: 'in_1', amount_paid: 74900 }, 'NOW', 'BUP1');
        expect(res.outcome).toBe('duplicate');
        expect(rec).toEqual([]);
    });

    it('neznámé předplatné → not_found, žádné zápisy', async () => {
        const rec: any[] = [];
        const res = await executeRenewal({ supabase: fakeRenewalDb(rec, null), stripe: fakeRenewalStripe(1) }, 'sub_x', { id: 'in_9', amount_paid: 1000 }, 'NOW', 'BUP9');
        expect(res.outcome).toBe('not_found');
        expect(rec).toEqual([]);
    });
});


describe('buildSubscriptionRecord (vytvoření záznamu předplatného)', () => {
    it('sestaví řádek z Stripe subscription + objednávky', () => {
        const stripeSub = { id: 'sub_1', customer: 'cus_1', status: 'active', pause_collection: null, cancel_at_period_end: false, current_period_end: 1893456000, items: { data: [{ price: { recurring: { interval_count: 2 } } }] } };
        const order = { customer_email: 'a@b.cz', customer_name: 'A B', user_id: 'u1', total: 1618, items: [{ sku: 'BUP-LEMON-12', price: 749, quantity: 2 }], delivery_info: { deliveryMethod: 'courier' } };
        const row = buildSubscriptionRecord(stripeSub, order, 'NOW');
        expect(row.stripe_subscription_id).toBe('sub_1');
        expect(row.stripe_customer_id).toBe('cus_1');
        expect(row.email).toBe('a@b.cz');
        expect(row.user_id).toBe('u1');
        expect(row.status).toBe('active');
        expect(row.interval).toBe('bimonthly');
        expect(row.product_handle).toBe('BUP-LEMON-12');
        expect(row.quantity).toBe(2);
        expect(row.shipping_method).toBe('courier');
        expect(row.shipping_price).toBe(120); // total 1618 - itemsTotal 1498
        expect(row.current_period_end).toBe(new Date(1893456000 * 1000).toISOString());
        expect(row.next_delivery_date).toBe(new Date(1893456000 * 1000).toISOString().slice(0, 10));
        expect(row.cancel_at_period_end).toBe(false);
        expect(row.updated_at).toBe('NOW');
    });
    it('bez objednávky → rozumné defaulty', () => {
        const row = buildSubscriptionRecord({ id: 'sub_2', status: 'active', current_period_end: null, items: { data: [] } }, null, 'NOW');
        expect(row.email).toBeNull();
        expect(row.shipping_price).toBeNull();
        expect(row.product_handle).toBe('subscription');
        expect(row.quantity).toBe(1);
        expect(row.interval).toBe('monthly');
        expect(row.items).toBeNull();
    });
});

function fakeDb2(rec: any[]) {
    return { from(t: string) { return { update(row: any) { return { eq(col: string, val: any) { rec.push({ op: 'update', table: t, row, col, val }); return Promise.resolve({ error: null }); } }; } }; } };
}

describe('performCancel (owner zrušení ke konci období)', () => {
    it('nastaví cancel_at_period_end ve Stripu i v DB', async () => {
        const rec: any[] = [];
        const stripe = { subscriptions: { update: (id: string, payload: any) => { rec.push({ op: 'stripe.update', id, payload }); return Promise.resolve({}); } } };
        const r = await performCancel(stripe, fakeDb2(rec), { id: 'row1', stripe_subscription_id: 'sub_1' }, 'NOW');
        expect(r.status).toBe(200);
        expect(rec).toEqual([
            { op: 'stripe.update', id: 'sub_1', payload: { cancel_at_period_end: true } },
            { op: 'update', table: 'subscriptions', row: { cancel_at_period_end: true, updated_at: 'NOW' }, col: 'id', val: 'row1' },
        ]);
    });
});

describe('performChangeDate (změna data odeslání)', () => {
    const NOW = new Date('2026-07-15T12:00:00.000Z').getTime();
    const inDays = (n: number) => new Date(NOW + n * 86400000).toISOString().slice(0, 10);
    it('posune trial_end a zapíše nové datum', async () => {
        const rec: any[] = [];
        const stripe = { subscriptions: { update: (id: string, payload: any) => { rec.push({ op: 'stripe.update', id, payload }); return Promise.resolve({}); } } };
        const newDate = inDays(10);
        const anchor = Math.floor(new Date(newDate + 'T00:00:00').getTime() / 1000);
        const r = await performChangeDate(stripe, fakeDb2(rec), { id: 'row1', stripe_subscription_id: 'sub_1', last_date_change_at: null, next_delivery_date: inDays(20) }, newDate, 'NOW', NOW);
        expect(r.status).toBe(200);
        expect(rec).toEqual([
            { op: 'stripe.update', id: 'sub_1', payload: { trial_end: anchor, proration_behavior: 'none' } },
            { op: 'update', table: 'subscriptions', row: { next_delivery_date: newDate, uses_global_date: false, last_date_change_at: 'NOW', updated_at: 'NOW' }, col: 'id', val: 'row1' },
        ]);
    });
    it('zamítne druhou změnu v měsíci (400, žádné volání)', async () => {
        const rec: any[] = [];
        const stripe = { subscriptions: { update: () => { rec.push({ op: 'stripe.update' }); return Promise.resolve({}); } } };
        const r = await performChangeDate(stripe, fakeDb2(rec), { id: 'row1', stripe_subscription_id: 'sub_1', last_date_change_at: new Date(NOW - 2 * 86400000).toISOString() }, inDays(10), 'NOW', NOW);
        expect(r.status).toBe(400);
        expect(rec).toEqual([]);
    });
});

describe('performChangeShipping (změna dopravy)', () => {
    const cfg = { stripeCurrency: 'czk', methods: { courier: [{ maxBottles: null, price: 99 }], zasilkovna: [{ maxBottles: null, price: 79 }] } };
    const deps = (rec: any[], itemsData: any[], shipCur = 99) => ({
        stripe: {
            subscriptions: {
                retrieve: () => Promise.resolve({ items: { data: itemsData } }),
                update: (id: string, payload: any) => { rec.push({ op: 'stripe.update', id, payload }); return Promise.resolve({}); },
            },
        },
        admin: fakeDb2(rec),
        resolveShippingCountry: () => cfg,
        shippingForMethod: () => shipCur,
        convertToCurrency: (x: number) => x,
    });
    const sub = { id: 'row1', stripe_subscription_id: 'sub_1', interval: 'monthly', last_shipping_change_at: null, items: [{ sku: 'X-6', price: 100, quantity: 1 }], delivery_info: {} };
    const dopravaItem = { id: 'si_ship', price: { product: { name: 'Doprava' } } };
    const prodItem = { id: 'si_prod', price: { product: { name: 'BoostUp' } } };

    it('shipCur>0 + existující položka Doprava → update položky', async () => {
        const rec: any[] = [];
        const r = await performChangeShipping(deps(rec, [prodItem, dopravaItem], 99) as any, sub, 'courier', 'NOW');
        expect(r.status).toBe(200);
        expect(rec[0]).toEqual({ op: 'stripe.update', id: 'sub_1', payload: { items: [{ id: 'si_ship', price_data: { currency: 'czk', product_data: { name: 'Doprava' }, unit_amount: 9900, recurring: { interval: 'month', interval_count: 1 } } }], proration_behavior: 'none' } });
        expect(rec[1]).toEqual({ op: 'update', table: 'subscriptions', row: { shipping_method: 'courier', shipping_price: 99, shipping_currency: 'czk', last_shipping_change_at: 'NOW', updated_at: 'NOW' }, col: 'id', val: 'row1' });
    });
    it('shipCur>0 bez položky Doprava → přidá novou položku', async () => {
        const rec: any[] = [];
        await performChangeShipping(deps(rec, [prodItem], 99) as any, sub, 'courier', 'NOW');
        expect(rec[0]).toEqual({ op: 'stripe.update', id: 'sub_1', payload: { items: [{ price_data: { currency: 'czk', product_data: { name: 'Doprava' }, unit_amount: 9900, recurring: { interval: 'month', interval_count: 1 } } }], proration_behavior: 'none' } });
    });
    it('shipCur=0 + existující položka → odebere ji', async () => {
        const rec: any[] = [];
        await performChangeShipping(deps(rec, [prodItem, dopravaItem], 0) as any, sub, 'courier', 'NOW');
        expect(rec[0]).toEqual({ op: 'stripe.update', id: 'sub_1', payload: { items: [{ id: 'si_ship', deleted: true }], proration_behavior: 'none' } });
    });
    it('neplatná metoda / bez pásem → 400', async () => {
        const rec: any[] = [];
        const badDeps: any = { ...deps(rec, [prodItem], 99), resolveShippingCountry: () => ({ stripeCurrency: 'czk', methods: {} }) };
        const r = await performChangeShipping(badDeps, sub, 'courier', 'NOW');
        expect(r.status).toBe(400);
        expect(rec).toEqual([]);
    });
});
