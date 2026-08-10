import React from 'react';
import { SectionHeading } from '../Bilingual';

const STEPS = [
  {
    n: '01',
    icon: '🧭',
    en: 'Take the 360° assessment',
    bm: 'Ambil penilaian 360°',
    bodyEn:
      'A short profile covering behaviour style, mindset, core motivation and learning method. It takes about ten minutes and you only do it once.',
    bodyBm:
      'Profil ringkas merangkumi gaya tingkah laku, pemikiran, motivasi teras dan kaedah pembelajaran. Kira-kira sepuluh minit, sekali sahaja.',
  },
  {
    n: '02',
    icon: '🗺️',
    en: 'Get a path built around you',
    bm: 'Dapatkan laluan yang dibina untuk anda',
    bodyEn:
      'Pick your form level and subjects. Your results shape the order topics are suggested in and how much scaffolding each lesson gives you.',
    bodyBm:
      'Pilih tingkatan dan subjek anda. Keputusan penilaian menentukan susunan topik dan tahap bimbingan setiap pelajaran.',
  },
  {
    n: '03',
    icon: '📚',
    en: 'Learn chapter by chapter',
    bm: 'Belajar bab demi bab',
    bodyEn:
      'Each chapter opens as a lesson with a clear explanation, key points, a worked example, a practice question and a five-question quiz — at easy, medium or hard.',
    bodyBm:
      'Setiap bab dibuka sebagai pelajaran dengan penerangan jelas, poin penting, contoh berpandu, soalan latihan dan kuiz lima soalan — tahap mudah, sederhana atau sukar.',
  },
];

const HowItWorks: React.FC = () => (
  <section id="how" className="py-20 border-t border-[var(--border)] scroll-mt-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <SectionHeading
        en="How it works"
        bm="Cara ia berfungsi"
        subEn="Three steps from signing up to your first lesson."
        subBm="Tiga langkah dari mendaftar hingga pelajaran pertama anda."
      />

      <div className="mt-12 grid md:grid-cols-3 gap-6">
        {STEPS.map(s => (
          <div key={s.n} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-7">
            <div className="flex items-center justify-between">
              <span className="text-3xl" aria-hidden="true">
                {s.icon}
              </span>
              <span
                className="font-playfair text-3xl font-bold opacity-25"
                style={{ color: 'var(--primary)' }}
              >
                {s.n}
              </span>
            </div>
            <h3 className="font-bold text-[var(--foreground)] mt-5 leading-snug">{s.en}</h3>
            <p lang="ms" className="text-sm text-[var(--muted)]">
              {s.bm}
            </p>
            <p className="mt-4 text-sm text-[var(--foreground)] opacity-80 leading-relaxed">
              {s.bodyEn}
            </p>
            <p lang="ms" className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
              {s.bodyBm}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
