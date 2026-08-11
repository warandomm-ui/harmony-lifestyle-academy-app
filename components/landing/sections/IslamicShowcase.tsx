import React from 'react';
import { SectionHeading } from '../Bilingual';
import { getSubjectsByTrack, getChapterCount, TINGKATAN } from '../../../constants/curriculum';

const GOLD = '#c9a84c';

const IslamicShowcase: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  const modules = getSubjectsByTrack('islamic');

  return (
    <section
      id="islamic"
      className="py-20 border-t scroll-mt-16"
      style={{ borderColor: `${GOLD}30`, background: `linear-gradient(180deg, ${GOLD}08, transparent 60%)` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-3" style={{ color: GOLD }}>
            Optional track · Laluan pilihan
          </p>
          <SectionHeading
            en="Islamic Studies, taught alongside your school subjects"
            bm="Pengajian Islam, diajar bersama subjek sekolah anda"
            subEn="Eight modules spanning Form 1 to Form 5. Study them with your academic subjects, or on their own — they are open to any student who wants them."
            subBm="Lapan modul merangkumi Tingkatan 1 hingga 5. Pelajari bersama subjek akademik anda, atau secara berasingan — terbuka kepada mana-mana pelajar."
          />
        </div>

        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map(m => {
            const levels = TINGKATAN.filter(t => (m.chapters[t]?.length ?? 0) > 0);
            return (
              <div
                key={m.id}
                className="rounded-2xl border p-6 flex flex-col"
                style={{ borderColor: `${GOLD}35`, background: 'var(--card)' }}
              >
                <span className="text-3xl" aria-hidden="true">
                  {m.icon}
                </span>
                <h3 className="font-bold text-[var(--foreground)] mt-4 leading-snug">{m.name}</h3>
                <p lang="ms" className="text-sm text-[var(--muted)]">
                  {m.nameBM}
                </p>
                {m.blurb && (
                  <p className="mt-3 text-xs text-[var(--muted)] leading-relaxed flex-1">{m.blurb}</p>
                )}
                <div className="mt-4 pt-4 border-t flex items-center justify-between gap-2" style={{ borderColor: `${GOLD}25` }}>
                  <span className="text-xs font-semibold" style={{ color: GOLD }}>
                    {getChapterCount(m)} chapters
                  </span>
                  <span className="text-[10px] text-[var(--muted)]">
                    {levels.length === TINGKATAN.length
                      ? 'Form 1–5'
                      : `Form ${levels.map(l => l.slice(1)).join(', ')}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sourcing note */}
        <div
          className="mt-10 rounded-2xl border p-6 sm:p-8 max-w-3xl mx-auto"
          style={{ borderColor: `${GOLD}35`, background: `${GOLD}08` }}
        >
          <h3 className="font-playfair text-xl font-bold" style={{ color: GOLD }}>
            Every narration carries its source
          </h3>
          <p lang="ms" className="font-playfair text-lg text-[var(--muted)]">
            Setiap riwayat disertakan sumbernya
          </p>
          <p className="mt-4 text-sm text-[var(--foreground)] opacity-80">
            Hadith and sunnah entries are stored with their narrator and reference — for example
            &ldquo;Sahih al-Bukhari, Hadith 6312, narrated by Abu Hurairah (RA)&rdquo; — so students
            and parents can check what is being taught. Quran modules include the Arabic text,
            transliteration and translation side by side.
          </p>
          <p lang="ms" className="mt-3 text-sm text-[var(--muted)]">
            Entri hadis dan sunnah disimpan bersama perawi dan rujukannya, supaya pelajar dan ibu
            bapa boleh menyemak apa yang diajar. Modul al-Quran menyertakan teks Arab, transliterasi
            dan terjemahan.
          </p>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={onGetStarted}
            className="px-7 py-3 rounded-full font-semibold transition-opacity hover:opacity-90"
            style={{ background: GOLD, color: '#0a0a0f' }}
          >
            Add Islamic Studies · Tambah Pengajian Islam
          </button>
        </div>
      </div>
    </section>
  );
};

export default IslamicShowcase;
