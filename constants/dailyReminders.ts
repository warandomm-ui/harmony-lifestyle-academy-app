// constants/dailyReminders.ts
// Daily reminder shown on the dashboard: one item per day, rotating through
// Quran verses, authentic hadith, and "Satu Hari Satu Sunnah" practices.
//
// Sources:
// - Quran: surah name and verse number. Malay meanings are explanatory
//   translations, not the Quran itself.
// - Hadith: collection and number. Sahih al-Bukhari follows the common
//   (Fath al-Bari) numbering; Sahih Muslim follows Fuad Abdul Baqi's numbering.
//   Numbering differs between editions, so check against the edition in use.
// Please have every entry checked by a qualified teacher (ustaz/ustazah)
// before adding to or editing this list.

export type DailyReminderType = 'quran' | 'hadith' | 'sunnah';

export interface DailyReminder {
  type: DailyReminderType;
  text: string;      // Malay meaning
  source: string;    // e.g. "Surah Al-Insyirah (94): 6" or "Sahih al-Bukhari no. 1"
  narrator?: string; // for hadith
  practice?: string; // for sunnah: what to do today
}

export const DAILY_REMINDERS: DailyReminder[] = [
  // ── Al-Quran ──
  { type: 'quran', text: 'Maka sesungguhnya bersama kesulitan ada kemudahan.', source: 'Surah Al-Insyirah (94): 6' },
  { type: 'quran', text: 'Bacalah dengan nama Tuhanmu yang menciptakan.', source: 'Surah Al-‘Alaq (96): 1' },
  { type: 'quran', text: 'Dan katakanlah: Ya Tuhanku, tambahkanlah ilmu kepadaku.', source: 'Surah Taha (20): 114' },
  { type: 'quran', text: 'Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.', source: 'Surah Al-Baqarah (2): 286' },
  { type: 'quran', text: 'Sesungguhnya Allah tidak mengubah keadaan sesuatu kaum sehingga mereka mengubah keadaan yang ada pada diri mereka sendiri.', source: 'Surah Ar-Ra‘d (13): 11' },
  { type: 'quran', text: 'Ketahuilah, dengan mengingati Allah hati menjadi tenteram.', source: 'Surah Ar-Ra‘d (13): 28' },
  { type: 'quran', text: 'Allah mengangkat darjat orang-orang yang beriman di antara kamu dan orang-orang yang diberi ilmu beberapa darjat.', source: 'Surah Al-Mujadilah (58): 11' },

  // ── Hadis ──
  { type: 'hadith', text: 'Sesungguhnya setiap amalan bergantung kepada niat, dan setiap orang mendapat apa yang dia niatkan.', source: 'Sahih al-Bukhari no. 1; Sahih Muslim no. 1907', narrator: 'Umar bin al-Khattab (RA)' },
  { type: 'hadith', text: 'Sesiapa yang menempuh satu jalan untuk menuntut ilmu, Allah akan memudahkan baginya jalan ke syurga.', source: 'Sahih Muslim no. 2699', narrator: 'Abu Hurairah (RA)' },
  { type: 'hadith', text: 'Amalan yang paling dicintai Allah ialah yang berterusan walaupun sedikit.', source: 'Sahih al-Bukhari no. 6464; Sahih Muslim no. 783', narrator: '‘Aisyah (RA)' },
  { type: 'hadith', text: 'Orang yang kuat bukanlah yang hebat bergusti, tetapi orang yang kuat ialah yang dapat menguasai dirinya ketika marah.', source: 'Sahih al-Bukhari no. 6114; Sahih Muslim no. 2609', narrator: 'Abu Hurairah (RA)' },
  { type: 'hadith', text: 'Tidak sempurna iman seseorang daripada kamu sehingga dia mencintai untuk saudaranya apa yang dia cintai untuk dirinya sendiri.', source: 'Sahih al-Bukhari no. 13; Sahih Muslim no. 45', narrator: 'Anas bin Malik (RA)' },
  { type: 'hadith', text: 'Sesiapa yang beriman kepada Allah dan hari akhirat, hendaklah dia berkata yang baik atau diam.', source: 'Sahih al-Bukhari no. 6018; Sahih Muslim no. 47', narrator: 'Abu Hurairah (RA)' },
  { type: 'hadith', text: 'Sebaik-baik kamu ialah orang yang mempelajari al-Quran dan mengajarkannya.', source: 'Sahih al-Bukhari no. 5027', narrator: '‘Uthman bin ‘Affan (RA)' },
  { type: 'hadith', text: 'Seorang Muslim ialah orang yang Muslim lain selamat daripada lidah dan tangannya.', source: 'Sahih al-Bukhari no. 10; Sahih Muslim no. 40', narrator: '‘Abdullah bin ‘Amr (RA)' },
  { type: 'hadith', text: 'Sesungguhnya Allah tidak melihat kepada rupa dan harta kamu, tetapi Dia melihat kepada hati dan amalan kamu.', source: 'Sahih Muslim no. 2564', narrator: 'Abu Hurairah (RA)' },
  { type: 'hadith', text: 'Bersuci itu separuh daripada iman.', source: 'Sahih Muslim no. 223', narrator: 'Abu Malik al-Asy‘ari (RA)' },

  // ── Satu Hari Satu Sunnah ──
  { type: 'sunnah', text: 'Wahai anak, sebutlah nama Allah, makanlah dengan tangan kananmu, dan makanlah apa yang dekat denganmu.', source: 'Sahih al-Bukhari no. 5376; Sahih Muslim no. 2022', narrator: '‘Umar bin Abi Salamah (RA)', practice: 'Baca “Bismillah” dan makan dengan tangan kanan pada setiap hidangan hari ini.' },
  { type: 'sunnah', text: 'Kamu tidak akan masuk syurga sehingga kamu beriman, dan kamu tidak beriman sehingga kamu saling mencintai. Mahukah aku tunjukkan sesuatu yang jika kamu lakukan kamu akan saling mencintai? Sebarkanlah salam di antara kamu.', source: 'Sahih Muslim no. 54', narrator: 'Abu Hurairah (RA)', practice: 'Mulakan setiap pertemuan hari ini dengan memberi salam.' },
  { type: 'sunnah', text: 'Kalaulah tidak memberatkan umatku, nescaya aku perintahkan mereka bersiwak setiap kali hendak solat.', source: 'Sahih al-Bukhari no. 887; Sahih Muslim no. 252', narrator: 'Abu Hurairah (RA)', practice: 'Bersiwak atau memberus gigi sebelum solat hari ini.' },
  { type: 'sunnah', text: 'Apabila seseorang daripada kamu memakai kasut, mulakanlah dengan kaki kanan; dan apabila menanggalkannya, mulakanlah dengan kaki kiri.', source: 'Sahih al-Bukhari no. 5856; Sahih Muslim no. 2097', narrator: 'Abu Hurairah (RA)', practice: 'Dahulukan kaki kanan ketika memakai kasut, dan kaki kiri ketika menanggalkannya.' },
  { type: 'sunnah', text: 'Apabila kamu hendak tidur, berwuduklah seperti wuduk untuk solat, kemudian berbaringlah di atas lambung kananmu.', source: 'Sahih al-Bukhari no. 247; Sahih Muslim no. 2710', narrator: 'Al-Bara’ bin ‘Azib (RA)', practice: 'Berwuduk sebelum tidur malam ini dan berbaring di sebelah kanan.' },
  { type: 'sunnah', text: 'Apabila bangun tidur, Rasulullah ﷺ membaca: “Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dibangkitkan.”', source: 'Sahih al-Bukhari no. 6312', narrator: 'Hudhaifah (RA)', practice: 'Baca doa bangun tidur sebaik sahaja anda bangun esok pagi.' },
];

// Interleaves the three types (Quran, hadith, sunnah) so consecutive days vary,
// then picks one item per calendar day.
export const getReminderForDate = (date: Date): DailyReminder => {
  const byType = (t: DailyReminderType) => DAILY_REMINDERS.filter(r => r.type === t);
  const lists = [byType('quran'), byType('hadith'), byType('sunnah')];
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  const list = lists[dayOfYear % lists.length];
  return list[Math.floor(dayOfYear / lists.length) % list.length];
};
