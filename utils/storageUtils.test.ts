import { describe, it, expect, vi } from 'vitest';
import { storage } from './storageUtils';

/**
 * `storage` is the obfuscated localStorage wrapper used for the whole user
 * profile (App.tsx keys it as `user_data_${user.id}`), so a round-trip failure
 * loses onboarding results, the life vision and the dashboard mode.
 *
 * The obfuscation is btoa(encodeURIComponent(json)) — deliberately not
 * encryption, per the module comment. It does mean the codec has to survive
 * everything the app stores, which includes Bahasa Malaysia text, Arabic script
 * and emoji.
 */

describe('round-trip', () => {
  it('restores primitives', () => {
    storage.set('n', 42);
    storage.set('s', 'hello');
    storage.set('b', true);

    expect(storage.get('n')).toBe(42);
    expect(storage.get('s')).toBe('hello');
    expect(storage.get('b')).toBe(true);
  });

  it('restores nested objects and arrays', () => {
    const profile = {
      profile: { name: 'Aisyah', age: 15, religion: 'Islam' },
      skills: ['python', 'design'],
      vision: { goals: [{ id: 1, text: 'Finish SPM' }] },
      dashboardMode: 'muslim',
    };

    storage.set('user_data_abc', profile);

    expect(storage.get('user_data_abc')).toEqual(profile);
  });

  it('restores unicode, Arabic script and emoji', () => {
    const value = {
      bm: 'Selamat pagi, semoga berjaya',
      arabic: 'بِسْمِ اللَّهِ',
      emoji: '🎉🔥🌅',
    };

    storage.set('unicode', value);

    expect(storage.get('unicode')).toEqual(value);
  });

  it('restores empty containers', () => {
    storage.set('emptyObj', {});
    storage.set('emptyArr', []);

    expect(storage.get('emptyObj')).toEqual({});
    expect(storage.get('emptyArr')).toEqual([]);
  });

  it('obfuscates the stored value rather than writing plaintext', () => {
    storage.set('secret', { name: 'Aisyah' });

    const raw = localStorage.getItem('secret');
    expect(raw).not.toBeNull();
    expect(raw).not.toContain('Aisyah');
    expect(atob(raw!)).toContain('Aisyah');
  });
});

describe('reading missing or unreadable data', () => {
  it('returns null for a key that was never set', () => {
    expect(storage.get('nope')).toBeNull();
  });

  it('returns null and logs when the value is not valid base64', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('corrupt', 'not-base64-!!!');

    expect(storage.get('corrupt')).toBeNull();
    expect(consoleError).toHaveBeenCalled();
  });

  it('returns null when the decoded value is not valid JSON', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    localStorage.setItem('corrupt', btoa(encodeURIComponent('{ not json')));

    expect(storage.get('corrupt')).toBeNull();
  });

  it('returns null for plaintext written by something other than storage.set', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Several components write to localStorage directly with JSON.stringify.
    // Reading those keys back through `storage` yields null rather than throwing.
    localStorage.setItem('mixed', JSON.stringify({ a: 1 }));

    expect(storage.get('mixed')).toBeNull();
  });

  it('treats an empty string as absent', () => {
    localStorage.setItem('blank', '');
    expect(storage.get('blank')).toBeNull();
  });
});

describe('storing values JSON cannot represent', () => {
  it('returns null for undefined, because JSON.stringify produces undefined', () => {
    // btoa(encodeURIComponent(undefined)) stores the literal string "undefined",
    // which fails to parse on the way back out.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    storage.set('u', undefined);

    expect(storage.get('u')).toBeNull();
  });

  it('drops undefined object properties and function values', () => {
    storage.set('lossy', { keep: 1, drop: undefined, fn: () => 'x' });

    expect(storage.get('lossy')).toEqual({ keep: 1 });
  });
});

describe('remove', () => {
  it('deletes the key', () => {
    storage.set('temp', { a: 1 });
    storage.remove('temp');

    expect(storage.get('temp')).toBeNull();
    expect(localStorage.getItem('temp')).toBeNull();
  });

  it('is a no-op for an unknown key', () => {
    expect(() => storage.remove('never-existed')).not.toThrow();
  });
});

describe('quota exhaustion', () => {
  // `set` has no try/catch, so a QuotaExceededError propagates to the caller.
  // App.handleOnboardingComplete calls storage.set without a catch, so a full
  // localStorage quota throws mid-onboarding. This test pins current behaviour;
  // it should be inverted once `set` returns a success boolean or swallows.
  it('propagates a QuotaExceededError to the caller', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('quota', 'QuotaExceededError');
    });

    expect(() => storage.set('big', { a: 'x'.repeat(10) })).toThrow(/quota/);
  });
});
