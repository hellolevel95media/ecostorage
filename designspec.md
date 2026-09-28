# Eco Storage Space Singapore — Homepage Design Specification

**Document owner:** Manus AI  
**Scope:** Current homepage design and implemented interaction model  
**Primary source:** `client/src/pages/Home.tsx`

## 1. Design Direction

The homepage presents Eco Storage Space as a premium, service-led storage brand rather than a conventional self-storage directory. The visual language combines **deep slate backgrounds**, **emerald action accents**, high-contrast typography, and practical capacity guidance. The experience is designed to move a visitor from brand understanding to a concrete storage estimate with minimal uncertainty.

The central message is operational simplicity: **“Singapore’s Premier Full-Service & Valet Storage Solutions”** followed by **“We Pick Up, Store & Deliver.”** The page supports this promise through a dark media-led hero, transparent rate presentation, a capacity visualizer, a progressive calculator, and a no-commitment survey path.

## 2. Homepage Section Architecture

The page renders the following sections from top to bottom:

| Order | Section | Implementation | Primary purpose |
|---:|---|---|---|
| 1 | Video Hero | `Home.tsx` | Establish the full-service proposition and provide the first calculator CTA. |
| 2 | Stats Bar | `Home.tsx` | Reinforce trust using facilities, customer, tenure, and carbon-reduction signals. |
| 3 | Complete Storage Solutions | `Home.tsx` | Introduce six service categories with media-backed cards. |
| 4 | Space Guide and Calculator | `Home.tsx` and `PricingCalculator.tsx` | Help visitors select a footprint, understand capacity, calculate a rate, and submit a lead. |
| 5 | No-Commitment Site Survey | `Home.tsx` | Offer a human-assisted path for uncertain volume or complex moves. |
| 6 | Comparison Table | `Home.tsx` | Contrast Eco Storage Space with self-access and industry-average alternatives. |
| 7 | Transparent Pricing | `Home.tsx` | Present commitment options and reinforce the no-hidden-fees position. |
| 8 | Crawlable FAQ | `FaqSection.tsx` | Answer common questions and support search visibility. |
| 9 | CTA Banner | `Home.tsx` | Reintroduce the instant quote and contact actions near the page end. |
| 10 | Sustainability Trust Strip | `SustainabilityTrustStrip.tsx` | Close with the sustainability and trust narrative. |

## 3. Visual System

### 3.1 Color palette

The base palette uses a near-white background and deep charcoal-slate text. The primary brand accent is mint emerald, represented in the implementation by `#2ECC97` and the equivalent Tailwind emerald utilities.

| Role | Current implementation | Use |
|---|---|---|
| Primary brand accent | `#2ECC97` / emerald-500 | Main CTAs, active tabs, savings, icons, and emphasis. |
| Deep page background | `#0f1923` and `bg-slate-950` | Hero overlay, calculator dashboard, comparison section, CTA, and footer. |
| Light surface | `bg-slate-50`, white cards | Service grid, calculator controls, and capacity cards. |
| Primary text | Deep slate/charcoal | Headings and readable content on light surfaces. |
| Inverse text | White and `text-slate-100`/`text-slate-200` | Content over dark or image-backed surfaces. |
| Warning notice | Amber background and text | Transparent-pricing notice. |

The mint accent is intentionally reserved for actions, selected states, savings, and brand signals. It is not used as a general decorative fill across every element.

### 3.2 Typography

The application uses **Inter** for interface and body copy and **Quicksand** for the brand wordmark. Headings are bold, tightly tracked, and generally use a 1.2 line height. The hierarchy is deliberately strong on the hero: the primary headline is the largest element, the service promise is a secondary large line, and the supporting paragraph is smaller and lighter.

Body copy uses a comfortable line height of approximately 1.65. Small labels use uppercase lettering and increased tracking to make section categories visually distinct without competing with headings.

### 3.3 Shape, depth, and motion

Cards use rounded corners from the shared radius scale, with larger cards generally using `rounded-2xl` or `rounded-3xl`. The design relies on soft layered shadows rather than heavy outlines. Hover transitions are short and primarily animate shadow, position, color, or gap. Touch controls maintain a minimum 44-pixel target, and reduced-motion preferences disable non-essential entrance animations.

## 4. Hero Design

The hero occupies approximately 95 viewport heights and uses a desktop MP4 background at the `md` breakpoint and above. The video is configured with autoplay, looping, muted playback, inline playback, a poster, and metadata preload. Mobile intentionally renders the preloaded WebP poster instead of immediately loading the video, protecting mobile first-contentful paint.

