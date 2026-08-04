# PANDUAN DEPLOYMENT HARMONY LIFESTYLE ACADEMY
## Untuk Waran — Step-by-Step, Senang Faham

---

## GAMBARAN MASALAH & APA YANG DAH DIFIX

App kamu dibina dalam Google AI Studio, yang guna CDN khas (`aistudiocdn.com`).
Bila deploy ke luar, CDN tu tak available. Saya dah fix semua masalah ni.

### Apa yang saya dah betulkan:

1. **Buang importmap AI Studio** — Guna npm packages biasa
2. **Buang CSP header** — Tak perlu untuk Vercel
3. **Fix environment variables** — Dari `process.env` ke Vite `define`
4. **Buang `window.aistudio` code** — Tak available di luar AI Studio
5. **Fix `zod` version** — Dari v4 (beta) ke v3 (stable)
6. **Tambah `vercel.json`** — Konfigurasi deployment
7. **Tambah TypeScript types** — Untuk React

---

## LANGKAH 1: BUAT SUPABASE PROJECT (15 minit)

1. Pergi ke **https://supabase.com** → Klik "Start your project"
2. Sign up guna GitHub atau email
3. Klik **"New Project"**
4. Isi:
   - **Name**: `harmony-lifestyle-academy`
   - **Database Password**: Pilih yang kuat, SIMPAN password ni
   - **Region**: Singapore (paling dekat dengan Malaysia)
5. Tunggu 2 minit untuk project siap
6. Pergi ke **Settings** → **API**
7. **SALIN DAN SIMPAN** dua benda ni:
   - `Project URL` → contoh: `https://abcdefg.supabase.co`
   - `anon public key` → string panjang bermula `eyJ...`

### Setup Auth dalam Supabase:

1. Di Supabase Dashboard → **Authentication** → **Providers**
2. Pastikan **Email** provider dah enabled
3. (Optional nanti) Enable Google dan GitHub providers

---

## LANGKAH 2: BUAT GEMINI API KEY (5 minit)

1. Pergi ke **https://aistudio.google.com/apikey**
2. Login guna Google account
3. Klik **"Create API Key"**
4. Pilih project atau buat baru
5. **SALIN API KEY** — simpan di tempat selamat

---

## LANGKAH 3: SETUP GITHUB REPOSITORY (10 minit)

1. Pergi ke **https://github.com** → Login
2. Klik **"+"** → **"New repository"**
3. Name: `harmony-lifestyle-academy`
4. Pilih **Private**
5. Klik **"Create repository"**

### Upload code ke GitHub:

Buka terminal/command prompt di folder project kamu:

```bash
git init
git add .
git commit -m "Initial commit - Harmony Lifestyle Academy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/harmony-lifestyle-academy.git
git push -u origin main
```

---

## LANGKAH 4: DEPLOY KE VERCEL (10 minit)

1. Pergi ke **https://vercel.com** → Sign up guna GitHub
2. Klik **"Add New..."** → **"Project"**
3. Import repository `harmony-lifestyle-academy`
4. **Framework Preset**: Pilih `Vite`
5. **Build Command**: `npm run build`
6. **Output Directory**: `dist`

### PENTING — Tambah Environment Variables:

Di bahagian "Environment Variables", tambah:

| Key | Value |
|-----|-------|
| `VITE_GEMINI_API_KEY` | (paste API key dari Langkah 2) |
| `VITE_SUPABASE_URL` | (paste URL dari Langkah 1) |
| `VITE_SUPABASE_ANON_KEY` | (paste anon key dari Langkah 1) |

7. Klik **"Deploy"**
8. Tunggu 2-3 minit
9. Vercel akan bagi kamu URL seperti: `harmony-lifestyle-academy.vercel.app`

---

## LANGKAH 5: TEST

1. Buka URL yang Vercel bagi
2. Cuba signup dengan email dan password
3. Check email untuk confirmation link
4. Login dan test app

---

## KALAU ADA ERROR

