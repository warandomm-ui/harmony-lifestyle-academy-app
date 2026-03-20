import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useToast } from '../contexts/ToastContext';
import { GitHubIcon, GoogleIcon } from './dashboard/Icons';

/* ââ Geometric ornament â exact SVG from hla-welcome.html ââ */
const GeometricOrnament = () => (
  <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
    <circle cx="250" cy="250" r="200" stroke="#c9a84c" strokeWidth="1"/>
    <circle cx="250" cy="250" r="160" stroke="#c9a84c" strokeWidth="0.5"/>
    <circle cx="250" cy="250" r="120" stroke="#c9a84c" strokeWidth="1"/>
    <polygon points="250,50 450,200 450,350 250,450 50,350 50,200" stroke="#c9a84c" strokeWidth="0.5" fill="none"/>
    <polygon points="250,100 400,200 400,330 250,420 100,330 100,200" stroke="#c9a84c" strokeWidth="0.5" fill="none"/>
    <line x1="250" y1="50" x2="250" y2="450" stroke="#c9a84c" strokeWidth="0.3"/>
    <line x1="50" y1="250" x2="450" y2="250" stroke="#c9a84c" strokeWidth="0.3"/>
    <line x1="109" y1="109" x2="391" y2="391" stroke="#c9a84c" strokeWidth="0.3"/>
    <line x1="391" y1="109" x2="109" y2="391" stroke="#c9a84c" strokeWidth="0.3"/>
    <circle cx="250" cy="250" r="8" fill="#c9a84c" opacity="0.5"/>
  </svg>
);

/* ââ Small corner ornament for the form card ââ */
const CornerOrnament = ({ style }: { style?: React.CSSProperties }) => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 60, height: 60, ...style }}>
    <line x1="0" y1="60" x2="60" y2="0" stroke="#c9a84c" strokeWidth="0.5" opacity="0.6"/>
    <line x1="0" y1="40" x2="40" y2="0" stroke="#c9a84c" strokeWidth="0.5" opacity="0.4"/>
    <line x1="0" y1="20" x2="20" y2="0" stroke="#c9a84c" strokeWidth="0.5" opacity="0.3"/>
    <circle cx="0" cy="60" r="3" fill="#c9a84c" opacity="0.4"/>
  </svg>
);

/* ââ Spinner ââ */
const SpinnerIcon = () => (
  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
  </svg>
);

