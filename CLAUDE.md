# Storage Space v2.0 - Project Instructions

## Tech Stack & Core Standards
- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend & Auth:** Supabase (PostgreSQL, Storage Buckets, RLS Security)
- **Deployment:** Vercel (Automatic GitHub CI/CD)
- **Testing:** Playwright CLI

## Design System & Theme Tokens
- **Brand Accent Green:** `#00E599` (Primary buttons, active tabs, highlights, key accents)
- **Dark Background:** `#0B0F17` / `#111827` (Dark slate main canvas background)
- **Card / Container BG:** `#1F2937` (Slightly lighter slate for popups, inputs, and cards)
- **Media Placeholders:** Do not hardcode static images/videos. Use empty video frames or CSS aspect-ratio skeletons.

## Code & Quality Rules
- **TypeScript:** Strict typing. Store interfaces in `src/types/database.ts`. Avoid `any`.
- **Imports:** Use `@/` path aliases (e.g., `@/components/`, `@/lib/`).
- **Components:** Server Components by default; add `'use client'` only when interactive state or hooks are strictly required.
- **Data Protection:** Enforce Supabase Row Level Security (RLS) on all database tables (Public Read, Admin Write).

## Execution & Workflow Rules
- **Token Efficiency:** Edit only requested files. Keep code clean and skip conversational filler.
- **Reference Wireframes:** Check `./references/` for visual layout guidance before building components.
- **Build Checks:** Ensure zero TypeScript or ESLint errors before finishing a task.