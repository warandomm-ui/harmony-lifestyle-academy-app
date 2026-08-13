import React, { StrictMode, ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, renderHook, act, screen } from '@testing-library/react';
import { GamificationProvider, useGamification } from './GamificationContext';
import { ToastProvider, useToast } from './ToastContext';
import { MOCK_USER_GAMIFICATION_PROFILE } from '../constants';

/**
 * addPoints is pure arithmetic wrapped in a context. The level-up loop is the
 * interesting part: a single award can cross several level boundaries, and the
 * XP requirement grows by 1.5x each time.
 *
 * Note the testability constraint: GamificationProvider always seeds from the
 * hardcoded MOCK_USER_GAMIFICATION_PROFILE with no way to inject a starting
 * profile, so every expectation below is relative to that baseline. Extracting
 * the reducer would remove that coupling.
 */

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>
    <GamificationProvider>{children}</GamificationProvider>
  </ToastProvider>
);

const renderGamification = () => renderHook(() => useGamification(), { wrapper });

describe('GamificationProvider baseline', () => {
  it('seeds from MOCK_USER_GAMIFICATION_PROFILE', () => {
    const { result } = renderGamification();
    expect(result.current.profile).toEqual(MOCK_USER_GAMIFICATION_PROFILE);
  });

  it('starts at level 5 with 250/1000 XP', () => {
    const { result } = renderGamification();
    expect(result.current.profile.level).toBe(5);
    expect(result.current.profile.xpInLevel).toBe(250);
    expect(result.current.profile.xpForNextLevel).toBe(1000);
    expect(result.current.profile.points).toBe(1250);
  });
});

describe('addPoints below the level threshold', () => {
  it('adds to both lifetime points and current-level XP', () => {
    const { result } = renderGamification();

    act(() => result.current.addPoints(100, 'a lesson'));

    expect(result.current.profile.points).toBe(1350);
    expect(result.current.profile.xpInLevel).toBe(350);
    expect(result.current.profile.level).toBe(5);
    expect(result.current.profile.xpForNextLevel).toBe(1000);
  });

  it('accumulates across several awards', () => {
    // A second award into an already-mounted tree trips React's
    // "cannot update a component while rendering" warning, because addToast
    // runs inside the setProfile updater. See GamificationContext.purity.test.tsx.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderGamification();

    act(() => result.current.addPoints(100, 'first'));
    act(() => result.current.addPoints(200, 'second'));

    expect(result.current.profile.points).toBe(1550);
    expect(result.current.profile.xpInLevel).toBe(550);
    expect(result.current.profile.level).toBe(5);
  });

  it('leaves the profile unchanged for a zero award', () => {
    const { result } = renderGamification();

    act(() => result.current.addPoints(0, 'nothing'));

    expect(result.current.profile).toEqual(MOCK_USER_GAMIFICATION_PROFILE);
  });
});

describe('addPoints crossing a level boundary', () => {
  it('levels up when XP exactly meets the requirement', () => {
    const { result } = renderGamification();

    // 250 + 750 === 1000, the level-5 requirement.
    act(() => result.current.addPoints(750, 'exact level up'));

    expect(result.current.profile.level).toBe(6);
    expect(result.current.profile.xpInLevel).toBe(0);
    expect(result.current.profile.xpForNextLevel).toBe(1500);
    expect(result.current.profile.points).toBe(2000);
  });

  it('carries surplus XP into the new level', () => {
    const { result } = renderGamification();

    act(() => result.current.addPoints(900, 'overshoot'));

    expect(result.current.profile.level).toBe(6);
    expect(result.current.profile.xpInLevel).toBe(150);
    expect(result.current.profile.points).toBe(2150);
  });

  it('scales the next requirement by 1.5x, floored', () => {
    const { result } = renderGamification();

    act(() => result.current.addPoints(750, 'to level 6'));
    expect(result.current.profile.xpForNextLevel).toBe(1500);

    act(() => result.current.addPoints(1500, 'to level 7'));
    expect(result.current.profile.xpForNextLevel).toBe(2250);

    act(() => result.current.addPoints(2250, 'to level 8'));
    expect(result.current.profile.xpForNextLevel).toBe(3375);
  });

  it('levels up multiple times from a single large award', () => {
    const { result } = renderGamification();

    // 250 + 3000 = 3250 -> L6 (leaves 2250, needs 1500) -> L7 (leaves 750).
    act(() => result.current.addPoints(3000, 'a whole course'));

    expect(result.current.profile.level).toBe(7);
    expect(result.current.profile.xpInLevel).toBe(750);
    expect(result.current.profile.xpForNextLevel).toBe(2250);
    expect(result.current.profile.points).toBe(4250);
  });

  it('keeps lifetime points as the untouched running total', () => {
    const { result } = renderGamification();

    act(() => result.current.addPoints(5000, 'a marathon session'));

    // Points never reset on level up, unlike xpInLevel.
    expect(result.current.profile.points).toBe(6250);
    expect(result.current.profile.xpInLevel).toBeLessThan(
      result.current.profile.xpForNextLevel,
    );
  });

  // Cannot be executed: `while (newXpInLevel >= newXpForNextLevel)` never
  // terminates when xpForNextLevel <= 0, because the loop body subtracts 0 and
  // Math.floor(0 * 1.5) stays 0. A synchronous infinite loop hangs the worker
  // rather than tripping the test timeout, so this stays a todo until the
  // reducer is extracted and given a guard.
  it.todo('does not hang when xpForNextLevel is 0 or negative');
});

