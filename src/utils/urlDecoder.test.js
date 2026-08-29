import { describe, it, expect } from 'vitest';
import { decodeHexUrl, decodeUrl } from './urlDecoder.js';

describe('urlDecoder - decodeHexUrl', () => {
  it('should return null for invalid inputs', () => {
    expect(decodeHexUrl(null)).toBeNull();
    expect(decodeHexUrl(undefined)).toBeNull();
    expect(decodeHexUrl(123)).toBeNull();
  });

  it('should return normal HTTP URLs as-is', () => {
    const url = 'https://example.com/image.png';
    expect(decodeHexUrl(url)).toBe(url);
  });

  it('should decode PostgreSQL bytea format correctly', () => {
    // \x + hex of 'https://test.com'
    const hex = '68747470733a2f2f746573742e636f6d';
    const input = '\\x' + hex;
    expect(decodeHexUrl(input)).toBe('https://test.com');
  });

  it('should decode pure hex format correctly', () => {
    const hex = '68747470733a2f2f746573742e636f6d';
    expect(decodeHexUrl(hex)).toBe('https://test.com');
  });

  it('should return non-hex non-http strings as-is', () => {
    const input = 'just a normal string';
    expect(decodeHexUrl(input)).toBe(input);
  });
});

describe('urlDecoder - decodeUrl', () => {
  it('should decode percent-encoded URLs', () => {
    expect(decodeUrl('https%3A%2F%2Fexample.com')).toBe('https://example.com');
  });

  it('should return null for invalid inputs', () => {
    expect(decodeUrl(null)).toBeNull();
  });
});
