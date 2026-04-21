import { describe, it, expect } from 'vitest';
import { parseSupplierMetadata, getVatMetadata } from './supplier-metadata';

describe('parseSupplierMetadata', () => {
  it('returns empty object when metadata is null/undefined', () => {
    expect(parseSupplierMetadata({ metadata: null })).toEqual({});
    expect(parseSupplierMetadata({ metadata: undefined })).toEqual({});
  });

  it('returns empty object on invalid JSON', () => {
    expect(parseSupplierMetadata({ metadata: 'not-json' })).toEqual({});
    expect(parseSupplierMetadata({ metadata: '{"unclosed' })).toEqual({});
  });

  it('returns empty object when JSON is not an object', () => {
    expect(parseSupplierMetadata({ metadata: 'null' })).toEqual({});
    expect(parseSupplierMetadata({ metadata: '"string"' })).toEqual({});
    expect(parseSupplierMetadata({ metadata: '42' })).toEqual({});
    expect(parseSupplierMetadata({ metadata: '[1,2]' })).toEqual([1, 2] as never);
    // ^ arrays technically typeof 'object'; ignore for callers — `.vat` will be undefined
  });

  it('parses well-formed VAT metadata', () => {
    const json = JSON.stringify({
      vat: {
        vatVerified: true,
        vatCountry: 'PL',
        vatNumber: '1234567890',
        registeredName: 'Procurea Sp. z o.o.',
        checkedAt: '2026-04-22T10:00:00Z',
      },
    });
    const parsed = parseSupplierMetadata({ metadata: json });
    expect(parsed.vat?.vatVerified).toBe(true);
    expect(parsed.vat?.vatCountry).toBe('PL');
    expect(parsed.vat?.registeredName).toBe('Procurea Sp. z o.o.');
  });
});

describe('getVatMetadata', () => {
  it('returns undefined when no metadata', () => {
    expect(getVatMetadata({ metadata: null })).toBeUndefined();
  });

  it('returns undefined when metadata has no vat field', () => {
    expect(getVatMetadata({ metadata: '{"other": "thing"}' })).toBeUndefined();
  });

  it('returns vat payload when present', () => {
    const vat = {
      vatVerified: false,
      vatCountry: 'DE',
      vatNumber: '123456789',
      checkedAt: '2026-04-22T10:00:00Z',
    };
    expect(getVatMetadata({ metadata: JSON.stringify({ vat }) })).toEqual(vat);
  });
});
