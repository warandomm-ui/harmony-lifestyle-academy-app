import type {
  AnalysisResult,
  HarmonyBand,
  HarmonyDimensionId,
  HarmonyDimensionMeta,
  HarmonyDimensionScore,
  HarmonyProfileAnalysis,
  RecommendedSkill,
  SkillCategoryId,
  SurveyAnswers,
  UserProfile,
} from '../types';
import {
  HARMONY_DIMENSIONS,
  HARMONY_DIMENSION_LABELS_MUSLIM,
  HARMONY_DIMENSION_ORDER,
  SKILL_DIMENSION_PROFILES,
  type SkillDimensionProfile,
} from '../constants/harmonyDimensions';
import { isMuslim } from './religionUtils';

// ═══════════════════════════════════════════════════════════════════
// Deterministic scoring of the Student 360° survey into the five
// Harmony dimensions, plus skill recommendations drawn from the four
// skill catalogues. No network calls — this runs instantly, works
// offline, and always produces the same result for the same input,
// which matters because students compare profiles with each other.
// ═══════════════════════════════════════════════════════════════════

/** Baseline credit for a categorical trait that does not match. Keeps a
 *  single "wrong" personality type from cratering a dimension. */
const CATEGORY_MISS = 0.35;
/** Credit for an intelligence the student did not pick as a top strength. */
const INTELLIGENCE_MISS = 0.3;

interface TraitSignals {
  disc: string | null;
  mbti: string | null;
  enneagram: number | null;
  bigFive: Record<string, number>;
  hexaco: Record<string, number>;
  temperament: string | null;
  socialStyle: string | null;
  intelligences: string[];
}

const emptySignals = (): TraitSignals => ({
  disc: null,
  mbti: null,
  enneagram: null,
  bigFive: {},
  hexaco: {},
  temperament: null,
  socialStyle: null,
  intelligences: [],
});

// ─── Extraction: raw survey answers ──────────────────────────────────

const asArray = (value: any): any[] => {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
};

/** The DISC section asks two questions; the repeated answer wins. */
const pickMajority = (values: string[]): string | null => {
  if (values.length === 0) return null;
  const tally = new Map<string, number>();
  values.forEach(v => tally.set(v, (tally.get(v) || 0) + 1));
  let best = values[0];
  let bestCount = 0;
  tally.forEach((count, value) => {
    if (count > bestCount) {
      best = value;
      bestCount = count;
    }
  });
  return best;
};

const collectRatings = (section: Record<string, any> | undefined): Record<string, number> => {
  const ratings: Record<string, number> = {};
  if (!section) return ratings;
  Object.values(section).forEach(answer => {
    if (answer && typeof answer === 'object' && typeof answer.score === 'number' && answer.question) {
      ratings[String(answer.question)] = answer.score;
    }
  });
  return ratings;
};

export const extractSignalsFromAnswers = (answers?: SurveyAnswers | null): TraitSignals => {
  const signals = emptySignals();
  if (!answers) return signals;

  const disc = answers.disc || {};
  signals.disc = pickMajority(Object.values(disc).filter(v => typeof v === 'string') as string[]);

  const mbti = answers.mbti || {};
  const letters = ['m1', 'm2', 'm3', 'm4']
    .map(id => mbti[id])
    .filter(v => typeof v === 'string')
    .join('');
  signals.mbti = letters || null;

  const enneagram = answers.enneagram || {};
  const primaryType = Number(enneagram.e1);
  signals.enneagram = Number.isFinite(primaryType) && primaryType >= 1 && primaryType <= 9 ? primaryType : null;

  signals.bigFive = collectRatings(answers.bigFive);
  signals.hexaco = collectRatings(answers.hexaco);

  const temperament = answers.temperament || {};
  signals.temperament = typeof temperament.t1 === 'string' ? temperament.t1 : null;

  const socialStyles = answers.socialStyles || {};
  signals.socialStyle = typeof socialStyles.ss1 === 'string' ? socialStyles.ss1 : null;

  const intelligences = answers.multipleIntelligences || {};
  signals.intelligences = asArray(intelligences.mi1).filter(v => typeof v === 'string') as string[];

  return signals;
};

