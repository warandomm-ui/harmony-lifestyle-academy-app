// services/moduleContentService.ts
// Curated lesson, quiz and reflection content for the wellness dimension modules.
// Reads from Supabase (module_topics + module_quiz_questions) and falls back to the
// JSON bundled in content/modules/, so pages work before the seed has been applied.

import { supabase } from './supabaseClient';
import type {
  GeneratedModuleContent,
  GeneratedQuiz,
  ModuleTopicContent,
  WellnessModuleContent,
} from '../types';

// Each module's JSON becomes its own lazily loaded chunk.
const bundled = import.meta.glob<{ default: Omit<WellnessModuleContent, 'topics'> & { topics: Omit<ModuleTopicContent, 'id' | 'moduleId'>[] } }>(
  '../content/modules/*.json',
);

async function loadBundledModule(moduleId: string): Promise<WellnessModuleContent | null> {
  const load = bundled[`../content/modules/${moduleId}.json`];
  if (!load) return null;
  const mod = (await load()).default;
  return {
    ...mod,
    topics: mod.topics.map((t) => ({ ...t, id: `${moduleId}/${t.slug}`, moduleId })),
  };
}

function mapTopicRow(row: Record<string, any>): ModuleTopicContent {
  const quiz: GeneratedQuiz[] = [...(row.module_quiz_questions ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((q) => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correct_index,
      explanation: q.explanation,
    }));
  return {
    id: row.id,
    moduleId: row.module_id,
    slug: row.slug,
    title: row.title,
    icon: row.icon,
    summary: row.summary,
    objectives: row.objectives,
    durationMinutes: row.duration_minutes,
    xpReward: row.xp_reward,
    lesson: row.lesson,
    quiz,
    reflection: row.reflection,
    faithLens: row.faith_lens ?? undefined,
  };
}

/** All topics of a module in display order. */
export const getModuleTopics = async (moduleId: string): Promise<ModuleTopicContent[]> => {
  try {
    const { data, error } = await supabase
      .from('module_topics')
      .select('*, module_quiz_questions(*)')
      .eq('module_id', moduleId)
      .order('sort_order', { ascending: true });
    if (!error && data && data.length > 0) return data.map(mapTopicRow);
  } catch {
    // network or configuration problem: use the bundled copy
  }
  return (await loadBundledModule(moduleId))?.topics ?? [];
};

/** One topic, looked up by the title the dimension page shows. */
export const getModuleTopic = async (moduleId: string, title: string): Promise<ModuleTopicContent | null> =>
  (await getModuleTopics(moduleId)).find((t) => t.title === title) ?? null;

/**
 * Adapts a curated topic to the single-question shape AIContentGenerator renders,
 * so curated content can be shown wherever AI-generated content is shown today.
 */
export const toGeneratedModuleContent = (
  topic: ModuleTopicContent,
  moduleName: string,
  quizIndex = 0,
): GeneratedModuleContent => ({
  lesson: topic.lesson,
  quiz: topic.quiz[quizIndex % topic.quiz.length],
  reflection: topic.reflection,
  module: moduleName,
  topic: topic.title,
  generatedAt: new Date().toISOString(),
});
