# Harmony Lifestyle Academy (HLA) — Agent & Contributor Guide

React + Vite SPA for a Malaysian holistic-education platform: onboarding
assessment → personalised dashboard → AI-generated lessons across "7 Dimensions"
and KSSM school subjects. Muslim and universal content modes. UI copy and code
comments are mostly Bahasa Melayu; keep that convention in user-facing text.

## Commands

```bash
npm ci               # install
npm run dev          # Vite dev server — SPA only, does NOT serve api/*
npx vercel dev       # SPA + api/* serverless functions (needed to test payments / AI lessons locally)
npm run build        # production build → dist/
npx tsc --noEmit     # type check — currently clean (exit 0); keep it that way
```

There is no test suite. Verify UI changes in a browser (Playwright + Chromium are
available in the cloud container).

## Architecture

```
index.tsx            Provider stack: ErrorBoundary > Theme > Auth > Admin > Toast > App
App.tsx              Top-level state machine: /payment/success → auth → onboarding → dashboard
components/          Onboarding steps (top level), UpgradeModal, PaymentSuccessPage
components/dashboard MainDashboard + pages/ (dimension pages, school subjects), shared/, lms/, …
contexts/            React contexts — useAuth, useToast, useGamification, useStudyBuddy, …
hooks/               usePremium (quota + paywall state)
services/            All I/O: Supabase client, AI calls, payments, Quran/Sunnah data
constants/           plans.ts (prices + free-tier limit), Quran/Sunnah static data
api/                 Vercel serverless functions (server-side secrets live here)
supabase/            SQL migrations/seeds — run manually in the Supabase SQL Editor
types.ts             Shared types (incl. DashboardView union of all views)
```

### Navigation — there is no router
- `MainDashboard` switches views on a `DashboardView` state value (`switch (currentView)`),
  not URLs. Add a view by extending the `DashboardView` union in `types.ts` and adding
  a `case` in `MainDashboard.tsx`.
- The only URL-based route is `/payment/success`, handled by a `pathname` check at the
  top of `App.tsx`. `vercel.json` rewrites every non-API path to `index.html`.

### Auth & data
- Supabase Auth via `contexts/AuthContext.tsx` (`useAuth()` → `user`, `loading`).
- Most user/profile data lives in **localStorage** (`utils/storageUtils.ts`, keyed
  `user_data_${user.id}`), not in Supabase. Supabase tables currently used: Sunnah
  content (`supabase/sunnah_*.sql`) and payments (`supabase/payment_stage1.sql`).

### AI — two paths, both server-side
| Path | Used by | Where the key lives | Quota enforced |
|------|---------|--------------------|----------------|
| `services/aiProxyService.ts` → Supabase Edge Function `ai-proxy` (Gemini) | geminiService, studyHubService, SchoolSubjectsPage, HarmonyAIChat (~14 components in all) | Edge Function secrets | **Client-side only** (`usePremium.checkAndUseLesson`) until the edge function calls `use_ai_lesson` — see DEPLOYMENT_GUIDE §6.3 |
| `services/claudeService.ts` → `api/ai/module-content.ts` (Claude) | `shared/AIContentGenerator` | Vercel env `ANTHROPIC_API_KEY` | Server-side, in the function |

The `ai-proxy` edge function source is **not in this repo** (deployed directly to
Supabase). Never call an AI provider from browser code.

### Payments (ToyyibPay)
1. `UpgradeModal` → `subscriptionService.startCheckout()` → `POST /api/toyyibpay/create-bill`
   (JWT-authenticated) → inserts `subscriptions` row `pending` → redirect to ToyyibPay.
2. ToyyibPay → `POST /api/toyyibpay/callback` → re-verifies with `getBillTransactions`,
   checks amount → sets `active`, `starts_at`, `expires_at`.
3. ToyyibPay redirects the user to `/payment/success`, which polls for the active row.
- Free tier: `FREE_LESSONS_PER_DAY` in `constants/plans.ts` **and** `v_limit` in the SQL
  RPCs — change both together. Prices/durations live only in `constants/plans.ts`.

## Rules & gotchas

- **Never put secrets in `VITE_*` env vars.** Vite inlines every `VITE_*` value into the
  public JS bundle. Server secrets belong in `api/` functions (`process.env.X`) or edge
  function secrets. Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are public by design.
- `api/` functions run as **native ESM on Node** (`"type": "module"`): relative imports
  inside `api/` MUST end in `.js` (e.g. `'../../constants/plans.js'`), or the function
  crashes at load with `ERR_MODULE_NOT_FOUND`. `npm run build` / `tsc` won't catch this —
  only a deployed request will. Use `import { type X }` for type-only imports.
- `api/` functions read secrets with `process.env.X!`; a missing var surfaces as a generic 500.
  Required vars are listed in DEPLOYMENT_GUIDE.md §6.2.
- Writes to `subscriptions` / `ai_usage` happen only via the service role (RLS allows
  users to `select` their own rows only). Don't add client-side insert/update policies.
- Production is **Vercel**. Netlify also builds PR previews, but `api/` functions don't
  run there, so payments and Claude lessons fail on Netlify previews.
- **Encoding:** several files contain mojibake (UTF-8 decoded as Latin-1, e.g. `âââ`, `ð`)
  — `SchoolSubjectsPage.tsx`, `MainDashboard.tsx`, `HeaderBar.tsx`, `HeroSection.tsx`,
  `CommunityHighlightsSection.tsx`, `AuthScreen.tsx`. Some of it is user-visible.
  Edit these files as UTF-8 and don't "fix" them by re-encoding the whole file blindly.
- Styling: Tailwind utility classes with hard-coded hex colours (gold `#C9A84C`,
  teal `#14B8A6`, dark `#161625`); many dashboard components use inline `style` objects.
- User-facing notifications: `useToast().addToast(msg, 'success' | 'error')`.
- Modals: follow `UpgradeModal` for accessibility (`role="dialog"`, `aria-modal`,
  labelled title, focus on open + Tab trap + Escape + focus return).