// ─── Extraction: the AI analysis result ──────────────────────────────
// Once onboarding is over the raw answers are gone (only the analysis is
// persisted), so the same dimensions must be recoverable from the result.

const KNOWN_DISC = ['Dominance', 'Influence', 'Steadiness', 'Conscientiousness'];
const KNOWN_TEMPERAMENTS = ['Sanguine', 'Choleric', 'Melancholic', 'Phlegmatic'];
const KNOWN_SOCIAL_STYLES = ['Driver', 'Amiable', 'Analytical', 'Expressive'];

/** The AI is free-form; match a label against a known vocabulary. */
const matchKnown = (value: string | undefined, vocabulary: string[]): string | null => {
  if (!value) return null;
  const lower = value.toLowerCase();
  return vocabulary.find(known => lower.includes(known.toLowerCase())) || null;
};

const traitsToRecord = (traits?: { name: string; score: number }[]): Record<string, number> => {
  const record: Record<string, number> = {};
  (traits || []).forEach(trait => {
    if (trait && typeof trait.score === 'number' && trait.name) {
      record[trait.name] = trait.score;
    }
  });
  return record;
};

export const extractSignalsFromResults = (results?: AnalysisResult | null): TraitSignals => {
  const signals = emptySignals();
  const profile = results?.studentProfile;
  if (!profile) return signals;

  signals.disc = matchKnown(profile.disc?.style, KNOWN_DISC);

  const mbtiType = (profile.mbti?.type || '').toUpperCase().replace(/[^EISNTFJP]/g, '');
  signals.mbti = /^[EI][SN][TF][JP]$/.test(mbtiType) ? mbtiType : null;

  const enneagramMatch = (profile.enneagram?.type || '').match(/[1-9]/);
  signals.enneagram = enneagramMatch ? Number(enneagramMatch[0]) : null;

  signals.bigFive = traitsToRecord(profile.bigFive?.traits);
  signals.hexaco = traitsToRecord(profile.hexaco?.traits);
  signals.temperament = matchKnown(profile.temperament?.type, KNOWN_TEMPERAMENTS);
  signals.socialStyle = matchKnown(profile.socialStyles?.style, KNOWN_SOCIAL_STYLES);
  signals.intelligences = profile.multipleIntelligences?.topIntelligences || [];

  return signals;
};

/** Raw answers win wherever they exist; the analysis fills the gaps. */
export const mergeSignals = (primary: TraitSignals, fallback: TraitSignals): TraitSignals => ({
  disc: primary.disc ?? fallback.disc,
  mbti: primary.mbti ?? fallback.mbti,
  enneagram: primary.enneagram ?? fallback.enneagram,
  bigFive: Object.keys(primary.bigFive).length ? primary.bigFive : fallback.bigFive,
  hexaco: Object.keys(primary.hexaco).length ? primary.hexaco : fallback.hexaco,
  temperament: primary.temperament ?? fallback.temperament,
  socialStyle: primary.socialStyle ?? fallback.socialStyle,
  intelligences: primary.intelligences.length ? primary.intelligences : fallback.intelligences,
});

// ─── Contribution model ──────────────────────────────────────────────

interface Contribution {
  weight: number;
  /** null when the survey never captured this signal */
  evaluate: (signals: TraitSignals) => number | null;
  label: string;
}

/** A 1-5 rating from Big Five / HEXACO, normalised to 0-1. */
const rating = (
  framework: 'bigFive' | 'hexaco',
  trait: string,
  weight: number,
  label: string,
  invert = false,
): Contribution => ({
  weight,
  label,
  evaluate: signals => {
    const score = signals[framework][trait];
    if (typeof score !== 'number') return null;
    const normalised = (score - 1) / 4;
    return invert ? 1 - normalised : normalised;
  },
});

