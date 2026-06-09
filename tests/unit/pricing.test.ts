import { describe, it, expect } from 'vitest';

// Define the classification function exactly as used in PricingStatistics
function classifyOrder(order: { id: string; delivery_info?: { paymentMethod?: string } }) {
  const isPromo = order.delivery_info?.paymentMethod === 'promo';
  const isManual = order.id?.startsWith('MAN-') && !isPromo;
  const isOnline = !order.id?.startsWith('MAN-') && !isPromo;

  if (isOnline) return 'online';
  if (isPromo) return 'promo';
  if (isManual) return 'manual';
  return 'unknown';
}

// Define packaging math exactly as used in PricingStatistics
function getUnitsCount(sku: string, quantity: number) {
  const skuLower = sku.toLowerCase();
  const sizeMatch = skuLower.match(/-(\d+)$/);
  const unitsPerPack = sizeMatch ? parseInt(sizeMatch[1]) : 1;
  return quantity * unitsPerPack;
}

describe('Order classification logic', () => {
  it('should classify normal web order as online', () => {
    const order = {
      id: 'BUP17760',
      delivery_info: { paymentMethod: 'card' }
    };
    expect(classifyOrder(order)).toBe('online');
  });

  it('should classify manual order starting with MAN- as manual', () => {
    const order = {
      id: 'MAN-1002',
      delivery_info: { paymentMethod: 'transfer_manual' }
    };
    expect(classifyOrder(order)).toBe('manual');
  });

  it('should classify promo order as promo regardless of ID prefix', () => {
    const order = {
      id: 'MAN-1003',
      delivery_info: { paymentMethod: 'promo' }
    };
    expect(classifyOrder(order)).toBe('promo');

    const orderWebPromo = {
      id: 'BUP17761',
      delivery_info: { paymentMethod: 'promo' }
    };
    expect(classifyOrder(orderWebPromo)).toBe('promo');
  });
});

describe('Units calculation logic', () => {
  it('should parse packaging suffix correctly for 3-pack', () => {
    expect(getUnitsCount('lemon-3', 2)).toBe(6);
  });

  it('should parse packaging suffix correctly for 12-pack', () => {
    expect(getUnitsCount('red-12', 1)).toBe(12);
  });

  it('should parse packaging suffix correctly for 21-pack', () => {
    expect(getUnitsCount('silky-21', 5)).toBe(105);
  });

  it('should fallback to 1 unit if no pack suffix exists', () => {
    expect(getUnitsCount('single-can', 10)).toBe(10);
  });
});
