import React from 'react';
import { SectionHeading } from '../Bilingual';
import { getSubjectsByTrack, getChapterCount } from '../../../constants/curriculum';

const countChapters = (track: 'core' | 'elective' | 'islamic') =>
  getSubjectsByTrack(track).reduce((sum, s) => sum + getChapterCount(s), 0);

const TwoTracks: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const academicSubjects = getSubjectsByTrack('core').length + getSubjectsByTrack('elective').length;
  const academicChapters = countChapters('core') + countChapters('elective');
  const islamicSubjects = getSubjectsByTrack('islamic').length;
  const islamicChapters = countChapters('islamic');

  return (
    <section className="py-20 border-t border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <SectionHeading
          en="Two tracks, one academy"
          bm="Dua laluan, satu akademi"
          subEn="Take the academic syllabus on its own, or study it alongside our Islamic Studies modules. The choice is yours — and you can change it at any time."
          subBm="Ambil sukatan akademik sahaja, atau pelajarinya bersama modul Pengajian Islam kami. Pilihan di tangan anda — dan boleh diubah bila-bila masa."
        />

        <div className="mt-12 grid md:grid-cols-2 gap-6">
          {/* Academic track */}
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 flex flex-col">
            <span className="text-4xl" aria-hidden="true">
              🎓
            </span>
            <h3 className="font-playfair text-2xl font-bold text-[var(--foreground)] mt-4">
              KSSM Academic
            </h3>
            <p lang="ms" className="text-lg text-[var(--muted)] font-playfair">
              Akademik KSSM
            </p>
            <p className="mt-4 text-sm text-[var(--foreground)] opacity-80">
              Core and elective subjects following the Malaysian KSSM syllabus, from Form 1 through
              the SPM years. Every chapter is bilingual, so you can study a topic in English and
              revise it in Bahasa Melayu.
            </p>
            <p lang="ms" className="mt-2 text-sm text-[var(--muted)]">
              Subjek teras dan elektif mengikut sukatan KSSM, dari Tingkatan 1 hingga tahun SPM.
              Setiap bab dwibahasa.
            </p>
            <div className="mt-6 pt-6 border-t border-[var(--border)] flex gap-8">
              <div>
                <p className="font-playfair text-2xl font-bold text-[var(--foreground)]">
                  {academicSubjects}
                </p>
                <p className="text-xs text-[var(--muted)]">subjects · subjek</p>
              </div>
              <div>
                <p className="font-playfair text-2xl font-bold text-[var(--foreground)]">
                  {academicChapters}
                </p>
                <p className="text-xs text-[var(--muted)]">chapters · bab</p>
              </div>
            </div>
            <a
              href="#catalog"
              className="mt-6 inline-block text-sm font-semibold"
              style={{ color: 'var(--primary)' }}
            >
              See the full catalogue →
            </a>
          </div>

          {/* Islamic track */}
          <div
            className="rounded-3xl border p-8 flex flex-col"
            style={{ borderColor: '#c9a84c40', background: 'linear-gradient(135deg, #c9a84c0a, transparent)' }}
          >
            <span className="text-4xl" aria-hidden="true">
              🕌
            </span>
            <h3 className="font-playfair text-2xl font-bold mt-4" style={{ color: '#c9a84c' }}>
              Islamic Studies
            </h3>
            <p lang="ms" className="text-lg text-[var(--muted)] font-playfair">
              Pengajian Islam
            </p>
            <p className="mt-4 text-sm text-[var(--foreground)] opacity-80">
              Eight modules taught alongside the academic subjects — Quran recitation and tajwid,
              hadith and sunnah, aqidah, fiqh, sirah, character, Arabic, and the KSSM Pendidikan
              Islam syllabus itself.
            </p>
            <p lang="ms" className="mt-2 text-sm text-[var(--muted)]">
              Lapan modul diajar bersama subjek akademik — tilawah dan tajwid, hadis dan sunnah,
              aqidah, fiqh, sirah, akhlak, Bahasa Arab, dan sukatan Pendidikan Islam KSSM.
            </p>
            <div className="mt-6 pt-6 border-t flex gap-8" style={{ borderColor: '#c9a84c30' }}>
              <div>
                <p className="font-playfair text-2xl font-bold" style={{ color: '#c9a84c' }}>
                  {islamicSubjects}
                </p>
                <p className="text-xs text-[var(--muted)]">modules · modul</p>
              </div>
              <div>
                <p className="font-playfair text-2xl font-bold" style={{ color: '#c9a84c' }}>
                  {islamicChapters}
                </p>
                <p className="text-xs text-[var(--muted)]">chapters · bab</p>
              </div>
            </div>
            <a href="#islamic" className="mt-6 inline-block text-sm font-semibold" style={{ color: '#c9a84c' }}>
              See the Islamic modules →
            </a>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-[var(--muted)] max-w-2xl mx-auto">
          Islamic Studies is optional and open to every student, whatever their background. Nothing
          in the academic catalogue is hidden from anyone.
          <span lang="ms" className="block mt-1 opacity-80">
            Pengajian Islam adalah pilihan dan terbuka kepada semua pelajar. Tiada apa-apa dalam
            katalog akademik disembunyikan daripada sesiapa.
          </span>
        </p>

        <div className="mt-8 text-center">
          <button
            onClick={onGetStarted}
            className="px-7 py-3 rounded-full font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--primary)' }}
          >
            Choose your track · Pilih laluan anda
          </button>
        </div>
      </div>
    </section>
  );
};

export default TwoTracks;
