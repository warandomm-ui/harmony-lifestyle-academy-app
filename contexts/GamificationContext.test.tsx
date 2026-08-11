import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GamificationProvider, useGamification } from './GamificationContext';
import { ToastProvider } from './ToastContext';

function TestHarness({ onReady }: { onReady: (api: ReturnType<typeof useGamification>) => void }) {
  const api = useGamification();
  onReady(api);
  return (
    <div>
      <span data-testid="points">{api.profile.points}</span>
      <span data-testid="level">{api.profile.level}</span>
      <span data-testid="xpInLevel">{api.profile.xpInLevel}</span>
      <span data-testid="xpForNextLevel">{api.profile.xpForNextLevel}</span>
    </div>
  );
}

function renderGamification() {
  let api!: ReturnType<typeof useGamification>;
  render(
    <ToastProvider>
      <GamificationProvider>
        <TestHarness onReady={(value) => { api = value; }} />
      </GamificationProvider>
    </ToastProvider>
  );
  return {
    getApi: () => api,
  };
}

describe('GamificationContext', () => {
  it('starts from the mock profile (points: 1250, level: 5)', () => {
    renderGamification();
    expect(screen.getByTestId('points').textContent).toBe('1250');
    expect(screen.getByTestId('level').textContent).toBe('5');
  });

  it('adds points without leveling up when under the threshold', () => {
    const { getApi } = renderGamification();
    act(() => {
      getApi().addPoints(100, 'test activity');
    });
    expect(screen.getByTestId('points').textContent).toBe('1350');
    expect(screen.getByTestId('level').textContent).toBe('5');
    expect(screen.getByTestId('xpInLevel').textContent).toBe('350');
  });

  it('levels up once xpInLevel reaches xpForNextLevel, carrying over the remainder', () => {
    const { getApi } = renderGamification();
    // Starting xpInLevel=250, xpForNextLevel=1000 -> needs 750 to level up.
    act(() => {
      getApi().addPoints(800, 'big win');
    });
    expect(screen.getByTestId('level').textContent).toBe('6');
    expect(screen.getByTestId('xpInLevel').textContent).toBe('50');
    // xpForNextLevel grows by 1.5x, floored.
    expect(screen.getByTestId('xpForNextLevel').textContent).toBe('1500');
    expect(screen.getByTestId('points').textContent).toBe('2050');
  });

  it('can trigger multiple level-ups from a single large point award', () => {
    const { getApi } = renderGamification();
    act(() => {
      getApi().addPoints(5000, 'massive win');
    });
    // level should have advanced more than once.
    expect(Number(screen.getByTestId('level').textContent)).toBeGreaterThan(6);
    expect(Number(screen.getByTestId('xpInLevel').textContent)).toBeGreaterThanOrEqual(0);
    expect(Number(screen.getByTestId('xpInLevel').textContent)).toBeLessThan(
      Number(screen.getByTestId('xpForNextLevel').textContent)
    );
  });
});

describe('useGamification', () => {
  it('throws when used outside a GamificationProvider', () => {
    const Bare = () => {
      useGamification();
      return null;
    };
    // Suppress the expected React error boundary console noise.
    const originalError = console.error;
    console.error = () => {};
    expect(() => render(<Bare />)).toThrow(/useGamification must be used within a GamificationProvider/);
    console.error = originalError;
  });
});
