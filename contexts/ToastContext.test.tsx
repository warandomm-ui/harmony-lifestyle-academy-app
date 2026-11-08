import React, { ReactNode } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';
import ToastContainer from '../components/ToastContainer';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

describe('addToast', () => {
  it('appends toasts in order with their message and type', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => result.current.addToast('saved', 'success'));
    act(() => result.current.addToast('oops', 'error'));

    expect(result.current.toasts.map(t => [t.message, t.type])).toEqual([
      ['saved', 'success'],
      ['oops', 'error'],
    ]);
  });

  it('starts empty', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    expect(result.current.toasts).toEqual([]);
  });
});

describe('removeToast', () => {
  it('removes the matching toast and leaves the rest', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    // Distinct ids require distinct millisecond timestamps.
    vi.spyOn(Date, 'now').mockReturnValueOnce(1).mockReturnValueOnce(2);
    act(() => result.current.addToast('first', 'info'));
    act(() => result.current.addToast('second', 'info'));

    act(() => result.current.removeToast(1));

    expect(result.current.toasts.map(t => t.message)).toEqual(['second']);
  });

  it('is a no-op for an unknown id', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => result.current.addToast('only', 'info'));
    act(() => result.current.removeToast(-1));

    expect(result.current.toasts).toHaveLength(1);
  });
});

/**
 * addToast derives its id from `Date.now()`. Any two toasts raised within the
 * same millisecond therefore share an id, which breaks two things:
 *
 *   1. ToastContainer keys its list on `toast.id`, so React sees duplicate keys.
 *   2. removeToast filters by id, so dismissing one toast removes every toast
 *      that shares its timestamp. Toast.tsx calls onClose after a 5s timer and
 *      on the close button, so the first expiry wipes the whole batch.
 *
 * GamificationContext.addPoints raises up to three toasts in a single tick on a
 * multi-level award, so this is reachable in normal use rather than theoretical.
 * A monotonic counter (or crypto.randomUUID) for the id fixes it.
 */
describe('id collisions within a millisecond', () => {
  it('assigns the same id to toasts raised in the same tick', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    act(() => {
      result.current.addToast('first', 'success');
      result.current.addToast('second', 'success');
      result.current.addToast('third', 'info');
    });

    const ids = result.current.toasts.map(t => t.id);
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(1);
  });

  it('removes every colliding toast when one is dismissed', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    act(() => {
      result.current.addToast('first', 'success');
      result.current.addToast('second', 'success');
      result.current.addToast('third', 'info');
    });

    act(() => result.current.removeToast(result.current.toasts[0].id));

    // Only 'first' was dismissed, but all three are gone.
    expect(result.current.toasts).toHaveLength(0);
  });

  it('renders duplicate React keys in ToastContainer', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const Harness: React.FC = () => {
      const { addToast } = useToast();
      return (
        <>
          <button onClick={() => { addToast('a', 'info'); addToast('b', 'info'); }}>
            raise
          </button>
          <ToastContainer />
        </>
      );
    };

    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    act(() => screen.getByText('raise').click());

    const warnedAboutKeys = consoleError.mock.calls.some(call =>
      String(call[0]).includes('same key'),
    );
    expect(warnedAboutKeys).toBe(true);
  });
});

describe('auto-dismiss', () => {
  it('removes a toast after its 5s timer plus exit animation', () => {
    vi.useFakeTimers();

    const Harness: React.FC = () => {
      const { addToast, toasts } = useToast();
      return (
        <>
          <span data-testid="count">{toasts.length}</span>
          <button onClick={() => addToast('bye', 'info')}>raise</button>
          <ToastContainer />
        </>
      );
    };

    render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );

    act(() => screen.getByText('raise').click());
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    act(() => void vi.advanceTimersByTime(5000));
    // Still present during the 300ms exit animation.
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    act(() => void vi.advanceTimersByTime(300));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
});

describe('useToast outside a provider', () => {
  it('throws a descriptive error', () => {
    // React logs the boundary-less render failure; that noise is expected here.
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => renderHook(() => useToast())).toThrow(
      /must be used within a ToastProvider/,
    );
  });
});
