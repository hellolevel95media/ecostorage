---
name: EcoStorage
description: Pay-as-you-use, hassle-free pickup-and-delivery storage for Singapore, with a genuine sustainability edge
colors:
  brand: "#00e599"
  brand-foreground: "#04140d"
  background: "#ffffff"
  foreground: "#0b0f17"
  surface: "#f4f6f8"
  card: "#ffffff"
  border: "#e5e8ec"
typography:
  display:
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 1.875rem)"
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "var(--font-geist-sans), Arial, Helvetica, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.02em"
  mono:
    fontFamily: "var(--font-geist-mono), monospace"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-foreground}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.brand}"
  button-secondary:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  card:
    backgroundColor: "{colors.card}"
    rounded: "{rounded.md}"
  input:
    backgroundColor: "{colors.background}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
---

# Design System: EcoStorage

## Overview

**Creative North Star: "The Hassle-Free Vault"**

EcoStorage is pay-as-you-use, secure, hassle-free storage — customers never touch a facility, and the site's job is to make that promise feel instantly credible. The base surface stays clean, white, and unhurried, so trust-building content (pricing, process, safety) reads with total clarity. Brand green (#00E599) is not a rare accent here — it's a confident, recurring signal, threaded through icons, stats, active states, and dividers so the sustainability story ("lower-carbon, ambient warehousing") stays visually present throughout, not just in one hero moment.

The voice is approachable and warm rather than clinical: rounded-full buttons and rounded-xl cards soften the logistics-company edge, while numeric content (prices, CO₂ saved, trees saved, module counts) is set in tabular figures and given clear visual weight so the "trustworthy and precise" half of the personality still comes through. Depth is structural, not ambient — surfaces sit flat at rest and shadows only appear as direct feedback to hover/focus, so motion always means something rather than decorating.

**Key Characteristics:**
- Clean white base canvas with brand green as a confident, recurring signal (not a rare accent)
- Rounded, tactile forms (full-round buttons, xl/2xl-round cards) over sharp geometry
- Numbers (price, CO₂, trees, module counts) always set in tabular figures for a precise, trustworthy feel
- Shadows appear only in response to interaction — flat at rest, lifted on hover/focus
- No stock photography or placeholder imagery; empty media slots use skeleton shimmer, never fake content

## Colors

A near-monochrome white/slate base carries the content; the single brand green does all the emotional and functional signaling — CTAs, active states, savings/eco stats, focus rings, selection color.

### Primary
- **Signal Mint** (`#00e599` / `--brand`): primary buttons, active nav/tab states, focus rings, selection highlight, brand mark, calculator stat numbers (savings, CO₂ saved, trees saved), section accent lines/dividers. Used confidently and repeatedly — this is the sustainability story made visible, not a decoration.
- **Ink on Mint** (`#04140d` / `--brand-foreground`): text/icon color anywhere it sits directly on Signal Mint (primary button label, logo mark background, gradient overlay text).

### Neutral
- **Paper White** (`#ffffff` / `--background`, `--card`): page background and card surfaces.
- **Warehouse Slate** (`#0b0f17` / `--foreground`): primary text color.
- **Soft Surface** (`#f4f6f8` / `--surface`): secondary panel background (e.g. TrustBanner container, size-guide backdrop) — one step off white for gentle separation without a border.
- **Hairline Border** (`#e5e8ec` / `--border`): all borders, dividers, input strokes.

### Named Rules
**The Recurring Signal Rule.** Unlike a typical "rare accent" system, Signal Mint is allowed to repeat across a single screen (a stat, a CTA, an active tab, a divider) because the color itself carries meaning (trust + sustainability) — the repetition reinforces the message rather than diluting it. It should still never become the dominant surface color; white/slate remain the base.

## Typography

**Display/Body Font:** Geist Sans (`var(--font-geist-sans)`, with Arial/Helvetica fallback)
**Mono Font:** Geist Mono (`var(--font-geist-mono)`) — reserved for any code/data-table contexts; not currently used in visible UI.

