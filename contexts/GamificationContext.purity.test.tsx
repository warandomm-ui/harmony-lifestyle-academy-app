import React, { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { GamificationProvider, useGamification } from './GamificationContext';
import { ToastProvider } from './ToastContext';

/**
 * GamificationContext.addPoints calls addToast from inside the setProfile
 * updater:
 *
 *     setProfile(prevProfile => {
 *       ...
 *       addToast(`+${amount} XP for ${activity}!`, 'info');
 *       return { ...prevProfile, ... };
 *     });
 *
 * State updaters must be pure. React detects the cross-component update and
 * warns "Cannot update a component (`ToastProvider`) while rendering a
 * different component (`GamificationProvider`)".
 *
 * This assertion lives in its own file on purpose. React deduplicates that
 * warning per module instance, so once any test in a file has triggered it,
 * every later test sees a silent console — which makes the assertion pass
 * vacuously if it shares a file with other addPoints tests. Vitest gives each
 * test file a fresh module registry, so this file always observes the first
 * occurrence.
 *
 * The fix is to move the toast into a useEffect keyed on the profile, or to
 * return the toasts to raise from a pure reducer. When that lands, this test
 * should be inverted to assert no warning.
 */

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>
    <GamificationProvider>{children}</GamificationProvider>
  </ToastProvider>
);

describe('addPoints updater purity', () => {
  it('warns that it updates ToastProvider while rendering GamificationProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useGamification(), { wrapper });

    // The warning appears on an award into an already-mounted tree, so two
    // sequential awards are needed to reach it.
    act(() => result.current.addPoints(100, 'first'));
    act(() => result.current.addPoints(200, 'second'));

    const warnings = consoleError.mock.calls.map(call => String(call[0]));
    expect(
      warnings.some(w => w.includes('Cannot update a component')),
    ).toBe(true);
  });

  it('still produces the correct profile despite the impure update', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useGamification(), { wrapper });

    act(() => result.current.addPoints(100, 'first'));
    act(() => result.current.addPoints(200, 'second'));

    expect(result.current.profile.points).toBe(1550);
    expect(result.current.profile.xpInLevel).toBe(550);
  });
});
