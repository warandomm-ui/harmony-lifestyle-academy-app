import { describe, expect, it } from 'vitest';
import { isMuslim } from './religionUtils';

describe('isMuslim', () => {
  it('returns true for exact match "Islam"', () => {
    expect(isMuslim('Islam')).toBe(true);
  });

  it('is case-insensitive', () => {
    expect(isMuslim('ISLAM')).toBe(true);
    expect(isMuslim('islam')).toBe(true);
    expect(isMuslim('IsLaM')).toBe(true);
  });

  it('ignores surrounding whitespace', () => {
    expect(isMuslim('  Islam  ')).toBe(true);
  });

  it('returns false for other religions', () => {
    expect(isMuslim('Buddhism')).toBe(false);
    expect(isMuslim('Christianity')).toBe(false);
    expect(isMuslim('Hinduism')).toBe(false);
    expect(isMuslim('Sikhism')).toBe(false);
    expect(isMuslim('Other')).toBe(false);
    expect(isMuslim('Prefer not to say')).toBe(false);
  });

  it('returns false for empty or default input', () => {
    expect(isMuslim('')).toBe(false);
    expect(isMuslim()).toBe(false);
  });

  it('does not match substrings or partial words', () => {
    expect(isMuslim('Islamic')).toBe(false);
    expect(isMuslim('Not Islam')).toBe(false);
  });
});