/* ââ Eye icons for password visibility toggle ââ */
const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const { addToast } = useToast();

  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider });
      if (error) throw error;
    } catch (error: any) {
      addToast(error.message || `${provider} login failed`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      addToast('Please enter your email address.', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      addToast('Password reset link sent! Check your email inbox.', 'success');
      setMode('login');
    } catch (error: any) {
      addToast(error.message || 'Failed to send reset email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgot) return handleForgotPassword(e);

    /* Client-side validation */
    if (!email.trim()) {
      addToast('Please enter your email address.', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        addToast('Welcome back to Harmony!', 'success');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName || undefined } },
        });
        if (error) throw error;
        addToast('Success! Please check your email for a confirmation link.', 'success');
      }
    } catch (error: any) {
      addToast(error.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ââ inline style tokens ââ */
  const C = {
    deep: '#0a0a0f',
    navy: '#0d1b2a',
    gold: '#c9a84c',
    goldLight: '#e8c97a',
    cream: '#f5f0e8',
    muted: '#8a8a9a',
    accent: '#2a4a6b',
    border: 'rgba(201,168,76,0.25)',
    borderDim: 'rgba(201,168,76,0.12)',
  };

  const font = {
    playfair: "'Playfair Display', Georgia, serif",
    cormorant: "'Cormorant Garamond', Georgia, serif",
    dmSans: "'DM Sans', system-ui, sans-serif",
  };

  /* ââ Shared input style ââ */
  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${focusedField === field ? C.gold : 'rgba(201,168,76,0.2)'}`,
    color: C.cream,
    padding: '0.85rem 1.1rem',
    fontFamily: font.dmSans,
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box' as const,
  });

  const labelStyle = (field: string): React.CSSProperties => ({
    display: 'block',
    fontSize: '0.65rem',
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    color: focusedField === field ? C.gold : C.muted,
    marginBottom: '0.5rem',
    transition: 'color 0.3s',
  });

  /* ââ Header text based on mode ââ */
  const headerTag = isForgot ? 'Password Recovery' : isLogin ? 'Member Portal' : 'Join the Academy';
  const headerTitle = isForgot
    ? <>Reset Your <em style={{ fontStyle: 'italic', color: C.gold, fontFamily: font.cormorant, fontWeight: 300 }}>Password</em></>
    : isLogin
    ? <>Welcome <em style={{ fontStyle: 'italic', color: C.gold, fontFamily: font.cormorant, fontWeight: 300 }}>Back</em></>
    : <>Begin Your <em style={{ fontStyle: 'italic', color: C.gold, fontFamily: font.cormorant, fontWeight: 300 }}>Journey</em></>;
  const headerSub = isForgot
    ? "Enter your email and we'll send you a reset link."
    : isLogin
    ? 'Sign in to continue your path of growth.'
    : 'Create your account and start transforming today.';

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: C.deep,
      fontFamily: font.dmSans, color: C.cream, overflowX: 'hidden',
    }}>

      {/* ââ Left panel â hero / branding ââ */}
      <div style={{
        flex: '0 0 55%', position: 'relative', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', padding: '3rem 4rem',
        background: `
          radial-gradient(ellipse 80% 60% at 60% 50%, rgba(42,74,107,0.35) 0%, transparent 65%),
          radial-gradient(ellipse 40% 40% at 10% 90%, rgba(201,168,76,0.07) 0%, transparent 50%),
          linear-gradient(135deg, #0a0a0f 0%, #0d1b2a 60%, #0a0a0f 100%)
        `,
        borderRight: `1px solid ${C.borderDim}`,
      }} className="auth-hero-panel">

        {/* Geometric ornament */}
        <div style={{ position: 'absolute', right: '-60px', top: '50%', transform: 'translateY(-50%)', width: '520px', height: '520px', opacity: 0.13, pointerEvents: 'none' }}>
          <GeometricOrnament />
        </div>

        {/* Top â wordmark */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ fontFamily: font.playfair, fontSize: '1.35rem', fontWeight: 700, color: C.gold, letterSpacing: '0.04em' }}>
            Harmony<span style={{ color: C.cream, fontWeight: 300 }}> Lifestyle Academy</span>
          </div>
        </div>

        {/* Middle â hero copy */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '560px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            border: `1px solid rgba(201,168,76,0.4)`,
            padding: '0.35rem 1rem', marginBottom: '2rem',
            fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: C.gold,
            animation: 'hla-fadeUp 0.6s ease 0.2s both',
          }}>
            <span style={{ width: 6, height: 6, background: C.gold, borderRadius: '50%', display: 'inline-block', animation: 'hla-pulse 2s infinite', flexShrink: 0 }}/>
            Akademi Kemahiran Hidup Malaysia
          </div>

          <h1 style={{
            fontFamily: font.playfair, fontSize: 'clamp(2.6rem, 4vw, 4.2rem)',
            fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.02em',
            marginBottom: '1.5rem', animation: 'hla-fadeUp 0.6s ease 0.4s both',
          }}>
            Shape Your{' '}
            <em style={{ fontStyle: 'italic', color: C.gold, fontFamily: font.cormorant, fontWeight: 300, fontSize: '1.12em' }}>Soul & Mind</em>
            <br />for Tomorrow
          </h1>

          <p style={{
            fontSize: '1rem', color: C.muted, lineHeight: 1.75, fontWeight: 300,
            maxWidth: '460px', animation: 'hla-fadeUp 0.6s ease 0.6s both',
          }}>
            A holistic transformation programme for students â combining self-awareness, life values, and practical skills for the modern world.
          </p>
        </div>

        {/* Bottom â stats */}
        <div style={{
          position: 'relative', zIndex: 2, display: 'flex', gap: '3rem',
          borderTop: `1px solid rgba(201,168,76,0.2)`,
          paddingTop: '1.75rem', animation: 'hla-fadeUp 0.6s ease 0.8s both',
        }}>
          {[
            { num: '500+', label: 'Students Enrolled' },
            { num: '5', label: 'Life Pillars' },
            { num: '98%', label: 'Parent Satisfaction' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: font.playfair, fontSize: '2rem', fontWeight: 700, color: C.gold, lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: C.muted, marginTop: '0.3rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ââ Right panel â auth form ââ */}
      <div className="auth-right-panel" style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(1.25rem, 5vw, 2.5rem)', background: C.deep,
        position: 'relative', minWidth: 0, overflowY: 'auto',
      }}>
        <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.5 }}><CornerOrnament /></div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, opacity: 0.5, transform: 'rotate(180deg)' }}><CornerOrnament /></div>

        <div className="auth-form-card" style={{ width: '100%', maxWidth: '420px', animation: 'hla-fadeUp 0.7s ease 0.3s both' }}>

          {/* Mobile-only wordmark */}
          <div className="auth-mobile-logo" style={{
            fontFamily: "'Playfair Display', Georgia, serif", fontSize: '1.3rem', fontWeight: 700,
            color: '#c9a84c', marginBottom: '1.5rem', textAlign: 'center', display: 'none',
          }}>
            Harmony<span style={{ color: '#f5f0e8', fontWeight: 300 }}> Lifestyle Academy</span>
          </div>

          {/* Form header */}
          <div className="auth-header-mb" style={{ marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: C.gold, marginBottom: '0.75rem' }}>
              {headerTag}
            </div>
            <h2 style={{ fontFamily: font.playfair, fontSize: '2.2rem', fontWeight: 700, lineHeight: 1.15, color: C.cream }}>
              {headerTitle}
            </h2>
            <p style={{ color: C.muted, fontSize: '0.88rem', marginTop: '0.5rem', fontWeight: 300 }}>
              {headerSub}
            </p>
          </div>

          {/* Gold divider */}
          <div className="auth-divider-mb" style={{ height: 1, background: `linear-gradient(90deg, ${C.gold}, transparent)`, marginBottom: '2rem', opacity: 0.5 }}/>

          {/* Form */}
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Full Name â register only */}
            {isRegister && (
              <div>
                <label style={labelStyle('fullName')}>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Your full name"
                  style={inputStyle('fullName')}
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label style={labelStyle('email')}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="you@example.com"
                required
                style={inputStyle('email')}
              />
            </div>

            {/* Password â hidden on forgot mode */}
            {!isForgot && (
              <div>
                <label style={labelStyle('password')}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder={isRegister ? 'Min 6 characters' : 'â¢â¢â¢â¢â¢â¢â¢â¢'}
                    required
                    minLength={6}
                    style={{ ...inputStyle('password'), paddingRight: '3rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: C.muted, cursor: 'pointer',
                      padding: '0.25rem', display: 'flex', alignItems: 'center',
                      transition: 'color 0.3s',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.gold; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.muted; }}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                {/* Forgot password link â login mode only */}
                {isLogin && (
                  <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      style={{
                        background: 'none', border: 'none', color: C.muted, cursor: 'pointer',
                        fontFamily: font.dmSans, fontSize: '0.75rem', padding: 0,
                        transition: 'color 0.3s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.gold; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.muted; }}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Primary CTA */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? 'rgba(201,168,76,0.5)' : C.gold, color: '#0a0a0f', border: 'none',
                padding: '1rem 2rem', fontFamily: font.dmSans, fontWeight: 500, fontSize: '0.85rem',
                letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s, transform 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '0.5rem', width: '100%', marginTop: '0.25rem',
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = C.goldLight; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = C.gold; }}
            >
              {loading
                ? <SpinnerIcon />
                : isForgot ? 'Send Reset Link'
                : isLogin ? 'Sign In'
                : 'Join the Academy'
              }
            </button>
          </form>

          {/* Social login â not on forgot mode */}
          {!isForgot && (
            <>
              <div className="auth-social-mt" style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.75rem 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.15)' }}/>
                <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: C.muted }}>or continue with</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(201,168,76,0.15)' }}/>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {([
                  { provider: 'github' as const, Icon: GitHubIcon, label: 'GitHub' },
                  { provider: 'google' as const, Icon: GoogleIcon, label: 'Google' },
                ]).map(({ provider, Icon, label }) => (
                  <button
                    key={provider}
                    onClick={() => handleSocialLogin(provider)}
                    disabled={loading}
                    style={{
                      background: 'transparent', border: `1px solid rgba(201,168,76,0.25)`,
                      color: C.cream, padding: '0.75rem 1rem', fontFamily: font.dmSans,
                      fontSize: '0.82rem', fontWeight: 500,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      opacity: loading ? 0.5 : 1, transition: 'border-color 0.3s, color 0.3s',
                      letterSpacing: '0.05em',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.gold; (e.currentTarget as HTMLButtonElement).style.color = C.gold; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(201,168,76,0.25)'; (e.currentTarget as HTMLButtonElement).style.color = C.cream; }}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Toggle sign-in / register / back from forgot */}
          <p className="auth-toggle-mt" style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.82rem', color: C.muted, fontWeight: 300 }}>
            {isForgot ? (
              <>
                Remember your password?{' '}
                <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', fontFamily: font.dmSans, fontSize: '0.82rem', padding: 0, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  Back to Sign In
                </button>
              </>
            ) : isLogin ? (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', fontFamily: font.dmSans, fontSize: '0.82rem', padding: 0, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  Register
                </button>
              </>
            ) : (
              <>
                Already a member?{' '}
                <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: C.gold, cursor: 'pointer', fontFamily: font.dmSans, fontSize: '0.82rem', padding: 0, textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                  Sign In
                </button>
              </>
            )}
          </p>

          {/* Footer */}
          <p className="auth-footer-mt" style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '0.7rem', letterSpacing: '0.05em', color: 'rgba(138,138,154,0.5)' }}>
            &copy; {new Date().getFullYear()} Harmony Lifestyle Academy
          </p>
        </div>
      </div>

      {/* ââ Keyframe animations ââ */}
      <style>{`
        @keyframes hla-fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes hla-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.4; transform: scale(0.75); }
        }
        .auth-hero-panel { display: flex; overflow: hidden; }
        @media (max-width: 767px) {
          .auth-hero-panel { display: none !important; }
          .auth-mobile-logo { display: block !important; }
          .auth-right-panel {
            align-items: flex-start !important;
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
          }
          .auth-form-card .auth-header-mb { margin-bottom: 1.5rem !important; }
          .auth-form-card .auth-divider-mb { margin-bottom: 1.25rem !important; }
          .auth-form-card .auth-social-mt { margin-top: 1.25rem !important; }
          .auth-form-card .auth-toggle-mt { margin-top: 1.25rem !important; }
          .auth-form-card .auth-footer-mt { margin-top: 1.25rem !important; }
        }
        input::placeholder { color: rgba(138,138,154,0.5); }
        input:-webkit-autofill, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0f1720 inset !important;
          -webkit-text-fill-color: #f5f0e8 !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
};

export default AuthScreen;
