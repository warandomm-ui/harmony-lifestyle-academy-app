# Ejen Pematuhan Kandungan AI

Setiap teks yang dijana AI (Claude atau Gemini) ditapis **di pelayan** sebelum sampai kepada pelajar. Ia termasuk skrip TTS, yang ditapis sebelum disuarakan. Penapisan berlaku dalam edge function `ai-proxy`. Pelayar tidak pernah menerima kandungan yang ditahan, jadi penapis tidak boleh dipintas dari sisi klien.

```
Model AI ──▶ ai-proxy ──▶ evaluateContent() ──┬─ allow / notice ─▶ pelajar
                                             ├─ redact ─────────▶ pelajar (PII disembunyikan)
                                             ├─ hold ───────────▶ baris gilir semakan manusia
                                             └─ block ──────────▶ disekat + log audit
```

| Fail | Peranan |
|---|---|
| `supabase/functions/_shared/contentCompliance.ts` | Enjin peraturan (tiada import; jalan di Deno dan pelayar) |
| `supabase/functions/ai-proxy/index.ts` | Pintu kuat kuasa; memasukkan item hold/block ke baris gilir |
| `supabase/ai_compliance_schema.sql` | Jadual baris gilir, penyemak, RLS, `my_compliance_reviews()` |
| `components/dashboard/admin/AdminComplianceReviewPage.tsx` | UI penyemak (Admin → AI Compliance / Moderation) |
| `components/ComplianceNotice.tsx` | Memaparkan sebab tahanan/sekatan kepada pelajar |
| `scripts/compliance.test.ts` | `npm run test:compliance` |

## Peraturan mengikut maqasid

| Maqsad | Contoh yang dikesan | Tindakan |
|---|---|---|
| **Agama (akidah)** | Menafikan Khatamun Nabiyyin, menyekutukan Allah, menafikan pemeliharaan Al-Quran, memperolok agama | `block` |
| | Rujukan ayat yang tidak wujud (cth. Al-Ikhlas: 9, Surah 115), hadis tanpa sumber, "hadis" yang masyhur tetapi palsu, teks Arab yang dijana AI, dakwaan pluralisme | `hold` |
| | Hadis yang disertakan sumber | `notice` (semak darjat) |
| **Had kompetensi** | Hukum talak, faraid atau sah nikah peribadi; menghukum seseorang kafir/murtad; takfir ke atas kumpulan; diagnosis atau dos ubat | `hold` |
| **Akal** | "Salin dan hantar", "cikgu takkan tahu", "tak perlu faham" | `hold` |
| | Cara membuat atau menggunakan arak/dadah | `block` |
| **Maruah** | Menghina pelajar, kata kesat perkauman, kandungan lucah | `block` |
| **Keselamatan** | Arahan membunuh diri atau mencederakan diri (mesej pelajar memaparkan talian bantuan), senjata atau bom, ekstremisme atas nama jihad | `block` |
| | Puasa ekstrem, cabaran berbahaya | `hold` |
| **Integriti data** | MyKad, telefon bimbit, e-mel, kad (semakan Luhn), kunci API/JWT/kunci peribadi | `redact` |
| | Ralat enjin, output melebihi had imbasan | `hold` (*fail-closed*) |

Peraturan juga mengecualikan konteks sanggahan atau pendidikan. Contohnya, "dakwaan nabi selepas Nabi Muhammad ialah ajaran sesat" **tidak** disekat, dan menyebut Talian Kasih dalam konteks sokongan dibenarkan.

## Pemasangan (sekali sahaja)

1. Jalankan `supabase/ai_compliance_schema.sql` dalam SQL Editor.
2. Daftarkan penyemak bertauliah:
   ```sql
   INSERT INTO public.ai_compliance_reviewers (user_id, display_name, credential)
   VALUES ('<uuid pengguna>', 'Ustaz …', 'Guru Pendidikan Islam');
   ```
3. Deploy semula: `supabase functions deploy ai-proxy`. Folder `_shared` ikut dibundel secara automatik. `SUPABASE_SERVICE_ROLE_KEY` disuntik oleh Supabase.

## Aliran semakan manusia

- Penyemak membuka **Admin → AI Compliance**, membaca dapatan dan petikan, dan boleh **membetulkan** kandungan sebelum melepaskannya.
- Catatan penyemak **wajib** diisi (akauntabiliti). RLS menghalang penyemak meluluskan output miliknya sendiri, dan keputusan hanya boleh dibuat ke atas item `pending`.
- Pelajar memanggil `my_compliance_reviews()` untuk melihat status. `released_content` hanya dipulangkan selepas item diluluskan.
- Klien **tidak** mencuba semula (*retry*) panggilan yang ditahan. Mengulang permintaan sehingga penapis meluluskannya ialah satu bentuk pintasan.

## Had yang diketahui

- **Gemini Live (`liveToken`)**: audio dua hala mengalir terus dari pelayar ke Google dan tidak melalui proksi, jadi ia **tidak ditapis** oleh ejen ini. Gunakan arahan sistem Live yang ketat, atau matikan ciri itu untuk pelajar bawah umur.
- **Imej yang dijana atau disunting** tidak diimbas. Hanya teksnya diimbas.
- Peraturan berasaskan pola memberi kepastian dan kebolehjelasan, tetapi tidak memahami makna seperti manusia. Ia adalah lapisan pertama, bukan pengganti penyemak bertauliah. Tambah pola baharu bersama ujian dalam `scripts/compliance.test.ts`.