const categorical = (
  key: 'disc' | 'temperament' | 'socialStyle',
  matches: string[],
  weight: number,
  label: string,
): Contribution => ({
  weight,
  label,
  evaluate: signals => {
    const value = signals[key];
    if (!value) return null;
    return matches.includes(value) ? 1 : CATEGORY_MISS;
  },
});

const intelligence = (name: string, weight: number, label: string): Contribution => ({
  weight,
  label,
  evaluate: signals => {
    if (signals.intelligences.length === 0) return null;
    return signals.intelligences.includes(name) ? 1 : INTELLIGENCE_MISS;
  },
});

const mbtiLetter = (letter: string, weight: number, label: string): Contribution => ({
  weight,
  label,
  evaluate: signals => {
    if (!signals.mbti) return null;
    return signals.mbti.includes(letter) ? 1 : CATEGORY_MISS;
  },
});

const enneagramType = (types: number[], weight: number, label: string): Contribution => ({
  weight,
  label,
  evaluate: signals => {
    if (signals.enneagram === null) return null;
    return types.includes(signals.enneagram) ? 1 : CATEGORY_MISS;
  },
});

const DIMENSION_CONTRIBUTIONS: Record<HarmonyDimensionId, Contribution[]> = {
  sq: [
    intelligence('Existential', 1.0, 'Kecerdasan eksistensial (suka soalan mendalam)'),
    intelligence('Intrapersonal', 0.8, 'Kecerdasan intrapersonal (muhasabah diri)'),
    intelligence('Naturalist', 0.5, 'Kecerdasan naturalis (dekat dengan alam)'),
    rating('bigFive', 'Gratitude', 1.0, 'Sifat bersyukur'),
    rating('bigFive', 'Forgiving', 0.8, 'Sifat pemaaf'),
    rating('hexaco', 'Honesty-Humility', 0.8, 'Kejujuran & rendah diri (HEXACO)'),
    rating('bigFive', 'Openness', 0.4, 'Keterbukaan kepada pengalaman baharu'),
    categorical('temperament', ['Melancholic', 'Phlegmatic'], 0.5, 'Perangai tenang & mendalam'),
    enneagramType([1, 4, 5, 9], 0.4, 'Motivasi teras mencari makna'),
    mbtiLetter('N', 0.3, 'Kecenderungan intuitif (MBTI)'),
  ],
  iq: [
    rating('bigFive', 'Focus', 1.0, 'Daya tumpuan panjang'),
    rating('bigFive', 'Openness', 0.9, 'Keterbukaan & daya imaginasi'),
    rating('bigFive', 'Conscientiousness', 0.7, 'Ketekunan & disiplin'),
    rating('hexaco', 'Openness', 0.7, 'Minda kreatif (HEXACO)'),
    rating('hexaco', 'Conscientiousness', 0.5, 'Perancangan teliti (HEXACO)'),
    intelligence('Logical-Mathematical', 1.0, 'Kecerdasan logik-matematik'),
    intelligence('Linguistic', 0.6, 'Kecerdasan linguistik'),
    intelligence('Spatial', 0.5, 'Kecerdasan ruang visual'),
    mbtiLetter('N', 0.5, 'Melihat corak & kemungkinan (MBTI)'),
    mbtiLetter('T', 0.5, 'Membuat keputusan secara logik (MBTI)'),
    categorical('disc', ['Conscientiousness'], 0.7, 'Gaya DISC berasaskan data'),
    categorical('socialStyle', ['Analytical'], 0.6, 'Gaya sosial analitikal'),
    enneagramType([5], 0.5, 'Dorongan memahami dunia'),
  ],
  eq: [
    rating('bigFive', 'Agreeableness', 1.0, 'Sifat prihatin terhadap orang lain'),
    rating('bigFive', 'Neuroticism', 0.9, 'Kestabilan emosi', true),
    rating('bigFive', 'Patience', 0.8, 'Kesabaran menghadapi kesukaran'),
    rating('hexaco', 'Agreeableness', 0.7, 'Mudah bertolak ansur (HEXACO)'),
    rating('hexaco', 'Emotionality', 0.4, 'Kawalan kerisauan (HEXACO)', true),
    intelligence('Interpersonal', 1.0, 'Kecerdasan interpersonal'),
    intelligence('Intrapersonal', 0.9, 'Kesedaran emosi diri'),
    mbtiLetter('F', 0.5, 'Keputusan berasaskan nilai & perasaan (MBTI)'),
    categorical('disc', ['Steadiness', 'Influence'], 0.6, 'Gaya DISC mesra orang'),
    categorical('socialStyle', ['Amiable', 'Expressive'], 0.6, 'Gaya sosial hangat'),
    enneagramType([2, 9], 0.5, 'Motivasi menjaga hubungan'),
  ],
  kinetic: [
    intelligence('Bodily-Kinesthetic', 1.0, 'Kecerdasan kinestetik badan'),
    intelligence('Musical', 0.3, 'Kepekaan rentak & muzik'),
    intelligence('Spatial', 0.3, 'Koordinasi mata & tangan'),
    rating('bigFive', 'Extraversion', 0.6, 'Tenaga bersama orang ramai'),
    rating('hexaco', 'Extraversion', 0.5, 'Sifat aktif & bertenaga (HEXACO)'),
    rating('bigFive', 'Conscientiousness', 0.3, 'Disiplin latihan berterusan'),
    categorical('temperament', ['Choleric', 'Sanguine'], 0.6, 'Perangai bertenaga tinggi'),
    categorical('disc', ['Dominance', 'Influence'], 0.5, 'Gaya DISC pantas bertindak'),
    categorical('socialStyle', ['Driver'], 0.4, 'Gaya sosial pemacu tindakan'),
    mbtiLetter('S', 0.4, 'Belajar melalui pengalaman langsung (MBTI)'),
    mbtiLetter('E', 0.3, 'Tenaga luaran (MBTI)'),
  ],
  akhlak: [
    rating('hexaco', 'Honesty-Humility', 1.0, 'Kejujuran & amanah (HEXACO)'),
    rating('bigFive', 'Forgiving', 0.9, 'Sifat pemaaf'),
    rating('bigFive', 'Agreeableness', 0.8, 'Timbang rasa terhadap orang lain'),
    rating('bigFive', 'Gratitude', 0.8, 'Sifat bersyukur'),
    rating('bigFive', 'Patience', 0.7, 'Kesabaran'),
    rating('hexaco', 'Agreeableness', 0.6, 'Bertolak ansur (HEXACO)'),
    rating('hexaco', 'Conscientiousness', 0.5, 'Boleh dipercayai & teratur (HEXACO)'),
    enneagramType([1, 2, 9], 0.6, 'Motivasi teras berbuat baik'),
    categorical('disc', ['Steadiness', 'Conscientiousness'], 0.4, 'Gaya DISC yang konsisten'),
    intelligence('Interpersonal', 0.3, 'Kepekaan terhadap orang lain'),
  ],
};

