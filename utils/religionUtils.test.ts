import { describe, it, expect } from 'vitest';
import { isMuslim } from './religionUtils';
import { isMuslimStudent } from '../components/OnboardingFlow';
import { RELIGIONS } from '../constants';

/**
 * There are two implementations of the "is this student Muslim?" rule:
 *
 *   utils/religionUtils.ts        isMuslim        -> exact match on 'islam'
 *   components/OnboardingFlow.tsx isMuslimStudent -> islam|muslim|sunni|shia|sufi
 *
 * They drive different things. `isMuslimStudent` selects `dashboardMode`
 * (App.tsx, OnboardingFlow.tsx); `isMuslim` selects which daily routine
 * DailyRoutineTable renders. Any input where they disagree puts a student in
 * the Muslim dashboard with the universal routine.
 *
 * These tests pin current behaviour, including the divergence, so that
 * consolidating the two functions is a deliberate change with a failing test
 * to guide it rather than a silent behaviour shift.
 */

describe('isMuslim (utils/religionUtils)', () => {
  it('returns true only for exactly "islam"', () => {
    expect(isMuslim('Islam')).toBe(true);
    expect(isMuslim('islam')).toBe(true);
    expect(isMuslim('ISLAM')).toBe(true);
  });

  it('trims surrounding whitespace before matching', () => {
    expect(isMuslim('  Islam  ')).toBe(true);
    expect(isMuslim('\tIslam\n')).toBe(true);
  });

  it('returns false for every other religion', () => {
    expect(isMuslim('Buddhism')).toBe(false);
    expect(isMuslim('Christianity')).toBe(false);
    expect(isMuslim('Hinduism')).toBe(false);
    expect(isMuslim('Sikhism')).toBe(false);
    expect(isMuslim('Other')).toBe(false);
    expect(isMuslim('Prefer not to say')).toBe(false);
  });

  it('defaults to false for empty or omitted input', () => {
    expect(isMuslim('')).toBe(false);
    expect(isMuslim('   ')).toBe(false);
    expect(isMuslim()).toBe(false);
    expect(isMuslim(undefined)).toBe(false);
  });

  it('does not match on substrings', () => {
    expect(isMuslim('Islamic')).toBe(false);
    expect(isMuslim('Nation of Islam')).toBe(false);
  });
});

describe('isMuslimStudent (components/OnboardingFlow)', () => {
  it('accepts a wider set of Muslim identifiers than isMuslim does', () => {
    expect(isMuslimStudent('Islam')).toBe(true);
    expect(isMuslimStudent('Muslim')).toBe(true);
    expect(isMuslimStudent('Sunni')).toBe(true);
    expect(isMuslimStudent('Shia')).toBe(true);
    expect(isMuslimStudent('Sufi')).toBe(true);
  });

  it('normalises case and whitespace', () => {
    expect(isMuslimStudent('  SUNNI  ')).toBe(true);
    expect(isMuslimStudent('sUfI')).toBe(true);
  });

  it('returns false for other religions and for empty input', () => {
    expect(isMuslimStudent('Buddhism')).toBe(false);
    expect(isMuslimStudent('Christianity')).toBe(false);
    expect(isMuslimStudent('Prefer not to say')).toBe(false);
    expect(isMuslimStudent('')).toBe(false);
  });

  it('throws on undefined input, unlike isMuslim which defaults to false', () => {
    // isMuslim has a `= ''` default parameter; isMuslimStudent does not, so it
    // reaches `.toLowerCase()` on undefined. UserProfile.religion is typed as a
    // required string, but profile data loaded from storage or Supabase is not
    // validated at the boundary, so undefined is reachable at runtime.
    expect(() => isMuslimStudent(undefined as unknown as string)).toThrow();
    expect(isMuslim(undefined)).toBe(false);
  });
});

describe('the two implementations agree on every selectable religion', () => {
  // This is what keeps the app correct today: the dropdown only offers 'Islam'
  // among Muslim values. Adding 'Muslim' or a denomination to RELIGIONS without
  // consolidating the two functions breaks this test — which is the point.
  it.each(RELIGIONS)('agrees for %s', religion => {
    expect(isMuslim(religion)).toBe(isMuslimStudent(religion));
  });
});

describe('the two implementations diverge outside the dropdown', () => {
  const divergent = ['Muslim', 'Sunni', 'Shia', 'Sufi'];

  it.each(divergent)('disagrees for %s (documents the latent bug)', religion => {
    expect(isMuslimStudent(religion)).toBe(true);
    expect(isMuslim(religion)).toBe(false);
  });

  it('means a student can get the Muslim dashboard with the universal routine', () => {
    const religion = 'Muslim';
    const dashboardMode = isMuslimStudent(religion) ? 'muslim' : 'universal';
    const routineIsIslamic = isMuslim(religion);

    expect(dashboardMode).toBe('muslim');
    expect(routineIsIslamic).toBe(false);
  });
});
