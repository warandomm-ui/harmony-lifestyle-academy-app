import React from 'react';
import { LinkedInIcon } from '../../dashboard/Icons';

const LandingFooter: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => (
  <>
    {/* Final CTA */}
    <section className="py-20 border-t border-[var(--border)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight">
          Your next chapter starts today
        </h2>
        <p lang="ms" className="font-playfair text-xl sm:text-2xl text-[var(--muted)] mt-1">
          Bab seterusnya bermula hari ini
        </p>
        <p className="mt-5 text-[var(--foreground)] opacity-80">
          Sign up free, take the assessment, and open your first chapter in under fifteen minutes.
        </p>
        <p lang="ms" className="mt-2 text-sm text-[var(--muted)]">
          Daftar percuma, ambil penilaian, dan buka bab pertama anda dalam masa kurang lima belas
          minit.
        </p>
        <button
          onClick={onGetStarted}
          className="mt-8 px-8 py-4 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary)' }}
        >
          Create your free account · Buka akaun percuma
        </button>
      </div>
    </section>

    <footer className="border-t border-[var(--border)] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span
            className="h-8 w-8 rounded-lg flex items-center justify-center font-playfair font-bold text-sm"
            style={{ background: '#c9a84c', color: '#0a0a0f' }}
            aria-hidden="true"
          >
            H
          </span>
          <span className="font-playfair font-bold text-[var(--foreground)]">
            Harmony Lifestyle Academy
          </span>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-[var(--muted)]">
          <a href="#catalog" className="hover:text-[var(--foreground)] transition-colors">
            Subjects
          </a>
          <a href="#islamic" className="hover:text-[var(--foreground)] transition-colors">
            Islamic Studies
          </a>
          <a href="#how" className="hover:text-[var(--foreground)] transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="hover:text-[var(--foreground)] transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-[var(--foreground)] transition-colors">
            FAQ
          </a>
        </nav>

        <a
          href="https://www.linkedin.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
        >
          <LinkedInIcon className="h-5 w-5" />
        </a>
      </div>

      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        &copy; {new Date().getFullYear()} Harmony Lifestyle Academy. All rights reserved. · Hak cipta
        terpelihara.
      </p>
    </footer>
  </>
);

export default LandingFooter;