### Error "Module not found":
- Pastikan semua files dalam zip yang saya bagi dah ada dalam repo

### Error "VITE_SUPABASE_URL undefined":
- Check environment variables dalam Vercel dashboard
- Pastikan nama variable EXACTLY sama (case-sensitive)
- Redeploy selepas tambah env vars

### App stuck di loading screen:
- Buka browser console (F12 → Console)
- Check untuk error messages
- Biasanya Supabase URL atau key salah

### Auth tak berfungsi:
- Check Supabase dashboard → Authentication → pastikan Email enabled
- Check URL dan key betul

---

## FILE YANG TELAH DIUBAH

| File | Apa yang diubah |
|------|----------------|
| `index.html` | Buang importmap, CSP header |
| `vite.config.ts` | Fix env variable mapping |
| `package.json` | Fix zod version, tambah React types |
| `tsconfig.json` | Fix untuk Vite build |
| `vercel.json` | Baru — config untuk Vercel |
| `.env.example` | Baru — template env variables |
| `.gitignore` | Fix untuk deployment |
| `types.ts` | Buang AI Studio global types |
| `CourseCreatorModal.tsx` | Buang window.aistudio code |
| `CoursePlayer.tsx` | Buang window.aistudio code |

---

## LANGKAH 6: SETUP PAYMENT (ToyyibPay + Premium)

### 6.1 Run SQL migration
1. Buka Supabase Dashboard → SQL Editor
2. Copy seluruh kandungan `supabase/payment_stage1.sql` dan Run
3. Ini akan cipta tables `subscriptions` + `ai_usage` dan RPCs `is_premium`, `use_ai_lesson`, `get_lesson_quota`

### 6.2 Environment Variables tambahan di Vercel
| Nama | Nilai |
|------|-------|
| `TOYYIBPAY_SECRET_KEY` | userSecretKey dari toyyibpay.com (Settings) |
| `TOYYIBPAY_CATEGORY_CODE` | Create category di dashboard ToyyibPay dulu |
| `SUPABASE_URL` | Sama dengan VITE_SUPABASE_URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role (RAHSIA — jangan letak di frontend) |
| `APP_URL` | URL production app (untuk callback & return URL) |

### 6.3 PENTING — Enforce quota di server (ai-proxy edge function)
Quota check di frontend sahaja boleh di-bypass (user boleh panggil edge function
terus). Tambah check ini dalam edge function `ai-proxy` SEBELUM panggil Gemini,
untuk action `generateContent`:

```ts
// Dalam ai-proxy/index.ts — selepas dapat user dari JWT:
const { data: usage } = await supabaseAdmin.rpc('use_ai_lesson', {
  p_user_id: user.id,
});
if (!usage?.allowed) {
  return new Response(
    JSON.stringify({ error: 'Quota harian habis. Upgrade ke Premium untuk akses tanpa had.' }),
    { status: 429, headers: { 'Content-Type': 'application/json' } }
  );
}
```

Nota: bila quota dah dikira di server, buang panggilan `checkAndUseLesson()` di
frontend (atau tukar kepada `getQuota()` sahaja) supaya quota tak dikira dua kali —
buat masa ini frontend yang increment.

### 6.4 Test payment flow
1. Login → generate 3 AI lessons → lesson ke-4 patut tunjuk UpgradeModal
2. Klik plan → redirect ke ToyyibPay → bayar guna FPX test
3. Selepas bayar → redirect ke `/payment/success` → status jadi premium
4. Check Supabase: `select * from subscriptions` — status patut `active`

---

## NEXT STEPS (Lepas Deploy Berjaya)

1. **Custom Domain** — Beli domain (contoh: harmonyacademy.my) dan sambung ke Vercel
2. **Supabase Database** — Setup tables untuk simpan user data
3. **Google OAuth** — Biar users login guna Google
4. **PWA** — Jadikan app boleh install di phone

---

Bismillah. Satu langkah pada satu masa. Kamu boleh buat ni, Waran.
