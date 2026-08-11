import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAllSurahList, fetchSurahCourses, fetchSurahInfo } from './quranApiService';

const jsonResponse = (body: unknown) => ({
  json: async () => body,
});

describe('fetchSurahInfo', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps the API response into the expected shape', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({
        chapter: {
          name_arabic: 'الفاتحة',
          name_simple: 'Al-Fatihah',
          translated_name: { name: 'Pembukaan' },
          verses_count: 7,
          revelation_place: 'makkah',
        },
      })
    );

    const info = await fetchSurahInfo(1);
    expect(info).toEqual({
      nameArabic: 'الفاتحة',
      nameEnglish: 'Al-Fatihah',
      nameMalay: 'Pembukaan',
      totalAyat: 7,
      revelationType: 'makkah',
    });
  });

  it('rejects when the underlying fetch fails', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('network down'));
    await expect(fetchSurahInfo(1)).rejects.toThrow('network down');
  });
});

describe('fetchSurahCourses', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('combines info, Arabic text, and Malay translation into ayat entries', async () => {
    const fetchMock = fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/chapters/')) {
        return Promise.resolve(
          jsonResponse({
            chapter: {
              name_arabic: 'الإخلاص',
              name_simple: 'Al-Ikhlas',
              translated_name: { name: 'Keikhlasan' },
              verses_count: 4,
              revelation_place: 'makkah',
            },
          })
        );
      }
      if (url.includes('/quran/verses/uthmani')) {
        return Promise.resolve(jsonResponse({ verses: [{ text_uthmani: 'A1' }, { text_uthmani: 'A2' }] }));
      }
      if (url.includes('/quran/translations/')) {
        return Promise.resolve(jsonResponse({ translations: [{ text: 'T1' }, { text: '<i>T2</i>' }] }));
      }
      return Promise.reject(new Error(`unexpected url ${url}`));
    });

    const result = await fetchSurahCourses(112);

    expect(result.surahNumber).toBe(112);
    expect(result.ayat).toHaveLength(2);
    expect(result.ayat[0]).toMatchObject({
      number: 1,
      textArabic: 'A1',
      textMalay: 'T1',
      courseId: 'quran-112-1',
    });
    // HTML tags in translations are stripped.
    expect(result.ayat[1].textMalay).toBe('T2');
  });

  it('serves subsequent requests for the same surah from cache', async () => {
    const fetchMock = fetch as ReturnType<typeof vi.fn>;
    fetchMock.mockImplementation((url: string) => {
      if (url.includes('/chapters/')) {
        return Promise.resolve(
          jsonResponse({
            chapter: {
              name_arabic: 'a',
              name_simple: 'b',
              translated_name: { name: 'c' },
              verses_count: 1,
              revelation_place: 'makkah',
            },
          })
        );
      }
      if (url.includes('/quran/verses/uthmani')) {
        return Promise.resolve(jsonResponse({ verses: [{ text_uthmani: 'A' }] }));
      }
      return Promise.resolve(jsonResponse({ translations: [{ text: 'T' }] }));
    });

    await fetchSurahCourses(999);
    const callsAfterFirst = fetchMock.mock.calls.length;
    await fetchSurahCourses(999);

    expect(fetchMock.mock.calls.length).toBe(callsAfterFirst);
  });

  it('falls back to an empty structure when a downstream call throws', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('down'));
    const result = await fetchSurahCourses(55);
    expect(result).toEqual({
      surahNumber: 55,
      surahNameArabic: '',
      surahNameMalay: '',
      surahNameEnglish: 'Surah 55',
      totalAyat: 0,
      revelationType: '',
      ayat: [],
    });
  });
});

describe('fetchAllSurahList', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns an empty array instead of throwing when the request fails', async () => {
    (fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('offline'));
    await expect(fetchAllSurahList()).resolves.toEqual([]);
  });
});
