import React from 'react';
import { TOTAL_SUBJECTS, TOTAL_CHAPTERS, getSubjectsByTrack } from '../../../constants/curriculum';

interface HeroProps {
  onGetStarted: () => void;
}

/* Geometric ornament, matching the motif already used on AuthScreen. */
const Ornament = () => (
  <svg
    viewBox="0 0 500 500"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-full"
    aria-hidden="true"
  >
    <circle cx="250" cy="250" r="200" stroke="#c9a84c" strokeWidth="1" />
    <circle cx="250" cy="250" r="160" stroke="#c9a84c" strokeWidth="0.5" />
    <circle cx="250" cy="250" r="120" stroke="#c9a84c" strokeWidth="1" />
    <polygon points="250,50 450,200 450,350 250,450 50,350 50,200" stroke="#c9a84c" strokeWidth="0.5" fill="none" />
    <polygon points="250,100 400,200 400,330 250,420 100,330 100,200" stroke="#c9a84c" strokeWidth="0.5" fill="none" />
    <line x1="250" y1="50" x2="250" y2="450" stroke="#c9a84c" strokeWidth="0.3" />
    <line x1="50" y1="250" x2="450" y2="250" stroke="#c9a84c" strokeWidth="0.3" />
    <line x1="109" y1="109" x2="391" y2="391" stroke="#c9a84c" strokeWidth="0.3" />
    <line x1="391" y1="109" x2="109" y2="391" stroke="#c9a84c" strokeWidth="0.3" />
    <circle cx="250" cy="250" r="8" fill="#c9a84c" opacity="0.5" />
  </svg>
);

const Hero: React.FC<HeroProps> = ({ onGetStarted }) => {
  const islamicCount = getSubjectsByTrack('islamic').length;

  const stats = [
    { value: `${TOTAL_SUBJECTS}`, en: 'subjects', bm: 'subjek' },
    { value: `${TOTAL_CHAPTERS}+`, en: 'chapters', bm: 'bab' },
    { value: 'Form 1–5', en: 'full coverage', bm: 'liputan penuh' },
    { value: `${islamicCount}`, en: 'Islamic modules', bm: 'modul Islam' },
  ];

  return (
    <section id="top" className="relative overflow-hidden">
      {/* Ambient ornament */}
      <div className="pointer-events-none absolute -right-32 -top-24 w-[520px] h-[520px] opacity-[0.13] hidden md:block">
        <Ornament />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="max-w-3xl">
          <span
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border"
            style={{ borderColor: '#c9a84c55', color: '#c9a84c', background: '#c9a84c12' }}
          >
            KSSM-aligned · Selaras KSSM
          </span>

          <h1 className="font-playfair text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--foreground)] mt-6 leading-[1.1]">
            Tuition that adapts to how you actually learn
          </h1>
          <p
            lang="ms"
            className="font-playfair text-2xl sm:text-3xl lg:text-4xl mt-2 leading-tight"
            style={{ color: 'var(--muted)' }}
          >
            Tuisyen yang menyesuaikan cara anda belajar
          </p>

          <p className="mt-7 text-lg text-[var(--foreground)] opacity-85 max-w-2xl">
            For students <strong>15 and above</strong>, covering the complete{' '}
            <strong>Tingkatan 1 to Tingkatan 5</strong> syllabus — so you can revise what you missed
            and push ahead to SPM at the same time.
          </p>
          <p lang="ms" className="mt-3 text-base text-[var(--muted)] max-w-2xl">
            Untuk pelajar <strong>15 tahun ke atas</strong>, merangkumi sukatan penuh{' '}
            <strong>Tingkatan 1 hingga Tingkatan 5</strong> — ulang kaji apa yang tertinggal sambil
            maju ke SPM.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onGetStarted}
              className="px-7 py-3.5 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--primary)' }}
            >
              Start free · Mula percuma
            </button>
            <a
              href="#catalog"
              className="px-7 py-3.5 rounded-full font-semibold text-center text-[var(--foreground)] border border-[var(--border)] hover:border-[var(--foreground)] transition-colors"
            >
              Browse subjects · Lihat subjek
            </a>
          </div>

          {/* Trust strip — counts come straight from constants/curriculum.ts */}
          <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
            {stats.map(s => (
              <div key={s.en}>
                <dt className="font-playfair text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
                  {s.value}
                </dt>
                <dd className="text-xs text-[var(--muted)] mt-1">
                  {s.en}
                  <span lang="ms" className="block opacity-70">
                    {s.bm}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
};

export default Hero;