describe('addPoints toasts', () => {
  it('announces the XP award', () => {
    const { result } = renderHook(
      () => ({ gamification: useGamification(), toast: useToast() }),
      { wrapper },
    );

    act(() => result.current.gamification.addPoints(50, 'daily check-in'));

    expect(result.current.toast.toasts).toHaveLength(1);
    expect(result.current.toast.toasts[0].message).toBe('+50 XP for daily check-in!');
    expect(result.current.toast.toasts[0].type).toBe('info');
  });

  it('announces each level gained alongside the XP award', () => {
    const { result } = renderHook(
      () => ({ gamification: useGamification(), toast: useToast() }),
      { wrapper },
    );

    act(() => result.current.gamification.addPoints(3000, 'a whole course'));

    const messages = result.current.toast.toasts.map(t => t.message);
    expect(messages).toContain("🎉 Level Up! You've reached Level 6!");
    expect(messages).toContain("🎉 Level Up! You've reached Level 7!");
    expect(messages).toContain('+3000 XP for a whole course!');
  });
});

describe('useGamification outside a provider', () => {
  it('throws a descriptive error', () => {
    // React logs the boundary-less render failure; that noise is expected here.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useGamification())).toThrow(
      /must be used within a GamificationProvider/,
    );
  });
});

describe('StrictMode', () => {
  /**
   * addToast is called from inside the setProfile updater, which React treats
   * as an impure update (see GamificationContext.purity.test.tsx). StrictMode's
   * double-invocation does not, however, duplicate the toasts or change the
   * resulting profile. Pinning that here means a React upgrade or a move to
   * concurrent features surfaces the difference rather than shipping it.
   */
  const Harness: React.FC = () => {
    const { addPoints, profile } = useGamification();
    const { toasts } = useToast();
    return (
      <div>
        <span data-testid="level">{profile.level}</span>
        <span data-testid="toast-count">{toasts.length}</span>
        <button onClick={() => addPoints(3000, 'a whole course')}>award</button>
      </div>
    );
  };

  const renderIn = (mode: 'strict' | 'plain') => {
    const tree = (
      <ToastProvider>
        <GamificationProvider>
          <Harness />
        </GamificationProvider>
      </ToastProvider>
    );
    return render(mode === 'strict' ? <StrictMode>{tree}</StrictMode> : tree);
  };

  it.each(['strict', 'plain'] as const)(
    'produces the same profile and toast count in %s mode',
    mode => {
      renderIn(mode);

      act(() => screen.getByText('award').click());

      expect(screen.getByTestId('level')).toHaveTextContent('7');
      // Two level-ups plus one XP award.
      expect(screen.getByTestId('toast-count')).toHaveTextContent('3');
    },
  );

});

describe('toast identity for a multi-level award', () => {
  // Regression guard for the ToastContext id collision documented in
  // contexts/ToastContext.test.tsx: three toasts raised in one tick all share
  // an id, so dismissing any one of them removes all three.
  it('emits toasts that all collide on the same id', () => {
    // Date.now() is pinned because the collision is timing-dependent: with the
    // real clock the batch sometimes straddles a millisecond boundary and
    // produces two ids instead of one. That non-determinism is the bug's
    // signature in production too — dismissal sometimes clears one toast and
    // sometimes the whole batch.
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);

    const { result } = renderHook(
      () => ({ gamification: useGamification(), toast: useToast() }),
      { wrapper },
    );

    act(() => result.current.gamification.addPoints(3000, 'a whole course'));

    const ids = result.current.toast.toasts.map(t => t.id);
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(1);
  });
});
