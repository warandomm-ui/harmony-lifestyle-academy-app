import React from 'react';
import { SectionHeading } from '../Bilingual';

const FEATURES = [
  {
    icon: '🤖',
    en: 'AI tutor on every chapter',
    bm: 'Tutor AI pada setiap bab',
    bodyEn: 'Explanations, worked examples and quizzes generated for the exact KSSM topic you opened, with Malaysian context.',
    bodyBm: 'Penerangan, contoh dan kuiz dijana untuk topik KSSM yang anda buka, dengan konteks Malaysia.',
  },
  {
    icon: '🧠',
    en: 'Lessons that match your profile',
    bm: 'Pelajaran mengikut profil anda',
    bodyEn: 'Visual, auditory, kinesthetic or reading-led — your assessment results change how each lesson is written.',
    bodyBm: 'Visual, auditori, kinestetik atau bacaan — keputusan penilaian mengubah cara pelajaran ditulis.',
  },
  {
    icon: '👨‍👩‍👧',
    en: 'Parent dashboard',
    bm: 'Papan pemuka ibu bapa',
    bodyEn: 'Parents can follow progress, completed chapters and study time without reading over a shoulder.',
    bodyBm: 'Ibu bapa boleh mengikuti kemajuan, bab yang selesai dan masa belajar.',
  },
  {
    icon: '🏅',
    en: 'XP, badges and leaderboards',
    bm: 'XP, lencana dan papan pendahulu',
    bodyEn: 'Finishing chapters earns XP and badges, with a leaderboard for students who like the push.',
    bodyBm: 'Menyelesaikan bab memberi XP dan lencana, dengan papan pendahulu untuk yang sukakan cabaran.',
  },
  {
    icon: '📝',
    en: 'Smart notebook and planner',
    bm: 'Buku nota pintar dan perancang',
    bodyEn: 'Keep notes, a timetable and a to-do list in the same place you study.',
    bodyBm: 'Simpan nota, jadual waktu dan senarai tugasan di tempat anda belajar.',
  },
  {
    icon: '💬',
    en: 'Community and support',
    bm: 'Komuniti dan sokongan',
    bodyEn: 'Study groups, an idea wall, and counselling hotlines when things get heavy.',
    bodyBm: 'Kumpulan belajar, dinding idea, dan talian kaunseling apabila diperlukan.',
  },
];

const Features: React.FC = () => (
  <section className="py-20 border-t border-[var(--border)]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6">
      <SectionHeading
        en="What you get"
        bm="Apa yang anda dapat"
        subEn="Everything included in the academy, whichever track you take."
        subBm="Semua disertakan dalam akademi, apa pun laluan yang anda ambil."
      />

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(f => (
          <div key={f.en} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
            <span className="text-2xl" aria-hidden="true">
              {f.icon}
            </span>
            <h3 className="font-bold text-[var(--foreground)] mt-4 leading-snug">{f.en}</h3>
            <p lang="ms" className="text-sm text-[var(--muted)]">
              {f.bm}
            </p>
            <p className="mt-3 text-sm text-[var(--foreground)] opacity-75 leading-relaxed">
              {f.bodyEn}
            </p>
            <p lang="ms" className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
              {f.bodyBm}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
