// Quran API Service
// Uses api.quran.com v4 (FREE, no API key needed)
// Translation ID 39 = Malay (Abdullah Muhammad Basmeih)

export interface QuranAyat {
  number: number;
  textArabic: string;
  textMalay: string;
  surahNumber: number;
  surahName: string;
  juzuk: number;
  courseId: string;
}

export interface QuranSurahDetail {
  surahNumber: number;
  surahNameArabic: string;
  surahNameMalay: string;
  surahNameEnglish: string;
  totalAyat: number;
  revelationType: string;
  ayat: QuranAyat[];
}

const API_BASE = 'https://api.quran.com/api/v4';
const MALAY_TRANSLATION_ID = 39; // Abdullah Muhammad Basmeih

// Cache to avoid refetching
const cache: Record<number, QuranSurahDetail> = {};

// Clean HTML tags from translation text
const cleanText = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Fetch surah info
export const fetchSurahInfo = async (surahNumber: number): Promise<{
  nameArabic: string;
  nameEnglish: string;
  nameMalay: string;
  totalAyat: number;
  revelationType: string;
}> => {
  try {
    const res = await fetch(`${API_BASE}/chapters/${surahNumber}?language=ms`);
    const data = await res.json();
    const chapter = data.chapter;
    return {
      nameArabic: chapter.name_arabic,
      nameEnglish: chapter.name_simple,
      nameMalay: chapter.translated_name?.name || chapter.name_simple,
      totalAyat: chapter.verses_count,
      revelationType: chapter.revelation_place,
    };
  } catch (err) {
    console.error(`Failed to fetch surah ${surahNumber} info:`, err);
    throw err;
  }
};

// Fetch Arabic text for a surah
const fetchArabicText = async (surahNumber: number): Promise<string[]> => {
  try {
    const res = await fetch(
      `${API_BASE}/quran/verses/uthmani?chapter_number=${surahNumber}`
    );
    const data = await res.json();
    return data.verses.map((v: any) => v.text_uthmani);
  } catch (err) {
    console.error(`Failed to fetch Arabic text for surah ${surahNumber}:`, err);
    return [];
  }
};

// Fetch Malay translation for a surah
const fetchMalayTranslation = async (surahNumber: number): Promise<string[]> => {
  try {
    const res = await fetch(
      `${API_BASE}/quran/translations/${MALAY_TRANSLATION_ID}?chapter_number=${surahNumber}`
    );
    const data = await res.json();
    return data.translations.map((t: any) => cleanText(t.text));
  } catch (err) {
    console.error(`Failed to fetch Malay translation for surah ${surahNumber}:`, err);
    return [];
  }
};

// Main function: Get full surah with ayat as courses
export const fetchSurahCourses = async (surahNumber: number): Promise<QuranSurahDetail> => {
  // Return from cache if available
  if (cache[surahNumber]) {
    return cache[surahNumber];
  }

  try {
    const [info, arabicTexts, malayTexts] = await Promise.all([
      fetchSurahInfo(surahNumber),
      fetchArabicText(surahNumber),
      fetchMalayTranslation(surahNumber),
    ]);

    const ayat: QuranAyat[] = [];
    const count = Math.max(arabicTexts.length, malayTexts.length);

    for (let i = 0; i < count; i++) {
      ayat.push({
        number: i + 1,
        textArabic: arabicTexts[i] || '',
        textMalay: malayTexts[i] || '',
        surahNumber,
        surahName: info.nameEnglish,
        juzuk: 0, // Can be fetched separately if needed
        courseId: `quran-${surahNumber}-${i + 1}`,
      });
    }

    const result: QuranSurahDetail = {
      surahNumber,
      surahNameArabic: info.nameArabic,
      surahNameMalay: info.nameMalay,
      surahNameEnglish: info.nameEnglish,
      totalAyat: info.totalAyat,
      revelationType: info.revelationType,
      ayat,
    };

    // Cache result
    cache[surahNumber] = result;
    return result;

  } catch (err) {
    console.error(`Failed to fetch surah ${surahNumber} courses:`, err);
    // Return empty structure on failure
    return {
      surahNumber,
      surahNameArabic: '',
      surahNameMalay: '',
      surahNameEnglish: `Surah ${surahNumber}`,
      totalAyat: 0,
      revelationType: '',
      ayat: [],
    };
  }
};

// Fetch a single ayat (for individual course view)
export const fetchSingleAyat = async (
  surahNumber: number,
  ayatNumber: number
): Promise<QuranAyat | null> => {
  try {
    const surah = await fetchSurahCourses(surahNumber);
    return surah.ayat.find(a => a.number === ayatNumber) || null;
  } catch {
    return null;
  }
};

// Get all 114 surah list (lightweight, no ayat)
export const fetchAllSurahList = async (): Promise<
  { number: number; nameArabic: string; nameEnglish: string; totalAyat: number; revelationType: string }[]
> => {
  try {
    const res = await fetch(`${API_BASE}/chapters?language=ms`);
    const data = await res.json();
    return data.chapters.map((ch: any) => ({
      number: ch.id,
      nameArabic: ch.name_arabic,
      nameEnglish: ch.name_simple,
      totalAyat: ch.verses_count,
      revelationType: ch.revelation_place,
    }));
  } catch (err) {
    console.error('Failed to fetch surah list:', err);
    return [];
  }
};
