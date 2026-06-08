import { describe, it, expect } from 'vitest';
import { cn, formatPrice } from '@/lib/utils';

describe('utils.ts - cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
  });

  it('should override class names according to Tailwind rules', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  it('should filter out falsy values', () => {
    expect(cn('bg-red-500', false && 'text-white', null, undefined, 'p-4')).toBe('bg-red-500 p-4');
  });
});

describe('utils.ts - formatPrice', () => {
  it('should format numbers to Czech Koruna (CZK) currency format', () => {
    // Note: formatPrice uses cs-CZ locale which uses non-breaking space (No-Break Space or Narrow No-Break Space) before Kč.
    // We can clean spaces in comparison or use matchers.
    const result = formatPrice(120).replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ');
    expect(result).toMatch(/120\s*Kč/);
  });

  it('should handle zero price', () => {
    const result = formatPrice(0).replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ');
    expect(result).toMatch(/0\s*Kč/);
  });

  it('should handle undefined or null value safely', () => {
    // @ts-ignore
    const result = formatPrice(null).replace(/\u00a0/g, ' ').replace(/\u202f/g, ' ');
    expect(result).toMatch(/0\s*Kč/);
  });
});
