import React, { useState } from 'react';
import { SectionHeading } from '../Bilingual';

const FAQS = [
  {
    qEn: 'Who is this for? I thought Form 1 students were 13.',
    qBm: 'Untuk siapa ini? Bukankah pelajar Tingkatan 1 berumur 13 tahun?',
    aEn:
      'The academy is for students aged 15 and above. We still carry the complete Form 1 to Form 5 syllabus because most students at that age need to go back and shore up earlier topics — Form 2 algebra before Add Maths, Form 3 trigonometry before the SPM papers. You get the whole ladder, not just the top two rungs.',
    aBm:
      'Akademi ini untuk pelajar berumur 15 tahun ke atas. Kami tetap menyediakan sukatan penuh Tingkatan 1 hingga 5 kerana kebanyakan pelajar pada usia itu perlu mengulang topik terdahulu — algebra Tingkatan 2 sebelum Matematik Tambahan, trigonometri Tingkatan 3 sebelum kertas SPM.',
  },
  {
    qEn: 'Do I have to take the Islamic Studies modules?',
    qBm: 'Adakah saya wajib mengambil modul Pengajian Islam?',
    aEn:
      'No. They are entirely optional and sit alongside the academic subjects. Any student can take them, and any student can skip them — the academic catalogue is identical either way.',
    aBm:
      'Tidak. Ia pilihan sepenuhnya dan berada bersebelahan subjek akademik. Mana-mana pelajar boleh mengambilnya atau melangkaunya — katalog akademik tetap sama.',
  },
  {
    qEn: 'Is the syllabus aligned to KSSM?',
    qBm: 'Adakah sukatan ini selaras dengan KSSM?',
    aEn:
      'Yes. Chapters follow the KSSM structure for each form level, and lessons are written with Malaysian context — Ringgit for money, local examples, SPM-style questions.',
    aBm:
      'Ya. Bab-bab mengikut struktur KSSM bagi setiap tingkatan, dan pelajaran ditulis dengan konteks Malaysia — Ringgit, contoh tempatan, soalan bergaya SPM.',
  },
  {
    qEn: 'What language are the lessons in?',
    qBm: 'Pelajaran dalam bahasa apa?',
    aEn:
      'Every chapter is titled in both English and Bahasa Melayu, and lessons can be generated in either. Many students read a topic in one language and revise it in the other.',
    aBm:
      'Setiap bab bertajuk dalam Bahasa Inggeris dan Bahasa Melayu, dan pelajaran boleh dijana dalam mana-mana bahasa.',
  },
  {
    qEn: 'Are the lessons AI-generated? Can I trust them?',
    qBm: 'Adakah pelajaran dijana AI? Bolehkah dipercayai?',
    aEn:
      'Lessons are AI-generated against a fixed, human-curated chapter list — the AI decides how a topic is explained, not which topics exist. Treat it as a tutor that is always available, not as a replacement for your teacher or textbook. Islamic content that quotes a hadith always carries its narrator and source so it can be checked.',
    aBm:
      'Pelajaran dijana AI berdasarkan senarai bab tetap yang disusun manusia — AI menentukan cara topik diterangkan, bukan topik mana yang wujud. Anggap ia tutor yang sentiasa ada, bukan pengganti guru atau buku teks.',
  },
  {
    qEn: 'Can my parents see what I am doing?',
    qBm: 'Bolehkah ibu bapa saya melihat apa yang saya buat?',
    aEn:
      'There is a parent dashboard showing progress, completed chapters and study time. It shows activity, not your private notes or chats.',
    aBm:
      'Terdapat papan pemuka ibu bapa yang menunjukkan kemajuan, bab yang selesai dan masa belajar. Ia menunjukkan aktiviti, bukan nota atau perbualan peribadi anda.',
  },
];

const Faq: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 border-t border-[var(--border)] scroll-mt-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <SectionHeading en="Questions" bm="Soalan lazim" />

        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.qEn}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full text-left px-6 py-5 flex items-start justify-between gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="min-w-0">
                    <span className="block font-semibold text-[var(--foreground)]">{f.qEn}</span>
                    <span lang="ms" className="block text-sm text-[var(--muted)] mt-0.5">
                      {f.qBm}
                    </span>
                  </span>
                  <svg
                    className={`h-5 w-5 shrink-0 mt-0.5 text-[var(--muted)] transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 -mt-1">
                    <p className="text-sm text-[var(--foreground)] opacity-80 leading-relaxed">
                      {f.aEn}
                    </p>
                    <p lang="ms" className="mt-3 text-sm text-[var(--muted)] leading-relaxed">
                      {f.aBm}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
