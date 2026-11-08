# Panduan Aktifkan ToyyibPay (Checkout Sebenar)

Kod checkout sudah siap. Ikut langkah di bawah **mengikut urutan**. Mula dengan **sandbox** (wang olok-olok), uji, kemudian baru tukar ke production.

## Cara ia berfungsi (ringkas)

```
Pelajar klik "Beli Sekarang"
  → edge function toyyibpay-checkout   (semak login, ambil HARGA dari jadual catalog_items, cipta order "pending")
  → ToyyibPay createBill               (kunci rahsia kekal di pelayan)
  → pelajar bayar di halaman FPX ToyyibPay
  → ToyyibPay panggil toyyibpay-callback (semak hash + SAHKAN semula dengan API ToyyibPay → order "paid")
  → pelajar kembali ke /payment/return  (halaman ini juga minta pelayan sahkan; tidak percaya URL)
```

Order hanya jadi **paid** selepas pelayan sahkan dengan ToyyibPay sendiri: jumlah mesti cukup dan rujukan mesti sepadan. Pelayar tidak boleh memalsukan pembayaran.

## Langkah 1 — Akaun ToyyibPay sandbox (10 minit)

1. Daftar di **https://dev.toyyibpay.com** (sandbox, berasingan daripada akaun sebenar).
2. Salin **User Secret Key** (Dashboard → profil/API).
3. Cipta **Category** (cth. "HLA Online") → salin **Category Code**.

## Langkah 2 — Jadual pangkalan data (2 minit)

Supabase Dashboard → **SQL Editor** → tampal kandungan `supabase/payments_schema.sql` → **Run**.
Selamat dijalankan semula. Ia mencipta `catalog_items` (harga), `orders`, `subscriptions` dan polisi RLS.

> **Harga ditetapkan di `catalog_items` (dalam sen)**, bukan dalam kod frontend. Untuk tukar harga, kemas kini jadual itu.
> Jika harga di skrin berbeza, pelajar akan diberitahu harga sebenar sebelum membayar.
> Barangan fizikal (Hoodie, Sticker) dimatikan (`active = false`) kerana belum ada borang alamat penghantaran.

## Langkah 3 — Secrets (2 minit)

```bash
supabase secrets set \
  TOYYIBPAY_SECRET_KEY=xxxxxxxx \
  TOYYIBPAY_CATEGORY_CODE=xxxxxxxx \
  TOYYIBPAY_ENV=sandbox \
  APP_URL=https://www.harmonylifestyleacademy.com
```

Pilihan:
- `EXTRA_RETURN_ORIGINS=https://preview-anda.vercel.app`: benarkan URL pratonton sebagai tempat pulang selepas bayar. Asal yang tidak disenaraikan akan dipulangkan ke `APP_URL`.
- `TOYYIBPAY_PAYMENT_CHANNEL=2`: FPX + kad. Lalai ialah `0` (FPX sahaja). Guna `2` hanya jika kad sudah diaktifkan pada akaun ToyyibPay anda.

## Langkah 4 — Deploy fungsi (2 minit)

```bash
supabase functions deploy toyyibpay-checkout
supabase functions deploy toyyibpay-callback --no-verify-jwt
```

⚠️ `--no-verify-jwt` **wajib** untuk callback sahaja, kerana ToyyibPay tidak menghantar token Supabase. Callback dilindungi oleh hash MD5 dan pengesahan semula melalui API ToyyibPay.

## Langkah 5 — Uji di sandbox

1. Log masuk ke app → **Rizq (Kewangan)** → beli "Focus Pomodoro Timer App" (RM5).
2. Di halaman ToyyibPay, pilih bank ujian dan luluskan.
3. Anda patut kembali ke `/payment/return` → **"Pembayaran berjaya!"**.
4. Semak Supabase → jadual `orders` → status `paid`, `paid_amount_sen = 500`.
5. Uji pelan: **Bil & Pelan → Naik Taraf → Pro**. Selepas bayar, "Aktif sehingga …" dipaparkan dan satu baris baharu muncul dalam `subscriptions`.
6. Uji gagal: batalkan di halaman bank → "Pembayaran tidak berjaya", order `failed`.

Log fungsi: Supabase Dashboard → Edge Functions → `toyyibpay-callback` → Logs.

## Langkah 6 — Production (wang sebenar)

1. Daftar/aktifkan akaun di **https://toyyibpay.com** (perlu pengesahan perniagaan oleh ToyyibPay).
2. Cipta Category baharu di akaun production.
3. ```bash
   supabase secrets set TOYYIBPAY_SECRET_KEY=<kunci production> TOYYIBPAY_CATEGORY_CODE=<kod production> TOYYIBPAY_ENV=production
   ```
4. Buat satu pembelian sebenar paling murah (RM5) dan sahkan langkah 5 sekali lagi.

## Ujian automatik (pembangun)

```bash
bash supabase/functions/_tests/run.sh
```

Skrip ini menjalankan 12 ujian terhadap Postgres tempatan (skema sebenar) dan ToyyibPay olok-olok. Ia meliputi:
- hash palsu
- bayaran kurang
- callback serentak (tepat satu langganan diberikan)
- harga ditukar oleh klien
- RLS
- secrets yang tiada

Keperluan: `deno` 2.x dan PostgreSQL 16.

## Had yang diketahui

- **Tiada pembaharuan automatik.** ToyyibPay tidak menyokong caj berulang, jadi pelan ialah pas 30 hari. Pembelian semula akan menyambung dari tarikh tamat semasa.
- **Bayaran balik** dibuat secara manual di dashboard ToyyibPay. Kemudian tukar status order secara manual dalam Supabase.
- **Barangan fizikal** perlu borang alamat sebelum diaktifkan.
- Order yang dibayar tetapi jumlahnya tidak sepadan **tidak** akan diaktifkan secara automatik. Cari log `needs manual review`.
