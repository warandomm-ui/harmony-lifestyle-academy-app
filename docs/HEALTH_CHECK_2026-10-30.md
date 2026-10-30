# Semakan Kesihatan & Status Pelepasan — 30 Okt 2026

Skop: projek Vercel `harmony-lifestyle-academy-app` (pasukan `warans-projects-a2805def`), domain `www.harmonylifestyleacademy.com`, cawangan `main` @ `33ccf13`.

## 1. Ringkasan status

| Komponen | Status | Bukti |
|---|---|---|
| Produksi (`dpl_7spizcup…`, dari `main` 33ccf13) | 🟢 READY | Deployment produksi terkini, sepadan dengan HEAD `main` |
| Kebolehcapaian domain | 🟢 | `www` → 200 (TTFB ~0.47s, `x-vercel-cache: HIT`); apex → 307 ke `www`; HSTS aktif |
| Build tempatan | 🟢 | `vite build` 5.5s, `tsc --noEmit` bersih |
| Kunci API dalam bundle awam | 🔴 KRITIKAL | Rentetan berbentuk kunci Gemini (`AIza…`) dan Anthropic (`sk-ant-…`) ditemui dalam `/assets/index-*.js` produksi |
| Fungsi `api/` pada Preview | 🔴 | `supabaseUrl is required` pada `/api/ai/module-content`, `/api/toyyibpay/create-bill`, `/api/toyyibpay/callback` (cawangan `claude/vibrant-tesla-y2kv4u`, 28 Okt) |
| Aset statik hilang | 🟠 | `/og-image.png`, `/favicon.ico`, `/robots.txt`, `/sitemap.xml` memulangkan `index.html` (200) — pratonton WhatsApp/Facebook rosak |
| Cache aset | 🟠 | Fail ber-hash `/assets/*` dihantar dengan `max-age=0, must-revalidate` |
| Saiz bundle | 🟠 | Satu chunk 1.48 MB (385 KB gzip) — tiada code-splitting |
| Pengepala keselamatan | 🟠 | Tiada `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` |
| Kebergantungan | 🟠 | `npm audit --omit=dev`: 6 isu (1 kritikal, 4 tinggi) — `protobufjs`, `ws`, `zod` |
| Pemboleh ubah persekitaran | ⚪ Tidak dapat disemak | API Vercel memulangkan 403 untuk senarai env |

## 2. Diperbaiki dalam PR ini (`vercel.json`)

1. `/assets/*` → `Cache-Control: public, max-age=31536000, immutable` (nama fail ber-hash, selamat di-cache selamanya).
2. Pengepala `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`.
3. Rewrite SPA kini hanya untuk laluan tanpa sambungan fail. Aset yang hilang memulangkan 404 sebenar, bukan HTML. Selamat kerana app guna penghalaan hash (`MainDashboard.tsx`).

## 3. Tindakan yang perlu dibuat oleh pemilik (tidak boleh dibuat dari kod)

| Keutamaan | Tindakan |
|---|---|
| P0 | **Putar (rotate) kunci Gemini & Anthropic sekarang**, simpan kunci baharu dalam Supabase secrets, `supabase functions deploy ai-proxy`, kemudian buang `VITE_GEMINI_API_KEY` dan `VITE_ANTHROPIC_API_KEY` dari Vercel. (Kod klien sudah dipindahkan ke `supabase/functions/ai-proxy` dalam PR ini.) |
| P0 | Tetapkan `SUPABASE_URL` (+ service role key) untuk persekitaran **Preview** juga, bukan Produksi sahaja, sebelum cawangan pembayaran ToyyibPay digabungkan. |
| P1 | Tambah folder `public/` dengan `og-image.png`, `favicon.ico`, `robots.txt`. |
| P1 | `npm audit fix` (tanpa `--force`; `zod` v4 ialah perubahan besar). |
| P2 | Code-split halaman dashboard dengan `React.lazy` untuk kurangkan muatan awal. |
| P2 | Tambah Content-Security-Policy selepas inventori domain luar (Supabase, Google Fonts, Gemini). |
