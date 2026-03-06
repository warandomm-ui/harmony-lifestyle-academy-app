// services/sunnahService.ts
// Fetches sunnah content from Supabase and manages local progress tracking.

import { supabase } from './supabaseClient';
import type { SunnahItem, SunnahQuiz } from '../constants/sunnahData';

export type TimePeriod = 'morning' | 'afternoon' | 'evening' | 'night';

// ─── Row → SunnahItem mapping ─────────────────────────────────────
// Supabase uses snake_case; TypeScript interface uses camelCase.
function mapRow(row: Record<string, any>): SunnahItem {
  return {
    id:              row.id,
    title:           row.title,
    arabicTitle:     row.arabic_title,
    arabic:          row.arabic,
    transliteration: row.transliteration,
    translation:     row.translation,
    source:          row.source,
    narrator:        row.narrator,
    category:        row.category,
    timeOfDay:       row.time_of_day as TimePeriod,
    topic:           row.topic,
    emoji:           row.emoji,
    benefit:         row.benefit,
    howTo:           row.how_to,
    quiz:            row.quiz as SunnahQuiz,
    reflection:      row.reflection,
    xpReward:        row.xp_reward,
  };
}

// ─── Content queries ──────────────────────────────────────────────

/** Fetch all sunnah items for a given time period, ordered by id. */
export const getSunnahByTimeOfDay = async (timeOfDay: TimePeriod): Promise<SunnahItem[]> => {
  const { data, error } = await supabase
    .from('sunnah_items')
    .select('*')
    .eq('time_of_day', timeOfDay)
    .order('id', { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
};

/** Fetch unique category names for a time period, in id order (preserves natural grouping). */
export const getSunnahCategories = async (timeOfDay: TimePeriod): Promise<string[]> => {
  const { data, error } = await supabase
    .from('sunnah_items')
    .select('id, category')
    .eq('time_of_day', timeOfDay)
    .order('id', { ascending: true });

  if (error) throw new Error(error.message);

  const seen = new Set<string>();
  const result: string[] = [];
  for (const row of data ?? []) {
    if (!seen.has(row.category)) {
      seen.add(row.category);
      result.push(row.category);
    }
  }
  return result;
};

/** Fetch a single sunnah item by id. Returns null if not found. */
export const getSunnahById = async (id: number): Promise<SunnahItem | null> => {
  const { data, error } = await supabase
    .from('sunnah_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return mapRow(data);
};

/** Search sunnah items by title, category, or Malay translation. */
export const searchSunnah = async (query: string): Promise<SunnahItem[]> => {
  const { data, error } = await supabase
    .from('sunnah_items')
    .select('*')
    .or(
      `title.ilike.%${query}%,` +
      `category.ilike.%${query}%,` +
      `translation.ilike.%${query}%,` +
      `topic.ilike.%${query}%`
    )
    .order('id', { ascending: true })
    .limit(60);

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
};

/** Get total count of sunnah items in the table. */
export const getSunnahCount = async (): Promise<number> => {
  const { count, error } = await supabase
    .from('sunnah_items')
    .select('*', { count: 'exact', head: true });

  if (error) return 0;
  return count ?? 0;
};

// ─── Local progress tracking ──────────────────────────────────────
// Uses localStorage so progress works for unauthenticated users too.
// Can be upgraded to write to public.sunnah_progress when auth is added.

const PROGRESS_KEY = 'harmony_sunnah_progress';

export interface SunnahProgress {
  completedIds: number[];
  quizPassedIds: number[];
}

export const getSunnahProgress = (): SunnahProgress => {
  try {
    return JSON.parse(
      localStorage.getItem(PROGRESS_KEY) ||
      '{"completedIds":[],"quizPassedIds":[]}'
    );
  } catch {
    return { completedIds: [], quizPassedIds: [] };
  }
};

/** Mark a sunnah item as completed. Idempotent. Returns updated progress. */
export const markSunnahComplete = (id: number): SunnahProgress => {
  const progress = getSunnahProgress();
  if (!progress.completedIds.includes(id)) {
    progress.completedIds.push(id);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }
  return progress;
};

/** Mark a sunnah quiz as passed. Idempotent. Returns updated progress. */
export const markQuizPassed = (id: number): SunnahProgress => {
  const progress = getSunnahProgress();
  if (!progress.quizPassedIds.includes(id)) {
    progress.quizPassedIds.push(id);
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  }
  return progress;
};

/** Get saved reflection text for a sunnah item. */
export const getReflectionText = (sunnahId: number): string =>
  localStorage.getItem(`harmony_sunnah_reflect_${sunnahId}`) ?? '';

/** Persist reflection text for a sunnah item. */
export const saveReflectionText = (sunnahId: number, text: string): void =>
  localStorage.setItem(`harmony_sunnah_reflect_${sunnahId}`, text);
