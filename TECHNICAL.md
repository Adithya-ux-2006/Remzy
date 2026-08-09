# curA — Technical Documentation

> Evidence-backed remedy search engine for university students.  
> Stack: React 19 · Vite 8 · Supabase · Zustand · Tailwind CSS · Google Gemini AI  
> Deployed on Vercel · Database on Supabase (PostgreSQL)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Routing](#routing)
5. [Authentication & User Management](#authentication--user-management)
6. [Search Engine (NLP Pipeline)](#search-engine-nlp-pipeline)
7. [Database Setup & Architecture](#database-setup--architecture)
8. [State Management](#state-management)
9. [API Endpoints](#api-endpoints)
10. [Theming](#theming)
11. [Component Library](#component-library)
12. [Deployment & Build](#deployment--build)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    Browser (SPA)                     │
│  React 19 + Vite 8 + Tailwind CSS + Framer Motion   │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Pages   │  │   UI     │  │  NLP Engine       │  │
│  │ (routes) │──│Components│──│  preprocessor      │  │
│  │          │  │          │  │  clinicalReasoner  │  │
│  └──────────┘  └──────────┘  │  relevanceRanker   │  │
│       │                      │  safetyFilter      │  │
│       ▼                      │  resultsGrouper    │  │
│  ┌──────────┐                └───────────────────┘  │
│  │ Zustand  │                      │                 │
│  │  Stores  │◄─────────────────────┘                 │
│  └────┬─────┘                                        │
│       │                                              │
└───────┼──────────────────────────────────────────────┘
        │  Supabase JS Client
        ▼
┌───────────────────────────────────────────────────┐
│              Supabase (Hosted)                     │
│  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │   Auth   │  │ PostgreSQL│  │ Edge Functions│  │
│  │ (JWT)    │  │  Database │  │ (email)       │  │
│  └──────────┘  └───────────┘  └───────────────┘  │
└───────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────┐
│          Vercel Serverless Functions               │
│  /api/ai-category-fallback   (Gemini AI)          │
│  /api/ai-symptom-search      (Gemini AI)          │
│  /api/ai-reminder-copy       (Gemini AI)          │
│  /api/cron/remedy-reminders  (Cron trigger)       │
└───────────────────────────────────────────────────┘
```

**Data flow for a search:**
1. User types a natural language query (e.g. "my head hurts after staring at screens all day")
2. Client-side NLP engine preprocesses the query, extracts tokens, detects negation, expands phrases
3. Clinical reasoner maps tokens to symptoms using phrase matching, anatomy/sensation/context scoring
4. Optional: Gemini AI API call for ambiguous queries, returning interpreted symptoms + confidence
5. Ranked remedies are scored by relevance, filtered by user allergies/conditions, grouped into tiers
6. Results displayed with severity badges, evidence labels, safety indicators, and remedy cards

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 19.2.6 |
| Build Tool | Vite | 8.0.12 |
| Routing | react-router-dom | 7.17.0 |
| State | Zustand | 5.0.14 |
| Styling | Tailwind CSS | 3.4.19 |
| Animations | Framer Motion | 12.40.0 |
| Icons | lucide-react | 1.18.0 |
| UI Primitives | shadcn/ui (Radix + CVA) | — |
| Backend/DB | Supabase (Auth + PostgreSQL) | 2.108.1 |
| AI | Google Gemini (@google/genai) | 2.12.0 |
| Hosting | Vercel (SPA + Serverless) | — |

---

## Project Structure

```
cura/
├── api/                        # Vercel serverless functions
│   ├── ai-category-fallback.js # AI symptom category resolution
│   ├── ai-symptom-search.js    # AI-powered search
│   ├── ai-reminder-copy.js     # AI reminder text generation
│   ├── cron/
│   │   └── remedy-reminders.js # Cron-triggered email reminders
│   ├── middleware.js            # Rate limiting, CORS, sanitization
│   └── parseBody.js            # Request body parser
├── netlify/functions/           # Netlify function (Gemini NLU)
├── scripts/                    # Dev/ops scripts
├── src/
│   ├── components/
│   │   ├── forms/              # SearchBar, RemedyScheduleForm
│   │   ├── layout/             # Navbar, BottomNav, AppDock, PageWrapper, AdminGuard
│   │   ├── onboarding/         # QuestionnaireFlow (multi-step health profile)
│   │   └── ui/                 # 47 reusable UI components
│   ├── constants/              # Emergency phrases, lifestyle tips, onboarding options
│   ├── context/                # ThemeContext (light/dark/system)
│   ├── data/                   # Static symptom/remedy data, NLP mappings, local catalog
│   ├── engine/                 # Client-side NLP pipeline (6 modules)
│   ├── hooks/                  # useSearch (debounced search)
│   ├── lib/                    # Supabase client, cn() utility
│   ├── pages/                  # 13 page components (all lazy-loaded)
│   ├── store/                  # 6 Zustand stores
│   └── utils/                  # Analytics, API, mapping, safety checks
├── index.html                  # Entry point with SEO meta + JSON-LD
├── tailwind.config.js          # Theme tokens, custom colors, gradients
├── vite.config.js              # Build config, chunk splitting
└── netlify.toml                # Netlify deploy config
```

---

## Routing

All pages are lazy-loaded via `React.lazy()` for code splitting. Each page is wrapped in its own `<Suspense>` so the navbar remains visible during transitions.

| Route | Page | Auth | Description |
|-------|------|------|-------------|
| `/` | Landing | — | Marketing homepage with hero, FAQ, symptom cards |
| `/login` | Login | — | Email/password authentication |
| `/register` | Register | — | Account creation with `?email=` prefill |
| `/search` | SymptomSearch | — | Primary search interface with quick-access cards |
| `/results` | Results | — | Ranked remedy results with severity/evidence panels |
| `/remedy/:id` | RemedyDetail | — | Full remedy page (hero, stats, evidence, guidance) |
| `/dashboard` | Dashboard | ✓ | Personalized home with favorites, recommendations |
| `/favorites` | Favorites | ✓ | Saved remedy grid |
| `/schedules` | RemedySchedules | ✓ | Remedy reminder management (CRUD) |
| `/profile` | Profile | ✓ | User profile editing, conditions, allergies |
| `/onboarding` | Onboarding | ✓ | Multi-step health questionnaire |
| `/admin` | AdminAnalytics | ✓ Admin | Aggregate search/remedy analytics |

**Guards:**
- `AuthEnforcer` — runs on every route; redirects authenticated users with incomplete profiles to `/onboarding`
- `ProtectedRoute` — redirects unauthenticated users to `/login`
- `AdminGuard` — checks `is_admin` flag on user profile

---

## Authentication & User Management

**Provider:** Supabase Auth (email/password)

**Flow:**
1. User registers → Supabase creates auth user → app upserts row in `users` table → imports any quick-saved favorites from localStorage
2. User logs in → Supabase validates credentials → app loads profile, favorites, schedules
3. Guest users store allergies/conditions in localStorage; these migrate to the `users` table on signup
4. Onboarding questionnaire collects gender, conditions, and allergies — saved via `authStore.saveOnboarding()`

**Key fields on `users` table:**  
`id`, `name`, `university_email`, `university_name`, `current_year`, `gender`, `common_conditions[]`, `known_allergies[]`, `has_completed_onboarding`, `is_admin`, `search_count`

---

## Search Engine (NLP Pipeline)

The client-side engine in `src/engine/` processes natural language queries through 6 stages:

### 1. Preprocessor (`preprocessor.js`)
- Lowercases, normalizes whitespace, expands contractions
- Detects negation (30+ negation words: "not", "no", "without", "don't", etc.)
- Expands natural phrases to symptoms via `conceptPhrases.js` (e.g. "keep throwing up" → nausea)
- Resolves synonyms and extracts tokens

### 2. Clinical Reasoner (`clinicalReasoner.js`)
- Builds a symptom index from the catalog
- Matches query tokens against symptom labels, descriptions, and phrase mappings
- Scores matches using `composer.js` (combines anatomy map + sensation map + context map)
- Enhances results with Gemini AI for ambiguous queries
- Classifies severity (severe/moderate/mild), detects emergency indicators
- Determines user intent: `relief`, `cause`, `prevention`, or `medication`

### 3. Relevance Ranker (`relevanceRanker.js`)
- Scores each remedy against matched symptoms using tiered relevance:
  - **Tier 0 (Direct):** remedy is a primary treatment for the symptom
  - **Tier 1 (Associated):** remedy has secondary association
  - **Tier 2 (Supportive):** remedy provides general support
- Factors in: evidence score, category affinity, safety score, user context, query confidence

### 4. Safety Filter (`safetyFilter.js`)
- Cross-references remedy allergen tags, ingredients, and contraindications against user profile
- Computes safety scores; marks unsafe remedies
- Adjusts confidence scores for filtered results (soft filter, not hard remove)

### 5. Knowledge Graph (`knowledgeGraph.js`)
- Wraps `symptomGraph.js` data: related symptoms, possible causes, severity/emergency flags
- Detects emergency indicators from matched symptoms

### 6. Results Grouper (`resultsGrouper.js`)
- Groups ranked remedies into display tiers:
  - `bestMatch` — single top result (HighlightedRemedyCard)
  - `bestMatches` — next 2-3 results (carousel)
  - `additionalOptions` — alternative remedies
  - `supportive` — complementary suggestions

### Gemini AI Integration
- Called via `/api/ai-category-fallback` for ambiguous queries
- Called via `/api/gemini-nlu` (Netlify function) for full symptom interpretation
- Results cached client-side (20-minute TTL, max 200 entries)
- Inflight request deduplication

---

## Database Setup & Architecture

### How Supabase Was Set Up

1. **Project creation** — Created a Supabase project (hosted PostgreSQL) via the Supabase dashboard
2. **SQL Editor** — All schema, migrations, and seed data were run through the Supabase SQL Editor (not a CLI migration tool)
3. **Auth** — Enabled email/password auth in Supabase Auth settings; the `auth.users` table is managed by Supabase internally
4. **RLS** — Enabled Row Level Security on every table; catalog data is publicly readable, user data is scoped to `auth.uid()`
5. **Edge Functions** — Deployed a Deno Edge Function (`send-remedy-reminders`) for email delivery
6. **API keys** — Used `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (anon key, safe for client-side) in the React app

**Client connection** (`src/lib/supabase.js`):
```js
// Lazy singleton — only created on first access, not at import time
let _client = null;
function getClient() {
  if (!_client) _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}
// Proxy delegates property access to the lazily-initialized client
export const supabase = new Proxy({}, {
  get(_, prop) { return getClient()[prop]; },
});
```

### Migration History (19 Migrations)

All migrations live in `supabase/migrations/` and were applied manually via the SQL Editor in order.

| # | File | What It Does |
|---|------|-------------|
| 001 | `initial_schema.sql` | Creates core tables: `symptoms`, `remedies`, `remedy_symptoms`, `research_papers`, `users`, `favorites`, `appointments`. Enables RLS on all. Creates `handle_new_user()` trigger. Sets up public-read policies for catalog, user-scoped policies for personal data. |
| 002 | `phase3a.sql` | Adds `university_email`, `university_name`, `current_year` columns to `users`. Adds `is_admin` flag. Adds treatment preference booleans (`prefer_natural`, `avoid_medication`, `vegetarian_remedies`). |
| 003 | `notify_launch.sql` | Adds `notify_nearby_launch` boolean to `users` for nearby-shop launch notifications. |
| 004 | `product_analytics.sql` | Creates `search_events`, `remedy_events`, `remedy_feedback` tables. Enables RLS. Anyone can insert; only admins can read. |
| 005 | `admin_authorization.sql` | Adds admin-only read policies on analytics tables. Only users with `is_admin = true` can query search/remedy events and feedback. |
| 006 | `profile_collection_fields.sql` | Adds `common_conditions`, `known_allergies`, `treatment_prefs` arrays to `users`. Supports onboarding questionnaire data. |
| 008 | `expanded_remedies.sql` | Expands remedy catalog with additional remedies for new symptom categories. |
| 009 | `symptom_remedies.sql` | Creates `symptom_remedies` table — precomputed evidence mapping with `evidence_score` and `priority_rank` columns. Public read access. |
| 010 | `body_pain_symptoms.sql` | Adds musculoskeletal symptoms: `muscle_pain`, `joint_pain`, `leg_pain`, `knee_pain`, `neck_pain`, `shoulder_pain`. |
| 011 | `symptom_search_fix.sql` | Fixes symptom search queries. Adjusts column types and constraints for better NLP matching. |
| 012 | `symptom_expansion.sql` | Adds `cough`, `congestion`, `sinus_pressure`, `dehydration`, `low_energy`, `burnout`, `brain_fog`, `eye_pain`, `stomach_ache`, `indigestion`, `heartburn`, `constipation`, `diarrhea`, `gas`, `dry_skin`, `acne`, `pms`, `menopause`. Grows catalog from 16 → 40 symptoms. |
| 013 | `database_repair.sql` | Fixes broken foreign keys, orphaned rows, and constraint violations discovered during testing. |
| 014 | `symptom_remedies_expansion.sql` | Populates `symptom_remedies` with evidence scores and priority ranks for expanded symptom-remedy pairs. |
| 015 | `remedy_schedules.sql` | Creates `remedy_schedules` table for reminder CRUD. User-scoped RLS policies (full CRUD for own schedules). |
| 016 | `sexual_wellness.sql` | Adds sexual wellness symptom categories and remedies. |
| 017 | `search_count.sql` | Adds `search_count` integer to `users`. Incremented on each search for analytics. |
| 018 | `search_optimization_and_mapping_fix.sql` | **Major overhaul.** Drops all CHECK constraints, reseeds all 40 symptoms + 62 remedies, clears incorrect negation mappings, recreates `symptom_remedies` with correct evidence/priority scores, adds `match_strength` column to `remedy_symptoms` (primary/secondary), remaps all remedy-symptom relationships, recreates category CHECK constraint. Self-contained and constraint-safe. |
| 019 | `fix_trigger_and_sync_schema.sql` | Fixes `handle_new_user` trigger (had 10 VALUES for 8 columns). Adds missing columns (`ingredients`, `search_count`, `match_strength`). Creates missing tables (`symptom_remedies`, `search_events`, `remedy_events`, `remedy_feedback`, `remedy_schedules`) with RLS. Idempotent (`IF NOT EXISTS`). |

### How the Tables Evolved

```
Phase 1 (001):   7 tables  — symptoms, remedies, remedy_symptoms, research_papers, users, favorites, appointments
Phase 2 (002-06): +columns  — users gets university info, admin flag, treatment prefs, conditions/allergies
Phase 3 (008-014): +catalog  — Grows from 16→40 symptoms, 50→62 remedies, adds symptom_remedies mapping table
Phase 4 (015):   +schedules — remedy_schedules for reminder system
Phase 5 (016):   +wellness  — Sexual wellness symptoms/remedies
Phase 6 (017-019): +analytics— search_count, search_events, remedy_events, remedy_feedback, constraint fixes
```

### Seed Data

**`supabase/seed.sql`** — Run once after schema creation:
- Seeds 16 initial symptoms with emoji + color theme
- Seeds 50 remedies with full metadata (descriptions, allergens, contraindications, ratings)
- Inserts `remedy_symptoms` junction mappings (which remedies treat which symptoms)
- Inserts `research_papers` for evidence citations
- Uses `ON CONFLICT` upserts so it's safe to re-run
- Wrapped in a single `BEGIN`/`COMMIT` transaction

**Migration 018** — The definitive reseed:
- Upserts all 40 symptoms (expanded from 16)
- Upserts all 62 remedies (expanded from 50)
- Clears all incorrect negation mappings
- Rebuilds `symptom_remedies` with proper evidence scores (1-10) and priority ranks
- Rebuilds `remedy_symptoms` with `match_strength` (primary/secondary)
- Re-creates CHECK constraints

### Row Level Security (RLS)

Every table has RLS enabled. The policy model:

| Table | Read | Write | Who |
|-------|------|-------|-----|
| `symptoms` | Public | — | Anyone can browse |
| `remedies` | Public | — | Anyone can browse |
| `remedy_symptoms` | Public | — | Anyone can browse |
| `symptom_remedies` | Public | — | Anyone can browse |
| `research_papers` | Public | — | Anyone can browse |
| `users` | Own | Own | `auth.uid() = id` |
| `favorites` | Own | Own | `auth.uid() = user_id` |
| `remedy_schedules` | Own | Own | `auth.uid() = user_id` |
| `search_events` | Admin | Anyone | Insert: public. Read: `is_admin = true` |
| `remedy_events` | Admin | Anyone | Insert: public. Read: `is_admin = true` |
| `remedy_feedback` | Admin | Own | Insert: public. Update: own. Read: `is_admin = true` |

### Auth Trigger: `handle_new_user()`

A PostgreSQL trigger on `auth.users` fires on INSERT. When Supabase Auth creates a new user, this function auto-creates a row in `public.users`:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, name, university_email, university_name, current_year, gender)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', 'Student'),
    NEW.raw_user_meta_data ->> 'university_email',
    NEW.raw_user_meta_data ->> 'university_name',
    NEW.raw_user_meta_data ->> 'current_year',
    COALESCE(NEW.raw_user_meta_data ->> 'gender', '')
  )
  ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, ...;
  RETURN NEW;
END;
$$;
```

This means signup automatically creates the profile row — no separate API call needed.

### How the App Uses the Database

**Catalog loading** (`src/store/catalogStore.js`):
1. On mount, tries to fetch `symptoms`, `remedies`, `symptomRemedies` from Supabase
2. Falls back to local JSON data if Supabase is unreachable
3. The NLP engine reads from this catalog to map queries → symptoms → remedies

**Favorites** (`src/store/favoritesStore.js`):
- Optimistic UI: toggles local state immediately, then syncs to Supabase
- On login: imports any localStorage-saved favorites into the `favorites` table

**Schedules** (`src/store/remedyScheduleStore.js`):
- Full CRUD against `remedy_schedules` table
- `hasActiveSchedule(remedyId)` selector checks if a remedy has an active schedule

**Analytics** (`src/utils/analytics.js`):
- `logSearchEvent()` → inserts into `search_events`
- `logRemedyEvent()` → inserts into `remedy_events`
- `logRemedyFeedback()` → inserts into `remedy_feedback`
- `incrementSearchCount()` → increments `users.search_count`

**Auth** (`src/store/authStore.js`):
- Registers via `supabase.auth.signUp()` → trigger creates profile row
- Loads profile from `users` table on session restore
- Updates profile via `supabase.from('users').update()`

### Edge Function: Email Reminders

`supabase/functions/send-remedy-reminders/index.ts` — Deno-based Edge Function deployed to Supabase:
- Triggered by `/api/cron/remedy-reminders` (Netlify cron)
- Reads active `remedy_schedules` where `scheduled_time` matches current time
- Generates personalized reminder text via AI (`/api/ai-reminder-copy`)
- Sends emails via Resend API

### Netlify Functions That Query Supabase

| Function | Supabase Interaction |
|----------|---------------------|
| `cron-remedy-reminders.js` | Calls the Edge Function via `SUPABASE_URL/functions/v1/send-remedy-reminders` using `SUPABASE_SERVICE_ROLE_KEY` |
| `gemini-nlu.js` | No direct DB access — returns interpreted symptoms; the client then queries the catalog |
| `nearby-shops.js` | No DB access — queries Geoapify API for nearby pharmacies |

---

## State Management

6 Zustand stores, all in `src/store/`:

| Store | State | Purpose |
|-------|-------|---------|
| `authStore` | user, isAuthenticated, isInitialized | Auth lifecycle, profile CRUD, onboarding |
| `catalogStore` | symptoms, remedies, symptomRemedies | Catalog data from Supabase (with local fallback) |
| `favoritesStore` | favorites | Optimistic favorite add/remove/toggle |
| `guestProfileStore` | allergies, conditions, gender | Guest profile in localStorage |
| `remedyScheduleStore` | schedules, isLoading | Schedule CRUD + `hasActiveSchedule()` selector |
| `quickScheduleStore` | remedy | Quick-add modal state |

**Pattern:** Stores fetch from Supabase on mount (when authenticated). Guest data lives in localStorage and migrates to Supabase on signup.

---

## API Endpoints

All serverless functions in `api/` (deployed on Vercel, proxied via Netlify redirects).

| Endpoint | Method | Purpose | AI? |
|----------|--------|---------|-----|
| `/api/ai-category-fallback` | POST | Maps free-text to symptom category | Gemini |
| `/api/ai-symptom-search` | POST | AI-powered symptom search | Gemini |
| `/api/ai-reminder-copy` | POST | Generates personalized reminder text | Gemini |
| `/api/cron/remedy-reminders` | GET | Triggers Supabase Edge Function for email reminders | — |

**Security:**
- Rate limiting: 20 req/min general, 5 req/min for AI endpoints
- Input sanitization: strips script tags, limits query length
- CORS headers configured per endpoint
- Cron endpoint authenticated via `CRON_SECRET`

---

## Theming

- **Three modes:** Light, Dark, System (auto-detect)
- Persisted to `localStorage` key `cura-theme`
- Dark mode uses Tailwind's `class` strategy (`.dark` on `<html>`)
- All colors defined as HSL CSS custom properties in `index.css`
- Dark mode palette: deep navy backgrounds (`210 30% 9%`), green accents (`152 40% 48%`)
- Global radial gradient vignette on `body::before` in dark mode
- Light mode: soft sage greens (`155 40% 95%`)

---

## Component Library

47 UI components in `src/components/ui/`, built with Tailwind CSS + Framer Motion.

**Key component categories:**

| Category | Components |
|----------|-----------|
| **Remedy Display** | RemedyCard (3 variants: default/featured/carousel), HighlightedRemedyCard, FeaturedRemedyCard, RemedyHero, RemedyCarousel, AltRemedyRow |
| **Safety & Evidence** | SafetyBanner, SafetyLabel, SafetyNotice, AdvisoryCard, AllergyBadge, SeverityBadge, EvidenceCard, EvidenceLabel |
| **User Actions** | FavoriteHeart, ScheduleQuickAdd, QuickScheduleModal, ThemeToggle |
| **Search & Analysis** | SymptomInterpreter, WhyRecommended, GuidancePanel, MedicalGuidancePanel, DoctorGuidance |
| **Layout & Navigation** | Modal, EmptyState, LoadingSkeleton, ErrorBoundary, Reveal, FAQAccordion, Checklist, NearbyShops |
| **shadcn/ui Primitives** | Button, Card, Badge, Avatar (TypeScript, CVA variants) |

**Animation:** Most components use Framer Motion for reveal-on-scroll (`Reveal`), hover lift, staggered list entry, and spring physics on the macOS-style dock.

---

## Deployment & Build

**Primary:** Vercel  
**Secondary:** Netlify (configured via `netlify.toml`)

**Build command:** `npm run build` → Vite production build  
**Output:** `dist/` directory  
**Chunk splitting:** Manual chunks for supabase, router, zustand, framer-motion, and UI vendor libs

**Environment variables required:**
| Variable | Purpose |
|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous API key |
| `VITE_API_BASE_URL` | Base URL for serverless API |
| `GEMINI_API_KEY` | Google Gemini AI key (server-side) |
| `CRON_SECRET` | Secret for cron endpoint authentication |

**Cron jobs:**
- `/api/cron/remedy-reminders` runs on a schedule, triggers Supabase Edge Function to send reminder emails

---

*Generated from codebase at commit `6415156`*