**Character:** A single clean geometric sans carries the whole system — no serif or display-font pairing. Warmth and precision come from weight, size, and color, not from font variety.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 5vw, 3.75rem)`, tight `-0.02em` tracking): Hero H1s.
- **Headline** (700, `clamp(1.5rem, 3vw, 1.875rem)`): Section H2s (TrustBanner, calculator heading).
- **Title** (600, `1rem`–`1.125rem`): Card headings (ServiceCard, ArticleCard titles), form section labels.
- **Body** (400, `1rem`, 1.6 line-height): Paragraph copy, descriptions.
- **Label** (600, `0.75rem`, `0.02em` tracking, uppercase where used): Eyebrow labels, category tags, field labels, badge text.

### Named Rules
**The Tabular Numbers Rule.** Any live/computed numeric value (calculator price, CO₂ saved, trees saved, module count) is set with `tabular-nums` so digits don't shift width as values change — precision is felt, not just stated.

## Layout

Content is constrained to a `max-w-7xl` container with responsive `px-4 sm:px-6 lg:px-8` gutters across nearly every section — this single container rhythm is the backbone of the whole site. Sections stack vertically with generous `py-12`–`py-24` breathing room; there is no dense dashboard-style layout anywhere on the public site (that density belongs only to `/admin`). Grids collapse from multi-column (`lg:grid-cols-2`, `lg:grid-cols-4`) down to a single stacked column below `lg`, with the calculator additionally using a dedicated mobile-only stepped flow (Items → Plan → Contact) instead of cramming the two-column desktop layout into a small screen.

## Elevation & Depth

Depth is structural, not ambient: surfaces are flat at rest (`shadow-card` is used sparingly on already-elevated containers like the TrustBanner panel and calculator card, not applied universally) and interaction is what introduces or deepens shadow. Cards lift (`hover:-translate-y-1` + `hover:shadow-card-hover`) only on hover; buttons get a glow (`shadow-glow`) only on the primary variant, signaling "this is the action to take" rather than being a universal button treatment.

### Shadow Vocabulary
- **`--shadow-card`** (`0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -22px rgba(15,23,42,0.18)`): resting elevation for cards/panels that are meant to read as raised (TrustBanner, calculator, form panels).
- **`--shadow-card-hover`** (`0 1px 2px rgba(15,23,42,0.06), 0 24px 48px -20px rgba(15,23,42,0.24)`): hover state for interactive cards (ServiceCard, ArticleCard).
- **`--shadow-glow`** (`0 0 0 1px rgba(0,229,153,0.4), 0 10px 30px -10px rgba(0,229,153,0.5)`): reserved for the primary button variant — a green-tinted glow that doubles as brand reinforcement.

### Named Rules
**The Earned Shadow Rule.** A shadow only appears where the user's attention or action just landed (hover, focus, primary CTA). Flat surfaces stay flat until then.

## Shapes

Corners are consistently rounded and skew generous: `rounded-full` for every button and pill/tag/badge, `rounded-xl`/`rounded-2xl` for cards, media placeholders, and larger panels, `rounded-lg` for small circular icon buttons (stepper +/−) and nav-item chips, `rounded-sm`/`rounded-lg` for form inputs. There are no sharp (unrounded) corners anywhere in the current component set — this softness is deliberate and central to the "hassle-free, approachable" character, not incidental.

## Components

### Buttons
- **Shape:** fully rounded (`rounded-full`), tactile and confident — firm press feedback via `active:scale-[0.97]`.
- **Primary:** `bg-brand` with `text-brand-foreground` and `shadow-glow`; darkens slightly on hover (`hover:bg-brand/90`).
- **Secondary:** `bg-card` with a `border-border` outline; border shifts to brand on hover (`hover:border-brand/50`).
- **Ghost:** text-only, `text-foreground` shifting to `text-brand` on hover.
- **Disabled:** `disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100` — visually muted and inert, no press feedback.

### Cards / Containers
- **Corner Style:** `rounded-xl` (ServiceCard, ArticleCard, MediaPlaceholder), `rounded-2xl` (TrustBanner panel).
- **Background:** `bg-card` (white) on `bg-background`/`bg-surface`.
- **Shadow Strategy:** flat at rest, `shadow-card-hover` + `-translate-y-1` lift on hover (see Elevation).
- **Border:** `border border-border`, shifting to a brand-tinted border on hover (`hover:border-brand/30` or `/40`).
- **Internal Padding:** `p-5`–`p-6` typical; compact variants (footer contact form) use `p-4`.

### Inputs / Fields
- **Style:** `bg-background` with `border-border`, `rounded-lg` (or `rounded-sm` for tighter contexts), `px-3 py-2`.
- **Focus:** border shifts to brand (`focus:border-brand`), no visible glow — a quieter treatment than buttons.
- **Error:** border switches to `border-red-500` with a red helper message below.

### Radio Cards (calculator commitment/valet selectors)
- **Style:** `rounded-lg` bordered chip; selected state fills `bg-brand/10` with `text-brand` and a brand border; unselected stays neutral with a brand-tinted hover border.

### Navigation
- **Style:** pill-shaped active state (`rounded-full bg-brand/10 text-brand ring-1 ring-brand/20`) against plain-text inactive links (`text-foreground/70`, hover to brand). Mobile nav mirrors the same treatment in a stacked drawer under a hamburger toggle.

### Media Placeholder (signature component)
No real images or video are hardcoded anywhere in the codebase by project rule; every media slot renders as a `skeleton` shimmer block (animated gradient sweep) inside the correct aspect ratio (video/square/wide/portrait) with a centered icon + label, until an admin uploads real media through the CMS. This keeps the site honest about what's real content vs. placeholder, and is a load-bearing part of the visual identity, not a temporary stopgap.

## Do's and Don'ts

### Do:
- **Do** use Signal Mint (`#00e599`) repeatedly and confidently across a screen — stats, CTAs, active states, dividers — per the Recurring Signal Rule; it's core to the eco-trust story.
- **Do** set every computed/live numeric value in `tabular-nums`.
- **Do** keep all corners rounded (`rounded-full` for actionable pill elements, `rounded-xl`/`2xl` for containers) — no sharp corners.
- **Do** keep shadows flat at rest and only introduce them on hover/focus (Earned Shadow Rule).
- **Do** use the `skeleton` shimmer placeholder for any media slot without a real uploaded asset.

### Don't:
- **Don't** hardcode stock photography, illustrations, or video — media slots stay empty placeholders until populated via the admin CMS.
- **Don't** apply `shadow-card` universally as an always-on ambient shadow; it's reserved for panels that are meant to read as already-raised, and hover-lift is earned, not default.
- **Don't** introduce a second display typeface or serif pairing — Geist Sans carries the entire hierarchy.
- **Don't** disclose specific warehouse/facility locations in any UI copy or design artifact — only the public office address (7030 Ang Mo Kio Ave 5, #08-94, Singapore 569880) may appear.
