import React, { useEffect, useState } from 'react';
import ThemeToggle from '../../ThemeToggle';

const LINKS = [
  { href: '#catalog', en: 'Subjects', bm: 'Subjek' },
  { href: '#islamic', en: 'Islamic Studies', bm: 'Pengajian Islam' },
  { href: '#how', en: 'How It Works', bm: 'Cara Ia Berfungsi' },
  { href: '#pricing', en: 'Pricing', bm: 'Harga' },
  { href: '#faq', en: 'FAQ', bm: 'Soalan Lazim' },
];

interface LandingNavProps {
  onGetStarted: () => void;
  onLogIn: () => void;
}

const LandingNav: React.FC<LandingNavProps> = ({ onGetStarted, onLogIn }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-colors duration-300 border-b ${
        scrolled
          ? 'bg-[var(--background)]/95 backdrop-blur border-[var(--border)]'
          : 'bg-transparent border-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2 shrink-0" onClick={() => setMenuOpen(false)}>
          <span
            className="h-8 w-8 rounded-lg flex items-center justify-center font-playfair font-bold text-sm"
            style={{ background: '#c9a84c', color: '#0a0a0f' }}
            aria-hidden="true"
          >
            H
          </span>
          <span className="font-playfair font-bold text-[var(--foreground)] hidden sm:block">
            Harmony Lifestyle Academy
          </span>
          <span className="font-playfair font-bold text-[var(--foreground)] sm:hidden">HLA</span>
        </a>

        <ul className="hidden lg:flex items-center gap-6">
          {LINKS.map(l => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                {l.en}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={onLogIn}
            className="hidden sm:inline-flex px-4 py-2 rounded-full text-sm font-semibold text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--foreground)] transition-colors"
          >
            Log Masuk
          </button>
          <button
            onClick={onGetStarted}
            className="px-4 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--primary)' }}
          >
            Mula Sekarang
          </button>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="lg:hidden p-2 rounded-lg text-[var(--foreground)]"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="lg:hidden border-t border-[var(--border)] bg-[var(--background)]">
          <ul className="px-4 py-3 space-y-1">
            {LINKS.map(l => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-baseline gap-2 py-2 text-sm text-[var(--foreground)]"
                >
                  {l.en}
                  <span lang="ms" className="text-xs text-[var(--muted)]">
                    · {l.bm}
                  </span>
                </a>
              </li>
            ))}
            <li className="pt-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onLogIn();
                }}
                className="w-full px-4 py-2 rounded-full text-sm font-semibold text-[var(--foreground)] border border-[var(--border)]"
              >
                Log Masuk
              </button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};

export default LandingNav;
