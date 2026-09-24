# EcoStorage

Personal & corporate storage marketing site and admin CMS, built with Next.js (App Router), TypeScript, Tailwind CSS, and Supabase.

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase project credentials:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public API key (Settings → API) |

## Supabase Setup

1. Create a Supabase project (or use an existing one).
2. Open the **SQL Editor** in the Supabase dashboard.
3. Run the contents of [`supabase/migrations/01_schema.sql`](supabase/migrations/01_schema.sql) to create the required tables and Row Level Security policies.
4. Copy your project's API URL and anon key into `.env.local` as described above.

## Deployment (Vercel)

1. Push this repository to GitHub.
2. In Vercel, import the GitHub repository as a new project.
3. Add the environment variables from the table above under **Project Settings → Environment Variables**.
4. Deploy. Vercel will automatically rebuild on every push to `main` (CI/CD via GitHub integration).
5. Under **Project Settings → Domains**, add the custom domain `www.storagespace.com.sg` and follow Vercel's instructions to point your DNS records at Vercel.

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS
- **Backend & Auth:** Supabase (PostgreSQL, Storage Buckets, Row Level Security)
- **Deployment:** Vercel (automatic GitHub CI/CD)
- **Testing:** Playwright CLI
