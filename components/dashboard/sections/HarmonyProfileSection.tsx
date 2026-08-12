import React, { useMemo, useState } from 'react';
import type {
  AnalysisResult,
  HarmonyDimensionId,
  HarmonyDimensionScore,
  RecommendedSkill,
  SkillCategoryId,
  SurveyAnswers,
  UserProfile,
} from '../../../types';
import { SKILL_CATEGORY_META } from '../../../constants/harmonyDimensions';
import { analyzeHarmonyProfile, getDimensionMeta } from '../../../utils/harmonyProfile';
import { isMuslim } from '../../../utils/religionUtils';

interface HarmonyProfileSectionProps {
  userProfile?: UserProfile | null;
  userResults?: AnalysisResult | null;
  /** Raw answers, when available (during onboarding). */
  surveyAnswers?: SurveyAnswers | null;
  /** Skills the student already picked — shown as "already on your path". */
  selectedSkills?: string[];
  /** Hide the outer card chrome when embedded in a page that supplies its own. */
  bare?: boolean;
}

const BAND_STYLES: Record<string, string> = {
  'Cemerlang': 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  'Kukuh': 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  'Sedang Berkembang': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  'Perlu Dibina': 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
};

const CATEGORY_ORDER: SkillCategoryId[] = ['technical', 'professional', 'life', 'creative'];

const DimensionRow: React.FC<{
  dimension: HarmonyDimensionScore;
  muslimFraming: boolean;
  isStrength: boolean;
  isGrowth: boolean;
}> = ({ dimension, muslimFraming, isStrength, isGrowth }) => {
  const meta = getDimensionMeta(dimension.id, muslimFraming);

  return (
    <div className="bg-[var(--background)] rounded-xl p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none mt-0.5" aria-hidden="true">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-bold text-[var(--foreground)]">
              {meta.code} · {meta.label}
            </h4>
            {isStrength && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Kekuatan
              </span>
            )}
            {isGrowth && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                Fokus Pertumbuhan
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">{meta.labelEn}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-bold text-[var(--foreground)] leading-none">{dimension.score}</p>
          <p className="text-[10px] text-[var(--muted)]">/ 100</p>
        </div>
      </div>

      <div className="w-full bg-[var(--border)] rounded-full h-2 mt-3" role="presentation">
        <div
          className="bg-[var(--primary)] h-2 rounded-full transition-all duration-700"
          style={{ width: `${dimension.score}%` }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${BAND_STYLES[dimension.band] || ''}`}>
          {dimension.band}
        </span>
        {dimension.evidence.slice(0, 2).map(item => (
          <span key={item} className="text-[11px] text-[var(--muted)] bg-[var(--secondary)] px-2 py-0.5 rounded-full">
            {item}
          </span>
        ))}
      </div>

      <p className="text-sm text-[var(--muted)] mt-3">{meta.description}</p>
    </div>
  );
};

const SkillRow: React.FC<{ skill: RecommendedSkill; alreadySelected: boolean; muslimFraming: boolean }> = ({
  skill,
  alreadySelected,
  muslimFraming,
}) => {
  const [open, setOpen] = useState(false);
  const tags = Array.from(new Set([...skill.leverages, ...skill.builds])) as HarmonyDimensionId[];

  return (
    <div className="bg-[var(--background)] rounded-xl p-3">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center gap-3 text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[var(--foreground)]">{skill.skill}</span>
            {alreadySelected && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
                Sudah dipilih
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {tags.map(id => (
              <span key={id} className="text-[10px] font-bold text-[var(--muted)] bg-[var(--secondary)] px-1.5 py-0.5 rounded">
                {getDimensionMeta(id, muslimFraming).code}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-[var(--primary)] leading-none">{skill.score}%</p>
          <p className="text-[10px] text-[var(--muted)]">padanan</p>
        </div>
      </button>
      {open && <p className="text-sm text-[var(--muted)] mt-3 pt-3 border-t border-[var(--border)]">{skill.reason}</p>}
    </div>
  );
};

const HarmonyProfileSection: React.FC<HarmonyProfileSectionProps> = ({
  userProfile,
  userResults,
  surveyAnswers,
  selectedSkills = [],
  bare = false,
}) => {
  const analysis = useMemo(
    () => analyzeHarmonyProfile({ results: userResults, answers: surveyAnswers, profile: userProfile }),
    [userResults, surveyAnswers, userProfile],
  );

  const muslimFraming = isMuslim(userProfile?.religion || '');
  const selected = useMemo(() => new Set(selectedSkills), [selectedSkills]);
  const [activeCategory, setActiveCategory] = useState<SkillCategoryId>('technical');

  const content = (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[var(--foreground)]">Analisis Profil Harmony</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          SQ · IQ · EQ · Kinestetik · Akhlak — dikira terus daripada jawapan Student 360° anda.
        </p>
      </div>

      {analysis.isFallback && (
        <div className="rounded-xl p-3 bg-amber-500/10 border border-amber-500/30">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Survey Student 360° belum lengkap, jadi skor di bawah adalah anggaran umum. Lengkapkan survey untuk
            analisis yang lebih tepat.
          </p>
        </div>
      )}

      <p className="text-[var(--foreground)] leading-relaxed">{analysis.summary}</p>

      {/* ─── Five dimensions ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analysis.dimensions.map(dimension => (
          <DimensionRow
            key={dimension.id}
            dimension={dimension}
            muslimFraming={muslimFraming}
            isStrength={analysis.strengths.includes(dimension.id)}
            isGrowth={analysis.growthAreas.includes(dimension.id)}
          />
        ))}
      </div>

      {/* ─── Headline recommendations ─── */}
      <div>
        <h3 className="font-bold text-[var(--foreground)] mb-1">Kemahiran Paling Sesuai Untuk Anda</h3>
        <p className="text-sm text-[var(--muted)] mb-3">
          Dipilih daripada keempat-empat katalog kemahiran. Ketuk mana-mana kemahiran untuk melihat sebabnya.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {analysis.topSkills.map(skill => (
            <SkillRow
              key={skill.skill}
              skill={skill}
              alreadySelected={selected.has(skill.skill)}
              muslimFraming={muslimFraming}
            />
          ))}
        </div>
      </div>

      {/* ─── Per-catalogue breakdown ─── */}
      <div>
        <h3 className="font-bold text-[var(--foreground)] mb-3">Cadangan Mengikut Kategori</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {CATEGORY_ORDER.map(category => {
            const meta = SKILL_CATEGORY_META[category];
            const active = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={active}
                className={`text-sm font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  active
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--secondary)] text-[var(--muted)] hover:text-[var(--foreground)]'
                }`}
              >
                {meta.icon} {meta.title}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[var(--muted)] mb-3">{SKILL_CATEGORY_META[activeCategory].titleEn}</p>
        <div className="space-y-2">
          {analysis.skillsByCategory[activeCategory].map(skill => (
            <SkillRow
              key={skill.skill}
              skill={skill}
              alreadySelected={selected.has(skill.skill)}
              muslimFraming={muslimFraming}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return bare ? content : <section className="bento-card">{content}</section>;
};

export default HarmonyProfileSection;
