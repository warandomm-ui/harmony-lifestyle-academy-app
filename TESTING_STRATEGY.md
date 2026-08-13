# Test Coverage Analysis & Proposal

**Date:** 2026-08-13
**Scope:** Full repository audit of `harmony-lifestyle-academy-app`

---

## 1. Current state

**There is no test coverage, because there is no test infrastructure.**

| Check | Result |
| --- | --- |
| Test files (`*.test.*`, `*.spec.*`) | 0 |
| Test runner (vitest / jest) in `package.json` | none |
| `npm test` script | none |
| Testing libraries (`@testing-library/*`, `jsdom`, `msw`) | none |
| CI workflow (`.github/`) | none |
| Effective line coverage | **0%** |

For context on what is uncovered: ~27,000 lines of TypeScript across 130 `.tsx`
components, 7 services, 7 React contexts, and 4 util modules.

The only automated check available today is `tsc --noEmit`, and it is not wired
into a script or CI. It currently exits non-zero on a `tsconfig.json`
deprecation warning (`TS5101`, `baseUrl`), so even that signal is not clean.

---

## 2. Where the risk actually is

Test effort should follow risk, not line count. Ranked by (blast radius x
likelihood of silent breakage):

| Area | Files | Why it is risky |
| --- | --- | --- |
| Religion → dashboard-mode routing | `utils/religionUtils.ts`, `components/OnboardingFlow.tsx`, `App.tsx` | **Two divergent implementations** of the same rule decide which entire dashboard a student sees |
| Date / "today" handling | 20+ sites | Two different definitions of "today" coexist; both are UTC-based in a UTC+8 market |
| AI response parsing | `services/geminiService.ts`, `claudeService.ts`, `studyHubService.ts`, `SchoolSubjectsPage.tsx` | Non-deterministic upstream, hand-rolled JSON extraction, silent fallbacks |
| Retry / error mapping | `services/aiProxyService.ts` | Backoff and HTTP status → message mapping is entirely untested |
| localStorage persistence | 25+ `JSON.parse` sites, `utils/storageUtils.ts` | Corrupt-data recovery paths written but never exercised |
| Gamification XP/levels | `contexts/GamificationContext.tsx` | Pure arithmetic that is trivially testable and currently unguarded |
| CSV export | `utils/exportUtils.ts` | Contains a deliberate formula-injection defence with zero tests pinning it |

---

## 3. Proposed priorities

### P0 — Stand up the harness

Nothing below is actionable until this exists. Concretely:

- Add **Vitest** (already Vite-native, zero extra build config) + **jsdom** +
  **@testing-library/react** + **@testing-library/user-event**.
- Add scripts: `test`, `test:watch`, `coverage`, and `typecheck`
  (`tsc --noEmit`). Fix the `TS5101` deprecation so `typecheck` exits 0.
- Add a GitHub Actions workflow running `typecheck` + `test` on PRs. The repo
  has no CI at all today, so nothing currently prevents a broken merge.
- Set an initial coverage floor low enough to pass (e.g. 20% lines) and ratchet
  it up, rather than a target nobody will meet.

Suggested first target: **60% coverage of `services/`, `utils/`, and
`contexts/`** — roughly 1,360 lines, i.e. 5% of the codebase carrying a large
share of the logic risk.

---

### P1 — Pure logic (highest value per hour, no DOM needed)

#### 3.1 Religion classification — a real inconsistency

There are two implementations of the same business rule, and they disagree:

`utils/religionUtils.ts`:
```ts
export const isMuslim = (religion = '') => religion.trim().toLowerCase() === 'islam';
```

`components/OnboardingFlow.tsx:53`:
```ts
const isMuslimStudent = (religion: string): boolean => {
  const muslimValues = ['islam', 'muslim', 'sunni', 'shia', 'sufi'];
  return muslimValues.includes(religion.toLowerCase().trim());
};
```

`App.tsx` and `OnboardingFlow.tsx` use `isMuslimStudent` to pick
`dashboardMode`; `components/dashboard/widgets/DailyRoutineTable.tsx:600` uses
`isMuslim` to pick which routine to render. For any input other than exactly
`"Islam"`, the two disagree — a student routed into the Muslim dashboard would
see the *universal* daily routine.

This is **latent, not currently user-visible**: `RELIGIONS` in `constants.ts`
only offers `'Islam'` among Muslim values. But `UserProfile.religion` is a plain
`string`, and the bug activates the moment anyone adds `"Muslim"` to the
dropdown or imports profile data from elsewhere.

