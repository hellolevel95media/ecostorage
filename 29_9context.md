# EcoStorage — Session Context (2026-09-29)

Handoff doc for continuing this project on another machine (MacBook) with a
fresh Claude Code session that has no memory of today's conversation. Read
this first, then `todo.txt` for outstanding setup tasks and `changelog.txt`
for the detailed feature changelog from earlier today.

## Project basics

- Next.js (App Router) + TypeScript + Tailwind CSS, Supabase (Postgres, Auth,
  Storage), deployed on Vercel with GitHub CI/CD.
- Live Supabase project: **"ecostorage"**, ref `dqmuuszmuyixjxonwjpv`,
  region `ap-southeast-1`.
- Live Vercel project: **ecostorage** (currently on `https://ecostorage-iota.vercel.app`,
  no custom domain connected yet — `storagespace.com.sg` is a different,
  externally-managed domain this project will eventually move to, but you
  don't control its DNS yet).
- GitHub repo: `hellolevel95media/ecostorage`, `main` branch, auto-deploys to
  Vercel on push.

## Secrets handling rule (carry this forward)

Never paste real passwords/API keys into chat expecting Claude to write them
into a file. Real secrets go directly into `.env.local` (gitignored) or the
relevant dashboard's own UI by you, not relayed through the conversation.
Claude can read/reformat an already-existing `.env.local`'s real values (e.g.
fixing a key name) without echoing them back in chat, but should never be the
first party to introduce a real secret into a persisted file from something
typed in chat.

## What happened today (chronological)

1. **Mobile redesign + admin CMS/SEO features + security hardening** — full
   details in `changelog.txt`. Covers HeroBanner/Header mobile rework,
   CardCarousel, admin analytics dashboard, 2FA/MFA, MediaPicker, cookie
   consent + GDPR page, Resend email notifications wiring, automated DB
   backup GitHub Action, and 3 real security fixes found via mutation testing
   (rate-limiter X-Forwarded-For spoofing, etc.).
2. **SEO/GEO audit fixes** — per-page metadata, article structured data
   (including `dateModified`), contact form accessibility.
3. **Connected the live Supabase project** — applied 3 migrations
   (`section_stats`, `page_views`, `media_bucket_limits`) via MCP, fixed
   `.env.example` documenting the wrong env var name
   (`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` → actually
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, which the app reads).
4. **WCAG contrast fix** — added a `--brand-ink` CSS token (~5:1 contrast on
   white) for text/links/focus outlines, separate from the vivid `--brand`
   token kept for button backgrounds. Swapped ~24 component/page files from
   `text-brand` to `text-brand-ink` where text sits directly on a light
   background.
5. **`/admin` graceful failure** — `src/proxy.ts` now catches Supabase client
   init failures (missing/invalid env vars) and redirects to a new
   `/config-error` page instead of a hard Next.js 500.
6. **Sentry wired up** via the official wizard (user ran it locally — the
   wizard needs a real TTY + browser OAuth, can't run through Claude's
   sandboxed shell). Fixed the wizard hardcoding the real DSN into 3 tracked
   files instead of reading `process.env.SENTRY_DSN` /
   `NEXT_PUBLIC_SENTRY_DSN`.
7. **Switched public pages from `force-dynamic` to ISR** (`revalidate = 60`)
   on all 9 public pages (`/`, `/services`, `/resources`,
   `/resources/[slug]`, `/personal`, `/mission`, `/partner`, `/corporate`,
   `/contact`) — visitors now get an instantly-served cached page instead of
   waiting on a live DB query every request. Added `POST /api/revalidate`
   (auth-gated) and wired it into the three admin save forms
   (`SectionEditor`, `ArticleForm`, `ServiceForm`) so publishing a content
   change invalidates the relevant public path immediately instead of
   waiting up to 60s. Admin pages themselves stay `force-dynamic` (always
   need live data, behind auth, not worth caching).
8. **Debugged the production `/admin` login failure** — user could log in
   locally but not on the Vercel deployment. Verified the *code* was correct
   by spinning up a throwaway Supabase test admin user, temporarily adding it
   to the local `ADMIN_ALLOWED_EMAILS` allowlist (via a temporary
   `.env.local` edit, reverted immediately after — Next.js auto-reloads env
   changes on a running dev server), and driving a full login through
   Playwright CLI against `localhost:3000` — it worked end-to-end, confirming
   the bug was in Vercel's env var config, not the app. Test user + local env
   edit were both cleaned up afterward; the user's own already-running dev
   server was never touched or restarted.
