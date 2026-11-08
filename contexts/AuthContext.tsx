import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  /** True after the user arrives via a password-reset email link. */
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    let active = true;

    // Check active sessions and set the user. Never leave the app stuck on the
    // loading screen if Supabase is unreachable or misconfigured.
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (active) setUser(session?.user ?? null);
      } catch (err) {
        console.error('[Auth] Failed to restore session:', err);
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    initAuth();

    // Listen for changes on auth state (logged in, signed out, password recovery, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY') setIsPasswordRecovery(true);
      if (event === 'SIGNED_OUT') setIsPasswordRecovery(false);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Auth] Sign out failed:', err);
    } finally {
      // Clear local state even if the network call failed so the user is never trapped.
      setUser(null);
      setIsPasswordRecovery(false);
    }
  }, []);

  const clearPasswordRecovery = useCallback(() => setIsPasswordRecovery(false), []);

  return (
    <AuthContext.Provider value={{ user, loading, isPasswordRecovery, clearPasswordRecovery, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