export const bandForScore = (score: number): HarmonyBand => {
  if (score >= 85) return 'Cemerlang';
  if (score >= 70) return 'Kukuh';
  if (score >= 50) return 'Sedang Berkembang';
  return 'Perlu Dibina';
};

const scoreDimension = (id: HarmonyDimensionId, signals: TraitSignals): HarmonyDimensionScore => {
  const contributions = DIMENSION_CONTRIBUTIONS[id];
  const totalWeight = contributions.reduce((sum, c) => sum + c.weight, 0);

  let weightedSum = 0;
  let usedWeight = 0;
  const drivers: { label: string; impact: number }[] = [];

  contributions.forEach(contribution => {
    const value = contribution.evaluate(signals);
    if (value === null) return;
    weightedSum += contribution.weight * value;
    usedWeight += contribution.weight;
    if (value >= 0.7) {
      drivers.push({ label: contribution.label, impact: contribution.weight * value });
    }
  });

  // No usable signal at all — sit on the neutral midpoint rather than
  // claiming the student scored zero.
  const score = usedWeight > 0 ? Math.round((weightedSum / usedWeight) * 100) : 50;

  return {
    id,
    score,
    band: bandForScore(score),
    confidence: totalWeight > 0 ? Number((usedWeight / totalWeight).toFixed(2)) : 0,
    evidence: drivers
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 4)
      .map(driver => driver.label),
  };
};