A dark gradient overlay sits above the media. Hero content sits above the overlay with a centered layout and generous vertical padding. The headline is split into two balanced lines:

1. **Singapore’s Premier**
2. **Full-Service & Valet Storage Solutions**

The second line is highlighted in mint and kept together on desktop where possible. The subheading reads **“We Pick Up, Store & Deliver”** and is followed by a single supporting paragraph focused on zero hidden fees and pay-as-you-use storage.

The hero exposes two primary actions. The mint button scrolls to the calculator, while the outlined button opens the Services route. A bottom-anchored “Calculate savings” cue repeats the calculator action and provides an additional visual path into the page.

## 5. Service Card Design

The Complete Storage Solutions section uses a light slate background and a responsive one-, two-, or three-column grid. Six service records are displayed: Eco Storage, Home Moving, Office Moving, Packing Service, Valet Storage, and AC Storage.

Five cards use local lazy-loaded MP4 backgrounds with still-image fallbacks hosted by the WordPress media library. AC Storage intentionally retains the clean icon-card treatment without a video or thumbnail. Media cards use an absolute layer with `object-cover`, a dark tint, and backdrop blur. All card content is placed in a relative high-z-index layer so text remains readable.

The service card content follows a consistent order: icon, title, uppercase subtitle, short description, and a “Learn more” link. The card itself is informative and routes to the broader Services page rather than attempting to duplicate the full booking workflow.

## 6. Calculator Section Design

The calculator is framed in a dark slate section with large vertical padding. Before the calculator loads, the page presents a lightweight capacity selector and visual guide. The full calculator is lazy-loaded when the section reaches the viewport, reducing initial JavaScript work.

On desktop, the calculator is a two-column rounded panel. The left column contains storage-size selection, module quantity, commitment period, valet options, and promo-code entry. The right column contains the estimated monthly rate, savings and environmental metrics, and the contact form.

On mobile, the calculator becomes a three-step wizard:

1. **Items** — select the storage module and quantity.
2. **Plan** — choose commitment period, valet service, and optional promo code.
3. **Contact** — review the rate, enter contact details, and lock in the quote.

Only the active step is mounted on mobile. This keeps the interaction compact and avoids forcing users through a long vertical form.

## 7. Pricing and Trust Sections

The no-commitment survey section uses a dark slate surface and a bordered translucent panel. It is deliberately positioned immediately after the calculator so visitors who cannot confidently estimate volume have an alternative action.

The comparison section uses a dark background, a four-column table, and mint checks for Eco Storage Space. The pricing section uses a WordPress-hosted background still image with a dark overlay. Desktop shows three rate cards, while mobile converts them into compact expandable summaries. The highlighted 12-month card uses mint borders and the “Best Value” badge.

The FAQ section continues the dark visual rhythm and is deferred until it approaches the viewport. The final CTA returns to the same two-part conversion model: get an instant quote or talk to the team. The sustainability strip then closes the page with a lighter emerald-tinted trust treatment.

## 8. Responsive and Accessibility Rules

The design is mobile-first and uses the 768-pixel breakpoint as the principal mobile/desktop transition. Form controls remain at least 16 pixels on mobile to prevent browser auto-zoom. Buttons, tabs, accordions, and icon controls target at least 44 pixels in height or width. Icon-only controls receive explicit accessible labels.

Dark media surfaces require white or light-slate text. Light cards use deep charcoal text with visible borders. Image and video media are decorative when used behind content and therefore use empty alternative text or an equivalent hidden presentation.

## 9. Performance Rules

The desktop hero video is the only immediately relevant video. Service videos use `preload="none"` and begin loading when an Intersection Observer detects that the card is near the viewport. FAQ and sustainability sections are lazy-loaded, and the calculator is both code-split and deferred until the calculator section is reached.

Below-the-fold images use lazy loading and asynchronous decoding. Local public video assets are served from `/assets/videos/`, while still imagery and selected section backgrounds remain configurable through WordPress URLs.

## References

[1]: ./client/src/pages/Home.tsx "Current homepage section structure, content, media, and responsive layout"
[2]: ./client/src/components/PricingCalculator.tsx "Current calculator interface, responsive wizard, and lead form"
[3]: ./client/src/index.css "Current design tokens, typography, spacing, card, button, and accessibility styles"
[4]: ./client/src/components/home/FaqSection.tsx "Current homepage FAQ section"
[5]: ./client/src/components/home/SustainabilityTrustStrip.tsx "Current sustainability and trust strip"
[6]: ./client/public/assets/videos/ "Local homepage and service MP4 assets"
