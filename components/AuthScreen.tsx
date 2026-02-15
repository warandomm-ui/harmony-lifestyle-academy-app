
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../contexts/ToastContext';
import { SpinnerIcon, SparklesIcon, GitHubIcon, GoogleIcon } from './dashboard/Icons';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        addToast('Welcome back to Harmony!', 'success');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        addToast('Success! Please check your email for a confirmation link.', 'success');
      }
    } catch (error: any) {
      addToast(error.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md bento-card p-8 space-y-8 animate-fade-in-up">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-600 text-white text-3xl mb-4 shadow-lg">
            ✨
          </div>
          <h1 className="text-3xl font-black text-[var(--foreground)]">Harmony Academy</h1>
          <p className="text-[var(--muted)] mt-2">
            {isLogin ? 'Sign in to continue your journey.' : 'Create an account to start growing.'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[var(--muted)] mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--secondary)]/30 border-2 border-transparent focus:border-indigo-500 focus:outline-none transition"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-[var(--muted)] mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[var(--secondary)]/30 border-2 border-transparent focus:border-indigo-500 focus:outline-none transition"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20"
          >
            {loading ? <SpinnerIcon /> : isLogin ? 'Sign In' : 'Join the Academy'}
          </button>
        </form>

        <div className="flex items-center gap-4 text-xs font-bold text-[var(--muted)]">
            <div className="flex-1 h-px bg-[var(--border)]"></div>
            <span>SOCIAL LOGIN</span>
            <div className="flex-1 h-px bg-[var(--border)]"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)]/20 transition font-bold text-sm">
                <GitHubIcon className="h-5 w-5" /> GitHub
            </button>
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)]/20 transition font-bold text-sm">
                <GoogleIcon className="h-5 w-5" /> Google
            </button>
        </div>

        <p className="text-center text-sm font-bold text-[var(--muted)]">
          {isLogin ? "Don't have an account?" : "Already a member?"}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-indigo-600 hover:underline"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthScreen;
