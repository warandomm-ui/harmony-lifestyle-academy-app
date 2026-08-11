import React from 'react';

// ───────────────────────────────────────────────────────────
// Bilingual primitives for the public landing page.
//
// Unlike the dashboard — where `dashboardMode` doubles as a
// language switch (muslim → BM, universal → EN) — the landing
// page shows BOTH languages to every visitor. A prospective
// student has not told us anything about themselves yet.
// ───────────────────────────────────────────────────────────

interface BilingualProps {
  en: string;
  bm: string;
  className?: string;
  bmClassName?: string;
  /** Render as a single line: "English · Bahasa Melayu". */
  inline?: boolean;
  as?: keyof JSX.IntrinsicElements;
}

/** English primary, Bahasa Melayu secondary underneath. */
export const Bilingual: React.FC<BilingualProps> = ({
  en,
  bm,
  className = '',
  bmClassName = '',
  inline = false,
  as: Tag = 'div',
}) => {
  if (inline) {
    return (
      <Tag className={className}>
        {en} <span className={`text-[var(--muted)] ${bmClassName}`}>· {bm}</span>
      </Tag>
    );
  }

  return (
    <Tag className={className}>
      <span className="block">{en}</span>
      <span lang="ms" className={`block text-[var(--muted)] ${bmClassName}`}>
        {bm}
      </span>
    </Tag>
  );
};

/** Section eyebrow — small uppercase label above a heading. */
export const SectionEyebrow: React.FC<{ en: string; bm: string; accent?: string }> = ({
  en,
  bm,
  accent = 'var(--primary)',
}) => (
  <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: accent }}>
    {en} <span className="opacity-60">· {bm}</span>
  </p>
);

/** Section heading + supporting paragraph, both bilingual. */
export const SectionHeading: React.FC<{
  en: string;
  bm: string;
  subEn?: string;
  subBm?: string;
  centered?: boolean;
}> = ({ en, bm, subEn, subBm, centered = true }) => (
  <div className={centered ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}>
    <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-[var(--foreground)] leading-tight">
      {en}
    </h2>
    <p lang="ms" className="font-playfair text-xl sm:text-2xl text-[var(--muted)] mt-1">
      {bm}
    </p>
    {(subEn || subBm) && (
      <div className="mt-4 space-y-1">
        {subEn && <p className="text-[var(--foreground)] opacity-80">{subEn}</p>}
        {subBm && <p lang="ms" className="text-sm text-[var(--muted)]">{subBm}</p>}
      </div>
    )}
  </div>
);

export default Bilingual;
