# Audit Onboarding, Pendaftaran & Kesediaan Pembayaran — 8 Nov 2026

Skop: semua kod klien (`tsc --noEmit` dan `vite build` bersih sebelum dan selepas). Keutamaan: aliran **daftar → onboarding → dashboard**.

## 1. Diperbaiki dalam PR ini

### Pendaftaran & log masuk (`AuthScreen`, `AuthContext`, `App`)
| # | Pepijat | Kesan kepada pengguna | Pembaikan |
|---|---|---|---|
| A1 | Pautan reset kata laluan membawa pengguna terus masuk tanpa borang kata laluan baharu | Tidak boleh tukar kata laluan langsung | Kesan acara `PASSWORD_RECOVERY`, paparkan borang "Choose a New Password" (`updateUser`) |
| A2 | Daftar dengan e-mel sedia ada dilaporkan "Success" | Pengguna menunggu e-mel yang tidak akan tiba | Kesan `identities: []`, arahkan ke Sign In |
| A3 | Mesej "check your email" walaupun sesi terus dibuat | Mengelirukan | Bezakan `data.session` vs pengesahan e-mel |
| A4 | Tiada medan sahkan kata laluan | Salah taip = akaun tidak boleh dimasuki | Tambah "Confirm Password" |
| A5 | OAuth / e-mel pengesahan tiada `redirectTo` | Boleh mendarat di URL salah (cth. pratonton) | `redirectTo: window.location.origin` |
| A6 | Pengguna lama pada peranti baharu dipaksa ulang onboarding | Data hilang di mata pengguna | Muat `profiles.profile_data` dari Supabase jika tiada cache tempatan |
| A7 | Kilatan wizard onboarding sebelum dashboard dimuat | UI berkelip | Keadaan `profileLoading` |
| A8 | Tiada cara log keluar semasa onboarding | Terperangkap dalam akaun salah | Pautan "Not you? Sign out" |
| A9 | Teks rosak (mojibake) — cth. `â¢â¢â¢` pada placeholder, `â` dalam teks hero | Nampak tidak profesional | Dibaiki dalam 6 fail (termasuk tajuk halaman dashboard) |
| A10 | `getSession()` gagal → skrin "Syncing…" selama-lamanya | App tergantung | `try/finally` |

### Onboarding (`OnboardingFlow` & langkah-langkah)
| # | Pepijat | Pembaikan |
|---|---|---|
| O1 | Respons AI separa (cth. tiada `summary`) **meranapkan** skrin Keputusan (`undefined.map`) | `normalizeAnalysisResult()` — gabung dengan nilai lalai, pastikan semua tatasusunan wujud |
| O2 | Bentuk JSON cadangan kemahiran tidak sepadan dengan UI → cadangan tidak pernah dipaparkan; `skills: null` boleh meranapkan | Prompt + normalisasi ikut jenis `SkillSuggestion`; kategori "⭐ Recommended for You" |
| O3 | Effect simpan ke Supabase boleh berjalan berulang kali (dua kali upsert/`onComplete`) | Guard `useRef`, `clearTimeout` semasa unmount |
| O4 | Percubaan semula AI bersarang: sehingga ~24 s spinner bila AI gagal | Kurangkan kepada satu lapisan; ralat kekal (401/404) tidak diulang |
| O5 | "Retake Survey" kembali ke Welcome, bukan ke soal selidik | Terus ke soal selidik |
| O6 | Tiada butang Kembali; jawapan hilang | Butang Back + nilai awal dikekalkan di setiap langkah; "Previous" dalam soal selidik |
| O7 | Langkah kerjaya buntu jika AI tiada cadangan | Pilihan "I'm not sure yet" / Continue |
| O8 | Butang "Sign in with GitHub/Google — coming soon" dipaparkan kepada pengguna yang *sudah* log masuk | Dibuang; salinan teks dibetulkan |
| O9 | Nama yang ditaip semasa daftar tidak diisi semula | Isi automatik dari `user_metadata.full_name` |
| O10 | `animate-feature-cycle` tidak wujud dalam CSS | Ditambah (+ `prefers-reduced-motion`) |
| O11 | Kad kerjaya tidak boleh dicapai papan kekunci | `role="checkbox"`, `tabIndex`, Enter/Space |

### Dashboard
- Toast resit menyatakan e-mel **rekaan** (`nama@gmail.com`) → kini guna e-mel akaun sebenar.
- Butang tema terapung bertindih dengan avatar pengepala → dipaparkan hanya semasa onboarding.

## 2. Penyekat sebelum menerima bayaran — ✅ diselesaikan (ToyyibPay)

| Isu asal | Status |
|---|---|
| `CheckoutModal` simulasi (`setTimeout` → "berjaya") | ✅ Kini mencipta bil ToyyibPay sebenar dan membawa pengguna ke halaman FPX ToyyibPay |
| Tukar pelan tanpa bayaran | ✅ Pelan berbayar melalui checkout; akses diberi hanya selepas callback disahkan |
| `PaymentModal` mengumpul nombor kad + CVC | ✅ Dibuang sepenuhnya; tiada butiran kad/bank disimpan |
| Data olok-olok (kad `4242`, `MOCK_TRANSACTIONS`) | ✅ Diganti dengan pesanan sebenar dari jadual `orders` |
| Pengesahan pembayaran di pelayan | ✅ Hash callback + `getBillTransactions` + semakan jumlah + idempoten |

Langkah aktifkan: lihat `docs/TOYYIBPAY_SETUP.md`.

## 3. Pautan
Tiada pautan dalaman rosak ditemui (penghalaan hash disahkan terhadap senarai `validViews`). Pautan LinkedIn generik (`linkedin.com`) di footer onboarding dibuang kerana tidak menunjuk ke halaman akademi.

## 4. Pengesahan
Ujian hujung-ke-hujung Playwright dengan Supabase olok-olok: daftar → profil → 7 bahagian soal selidik (termasuk Previous) → semua 10 tab keputusan → matlamat → kerjaya (Back/forward kekal pilihan) → kemahiran → status → dashboard. Lulus untuk (a) respons AI separa dan (b) AI gagal sepenuhnya; 0 ralat halaman; tepat 1 upsert. Turut lulus: pautan reset kata laluan, e-mel berulang, pengesahan e-mel diperlukan, pengguna lama pada peranti baharu.