// ─── Skill recommendation ────────────────────────────────────────────

/** Age nudges which catalogue is emphasised, without overriding the survey. */
const categoryEmphasis = (category: SkillCategoryId, age: number | null | undefined): number => {
  if (typeof age !== 'number' || Number.isNaN(age)) return 1;
  if (age <= 13) return category === 'life' || category === 'creative' ? 1.06 : 0.96;
  if (age <= 16) return category === 'professional' || category === 'creative' ? 1.02 : 1.0;
  return category === 'technical' || category === 'professional' ? 1.05 : 0.98;
};

const weightedAverage = (
  weights: Partial<Record<HarmonyDimensionId, number>>,
  valueFor: (id: HarmonyDimensionId) => number,
): number | null => {
  const entries = Object.entries(weights) as [HarmonyDimensionId, number][];
  const totalWeight = entries.reduce((sum, [, weight]) => sum + weight, 0);
  if (totalWeight === 0) return null;
  const total = entries.reduce((sum, [id, weight]) => sum + weight * valueFor(id), 0);
  return total / totalWeight;
};

const topDimensions = (
  weights: Partial<Record<HarmonyDimensionId, number>>,
  limit: number,
): HarmonyDimensionId[] =>
  (Object.entries(weights) as [HarmonyDimensionId, number][])
    .filter(([, weight]) => weight >= 0.4)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

const labelFor = (id: HarmonyDimensionId, muslimFraming: boolean): string =>
  getDimensionMeta(id, muslimFraming).label;

const buildReason = (
  profile: SkillDimensionProfile,
  scoreById: Record<HarmonyDimensionId, number>,
  leverages: HarmonyDimensionId[],
  builds: HarmonyDimensionId[],
  muslimFraming: boolean,
): string => {
  const parts: string[] = [profile.note];

  const leverage = leverages[0];
  if (leverage) {
    parts.push(`Ia bersandar pada kekuatan ${labelFor(leverage, muslimFraming)} anda (${scoreById[leverage]}/100).`);
  }

  // Only call something a growth area when it genuinely lags.
  const growth = builds.find(id => scoreById[id] < 70 && id !== leverage);
  if (growth) {
    parts.push(`Pada masa sama ia membina ${labelFor(growth, muslimFraming)} yang masih ada ruang untuk berkembang (${scoreById[growth]}/100).`);
  }

  return parts.join(' ');
};

const scoreSkill = (
  profile: SkillDimensionProfile,
  scoreById: Record<HarmonyDimensionId, number>,
  age: number | null | undefined,
  muslimFraming: boolean,
): RecommendedSkill => {
  const fit = weightedAverage(profile.leverages, id => scoreById[id]);
  const gap = weightedAverage(profile.builds, id => 100 - scoreById[id]);

  // Weight fit above gap: play to strengths first, then close gaps.
  let raw: number;
  if (fit !== null && gap !== null) raw = 0.62 * fit + 0.38 * gap;
  else if (fit !== null) raw = fit;
  else if (gap !== null) raw = gap;
  else raw = 50;

  const score = Math.max(0, Math.min(100, Math.round(raw * categoryEmphasis(profile.category, age))));
  const leverages = topDimensions(profile.leverages, 2);
  const builds = topDimensions(profile.builds, 2);

  return {
    skill: profile.skill,
    category: profile.category,
    score,
    leverages,
    builds,
    reason: buildReason(profile, scoreById, leverages, builds, muslimFraming),
  };
};

// ─── Public API ──────────────────────────────────────────────────────

export const getDimensionMeta = (id: HarmonyDimensionId, muslimFraming = false): HarmonyDimensionMeta => {
  const base = HARMONY_DIMENSIONS[id];
  const override = muslimFraming ? HARMONY_DIMENSION_LABELS_MUSLIM[id] : undefined;
  return override ? { ...base, ...override } : base;
};

