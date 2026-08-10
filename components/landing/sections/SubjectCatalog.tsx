import React, { useState } from 'react';
import { SectionHeading } from '../Bilingual';
import {
  SUBJECTS,
  TINGKATAN,
  TINGKATAN_LABELS,
  TRACK_ORDER,
  TRACK_LABELS,
  getChapterCount,
  type Subject,
  type TingkatanKey,
} from '../../../constants/curriculum';

// Public catalogue. Reads the same data the in-app School Academy renders,
// so what a visitor is shown here is literally what they get after signing up.

const SubjectCard: React.FC<{ subject: Subject; tingkatan: TingkatanKey }> = ({
  subject,
  tingkatan,
}) => {
  const [open, setOpen] = useState(false);
  const chapters = subject.chapters[tingkatan] ?? [];
  const total = getChapterCount(subject);

  return (
    <div
      className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-colors"
      style={open ? { borderColor: subject.color } : undefined}
    >
      <div className="flex items-start gap-3">
        <span className="text-3xl leading-none shrink-0" aria-hidden="true">
          {subject.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-[var(--foreground)] leading-snug">{subject.name}</h4>
          <p lang="ms" className="text-sm text-[var(--muted)]">
            {subject.nameBM}
          </p>
        </div>
      </div>

      {subject.blurb && (
        <p className="mt-3 text-xs text-[var(--muted)] leading-relaxed">{subject.blurb}</p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: `${subject.color}18`, color: subject.color }}
        >
          {chapters.length > 0
            ? `${chapters.length} chapters · ${total} total`
            : `Not offered at this level`}
        </span>

        {chapters.length > 0 && (
          <button
            onClick={() => setOpen(o => !o)}
            className="text-xs font-semibold text-[var(--muted)] hover:text-[var(--foreground)] transition-colors shrink-0"
            aria-expanded={open}
          >
            {open ? 'Hide' : 'Syllabus'} {open ? '↑' : '↓'}
          </button>
        )}
      </div>

      {open && chapters.length > 0 && (
        <ol className="mt-4 pt-4 border-t border-[var(--border)] space-y-2">
          {chapters.map((c, i) => (
            <li key={c.id} className="flex gap-2.5 text-xs">
              <span
                className="shrink-0 w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] text-white"
                style={{ background: subject.color }}
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-[var(--foreground)]">{c.title}</span>
                <span lang="ms" className="block text-[var(--muted)]">
                  {c.titleBM}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

const SubjectCatalog: React.FC = () => {
  const [tingkatan, setTingkatan] = useState<TingkatanKey>('T4');

  return (
    <section id="catalog" className="py-20 border-t border-[var(--border)] scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          en="The full course structure"
          bm="Struktur kursus penuh"
          subEn="Pick a form level to see exactly which chapters are covered. Every subject is available to every student."
          subBm="Pilih tingkatan untuk melihat bab yang dirangkumi. Setiap subjek terbuka kepada semua pelajar."
        />

        {/* Form level filter */}
        <div
          className="mt-10 flex gap-2 overflow-x-auto no-scrollbar justify-start sm:justify-center pb-1"
          role="tablist"
          aria-label="Form level"
        >
          {TINGKATAN.map(t => {
            const active = tingkatan === t;
            return (
              <button
                key={t}
                role="tab"
                aria-selected={active}
                onClick={() => setTingkatan(t)}
                className="shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors border"
                style={
                  active
                    ? { background: 'var(--primary)', color: '#fff', borderColor: 'var(--primary)' }
                    : { background: 'transparent', color: 'var(--muted)', borderColor: 'var(--border)' }
                }
              >
                {TINGKATAN_LABELS.universal[t]}
                <span lang="ms" className="hidden sm:inline opacity-70">
                  {' '}
                  · {TINGKATAN_LABELS.muslim[t]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grouped by track */}
        <div className="mt-12 space-y-14">
          {TRACK_ORDER.map(track => {
            const subjects = SUBJECTS.filter(
              s => s.track === track && (s.chapters[tingkatan]?.length ?? 0) > 0
            );
            if (subjects.length === 0) return null;
            const label = TRACK_LABELS[track];
            const accent = track === 'islamic' ? '#c9a84c' : 'var(--primary)';

            return (
              <div key={track}>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-5">
                  <h3 className="font-playfair text-2xl font-bold" style={{ color: accent }}>
                    {label.en}
                  </h3>
                  <span lang="ms" className="font-playfair text-lg text-[var(--muted)]">
                    {label.bm}
                  </span>
                  <span className="text-xs text-[var(--muted)] w-full sm:w-auto">
                    {label.description}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjects.map(s => (
                    <SubjectCard key={s.id} subject={s} tingkatan={tingkatan} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SubjectCatalog;
