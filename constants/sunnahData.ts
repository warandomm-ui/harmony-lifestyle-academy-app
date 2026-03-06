// constants/sunnahData.ts
// Sunnah type definitions — data is stored in Supabase (sunnah_items table).
// See: supabase/sunnah_schema.sql for table DDL and sample INSERT statements.

export interface SunnahQuiz {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface SunnahItem {
  id: number;
  title: string;           // Malay title
  arabicTitle: string;     // Arabic name of the practice
  arabic: string;          // Arabic du'a text or description
  transliteration: string; // Romanised pronunciation
  translation: string;     // Malay meaning
  source: string;          // e.g. "Sahih al-Bukhari, Hadith 6312"
  narrator: string;        // e.g. "Diriwayatkan oleh Abu Hurairah (RA)"
  category: string;        // e.g. "Upon Waking"
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  topic: string;
  emoji: string;
  benefit: string;
  howTo: string;
  quiz: SunnahQuiz;
  reflection: string;
  xpReward: number;        // 10–30 XP
}

export interface SunnahBadge {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  emoji: string;
  category: string;
  requiredCount: number;
}
