import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { storage } from './storageUtils';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('round-trips primitives and objects through set/get', () => {
    storage.set('str', 'hello');
    expect(storage.get('str')).toBe('hello');

    storage.set('num', 42);
    expect(storage.get('num')).toBe(42);

    const obj = { a: 1, b: ['x', 'y'], c: { nested: true } };
    storage.set('obj', obj);
    expect(storage.get('obj')).toEqual(obj);
  });

  it('does not store plaintext JSON in localStorage', () => {
    storage.set('secret', { token: 'abc123' });
    const raw = localStorage.getItem('secret');
    expect(raw).not.toContain('abc123');
    expect(raw).not.toContain('token');
  });

  it('returns null for a missing key', () => {
    expect(storage.get('does-not-exist')).toBeNull();
  });

  it('returns null and does not throw for corrupted/unreadable data', () => {
    localStorage.setItem('corrupted', 'not-valid-base64-or-json!!!');
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(storage.get('corrupted')).toBeNull();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('removes a stored key', () => {
    storage.set('temp', 'value');
    storage.remove('temp');
    expect(storage.get('temp')).toBeNull();
  });
});

afterEach(() => {
  localStorage.clear();
});