9. **Found the root cause via a screenshot of the Vercel env vars dashboard**:
   `ADMIN_ALLOWED_EMAILS` was set to `hello@leve95media.com` — **missing the
   "l" in "level95"** — a typo, should be `hello@level95media.com`. This is
   why the real login attempt succeeded against Supabase auth but then got
   silently signed out by the app-level allowlist check in
   `src/app/admin/(protected)/layout.tsx`.

## Current blocking issue (unresolved as of end of session)

**`/admin` login on production Vercel may still be broken** — the user was
told to fix the `ADMIN_ALLOWED_EMAILS` typo in the Vercel dashboard (Settings
→ Environment Variables → correct to `hello@level95media.com`) and hit
**Redeploy** (env var changes don't apply until redeployed). **Not yet
confirmed working** — first thing to check next session is whether this was
done and whether login now succeeds on
`https://ecostorage-iota.vercel.app/admin/login`.

## Known bug (found, not yet fixed)

A **React hydration mismatch** fires on every page load, pointing at the
`CookieConsent` component — server-rendered HTML doesn't match the client
render for it (likely reads consent state from `localStorage` only on the
client, causing a server/client branch). Not breaking anything functionally
(React just regenerates the tree client-side), but worth fixing — probably
needs a `useEffect`-gated mount check or `suppressHydrationWarning` on the
right element rather than reading `localStorage` during initial render.

## Outstanding todo.txt items (see that file for full detail/context)

1. **[CRITICAL, still unresolved]** Disable "Allow new users to sign up" in
   Supabase dashboard (Authentication → Providers → Email). User couldn't
   find this toggle when they looked — may be under a different path in the
   current Supabase dashboard UI, needs another look.
2. ~~Connect live Supabase project~~ — **done** this session.
3. **Resend email notifications** — user has no option to add a new sender
   email in their Resend dashboard; the only "Emails" entry shown is tied to
   a domain verified under a different project, and "Domains" only lets them
   verify a domain they control DNS for (they don't control
   `storagespace.com.sg`'s DNS yet). Recommended path: use the sandbox sender
   `onboarding@resend.dev` for now (works with no domain verification, but
   can only deliver to the Resend account owner's own registered email while
   unverified) — or their pre-existing `<anything>@istutyen.resend.app`
   address, which the user mentioned they can already receive mail at. Needs
   `RESEND_API_KEY`, `INQUIRY_NOTIFICATION_EMAIL`,
   `INQUIRY_NOTIFICATION_FROM` set in `.env.local` (and Vercel) — not yet
   confirmed done.
4. **Sentry** — SDK installed and wired correctly (see above). Still need to:
   restart the dev server, visit `/sentry-example-page`, and confirm a test
   error lands in the Sentry dashboard. Once confirmed, delete
   `src/app/sentry-example-page/` and `src/app/api/sentry-example-api/`
   (scaffolding, not meant to ship).
5. UptimeRobot — deliberately deferred, no domain control yet, no action
   needed until `storagespace.com.sg` DNS is available.
6. GitHub Actions secrets (`SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD` for
   the automated backup workflow) — naming convention was discussed and
   standardized in chat; not confirmed whether the user actually added them
   to the GitHub repo's Actions secrets yet.
7. Admin 2FA — feature is built (`/admin` → Security tab), user still needs
   to personally enroll.
8. Alternative media hosting (Cloudflare R2 / Bunny.net) — optional, only
   relevant if Supabase Storage's free 1GB tier is outgrown. No action
   needed now.

## Loose ends from this session

- `foryou.png` (Vercel env var dashboard screenshot) is sitting untracked in
  the repo root — a debugging artifact, not committed, safe to delete once
  no longer needed.
- Both `changelog.txt` (earlier today, feature-level detail) and this file
  exist — this file is the higher-level session handoff; `changelog.txt` has
  the line-by-line feature changelog for the mobile redesign / admin CMS work
  that predates the Supabase/Sentry/ISR work described above.