Proposed tests:
- Table-driven test over every entry in `RELIGIONS` asserting both functions
  agree.
- Cases for casing, whitespace, empty string, and `undefined`.
- Then consolidate to one exported function and delete the duplicate.

#### 3.2 Gamification XP and level-up

`contexts/GamificationContext.tsx:17` — pure arithmetic, ideal test target:
- Points below threshold do not level up.
- A single large award levels up **multiple times** (the `while` loop).
- XP requirement scales by `Math.floor(x * 1.5)` each level.
- Guard: `xpForNextLevel <= 0` currently causes an **infinite loop**. A test
  should pin the intended behaviour and the fix.

Separate issue worth fixing while testing: `addToast` is called *inside* the
`setProfile` updater. Updaters must be pure — under `React.StrictMode` (enabled
in `index.tsx`) dev builds double-invoke them, firing duplicate toasts. Moving
the toast into an effect makes the reducer trivially unit-testable.

#### 3.3 CSV export

`utils/exportUtils.ts` implements formula-injection escaping (`=`, `+`, `-`,
`@`, tab, CR). That is a security control with no test. Pin it:
- Cells starting with each dangerous character get prefixed with `'`.
- Embedded quotes doubled; cells with `,`/`"`/newline get quoted.
- `null`/`undefined` → empty string; `Date` → `toLocaleString()`.
- Empty array is a no-op.
- Keys are taken from `data[0]` only — a test should document that rows with
  extra keys silently lose columns.

#### 3.4 Storage obfuscation round-trip

`utils/storageUtils.ts` uses `btoa(encodeURIComponent(...))`:
- Round-trip of nested objects, unicode, and emoji (this codebase is full of
  both — Bahasa Malaysia content and emoji-heavy strings).
- `get` on a missing key → `null`.
- `get` on corrupt/non-base64 data → `null`, not a throw.
- Currently untested: `set` has no `try/catch`, so a `QuotaExceededError` will
  propagate and crash the caller. Worth a test plus a fix.

---

### P2 — Services (mock `fetch` / the Supabase client)

#### 3.5 AI proxy error mapping and retry

`services/aiProxyService.ts` is the single choke point for every AI call, and
every branch is untested:
- Unconfigured Supabase → the "Server not configured" error.
- No session token → "User not authenticated".
- `fetch` rejecting with a `TypeError` → the friendly network message.
- `404` → the "deploy the ai-proxy edge function" message.
- `5xx` → server-error message, preferring `errorData.error`.
- `4xx` → `AI service error: {status}`.

And `retry()` specifically, using fake timers:
- Succeeds on the first attempt → no delay incurred.
- Succeeds on the third attempt → resolves.
- Exhausts retries → rethrows the **original** error, not `'Retry failed'`.
- `429` in the message → longer backoff (`delay * (i + 2)`).

Note: the trailing `throw new Error('Retry failed')` is unreachable. A test that
tries to reach it will document that.

#### 3.6 AI JSON parsing

`safeParseJSON` is duplicated verbatim in `geminiService.ts:18` and
`claudeService.ts:22`, and — despite the name — **throws** on malformed JSON.
`SchoolSubjectsPage.tsx:731` has a third, different implementation. Tests
should cover:
- Bare JSON, ```` ```json ```` fences, bare ``` ``` ``` fences, leading/trailing
  whitespace.
- Empty/undefined input → `null`.
- Malformed JSON — pin whether it throws or returns `null`, then unify all three
  copies into one shared helper.
- `getPersonalityAnalysis` returning `DEFAULT_ANALYSIS_RESULT` when the AI
  returns a structurally invalid payload (this is the user-facing safety net for
  the entire onboarding flow).

#### 3.7 Quran API service

`services/quranApiService.ts` has behaviour worth pinning:
- `cleanText` strips HTML tags and collapses whitespace.
- Cache: a second `fetchSurahCourses` call for the same surah does not re-fetch.
- Partial failure — Arabic succeeds, translation fails — still produces ayat
  with empty `textMalay` (the `Math.max` length reconciliation).
- Total failure returns the empty-shape object rather than throwing.

The module-level `cache` object is shared state with no reset export; tests will
need `vi.resetModules()`, which is itself a signal the cache should be
injectable.

---

### P3 — Component and flow tests

#### 3.8 Onboarding flow (the highest-value integration test)

