# Harmony Lifestyle Academy

Holistic lifestyle and personal development platform for Malaysian students (ages 7-17). Features personality assessments (DISC, MBTI, Enneagram, Big Five, Hexaco), AI-powered learning, gamification, wellness tracking across 7 life dimensions, and community features.

Two dashboard modes set at registration: `muslim` (Quran, Sunnah, Doa, Arabic) and `universal` (Science, Philosophy, Wisdom). Mode is immutable after selection.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (dark mode via `class` strategy), Framer Motion animations, Poppins font
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **AI**: Anthropic Claude SDK (`@anthropic-ai/sdk`), Google Gemini (`@google/genai`)
- **Deployment**: Vercel
- **Utilities**: `clsx` + `tailwind-merge` for conditional classes, `date-fns` for dates

## Commands

```bash
npm run dev      # Start Vite dev server
npm run build    # Production build — use to verify TypeScript/build errors
npm run preview  # Preview production build
```

No test framework or linter is currently configured.

## Architecture

### Entry Flow

```
index.html → index.tsx → App.tsx → MainDashboard.tsx
```

### Provider Tree (index.tsx)

```
ThemeProvider → AuthProvider → AdminProvider → ToastProvider → App
```

App.tsx adds: `ChatProvider`, `GamificationProvider`, `StudyBuddyProvider`

### Routing

Hash-based routing via `DashboardView` union type in `types.ts` (40+ views). View switching handled in `MainDashboard.tsx` with `getViewFromHash()`.

### App Flow

1. `AuthScreen` — Supabase email/password auth
2. `OnboardingFlow` — 8-step personality assessment + goals
3. `MainDashboard` — Main app with sidebar navigation

## Directory Structure

```
├── App.tsx                    # Root component, auth/onboarding flow
├── index.tsx                  # Provider tree, ErrorBoundary
├── types.ts                   # All TypeScript interfaces (630+ lines)
├── constants.ts               # App-wide constants (64KB — read specific sections only)
├── styles.css                 # Global Tailwind + custom CSS
├── components/
│   ├── dashboard/
│   │   ├── MainDashboard.tsx  # Dashboard hub, view routing (40+ views)
│   │   ├── HeaderBar.tsx
│   │   ├── SidebarNav.tsx
│   │   ├── HarmonyAIChat.tsx  # AI chat sidebar
│   │   ├── pages/             # Dashboard page components (20+)
│   │   │   └── dimensions/    # 7 wellness dimension pages
│   │   ├── sections/          # Feature sections (25+)
│   │   ├── shared/            # Reusable: AIContentGenerator, ProgressBar, HabitTracker
│   │   ├── widgets/           # DailyCheckIn, LifeBalanceWheel
│   │   ├── lms/               # CoursePlayer
│   │   ├── practice-hub/      # Dojo, CulinaryKitchen, CybersecurityOps, AIRoboticsLab
│   │   ├── gamification/      # Leaderboard, Badges
│   │   └── admin/             # Admin/teacher management (10+ pages)
│   ├── AuthScreen.tsx
│   ├── OnboardingFlow.tsx
│   └── Assessment*.tsx        # Personality assessment steps
├── contexts/                  # 7 React Context providers
│   ├── AuthContext.tsx         # useAuth() — Supabase auth state
│   ├── ChatContext.tsx         # useChat() — AI chat toggle
│   ├── ThemeContext.tsx        # useTheme() — dark/light mode
│   ├── ToastContext.tsx        # useToast() — notifications
│   ├── GamificationContext.tsx # useGamification() — XP, points, badges
│   ├── StudyBuddyContext.tsx   # useStudyBuddy() — AI study assistant
│   └── AdminContext.tsx        # useAdmin() — admin panel state
├── services/
│   ├── aiProxyService.ts      # Secure AI proxy via Supabase Edge Functions
│   ├── geminiService.ts       # Gemini AI (personality analysis, career recs, courses)
│   ├── claudeService.ts       # Claude AI (module content generation)
│   ├── supabaseClient.ts      # Supabase client init
│   ├── quranApiService.ts     # Quranic content API
│   ├── sunnahService.ts       # Sunnah teachings
│   └── studyHubService.ts     # Study hub content
├── utils/
│   ├── storageUtils.ts        # Base64-obfuscated localStorage wrapper
│   ├── exportUtils.ts         # Data export
│   ├── audioUtils.ts          # Audio handling
│   └── religionUtils.ts       # Religion-specific logic
├── constants/                 # Quranic data files
└── supabase/                  # SQL schemas and seed data
```

## AI Service Patterns

### Gemini (secure proxy)
All Gemini calls route through `aiProxyService.ts` → Supabase Edge Function. API keys stay server-side.

```typescript
import { generateContent } from './aiProxyService';
const result = await generateContent(prompt, { model: 'gemini-2.5-flash-lite', jsonMode: true });
```

### Claude (direct)
Claude calls use the Anthropic SDK directly via `claudeService.ts` with `dangerouslyAllowBrowser: true`.

```typescript
import { generateModuleContent } from '../services/claudeService';
const content = await generateModuleContent('Physical', 'Nutrition Basics');
```

### Shared Patterns
- Both services include **retry with exponential backoff** for rate limiting (429 errors)
- JSON responses parsed with `safeParseJSON()` that strips markdown code fences
- Claude content cached in localStorage with **24-hour TTL** via `getCacheKey()`
- Prompt injection mitigation: `escapePrompt()` wraps user content in XML tags

## Coding Conventions

- Functional components with TypeScript (no class components except ErrorBoundary)
- React Context + custom hooks pattern: create context, export `useXxx()` hook
- Tailwind CSS utility classes; dark mode classes use `dark:` prefix
- Import alias: `@/` maps to project root (configured in `vite.config.ts`)
- No prop drilling — use contexts for shared state
- localStorage for client-side persistence (via `storageUtils.ts`)
- Supabase for server-side persistence and auth

## Adding New Features

### New Dashboard View
1. Add view name to `DashboardView` type in `types.ts`
2. Create component in `components/dashboard/pages/`
3. Add rendering case in `MainDashboard.tsx` switch/conditional
4. Add navigation entry in `SidebarNav.tsx` if needed

### New Context Provider
1. Create file in `contexts/` following existing pattern (createContext + Provider + useHook)
2. Wrap in provider tree in `index.tsx` or within `App.tsx`

### New AI Service
1. Create file in `services/`
2. For secure calls: use `callAI()` from `aiProxyService.ts`
3. For direct calls: follow `claudeService.ts` pattern with retry logic

### New Dimension Page
1. Create component in `components/dashboard/pages/dimensions/`
2. Add to `DashboardView` type and `MainDashboard.tsx` routing

## Important Notes

- `constants.ts` is 64KB — always read specific sections, never the whole file
- `storageUtils.ts` uses Base64 obfuscation, not real encryption
- Dashboard mode (`muslim` | `universal`) is immutable after registration
- Environment variables must be prefixed with `VITE_` for client-side access
- `.env.example` lists required variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- AI API keys should be stored in Supabase Edge Function secrets (not frontend env vars)
- No tests or linting configured — verify changes with `npm run build`
- Deployment: Vercel with SPA rewrite in `vercel.json`
