-- ═══════════════════════════════════════════════════════════════════
-- Harmony Lifestyle Academy — Sunnah Module Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. sunnah_items ─────────────────────────────────────────────
--   Stores all 354 sunnah entries (content managed via Supabase dashboard
--   or bulk INSERT statements).
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sunnah_items (
  id              INTEGER PRIMARY KEY,          -- 1–354 (sequential, matches plan)
  title           TEXT    NOT NULL,             -- Malay title
  arabic_title    TEXT    NOT NULL DEFAULT '',  -- Arabic name of the practice
  arabic          TEXT    NOT NULL DEFAULT '',  -- Arabic du'a / description text
  transliteration TEXT    NOT NULL DEFAULT '',  -- Romanised pronunciation
  translation     TEXT    NOT NULL DEFAULT '',  -- Malay meaning / translation
  source          TEXT    NOT NULL DEFAULT '',  -- e.g. "Sahih al-Bukhari, Hadith 6312"
  narrator        TEXT    NOT NULL DEFAULT '',  -- e.g. "Diriwayatkan oleh Abu Hurairah (RA)"
  category        TEXT    NOT NULL,             -- e.g. "Upon Waking"
  time_of_day     TEXT    NOT NULL
                    CHECK (time_of_day IN ('morning','afternoon','evening','night')),
  topic           TEXT    NOT NULL DEFAULT '',  -- sub-topic label
  emoji           TEXT    NOT NULL DEFAULT '📿',
  benefit         TEXT    NOT NULL DEFAULT '',  -- spiritual/physical benefit explanation
  how_to          TEXT    NOT NULL DEFAULT '',  -- numbered step-by-step instructions
  quiz            JSONB   NOT NULL DEFAULT      -- MCQ: { question, options[4], correctIndex, explanation }
    '{"question":"","options":["","","",""],"correctIndex":0,"explanation":""}',
  reflection      TEXT    NOT NULL DEFAULT '',  -- journaling prompt
  xp_reward       INTEGER NOT NULL DEFAULT 15,  -- 10–30 XP
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common filters
CREATE INDEX IF NOT EXISTS idx_sunnah_time_of_day ON public.sunnah_items (time_of_day);
CREATE INDEX IF NOT EXISTS idx_sunnah_category    ON public.sunnah_items (category);
CREATE INDEX IF NOT EXISTS idx_sunnah_time_cat    ON public.sunnah_items (time_of_day, category);

-- Full-text search index (optional but recommended for search feature)
CREATE INDEX IF NOT EXISTS idx_sunnah_fts
  ON public.sunnah_items
  USING gin(to_tsvector('simple', title || ' ' || translation || ' ' || category));

-- Enable Row Level Security
ALTER TABLE public.sunnah_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone (authenticated or anonymous) to read sunnah content
CREATE POLICY "sunnah_items_public_read"
  ON public.sunnah_items
  FOR SELECT
  USING (true);

-- Only service-role / admins can insert/update/delete content
-- (uncomment if you want to allow admin inserts via the dashboard)
-- CREATE POLICY "sunnah_items_admin_write"
--   ON public.sunnah_items
--   FOR ALL
--   USING (auth.role() = 'service_role');


-- ─── 2. sunnah_progress ──────────────────────────────────────────
--   Tracks which sunnah items each authenticated user has completed.
--   Falls back to localStorage for unauthenticated users (see sunnahService.ts).
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sunnah_progress (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sunnah_id    INTEGER     NOT NULL REFERENCES public.sunnah_items(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  quiz_passed  BOOLEAN     DEFAULT FALSE,
  UNIQUE (user_id, sunnah_id)
);

CREATE INDEX IF NOT EXISTS idx_sunnah_progress_user ON public.sunnah_progress (user_id);

ALTER TABLE public.sunnah_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sunnah_progress_read_own"
  ON public.sunnah_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "sunnah_progress_insert_own"
  ON public.sunnah_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "sunnah_progress_update_own"
  ON public.sunnah_progress FOR UPDATE
  USING (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════
-- SAMPLE DATA — first 5 rows to verify schema works
-- Remove or replace with your full 354-row INSERT when ready.
-- ═══════════════════════════════════════════════════════════════════
INSERT INTO public.sunnah_items
  (id, title, arabic_title, arabic, transliteration, translation, source, narrator,
   category, time_of_day, topic, emoji, benefit, how_to, quiz, reflection, xp_reward)
VALUES
(1,
 'Doa Bangun Tidur',
 'دُعَاءُ الِاسْتِيقَاظِ',
 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
 'Alhamdulillahil-ladhi ahyana ba''da ma amatana wa ilayhin-nushur',
 'Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nyalah kami akan dibangkitkan.',
 'Sahih al-Bukhari, Hadith 6312',
 'Diriwayatkan oleh Huzaifah ibn al-Yaman (RA)',
 'Upon Waking', 'morning', 'Doa Pagi', '🌅',
 'Doa ini mengajar kita bahawa setiap pagi yang kita bangun adalah pemberian Allah. Tidur diibaratkan kematian kecil, dan bangun semula adalah tanda rahmat Allah.',
 E'1. Sebaik sahaja buka mata dari tidur\n2. Sebelum turun dari katil\n3. Baca doa ini dengan penuh rasa syukur\n4. Fikirkan nikmat hidup yang Allah berikan',
 '{"question":"Apakah doa yang perlu dibaca pertama sekali selepas bangun dari tidur?","options":["Bismillahirrahmanirrahim","Alhamdulillahil-ladhi ahyana ba''da ma amatana","Subhanallahu wa bihamdihi","La ilaha illallahu wahdah"],"correctIndex":1,"explanation":"Rasulullah SAW sentiasa membaca doa ini setiap kali bangun tidur. (Sahih al-Bukhari, Hadith 6312)"}',
 'Allah memberikan kita kehidupan baru setiap pagi. Apakah satu amalan baik yang akan kamu lakukan hari ini sebagai tanda syukur?',
 15),

(2,
 'Mengusap Muka Selepas Bangun',
 'مَسْحُ الْوَجْهِ عِنْدَ الِاسْتِيقَاظِ',
 'كَانَ إِذَا اسْتَيْقَظَ مَسَحَ وَجْهَهُ بِيَدَيْهِ',
 'Kana idha istayqaza masaha wajhahu biyadayhi',
 'Baginda SAW apabila bangun tidur, mengusap mukanya dengan kedua-dua tangannya.',
 'Sahih al-Bukhari, Hadith 183',
 'Diriwayatkan oleh Ibn Abbas (RA)',
 'Upon Waking', 'morning', 'Sunnah Bangun', '👐',
 'Mengusap muka membantu mengaktifkan saraf muka dan menghilangkan rasa mengantuk. Ia juga lambang kesedaran dan persiapan untuk memulakan hari.',
 E'1. Bangun dari tidur\n2. Angkat kedua-dua tangan\n3. Usap muka perlahan-lahan dari dahi ke dagu\n4. Ulangi 1-2 kali',
 '{"question":"Apakah sunnah Rasulullah SAW yang dilakukan selepas bangun tidur?","options":["Terus solat tanpa bersiap","Mengusap muka dengan kedua tangan","Minum air sejuk","Membaca al-Quran"],"correctIndex":1,"explanation":"Hadith sahih menceritakan bahawa Rasulullah SAW mengusap mukanya selepas bangun tidur sebagai amalan harian baginda."}',
 'Setiap pagi adalah peluang baru dari Allah. Apakah yang ingin kamu capai hari ini?',
 15),

(3,
 'Membaca Tiga Ayat Terakhir Ali Imran',
 'قِرَاءَةُ آخِرِ آلِ عِمْرَانَ',
 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ لِأُولِي الْأَلْبَابِ',
 'Inna fi khalqis-samawati wal-ardi wakhtilaafil-layli wan-nahari la-ayatin li-ulil-albab',
 'Sesungguhnya pada penciptaan langit dan bumi dan pergantian malam dan siang terdapat tanda-tanda kebesaran Allah bagi orang yang berakal.',
 'Sahih al-Bukhari, Hadith 183',
 'Diriwayatkan oleh Ibn Abbas (RA)',
 'Upon Waking', 'morning', 'Tilawah Pagi', '📖',
 'Membaca ayat-ayat ini selepas bangun melatih minda untuk berfikir tentang keajaiban ciptaan Allah dan mensyukuri nikmat akal yang diberikan.',
 E'1. Selepas bangun dan mengusap muka\n2. Duduk di atas katil\n3. Baca 10 ayat terakhir Surah Ali Imran (ayat 190-200)\n4. Renungkan maksud setiap ayat',
 '{"question":"Surah apakah yang dibaca Rasulullah SAW selepas bangun tidur?","options":["Al-Fatihah","Al-Baqarah","Ali Imran (10 ayat terakhir)","Yasin"],"correctIndex":2,"explanation":"Ibn Abbas meriwayatkan bahawa Rasulullah SAW membaca 10 ayat terakhir Surah Ali Imran selepas bangun dari tidur malam."}',
 'Langit dan bumi sentiasa bertasbih. Apakah tanda keajaiban Allah yang kamu nampak hari ini?',
 20),

(4,
 'Bersugi (Miswak) Selepas Bangun',
 'السِّوَاكُ عِنْدَ الِاسْتِيقَاظِ',
 'لَوْلَا أَنْ أَشُقَّ عَلَى أُمَّتِي لَأَمَرْتُهُمْ بِالسِّوَاكِ عِنْدَ كُلِّ صَلَاةٍ',
 'Lawla an ashuqqa ''ala ummati la-amartuhum bis-siwaki ''inda kulli salah',
 'Sekiranya tidak memberatkan umatku, nescaya aku perintahkan mereka bersugi pada setiap solat.',
 'Sahih al-Bukhari, Hadith 887',
 'Diriwayatkan oleh Abu Hurairah (RA)',
 'Upon Waking', 'morning', 'Kebersihan Mulut', '🦷',
 'Miswak mengandungi bahan antibakteria semula jadi. Kajian moden membuktikan miswak lebih berkesan daripada ubat gigi biasa dalam membunuh kuman mulut.',
 E'1. Ambil miswak yang telah dibasahkan\n2. Gosok gigi dari kanan ke kiri\n3. Gosok gusi atas kemudian bawah\n4. Bersihkan lidah\n5. Bilas mulut',
 '{"question":"Mengapa Rasulullah SAW tidak mewajibkan miswak pada setiap solat?","options":["Kerana miswak sukar didapati","Kerana tidak mahu membebankan umat","Kerana miswak tidak penting","Kerana miswak hanya untuk ulama"],"correctIndex":1,"explanation":"Rasulullah SAW bersabda bahawa baginda tidak mewajibkannya atas sebab tidak mahu memberatkan umat, tetapi sangat menggalakkannya."}',
 'Kebersihan adalah sebahagian daripada iman. Bagaimana kamu menjaga kebersihan diri sebagai ibadah kepada Allah?',
 15),

(5,
 'Membersihkan Hidung (Istintsar)',
 'الِاسْتِنْثَارُ عِنْدَ الِاسْتِيقَاظِ',
 'إِذَا اسْتَيْقَظَ أَحَدُكُمْ مِنْ نَوْمِهِ فَلْيَسْتَنْثِرْ ثَلَاثَ مَرَّاتٍ',
 'Idha istayqaza ahadukum min nawmihi fal-yastanthir thalatha marratin',
 'Apabila salah seorang di antara kamu bangun dari tidurnya, hendaklah dia menghembuskan udara dari hidungnya tiga kali.',
 'Sahih al-Bukhari, Hadith 3295',
 'Diriwayatkan oleh Abu Hurairah (RA)',
 'Upon Waking', 'morning', 'Kebersihan Pagi', '👃',
 'Semasa tidur, syaitan bersarang di hujung hidung. Istintsar membersihkan saluran pernafasan dan menyingkirkan kuman yang terkumpul semasa tidur.',
 E'1. Selepas bangun tidur\n2. Di dalam bilik air atau luar\n3. Hembuskan udara kuat dari hidung\n4. Ulangi tiga kali\n5. Boleh guna air untuk membilas',
 '{"question":"Berapa kali Rasulullah SAW mengajar kita untuk membersihkan hidung selepas bangun tidur?","options":["Sekali","Dua kali","Tiga kali","Tujuh kali"],"correctIndex":2,"explanation":"Hadith sahih menyatakan bahawa kita perlu melakukan istintsar (membersihkan hidung) tiga kali selepas bangun dari tidur."}',
 'Kebersihan badan mencerminkan kebersihan hati. Apakah yang kamu ingin bersihkan dalam diri kamu hari ini?',
 15)

ON CONFLICT (id) DO NOTHING;


-- ═══════════════════════════════════════════════════════════════════
-- VERIFICATION QUERIES
-- Run these after the INSERT to confirm data loaded correctly:
-- ═══════════════════════════════════════════════════════════════════
-- SELECT count(*) FROM public.sunnah_items;
-- SELECT id, title, category, time_of_day, xp_reward FROM public.sunnah_items ORDER BY id LIMIT 10;
-- SELECT DISTINCT category FROM public.sunnah_items WHERE time_of_day = 'morning' ORDER BY category;