export interface HarmonyProfileInput {
  /** The AI analysis stored on the profile — the always-available source. */
  results?: AnalysisResult | null;
  /** Raw survey answers, available during onboarding. Preferred when present. */
  answers?: SurveyAnswers | null;
  /** Used for age emphasis and for Islamic vs universal framing. */
  profile?: UserProfile | null;
  /** How many skills to return per category. Defaults to 3. */
  perCategory?: number;
}

const CATEGORY_IDS: SkillCategoryId[] = ['technical', 'professional', 'life', 'creative'];

const buildSummary = (
  dimensions: HarmonyDimensionScore[],
  strengths: HarmonyDimensionId[],
  growthAreas: HarmonyDimensionId[],
  topSkills: RecommendedSkill[],
  muslimFraming: boolean,
): string => {
  const scoreById = Object.fromEntries(dimensions.map(d => [d.id, d.score])) as Record<HarmonyDimensionId, number>;
  const name = (id: HarmonyDimensionId) => labelFor(id, muslimFraming);

  const strengthText = strengths.map(id => `${name(id)} (${scoreById[id]}/100)`).join(' dan ');
  const growthText = growthAreas.map(id => `${name(id)} (${scoreById[id]}/100)`).join(' dan ');
  const skillText = topSkills.slice(0, 3).map(skill => skill.skill).join(', ');

  return (
    `Berdasarkan jawapan survey dan profil anda, kekuatan paling menonjol ialah ${strengthText}. ` +
    `Ruang pertumbuhan terbesar pula ialah ${growthText} — bukan kelemahan, tetapi bahagian yang belum cukup dilatih. ` +
    `Tiga kemahiran paling sesuai untuk anda mulakan sekarang: ${skillText}.`
  );
};

/**
 * Scores the five Harmony dimensions and ranks the four skill
 * catalogues against them. Safe to call with partial data — missing
 * frameworks simply lower the reported confidence.
 */
export const analyzeHarmonyProfile = (input: HarmonyProfileInput): HarmonyProfileAnalysis => {
  const { results, answers, profile, perCategory = 3 } = input;

  const signals = mergeSignals(extractSignalsFromAnswers(answers), extractSignalsFromResults(results));
  const muslimFraming = isMuslim(profile?.religion || '');

  const dimensions = HARMONY_DIMENSION_ORDER.map(id => scoreDimension(id, signals));
  const scoreById = Object.fromEntries(dimensions.map(d => [d.id, d.score])) as Record<HarmonyDimensionId, number>;

  const ranked = [...dimensions].sort((a, b) => b.score - a.score);
  const strengths = ranked.slice(0, 2).map(d => d.id);
  const growthAreas = ranked.slice(-2).reverse().map(d => d.id);

  const scoredSkills = SKILL_DIMENSION_PROFILES
    .map(skillProfile => scoreSkill(skillProfile, scoreById, profile?.age, muslimFraming))
    .sort((a, b) => b.score - a.score || a.skill.localeCompare(b.skill));

  const skillsByCategory = CATEGORY_IDS.reduce((acc, category) => {
    acc[category] = scoredSkills.filter(skill => skill.category === category).slice(0, perCategory);
    return acc;
  }, {} as Record<SkillCategoryId, RecommendedSkill[]>);

  // Guarantee one pick from every category, so a student never sees a
  // shortlist made entirely of coding skills, then fill by raw score.
  const leadPicks = CATEGORY_IDS.map(category => skillsByCategory[category][0]).filter(Boolean);
  const topSkills = [...leadPicks, ...scoredSkills.filter(skill => !leadPicks.includes(skill))]
    .slice(0, 6)
    .sort((a, b) => b.score - a.score);

  const averageConfidence =
    dimensions.reduce((sum, d) => sum + d.confidence, 0) / (dimensions.length || 1);

  return {
    dimensions,
    strengths,
    growthAreas,
    summary: buildSummary(dimensions, strengths, growthAreas, topSkills, muslimFraming),
    topSkills,
    skillsByCategory,
    isFallback: averageConfidence < 0.25,
  };
};
