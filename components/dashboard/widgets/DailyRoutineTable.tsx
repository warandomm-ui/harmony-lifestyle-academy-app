import React, { useState, useEffect } from 'react';

// --- Types ---
interface DimensionBenefit {
  ruh: string;
  aql: string;
  qalb: string;
  nafs: string;
  jasad: string;
}

interface RoutineTask {
  id: string;
  time: string;
  task: string;
  category: 'solat' | 'ibadah' | 'health' | 'study' | 'life' | 'social';
  sunnahNote: string;
  scienceNote: string;
  dimensions: DimensionBenefit;
  isFixed: boolean;
}

interface RoutineLog {
  [taskId: string]: boolean;
}

const CATEGORY_CONFIG = {
  solat:  { emoji: '🕌', label: 'Solat',     color: 'emerald' },
  ibadah: { emoji: '📿', label: 'Ibadah',    color: 'indigo' },
  health: { emoji: '💪', label: 'Kesihatan', color: 'rose' },
  study:  { emoji: '📚', label: 'Ilmu',      color: 'amber' },
  life:   { emoji: '🌙', label: 'Kehidupan', color: 'cyan' },
  social: { emoji: '👨‍👩‍👧‍👦', label: 'Sosial',    color: 'pink' },
};

const DIMENSION_CONFIG = {
  ruh:   { emoji: '🕊️', label: 'Ruh',   desc: 'Kesedaran Spiritual' },
  aql:   { emoji: '🧠', label: 'Aql',   desc: 'Akal & Pemikiran' },
  qalb:  { emoji: '❤️', label: 'Qalb',  desc: 'Hati & Emosi' },
  nafs:  { emoji: '⚔️', label: 'Nafs',  desc: 'Disiplin Diri' },
  jasad: { emoji: '💪', label: 'Jasad', desc: 'Fizikal & Badan' },
};

