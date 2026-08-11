import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const getSessionMock = vi.fn();
const signOutMock = vi.fn();
const onAuthStateChangeMock = vi.fn();
const unsubscribeMock = vi.fn();

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: getSessionMock,
      signOut: signOutMock,
      onAuthStateChange: onAuthStateChangeMock,
    },
  },
}));

const { AuthProvider, useAuth } = await import('./AuthContext');

function AuthProbe() {
  const { user, loading, signOut } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user-email">{user?.email ?? 'none'}</span>
      <button onClick={() => signOut()}>sign out</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    onAuthStateChangeMock.mockReturnValue({ data: { subscription: { unsubscribe: unsubscribeMock } } });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('starts loading, then resolves the current session', async () => {
    getSessionMock.mockResolvedValue({ data: { session: { user: { email: 'a@b.com' } } } });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user-email').textContent).toBe('a@b.com');
  });

  it('reports no user when there is no active session', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user-email').textContent).toBe('none');
  });

  it('updates the user when the auth state change listener fires', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    let capturedCallback: ((event: string, session: any) => void) | undefined;
    onAuthStateChangeMock.mockImplementation((cb) => {
      capturedCallback = cb;
      return { data: { subscription: { unsubscribe: unsubscribeMock } } };
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user-email').textContent).toBe('none');

    act(() => {
      capturedCallback?.('SIGNED_IN', { user: { email: 'new@user.com' } });
    });

    expect(screen.getByTestId('user-email').textContent).toBe('new@user.com');
  });

  it('unsubscribes from auth state changes on unmount', async () => {
    getSessionMock.mockResolvedValue({ data: { session: null } });
    const { unmount } = render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    unmount();
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('calls supabase.auth.signOut when signOut is invoked', async () => {
    getSessionMock.mockResolvedValue({ data: { session: { user: { email: 'a@b.com' } } } });
    signOutMock.mockResolvedValue({ error: null });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    await act(async () => {
      screen.getByText('sign out').click();
    });

    expect(signOutMock).toHaveBeenCalledTimes(1);
  });

  it('throws when used outside an AuthProvider', () => {
    const originalError = console.error;
    console.error = () => {};
    expect(() => render(<AuthProbe />)).toThrow(/useAuth must be used within an AuthProvider/);
    console.error = originalError;
  });
});