`components/OnboardingFlow.tsx` is a 10-state machine that ends in a Supabase
upsert. Worth covering:
- Happy path through each step transition.
- Skipping personal info defaults to the **universal** path (documented as the
  safe default — pin it).
- Goal selection branches to career-path vs skill-selection.
- **Persistence failure still completes onboarding** via the localStorage
  fallback (`OnboardingFlow.tsx:204`). This is a data-loss-adjacent path and
  currently entirely unverified.

#### 3.9 `PersonalInfoStep` validation

The only Zod schema in the codebase (`components/PersonalInfoStep.tsx:15`):
name min length, age bounds 5–100, the `invalid_type_error` on a non-numeric
age, and required gender/race/religion. Cheap to test, and it guards the input
that drives dashboard routing.

#### 3.10 `WithdrawalModal`

`components/dashboard/WithdrawalModal.tsx:19` — rejects non-numeric and
non-positive amounts, rejects amounts exceeding balance. Note the `max` HTML
attribute is *not* a substitute for the JS check; a test should assert the JS
guard directly.

> Note on payments generally: `CheckoutModal` and `PaymentModal` are simulated
> (`setTimeout` stubs, no real Bayarcash call), and `AdminCouponsPage` holds
> coupons in component state with discounts as free-text strings. These are not
> yet worth deep testing — but when real payment logic lands, it should arrive
> with tests, not after them.

---

## 4. Cross-cutting issues surfaced by this audit

These are not test gaps *per se*, but they are why tests are hard to write here
and are worth fixing alongside:

1. **Two definitions of "today", both UTC.**
   `DailyRoutineTable.tsx:604` and `GamificationWidget.tsx:22` use
   `new Date().toISOString().split('T')[0]` (**UTC**), while
   `DailyCheckIn.tsx:45` uses `new Date().toDateString()` (**local**). For a
   Malaysia-targeted app (UTC+8), the UTC-based day boundary rolls over at
   **08:00 local time**, not midnight — so a 7 AM check-in is logged against the
   previous day, and daily routine logs and login streaks reset mid-morning.
   Proposal: extract a single `getLocalDateKey()` helper, unit-test it with a
   mocked clock across the boundary, and use it everywhere.

2. **API key shipped to the browser.**
   `services/claudeService.ts:4` constructs the Anthropic SDK client with
   `dangerouslyAllowBrowser: true` and `VITE_ANTHROPIC_API_KEY`. Any `VITE_`
   variable is inlined into the client bundle and readable by every visitor.
   This directly contradicts `.env.example` ("AI API keys are stored securely in
   Supabase Edge Function secrets - NOT in frontend env") and the header comment
   in `geminiService.ts`. `claudeService` is reachable from
   `AIContentGenerator.tsx`. It should route through the existing `ai-proxy`
   edge function like every other AI call. Worth an architectural guard test
   asserting no `VITE_*` key name matching `/KEY|SECRET|TOKEN/` is referenced
   outside `supabaseClient.ts`.

3. **~25 unguarded-ish `JSON.parse` calls on localStorage.** Most are wrapped,
   but several are not — e.g. `DailyCheckIn.tsx:44` and
   `MyPathPage.tsx:48`. One corrupt key crashes the widget into the top-level
   `ErrorBoundary`. Routing all of them through the (tested) `storage` util
   fixes the class rather than the instances.

4. **`DailyRoutineTable` load effect has `[]` dependencies** but reads
   `STORAGE_KEY`, which is derived from the `religion` prop. If religion changes
   after mount, the component keeps the previous mode's stored data.

5. **`getCacheKey` collisions** in `claudeService.ts:33` — topics `"a b"` and
   `"a_b"` map to the same cache key.

---

## 5. Suggested sequencing

| Phase | Work | Rough size |
| --- | --- | --- |
| 1 | Vitest + jsdom + RTL setup, `test`/`typecheck` scripts, CI workflow | half a day |
| 2 | P1 pure-logic tests (religion, gamification, CSV, storage) | 1 day |
| 3 | P2 service tests with mocked `fetch`/Supabase | 1–2 days |
| 4 | P3 onboarding + validation + modal component tests | 2 days |
| 5 | Fix the cross-cutting issues in §4, each landing with its test | ongoing |

The unifying theme: **most of the highest-risk logic in this codebase is pure
functions that happen to live inside components.** Extracting them (date keys,
religion classification, XP math, JSON extraction) makes them testable and
removes the duplication that is already causing divergence.