// ========================================
// DEFAULT PROPHETIC ROUTINE
// Setiap rutin: Sunnah + Sains + 5 Dimensi
// ========================================
const DEFAULT_ROUTINE: RoutineTask[] = [
  {
    id: 'tahajjud',
    time: '4:30 AM',
    task: 'Qiyamullail / Tahajjud',
    category: 'ibadah',
    sunnahNote: 'Nabi ﷺ bangun sepertiga malam terakhir untuk solat malam. "Doa paling dimakbulkan ialah di sepertiga akhir malam" (HR Tirmizi). Baginda tidak pernah tinggalkan tahajjud walau dalam musafir.',
    scienceNote: '🔬 Kajian 2025 (Kufa Journal, 210 peserta Indonesia, 4 minggu): Bangun 4-5 pagi → cortisol naik +45%, gen BMAL1 & PER2 naik 1.5x. Kesan: metabolisme aktif, gula darah stabil, badan cergas. Badan align dengan circadian rhythm semulajadi.',
    dimensions: {
      ruh: 'Masa paling dekat dengan Allah — doa dimakbulkan, hati disambung terus kepada Pencipta',
      aql: 'Prefrontal cortex paling tenang — sesuai berfikir jernih, buat keputusan & rancang hari',
      qalb: 'Hati dilembut dengan munajat — rasa takut, harap & cinta pada Allah paling mendalam',
      nafs: 'Latihan ULTIMATE lawan nafs — bangun masa orang tidur = bukti kau serius berubah',
      jasad: 'Cortisol naik +45% semulajadi — badan "switch on" awal, metabolisme aktif',
    },
    isFixed: false,
  },
  {
    id: 'subuh',
    time: '5:30 AM',
    task: 'Solat Subuh',
    category: 'solat',
    sunnahNote: '"Dua rakaat Subuh lebih baik dari dunia dan seisinya" (HR Muslim). Nabi ﷺ solat berjemaah & duduk berzikir sehingga syuruk.',
    scienceNote: '🔬 Kajian 2021 (Medical J Malaysia, review 1966-2020): Solat = kesan positif pada neurologi, kardiovaskular & muskuloskeletal. Kajian 2025 (IJABSS): Sujud = "grounding therapy" — sentuhan dahi ke tanah stabilkan sistem saraf & tingkatkan emotional regulation. Aliran darah ke otak meningkat semasa sujud.',
    dimensions: {
      ruh: 'Tiang agama — berdiri di hadapan Allah = mengaku kita hamba, Dia Tuhan',
      aql: 'Sujud tingkatkan aliran darah ke otak — lebih oksigen, lebih fokus sepanjang pagi',
      qalb: 'Al-Fatihah setiap rakaat = "perbualan" dengan Allah — hati tenang & terpimpin',
      nafs: 'Bangun awal untuk Subuh lawan kemalasan — disiplin paling asas yang bina semua disiplin lain',
      jasad: 'Rukuk, sujud, duduk = senaman ringan teratur yang aktifkan hampir semua sendi & otot utama',
    },
    isFixed: true,
  },
  {
    id: 'azkar-pagi',
    time: '5:50 AM',
    task: 'Zikir & Doa Pagi',
    category: 'ibadah',
    sunnahNote: 'Nabi ﷺ duduk berzikir dari Subuh sampai syuruk. Amalan: Ayatul Kursi, 3 Qul 3x, SubhanAllah 33x, Alhamdulillah 33x, Allahuakbar 33x. "Siapa baca ini, dilindungi dari segala keburukan" (HR Abu Dawud).',
    scienceNote: '🔬 Systematic Review 2025 (Iranian J Psychiatry, 22 kajian EEG): Zikir/Quran naikkan gelombang alpha & theta otak = relaxation & emotional regulation. Kesan berlaku walaupun pada bukan Muslim. Kajian 2023: Zikir kurangkan anxiety, stress & depression secara signifikan.',
    dimensions: {
      ruh: 'Perisai rohani — perlindungan dari gangguan syaitan & keburukan sepanjang hari',
      aql: 'Gelombang alpha naik = "fokus tenang" — otak masuk state optimal untuk belajar',
      qalb: 'SubhanAllah, Alhamdulillah, Allahuakbar = reset emosi. Hati jadi positif & tenang',
      nafs: 'Istiqamah zikir setiap pagi = latihan konsistensi. Nafs belajar ikut jadual, bukan ikut mood',
      jasad: 'Cortisol turun — tekanan darah stabil, immune system lebih kuat',
    },
    isFixed: false,
  },
  {
    id: 'isyraq',
    time: '6:30 AM',
    task: 'Solat Dhuha / Isyraq',
    category: 'ibadah',
    sunnahNote: '"Setiap pagi, setiap sendi kamu ada sedekah. Dua rakaat Dhuha sudah cukup untuk sedekah 360 sendi" (HR Muslim). Nabi ﷺ solat Dhuha 2-8 rakaat.',
    scienceNote: '🔬 Kajian 2020 (Narrative Review): Solat = aktiviti fizikal ringan sama kesan seperti yoga — tingkatkan fleksibiliti & sistem immune. Muslim pengamal solat punya range of motion 139.5° vs 102.5° bukan pengamal.',
    dimensions: {
      ruh: 'Sedekah untuk setiap sendi = bersyukur dengan badan yang Allah beri',
      aql: 'Pergerakan ringan pagi bantu otak "warm up" untuk deep focus',
      qalb: 'Solat sunat = bukti cinta pada Allah tanpa dipaksa — hati jadi lebih ikhlas',
      nafs: 'Nafs kata "tak wajib, skip lah" — lawan tu = upgrade disiplin ke level seterusnya',
      jasad: 'Senaman ringan aktifkan sendi, lancarkan peredaran darah, tingkatkan flexibility',
    },
    isFixed: false,
  },
  {
    id: 'workout',
    time: '6:45 AM',
    task: 'Senaman / Workout (30 min)',
    category: 'health',
    sunnahNote: '"Mukmin yang kuat lebih baik dan lebih dicintai Allah dari mukmin yang lemah" (HR Muslim). Nabi ﷺ galakkan memanah, berkuda, berenang. Baginda pernah berlumba lari dengan Aisyah رضي الله عنها.',
    scienceNote: '🔬 Senaman pagi naikkan BDNF (brain growth factor) — tingkatkan memory & learning (Biomolecules, 2021). 30 min/hari kurangkan risiko depression 26% (Harvard, 2019). Senaman teratur tingkatkan neuroplasticity — otak belajar skill baru lebih pantas.',
    dimensions: {
      ruh: 'Badan kuat = ibadah lebih khusyuk, boleh puasa, bangun tahajjud tanpa penat',
      aql: 'BDNF naik = otak grow new neurons — literally jadi lebih pandai lepas senaman',
      qalb: 'Endorphin release = mood positif sepanjang hari. Exercise = anti-depressant semulajadi',
      nafs: 'Workout paksa nafs tahan tak selesa → belajar tahan sakit → transfer ke semua cabaran hidup',
      jasad: 'Otot kuat, jantung sihat, tulang padat, postur baik, stamina tinggi',
    },
    isFixed: false,
  },
  {
    id: 'breakfast',
    time: '7:30 AM',
    task: 'Sarapan Sihat (Sunnah Food)',
    category: 'health',
    sunnahNote: 'Nabi ﷺ makan kurma, madu, zaitun, roti barli, susu. Prinsip: 1/3 makanan, 1/3 air, 1/3 udara (HR Tirmizi). Makan tangan kanan, sebut Bismillah, duduk.',
    scienceNote: '🔬 Madu: Antibakteria, anti-radang, lawan 60+ jenis bakteria (Saudi J Bio Sci, 2020, 240 citations). Kurma: GI rendah 42-55, tinggi serat & potassium. Prinsip 1/3: Kurangkan insulin spike & risiko diabetes type 2.',
    dimensions: {
      ruh: 'Bismillah sebelum makan = ingat Allah Pemberi rezeki. Makanan halal & tayyib bersihkan ruh',
      aql: 'Otak guna 20% tenaga badan — sarapan betul beri glucose stabil untuk fokus 4-5 jam',
      qalb: 'Makan bersyukur = hati gembira. Makan berlebihan = hati berat & gelap',
      nafs: 'Prinsip 1/3 = latihan kawal nafsu. Nafs nak penuh — kau stop 1/3 = kau menang',
      jasad: 'Nutrisi seimbang pagi = tenaga stabil, pencernaan lancar, berat badan terkawal',
    },
    isFixed: false,
  },
  {
    id: 'study-1',
    time: '8:00 AM',
    task: 'Belajar / Sekolah (Deep Focus)',
    category: 'study',
    sunnahNote: '"Ya Allah, aku mohon ilmu yang bermanfaat, rezeki yang halal, dan amalan yang diterima" (HR Ibn Majah). Wahyu pertama: "Iqra — Bacalah!" (Al-Alaq: 1).',
    scienceNote: '🔬 Cortisol peak 8-11 pagi — otak paling alert & mampu proses info kompleks. "Deep work" pagi 2-4x lebih produktif dari petang (Cal Newport, MIT). Prefrontal cortex paling aktif selepas tidur cukup.',
    dimensions: {
      ruh: 'Menuntut ilmu = ibadah. "Siapa keluar menuntut ilmu, dia di jalan Allah sehingga pulang" (HR Tirmizi)',
      aql: 'Pagi = golden hour otak. Cortisol peak = fokus & ingatan paling tajam',
      qalb: 'Ilmu yang diamalkan buat hati tenang — tahu apa patut buat = kurang anxiety',
      nafs: 'Fokus 2-3 jam tanpa phone = latihan tahan godaan. Nafs nak scroll — kau belajar',
      jasad: 'Otak = otot. Semakin dilatih semakin kuat. Belajar pagi = senaman otak waktu peak',
    },
    isFixed: false,
  },
  {
    id: 'zohor',
    time: '1:00 PM',
    task: 'Solat Zohor',
    category: 'solat',
    sunnahNote: '"Amalan paling dicintai Allah ialah solat pada waktunya" (HR Bukhari). 12 rakaat sunat rawatib (4 sebelum + 2 selepas Zohor) = rumah di syurga.',
    scienceNote: '🔬 5x solat/hari = 5x "movement break" kurangkan risiko penyakit jantung & sakit belakang (Medical J Malaysia, 2021). WHO rekomen berdiri setiap 30-60 min — solat penuhi ini. Wudhu kurangkan bakteria hidung ~70% (Kajian Taif 2018).',
    dimensions: {
      ruh: 'Solat tengah hari = reset spiritual. Dunia buat kau lupa Allah — Zohor ingatkan balik',
      aql: 'Break dari belajar beri otak masa proses maklumat — memory consolidation lebih kukuh',
      qalb: 'Wudhu + solat = "emotional reset button". Masuk stres, keluar tenang',
      nafs: 'Solat tepat waktu walau sibuk = latihan prioriti. Allah > semua',
      jasad: 'Wudhu bersihkan bakteria. Gerakan solat kurangkan risiko DVT akibat duduk lama',
    },
    isFixed: true,
  },
  {
    id: 'lunch',
    time: '1:30 PM',
    task: 'Makan Tengahari',
    category: 'health',
    sunnahNote: 'Nabi ﷺ makan perlahan, tangan kanan, Bismillah, duduk. Tidak pernah mencela makanan. "Berkumpullah makan, nescaya diberkati" (HR Abu Dawud).',
    scienceNote: '🔬 Mindful eating tingkatkan rasa kenyang 25% lebih awal — kurangkan makan berlebihan (Harvard Health). Makan bersama tingkatkan oxytocin & kurangkan cortisol. Makan duduk = enzim pencernaan lebih efisien.',
    dimensions: {
      ruh: 'Bismillah + bersyukur = setiap suapan jadi ibadah',
      aql: 'Makan sederhana = tak ngantuk. Otak masih boleh function untuk sesi petang',
      qalb: 'Makan bersama = bonding. Tidak mencela makanan = hati bersyukur',
      nafs: 'Stop sebelum kenyang = latihan kawal diri paling basic. Master ini = master nafsu lain',
      jasad: 'Pencernaan efisien bila makan duduk & perlahan. Nutrisi diserap lebih baik',
    },
    isFixed: false,
  },
  {
    id: 'qailulah',
    time: '2:00 PM',
    task: 'Qailulah (Power Nap 20 min)',
    category: 'health',
    sunnahNote: '"Tidur sianglah (qailulah), kerana syaitan tidak tidur siang" (HR Al-Tabarani). Sahabat amalkan tidur siang sebentar untuk bertenaga menjelang malam.',
    scienceNote: '🔬 Meta-analysis 2022 (Sleep Medicine Reviews, 54 kajian): Power nap tingkatkan vigilance +61%, procedural memory +49%, declarative memory +38%. Paling berkesan 20-30 min sebelum 1 PM (Kajian 2021, 381 peserta).',
    dimensions: {
      ruh: 'Ikut Sunnah dalam perkara "kecil" = tanda cinta pada Nabi ﷺ',
      aql: 'Memory consolidation semasa nap — apa belajar pagi "disimpan" dalam long-term memory',
      qalb: 'Rehat tengah hari reset emosi — kurang irritable, lebih sabar petang',
      nafs: 'Nap 20 min je bukan 2 jam = latihan disiplin masa. Set alarm, bangun = nafs terkawal',
      jasad: 'Badan recovery dari pagi. Heart rate turun, otot relax, tenaga recharge',
    },
    isFixed: false,
  },
  {
    id: 'asar',
    time: '4:00 PM',
    task: 'Solat Asar',
    category: 'solat',
    sunnahNote: '"Siapa tinggalkan solat Asar, amalannya terhapus" (HR Bukhari). Asar = solat wusta yang disebut khas: "Hafizuu \'alas solawaat was solatil wusta" (Al-Baqarah: 238).',
    scienceNote: '🔬 2-4 PM = "afternoon slump" — adenosine terkumpul. Movement break (solat) counteract dengan tingkatkan blood flow & alertness. Wudhu air sejuk aktifkan "dive reflex" — turunkan heart rate, naikkan fokus semula.',
    dimensions: {
      ruh: 'Asar = ujian paling susah — semua sibuk. Tinggal semua & solat = bukti iman sebenar',
      aql: 'Break dari afternoon slump — otak reset untuk 2-3 jam productive petang',
      qalb: 'Hati yang jaga Asar = hati yang prioritikan Allah atas dunia',
      nafs: 'Nafs kata "nanti lah" — kau solat jugak = nafs kalah, iman menang',
      jasad: 'Wudhu + solat = physical reset. Kurangkan kesan duduk lama sepanjang hari',
    },
    isFixed: true,
  },
  {
    id: 'quran',
    time: '4:30 PM',
    task: 'Baca Al-Quran (10-30 min)',
    category: 'ibadah',
    sunnahNote: '"Setiap huruf 10 pahala — Alif satu huruf, Lam satu huruf, Mim satu huruf" (HR Tirmizi). "Quran itu penyembuh (syifa\') bagi apa yang ada dalam dada" (Al-Isra: 82).',
    scienceNote: '🔬 EEG Review 2025 (22 kajian): Baca/dengar Quran naikkan alpha & theta = relaxation & fokus mendalam. Systematic Review 2022 (20 kajian): Quran perbaiki depression, anxiety, kualiti tidur & naikkan IQ.',
    dimensions: {
      ruh: 'Quran = kalam Allah langsung. Baca = ruh "minum air" — tanpa Quran, ruh dahaga & mati perlahan',
      aql: 'Hafalan Quran tingkatkan IQ & memory. Theta otak = state "super learning"',
      qalb: '"Dengan zikrullah, hati jadi tenang" (Ar-Ra\'d: 28) — penyembuh paling mujarab untuk hati',
      nafs: 'Quran ajar apa betul & salah — nafs jadi terdidik, tahu had & limit',
      jasad: 'Cortisol turun, blood pressure stabil, immune system kuat',
    },
    isFixed: false,
  },
  {
    id: 'skill',
    time: '5:00 PM',
    task: 'Latih Skill / Side Project',
    category: 'study',
    sunnahNote: '"Tangan yang di atas (memberi) lebih baik dari tangan yang di bawah" (HR Bukhari & Muslim). Abu Bakar = ahli perniagaan, Ali = ahli ilmu, Khadijah = usahawan.',
    scienceNote: '🔬 Deliberate practice 1 jam/hari = pakar dalam bidang (Ericsson, 1993). Petang = waktu baik untuk latihan kreatif kerana prefrontal cortex kurang "strict" — idea lebih mengalir (Wieth & Zacks, 2011).',
    dimensions: {
      ruh: 'Skill bermanfaat = sedekah jariah. Buat app, ajar orang — pahala mengalir',
      aql: 'Deliberate practice bina neural pathways baru — otak "rewire" jadi lebih capable',
      qalb: 'Rasa "aku boleh buat sesuatu" = confidence naik, self-worth naik',
      nafs: 'Pilih skill practice > Netflix/TikTok = nafs kalah lagi satu round',
      jasad: 'Typing, coding, menulis = fine motor skill. Drawing = hand-eye coordination',
    },
    isFixed: false,
  },
  {
    id: 'maghrib',
    time: '7:15 PM',
    task: 'Solat Maghrib',
    category: 'solat',
    sunnahNote: 'Nabi ﷺ segera solat Maghrib sebaik azan — tidak bertangguh. Maghrib = peralihan siang ke malam, masa syaitan berkeliaran — solat jadi perisai.',
    scienceNote: '🔬 Kajian 2025 (IJABSS): Ibadah petang bantu transisi dari sympathetic (fight-or-flight) ke parasympathetic (rest-and-digest). Penting untuk: pemulihan otot, pencernaan malam & persiapan tidur berkualiti.',
    dimensions: {
      ruh: 'Peralihan siang-malam = tanda kebesaran Allah. Maghrib = syukur atas hari yang selamat',
      aql: 'Transisi ke mode "wind down" — otak proses & simpan semua input hari ini',
      qalb: 'Maghrib = refleksi. Apa baik hari ini? Apa perlu diperbaiki? Hati jadi sedar',
      nafs: 'Segera solat = lawan tangguh. Nafs nak "nanti, nak habis tengok ni" — kau solat',
      jasad: 'Parasympathetic aktif = badan masuk "repair mode". Otot relax, pencernaan lancar',
    },
    isFixed: true,
  },
  {
    id: 'family',
    time: '7:45 PM',
    task: 'Masa Keluarga / Silaturahim',
    category: 'social',
    sunnahNote: '"Sebaik-baik kamu ialah yang terbaik terhadap keluarganya" (HR Tirmizi). Nabi ﷺ bermain, bergurau, berbual dengan keluarga setiap malam. Tolong kerja rumah, jahit sendiri.',
    scienceNote: '🔬 Harvard Study (75+ tahun, 724 peserta): Hubungan sosial berkualiti = faktor #1 kebahagiaan & umur panjang — lebih penting dari duit atau kerjaya. Masa keluarga tingkatkan oxytocin & turunkan cortisol.',
    dimensions: {
      ruh: '"Siapa nak dimurahkan rezeki & dipanjangkan umur, sambunglah silaturahim" (HR Bukhari)',
      aql: 'Berbual dengan keluarga = latihan communication, empathy & problem-solving',
      qalb: 'Rasa "ada orang sayang aku" = hati kuat. Loneliness bunuh — connection sembuh',
      nafs: 'Dengar orang lain, sabar dengan kerenah mereka = latihan tahan ego',
      jasad: 'Oxytocin naik, cortisol turun = immune kuat, tekanan darah rendah, tidur nyenyak',
    },
    isFixed: false,
  },
  {
    id: 'isyak',
    time: '8:30 PM',
    task: 'Solat Isyak',
    category: 'solat',
    sunnahNote: '"Siapa solat Isyak berjemaah, seolah-olah dia qiam separuh malam" (HR Muslim). Nabi ﷺ tidak suka bergadang selepas Isyak kecuali untuk kebaikan.',
    scienceNote: '🔬 Melatonin mula naik ~8-9 PM — signal tidur (British J Pharmacology, 2018, 655 citations). Rutin malam konsisten stabilkan circadian rhythm → tidur nyenyak, immune kuat. Skrin phone suppress melatonin — solat = peluang letak phone.',
    dimensions: {
      ruh: 'Isyak = solat terakhir. "Tutup" hari dengan ibadah — apa sahaja berlaku, akhiri dengan Allah',
      aql: 'Letak phone, solat, zikir = digital detox malam yang bagi otak rehat dari overstimulation',
      qalb: 'Malam = hati paling vulnerable. Solat Isyak jadi "anchor" — hati ada pegangan',
      nafs: 'Tidak bergadang = lawan budaya scroll sampai 2 AM. Disiplin malam tentukan kualiti esok',
      jasad: 'Melatonin naik semulajadi. Tak ganggu phone = tidur lebih cepat & berkualiti',
    },
    isFixed: true,
  },
  {
    id: 'azkar-malam',
    time: '9:00 PM',
    task: 'Zikir Malam & Muhasabah',
    category: 'ibadah',
    sunnahNote: 'Umar al-Khattab: "Hisablah dirimu sebelum kamu dihisab." Amalan: Istighfar 100x, selawat, Surah Al-Mulk (pelindung azab kubur — HR Tirmizi), Ayatul Kursi.',
    scienceNote: '🔬 Meta-analysis 2020 (J Occupational Health, 9 RCT): Self-reflection & gratitude kurangkan stress & depression secara signifikan. Kajian 2022: 8 minggu gratitude practice naikkan resilience & turunkan anxiety pada mahasiswa.',
    dimensions: {
      ruh: 'Muhasabah = "audit" ruh harian. Apa jauh dari Allah? Apa dekatkan? Istighfar bersihkan',
      aql: 'Self-reflection aktifkan metacognition — "berfikir tentang cara berfikir" = level aql tertinggi',
      qalb: 'Istighfar bersihkan hati dari dosa. "Setiap dosa = titik hitam. Istighfar = polish balik" (HR Tirmizi)',
      nafs: 'Muhasabah paksa nafs mengaku salah — ego paling tak suka ini. Tapi ini yang buat kau grow',
      jasad: 'Zikir malam turunkan cortisol & heart rate — badan masuk deep relaxation mode',
    },
    isFixed: false,
  },
  {
    id: 'journal',
    time: '9:15 PM',
    task: 'Tulis Journal / Gratitude',
    category: 'life',
    sunnahNote: '"Siapa bersyukur, nescaya Aku tambah nikmatnya" (Ibrahim: 7). 3 soalan: Apa yang baik? Apa perlu diperbaiki? Apa target esok?',
    scienceNote: '🔬 Kajian 2022 (J American College Health, 132 mahasiswa, 8 minggu): Gratitude journaling naikkan life satisfaction, happiness, resilience & turunkan depression, anxiety & stress. Menulis sebelum tidur "offload" fikiran → tidur lebih nyenyak.',
    dimensions: {
      ruh: 'Tulis nikmat Allah = syukur bertulis. Semakin syukur, semakin nampak nikmat — ruh jadi kaya',
      aql: 'Menulis = proses fikiran jadi teratur. Tak boleh tulis = belum faham. Journaling perjelas pemikiran',
      qalb: 'Gratitude journal turunkan anxiety & depression. Hati bersyukur = hati gembira',
      nafs: 'Tulis 3 benda bersyukur paksa nafs fokus positif — lawan "negativity bias"',
      jasad: 'Brain dump sebelum tidur = otak tak overactive → tidur datang lebih cepat & dalam',
    },
    isFixed: false,
  },
  {
    id: 'sleep',
    time: '10:00 PM',
    task: 'Tidur Awal (Wudhu + Doa + Kanan)',
    category: 'life',
    sunnahNote: 'Nabi ﷺ wudhu sebelum tidur, baring kanan, tangan kanan bawah pipi. Baca Ayatul Kursi, 3 Qul (tiup tangan sapu badan 3x), doa: "Bismika Allahumma amutu wa ahya." Tidak tidur meniarap.',
    scienceNote: '🔬 Tidur kanan: Tingkatkan fungsi jantung kiri & kanan — LVOT TVI & TAPSE lebih baik vs kiri/terlentang (Echocardiography, 2018). Tidur awal + bangun awal: Gen BMAL1 naik 1.5x → metabolisme baik, gula stabil (Kajian 2025, 210 peserta). 7-8 jam = sweet spot cognitive & physical recovery.',
    dimensions: {
      ruh: 'Tidur dalam wudhu = mati dalam keadaan suci. Tak bangun = ruh bersih. Bangun = start fresh',
      aql: 'Tidur 7-8 jam = otak proses semua pembelajaran (memory consolidation). Kurang tidur = IQ turun 10-15 points',
      qalb: 'Doa tidur serahkan diri pada Allah = hati tenang. "Ya Allah, dengan namaMu aku mati & hidup"',
      nafs: 'Tidur awal 10 PM = lawan budaya bergadang. Nafs nak scroll — kau letak phone, pejam mata = menang',
      jasad: 'Tidur kanan = jantung tak tertekan, pencernaan lancar. Gen BMAL1 naik = badan repair optimum',
    },
    isFixed: false,
  },
];

