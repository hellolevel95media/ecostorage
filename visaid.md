# Eco Storage Space Singapore — Visual Aid Calculator Specification

**Document owner:** Manus AI  
**Scope:** Homepage capacity visualizer, size selector, visual item guide, and synchronization with the live calculator  
**Primary source:** `client/src/pages/Home.tsx`

## 1. Purpose

The visual aid is the orientation layer immediately above the live calculator. Its purpose is to help a visitor recognize a familiar household or business scenario, choose a starting storage footprint, and understand what that footprint can hold before entering detailed calculator inputs.

It is intentionally visual and approximate. It does not replace the live calculator’s backend response. Instead, it reduces the cognitive effort required to choose an initial size and creates a practical bridge between household contents and square footage.

## 2. Visual Structure

The visual aid sits inside the dark slate calculator section and contains three layers:

1. **Size selector:** six capacity buttons.
2. **Singapore Space Guide:** a dark compact header with footprint, use case, and starting rate.
3. **Item breakdown:** a responsive grid of representative contents.

The guide is rendered before the calculator module. The calculator itself is deferred until the calculator section is near the viewport, so the visual aid remains lightweight and useful during the loading boundary.

## 3. Size Selector

### Desktop

At the `sm` breakpoint and above, the selector uses a six-column grid at large widths and three columns at smaller desktop widths. The parent has a slate background and padding. Each option is an individual white card with a visible border, rounded corners, shadow, and hover state.

The active option uses an emerald background, dark text, an emerald border, and a stronger shadow. Each card presents the square footage, a practical Singapore-oriented use case, and a monthly starting rate.

### Mobile

Below the `sm` breakpoint, the selector becomes a horizontally scrollable pill bar. This keeps the control near 50 pixels in height and prevents six options from becoming a long vertical stack. The active pill remains emerald, while inactive pills use white or light-slate surfaces with visible borders.

Every selector button uses `role="tab"`, `aria-selected`, and `aria-controls="storage-capacity-guide"`. The selected footprint is stored in `selectedGuideSqft`.

## 4. Capacity Guide Data

The current guide contains six static scenarios:

| Footprint | Starting rate | Practical use case | Ideal-for description |
|---:|---:|---|---|
| 20 sqft | $60/mo | Bedroom Declutter / Festive Storage | HDB storeroom or bedroom declutter. |
| 40 sqft | $118/mo | Living Room Cleanout | Compact dining area or small apartment refresh. |
| 60 sqft | $174/mo | Kitchen Remodeling Storage | Two-room home move or document storage. |
| 80 sqft | $232/mo | Single Bedroom Flat Storage | Family living room or medium office setup. |
| 100 sqft | $285/mo | 3-Room HDB Renovation | Large home contents or heavier furniture. |
| 120 sqft | $342/mo | Full Home Relocation / Office | Complete 3-bedroom HDB or condo layout equivalent. |

These rates are guide values. The live calculator obtains unit sizes and base monthly rates through its backend query. The guide and backend values should be synchronized whenever commercial pricing changes.

## 5. Item Breakdown Content

Each selected footprint displays representative contents. The list is not an inventory guarantee; it is a visual planning aid that helps visitors map their belongings to a starting size.

| Footprint | Representative contents |
|---:|---|
| 20 sqft | 10 cardboard boxes; 4 Toyogo storage boxes; 5 document boxes; 2 suitcases. |
| 40 sqft | 15 cardboard boxes; 6 Toyogo boxes; dining chairs and a compact table; 55-inch TV. |
| 60 sqft | 25 cardboard boxes; full-sized fridge; dining table and four chairs; document storage. |
| 80 sqft | 35 cardboard boxes; fridge; sofa set; dining set; Toyogo stack. |
| 100 sqft | 45 cardboard boxes; upright piano or heavy furniture; fridge; TV; document boxes. |
| 120 sqft | Complete 3-bedroom HDB or condo layout; main living-room furniture; bedroom sets; packed household contents. |

The implementation stores each item as an icon-and-label pair. Icons are presented as decorative visual markers and the adjacent text remains the authoritative description.

## 6. Header Behavior

The guide header is a dark slate horizontal banner on larger screens and a compact two-line arrangement on mobile. It contains:

- The label **Singapore space guide**.
- The active square footage.
- An **Ideal for** description.
- An emerald **From $X/mo** badge.

The header is designed to preserve context while the visitor changes tabs. The active footprint and rate update immediately without navigation or page reload.

## 7. Item Card Layout

On mobile, item cards use a two-column grid with tight spacing and compact padding. The icon sits in a small white badge on the left of the text. On larger screens, the grid expands to four columns and uses more generous spacing.

The cards use a pale slate surface, a subtle border, rounded corners, and deep slate text. The layout is intentionally horizontal rather than vertically centered, reducing unused space and keeping the visual guide compact.

The card rules are:

- Use `object`-independent text and CSS layout; no heavy image asset is required.
- Keep the icon decorative with `aria-hidden="true"`.
- Maintain readable text at mobile sizes.
- Allow labels to wrap rather than clipping long descriptions such as “Upright Piano / Heavy Furniture.”
- Keep the entire guide height driven by content, with no artificial fixed height.

## 8. Synchronization with the Live Calculator

When a visitor selects a guide tab, the homepage updates `selectedGuideSqft`. That value controls the active visual guide and is passed to the deferred `PricingCalculator` as `preferredSqft`.

Inside the calculator, the preferred square footage is translated into 20 sqft module quantities:

```text
moduleCount = max(1, round(preferredSqft / 20))
```

The resulting starting quantities are therefore:

| Guide selection | Initial module interpretation |
|---:|---:|
| 20 sqft | 1 × 20 sqft module |
| 40 sqft | 2 × 20 sqft modules |
| 60 sqft | 3 × 20 sqft modules |
| 80 sqft | 4 × 20 sqft modules |
| 100 sqft | 5 × 20 sqft modules |
| 120 sqft | 6 × 20 sqft modules |

The visitor can continue refining the number of units in the live calculator. The visual guide should be understood as a starting recommendation, not as a locked quote.

## 9. Content and Pricing Governance

The guide is a static frontend configuration. Its use-case language and displayed starting rates live in `CALCULATOR_SIZE_GUIDE` inside `Home.tsx`. The live calculator’s size records and base rates come from the backend database through `calculator.getUnitSizes`.

A pricing update is incomplete if only one source changes. Content owners should update the guide array, backend unit-size records, resource copy, and any agent-facing pricing summary together. Regression tests should confirm that all six guide options remain present and that selected square footage continues to reach the calculator.

## 10. Accessibility and Performance

The selector uses semantic tab attributes and exposes the active state programmatically. Buttons meet the shared minimum touch target. The guide itself is lightweight and does not add a network image dependency. The interactive calculator remains code-split and deferred until the user reaches the section.

The visual aid should remain useful with JavaScript delayed because its surrounding static page structure and labels are part of the homepage content. If the calculator fails to load, the guide still communicates a valid starting footprint and directs the visitor toward the survey or contact path elsewhere on the page.

## References

[1]: ./client/src/pages/Home.tsx "Current homepage visual guide data, selector tabs, guide header, item cards, and calculator handoff"
[2]: ./client/src/components/PricingCalculator.tsx "Current preferred-footprint handling and live calculator controls"
[3]: ./server/calculatorSizeGuide.test.ts "Current visual-guide and calculator synchronization regression tests"
[4]: ./client/src/index.css "Current responsive, accessibility, color, radius, and interaction tokens"
[5]: ./client/public/llms.txt "Current public starting-price summaries and service positioning"