// ──────────────────────────────────────
// COMPONENT
// ──────────────────────────────────────
const DailyRoutineTable: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const STORAGE_KEY = 'harmony_daily_routine_v2';
  const LOG_KEY = `harmony_routine_log_${today}`;

  const [routine, setRoutine] = useState<RoutineTask[]>([]);
  const [log, setLog] = useState<RoutineLog>({});
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editTime, setEditTime] = useState('');
  const [editName, setEditName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] = useState<RoutineTask['category']>('life');
  const [activeTab, setActiveTab] = useState<'sunnah' | 'science' | 'dimensions'>('dimensions');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && parsed[0].dimensions) {
          setRoutine(parsed);
        } else {
          setRoutine(DEFAULT_ROUTINE);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROUTINE));
        }
      } catch { setRoutine(DEFAULT_ROUTINE); }
    } else {
      setRoutine(DEFAULT_ROUTINE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROUTINE));
    }
    const savedLog = localStorage.getItem(LOG_KEY);
    if (savedLog) { try { setLog(JSON.parse(savedLog)); } catch { setLog({}); } }
  }, []);

  useEffect(() => { if (Object.keys(log).length > 0) localStorage.setItem(LOG_KEY, JSON.stringify(log)); }, [log]);
  useEffect(() => { if (routine.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(routine)); }, [routine]);

  const toggleTask = (taskId: string) => setLog(prev => ({ ...prev, [taskId]: !prev[taskId] }));

  const completedCount = Object.values(log).filter(Boolean).length;
  const totalCount = routine.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const prayersDone = routine.filter(t => t.category === 'solat' && log[t.id]).length;
  const totalPrayers = routine.filter(t => t.category === 'solat').length;

  const startEdit = (task: RoutineTask) => { setEditingTask(task.id); setEditTime(task.time); setEditName(task.task); };
  const saveEdit = (taskId: string) => { setRoutine(prev => prev.map(t => t.id === taskId ? { ...t, time: editTime, task: editName } : t)); setEditingTask(null); };
  const deleteTask = (taskId: string) => setRoutine(prev => prev.filter(t => t.id !== taskId));

  const addTask = () => {
    if (!newTask.trim() || !newTime.trim()) return;
    const t: RoutineTask = {
      id: `custom-${Date.now()}`, time: newTime, task: newTask, category: newCategory,
      sunnahNote: 'Tambahan peribadi — niatkan kerana Allah',
      scienceNote: '🔬 Konsistensi amalan positif bina neural pathways baru dalam otak',
      dimensions: { ruh: 'Amalan baik diniatkan kerana Allah = ibadah', aql: 'Tabiat baru bina sambungan neuron baru', qalb: 'Komitmen pada routine = hati stabil', nafs: 'Tambah amalan = nafs makin terlatih', jasad: 'Rutin konsisten stabilkan circadian rhythm' },
      isFixed: false,
    };
    setRoutine(prev => [...prev, t].sort((a, b) => a.time.localeCompare(b.time)));
    setNewTask(''); setNewTime(''); setShowAddForm(false);
  };

  const resetToDefault = () => {
    setRoutine(DEFAULT_ROUTINE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ROUTINE));
    setLog({}); localStorage.removeItem(LOG_KEY);
  };

  const getCatColor = (cat: string) => {
    const c: Record<string, string> = { solat: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', ibadah: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', health: 'bg-rose-500/15 text-rose-400 border-rose-500/30', study: 'bg-amber-500/15 text-amber-400 border-amber-500/30', life: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30', social: 'bg-pink-500/15 text-pink-400 border-pink-500/30' };
    return c[cat] || 'bg-gray-500/15 text-gray-400';
  };

  const getDimColor = (dim: string) => {
    const c: Record<string, string> = { ruh: 'bg-purple-500/10 border-purple-500/30 text-purple-300', aql: 'bg-blue-500/10 border-blue-500/30 text-blue-300', qalb: 'bg-red-500/10 border-red-500/30 text-red-300', nafs: 'bg-orange-500/10 border-orange-500/30 text-orange-300', jasad: 'bg-green-500/10 border-green-500/30 text-green-300' };
    return c[dim] || '';
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            🕌 Rutin Harian Nabi ﷺ
            <span className="text-[10px] font-medium bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">Sunnah + Sains + 5 Dimensi</span>
          </h2>
          <p className="text-xs text-white/40 mt-1">🕊️Ruh 🧠Aql ❤️Qalb ⚔️Nafs 💪Jasad — setiap rutin level up semua dimensi kamu</p>
        </div>
        <button onClick={resetToDefault} className="text-xs bg-white/5 hover:bg-white/10 text-white/60 px-3 py-1.5 rounded-lg transition-colors">🔄 Reset Sunnah</button>
      </div>

      {/* Progress */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/60">Hari ini: <span className="text-white font-bold">{completedCount}/{totalCount}</span></span>
          <span className="text-white/60">Solat: <span className="text-emerald-400 font-bold">{prayersDone}/{totalPrayers}</span></span>
          <span className={`font-black ${progress === 100 ? 'text-yellow-400' : 'text-white'}`}>{progress}%</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-500'}`} style={{ width: `${progress}%` }} />
        </div>
        {progress === 100 && (
          <div className="text-center py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <span className="text-yellow-400 font-black text-sm">🏆 MasyaAllah! Semua siap! Ruh, Aql, Qalb, Nafs & Jasad kamu naik hari ini! 🏆</span>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs text-white/40 py-2 px-2 w-8">✓</th>
              <th className="text-left text-xs text-white/40 py-2 px-2 w-20">Masa</th>
              <th className="text-left text-xs text-white/40 py-2 px-2">Rutin</th>
              <th className="text-left text-xs text-white/40 py-2 px-2 w-20">Jenis</th>
              <th className="text-right text-xs text-white/40 py-2 px-2 w-24">Info</th>
            </tr>
          </thead>
          <tbody>
            {routine.map((task) => (
              <React.Fragment key={task.id}>
                <tr className={`border-b border-white/5 hover:bg-white/5 transition-colors ${log[task.id] ? 'opacity-60' : ''}`}>
                  <td className="py-2.5 px-2">
                    <button onClick={() => toggleTask(task.id)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${log[task.id] ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-white/20 hover:border-emerald-500/50'}`}>
                      {log[task.id] && <span className="text-xs">✓</span>}
                    </button>
                  </td>
                  <td className="py-2.5 px-2">
                    {editingTask === task.id ? <input value={editTime} onChange={e => setEditTime(e.target.value)} className="w-20 bg-white/10 text-white text-xs px-2 py-1 rounded" /> : <span className={`text-xs font-mono ${log[task.id] ? 'text-white/40 line-through' : 'text-white/70'}`}>{task.time}</span>}
                  </td>
                  <td className="py-2.5 px-2">
                    {editingTask === task.id ? (
                      <div className="flex items-center gap-2">
                        <input value={editName} onChange={e => setEditName(e.target.value)} className="flex-1 bg-white/10 text-white text-sm px-2 py-1 rounded" />
                        <button onClick={() => saveEdit(task.id)} className="text-emerald-400 text-xs">💾</button>
                        <button onClick={() => setEditingTask(null)} className="text-red-400 text-xs">✖</button>
                      </div>
                    ) : <span className={`text-sm font-semibold ${log[task.id] ? 'text-white/40 line-through' : 'text-white'}`}>{task.task}</span>}
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCatColor(task.category)}`}>{CATEGORY_CONFIG[task.category]?.emoji} {CATEGORY_CONFIG[task.category]?.label}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)} className={`text-xs px-2 py-1 rounded-lg transition-colors ${expandedTask === task.id ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-white/40 hover:text-white/70'}`}>
                        {expandedTask === task.id ? '🔽' : '📖'}
                      </button>
                      {!task.isFixed && (
                        <>
                          <button onClick={() => startEdit(task)} className="text-xs bg-white/5 text-white/40 hover:text-white/70 px-1.5 py-1 rounded-lg">✏️</button>
                          <button onClick={() => deleteTask(task.id)} className="text-xs bg-white/5 text-red-400/60 hover:text-red-400 px-1.5 py-1 rounded-lg">🗑️</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>

                {/* Expanded Panel */}
                {expandedTask === task.id && (
                  <tr>
                    <td colSpan={5} className="px-2 py-3">
                      <div className="space-y-3">
                        {/* Tabs */}
                        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
                          {(['dimensions', 'sunnah', 'science'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 text-xs py-1.5 rounded-lg font-bold transition-colors ${activeTab === tab ? (tab === 'dimensions' ? 'bg-purple-500/20 text-purple-300' : tab === 'sunnah' ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300') : 'text-white/40 hover:text-white/60'}`}>
                              {tab === 'dimensions' ? '🕊️🧠❤️⚔️💪 5 Dimensi' : tab === 'sunnah' ? '☀️ Sunnah Nabi' : '🧬 Bukti Sains'}
                            </button>
                          ))}
                        </div>

                        {activeTab === 'sunnah' && (
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
                            <span className="text-2xl mt-0.5">☀️</span>
                            <div>
                              <p className="text-xs font-black text-amber-400 uppercase tracking-wider mb-1.5">Amalan Nabi ﷺ</p>
                              <p className="text-sm text-amber-200/80 leading-relaxed">{task.sunnahNote}</p>
                            </div>
                          </div>
                        )}

                        {activeTab === 'science' && (
                          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3">
                            <span className="text-2xl mt-0.5">🧬</span>
                            <div>
                              <p className="text-xs font-black text-cyan-400 uppercase tracking-wider mb-1.5">Bukti Sains & Kajian</p>
                              <p className="text-sm text-cyan-200/80 leading-relaxed">{task.scienceNote}</p>
                            </div>
                          </div>
                        )}

                        {activeTab === 'dimensions' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                            {(Object.entries(task.dimensions) as [keyof DimensionBenefit, string][]).map(([dim, text]) => (
                              <div key={dim} className={`rounded-xl p-3 border ${getDimColor(dim)}`}>
                                <div className="flex items-center gap-1.5 mb-1.5">
                                  <span className="text-lg">{DIMENSION_CONFIG[dim].emoji}</span>
                                  <div>
                                    <span className="text-xs font-black uppercase tracking-wider block">{DIMENSION_CONFIG[dim].label}</span>
                                    <span className="text-[9px] opacity-50">{DIMENSION_CONFIG[dim].desc}</span>
                                  </div>
                                </div>
                                <p className="text-[11px] leading-relaxed opacity-80">{text}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Task */}
      <div className="mt-4 border-t border-white/10 pt-4">
        {showAddForm ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <input value={newTime} onChange={e => setNewTime(e.target.value)} placeholder="Masa (cth: 3:00 PM)" className="w-full sm:w-28 bg-white/5 border border-white/10 text-white text-xs px-3 py-2 rounded-lg" />
            <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Nama rutin..." className="flex-1 w-full bg-white/5 border border-white/10 text-white text-xs px-3 py-2 rounded-lg" />
            <select value={newCategory} onChange={e => setNewCategory(e.target.value as RoutineTask['category'])} className="w-full sm:w-32 bg-white/5 border border-white/10 text-white text-xs px-3 py-2 rounded-lg">
              {Object.entries(CATEGORY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
            </select>
            <div className="flex gap-1">
              <button onClick={addTask} className="bg-emerald-500/20 text-emerald-400 text-xs px-3 py-2 rounded-lg hover:bg-emerald-500/30">✅ Tambah</button>
              <button onClick={() => setShowAddForm(false)} className="bg-white/5 text-white/40 text-xs px-3 py-2 rounded-lg">✖</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowAddForm(true)} className="w-full text-center text-xs text-white/30 hover:text-white/60 py-2 border border-dashed border-white/10 hover:border-white/20 rounded-xl transition-colors">
            ➕ Tambah Rutin Sendiri
          </button>
        )}
      </div>
    </div>
  );
};

export default DailyRoutineTable;
