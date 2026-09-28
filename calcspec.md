# Eco Storage Space Singapore — Calculator Specification

**Document owner:** Manus AI  
**Scope:** Current homepage calculator behavior, pricing calculations, environmental metrics, validation, and lead submission  
**Primary sources:** `client/src/components/PricingCalculator.tsx` and `server/routers.ts`

## 1. Calculator Purpose

The calculator converts a visitor’s storage requirement into a monthly estimate and a lead-capture payload. It combines three inputs that materially affect the quote:

- **Storage capacity:** the selected unit size and number of units.
- **Commitment period:** month-to-month, 8 months, 12 months, or 18 months.
- **Service options:** valet service and an optional promo code.

The calculator presents an estimated monthly rate, billed months, savings, carbon savings, and equivalent trees. It then collects contact details and sends the lead to the configured WordPress Fluent Forms endpoint.

The interface does not present the calculated lump-sum total or an admin-fee line in the visible rate dashboard. The backend still calculates the internal fee component and includes the resulting total in the lead payload because the submission contract retains those fields.

## 2. State Model

The calculator maintains the following user-controlled state:

| State | Current role |
|---|---|
| `selectedSizeId` | Identifies the selected backend unit-size record. |
| `numUnits` | Number of selected modules or units; minimum value is 1. |
| `durationIdx` | Index into the four commitment-period options. |
| `valetOption` | `none`, `standard`, or `premium`. |
| `promoCode` | Optional uppercase code entered by the visitor. |
| `promoApplied` | Indicates that the code has been sent for validation. |
| `mobileStep` | Mobile wizard step: Items, Plan, or Contact. |
| `form` | First name, last name, email, phone, and delivery address. |
| `submitted` | Switches the calculator into the success state after a successful lead submission. |

If the homepage visual guide supplies `preferredSqft`, the calculator chooses the 20 sqft module as its computational basis and sets the number of modules to `Math.max(1, Math.round(preferredSqft / 20))`. The visual guide therefore provides a starting footprint while the calculator remains the live pricing interface.

## 3. Commitment Periods

The current calculator offers four duration options:

| Option | Duration | Free months | Effect |
|---|---:|---:|---|
| Month-to-Month | 1 month | 0 | No commitment discount. |
| 8-Month Lock-in | 8 months | 1 | Eight billed months provide nine months of occupancy value in the offer model. |
| 12-Month Lock-in | 12 months | 2 | Ten billed months are used in the current calculation model. |
| 18-Month Lock-in | 18 months | 3 | Fifteen billed months are used in the current calculation model. |

The free-month mapping is implemented by `calcFreeMonths(durationMonths)`. The user-facing label communicates the commitment duration and the free-month badge communicates the promotion.

## 4. Valet Options

The calculator exposes three service choices:

| Value | Label | Current description |
|---|---|---|
| `none` | No Valet | Self-access only. |
| `standard` | Standard Valet | Adds $15 per month for doorstep pickup and delivery. |
| `premium` | Premium Valet | Adds $30 per month for full itemisation and priority service. |

The current frontend records the selected valet option in the submission payload. The backend calculation procedure shown in `server/routers.ts` calculates the storage price from the unit size, quantity, duration, and promo code. Any valet-price adjustment should therefore remain synchronized with the active backend or WordPress pricing contract if it is introduced into the server calculation later.

## 5. Backend Pricing Formula

The live calculation is performed by the public `calculator.calculate` procedure. It receives `unitSizeId`, `numUnits`, `durationMonths`, and an optional `promoCode`.

Let:

- `B` = base monthly rate for the selected unit size.
- `N` = number of units.
- `V` = volume discount per unit, when applicable.
- `M` = duration in months.
- `F` = free months granted by the commitment period.
- `A` = calculated admin fee.
- `P` = promo discount.

The current procedure applies the volume discount only when the selected unit is 20 sqft:

```text
volumeDiscount = calcVolumeDiscount(N, sqft)
ratePerUnit    = B - volumeDiscount
monthlyTotal   = ratePerUnit × N
billableMonths = M - F
```

The normal admin fee is calculated from the monthly total and duration:

```text
adminFee          = calcAdminFee(monthlyTotal, M)
effectiveAdminFee = 0 when a valid waive-admin-fee promo applies
                    otherwise adminFee
```

The displayed monthly figure is calculated after any fixed or percentage promo discount:

```text
discountedMonthly = max(0, monthlyTotal - P)
totalCost         = discountedMonthly × billableMonths + effectiveAdminFee
```

The reference comparison uses the undiscounted base rate across the full commitment duration:

```text
standardTotal = B × N × M
savings       = max(0, standardTotal - totalCost)
```

The frontend displays `discountedMonthly` as the estimated monthly rate. It displays the `billableMonths` value as the billed-month count. The lump-sum `totalCost` and the fee detail are not shown in the visible rate dashboard, although they remain available to the submission payload and backend response.

## 6. Volume Discount

The current `getVolumeDiscountPct` helper is named as a percentage helper, but it returns a percentage-like value used as a per-unit rate reduction by the server calculation. It applies only to 20 sqft modules:

| Number of 20 sqft units | Current reduction value |
|---:|---:|
| 1 | $0 per unit |
| 2 | 1.67 per unit |
| 3–4 | 3.33 per unit |
| 5 or more | 5 per unit |

The interface summarizes this as **“Save X% via Storage+”** using the returned value. The label is part of the current product behavior and should be reviewed if the backend value is redefined as a true currency discount rather than a percentage-like reduction.

## 7. Environmental Metrics

The procedure estimates carbon savings using a module-specific monthly factor:

```text
20 sqft module: 12 kg CO₂ saved per module per month
other module sizes: 40 kg CO₂ saved per module per month
```

The current formula is:

```text
co2Saved = factor × numUnits × durationMonths
treesSaved = max(1, round(co2Saved / 21))
```

The frontend labels the first result **CO₂ saved** and the second result **Trees saved**. The response property is historically named `co2SavedLiters`, but it is displayed and calculated as kilograms. Any API cleanup should rename the property or preserve a compatibility alias while updating the frontend contract.

## 8. Validation and Submission

The contact step requires a first name, a valid email address, and a valid mobile number. Email validation rejects incomplete domains such as `name@domain` and `test@com`. Mobile validation requires at least eight digits while allowing common separators and country-code formats.

The current form fields are:

- First name — required.
- Last name — optional.
- Email address — required and format-validated.
- Mobile number — required and format-validated.
- Delivery address — optional.

On successful validation, the calculator builds a Fluent Forms payload containing contact values, storage type, selected footprint, module count, duration, monthly price, total price, internal fee and deposit values, valet option, savings, and promo code. The configured `submitWordPressLead` function sends the payload to the centralized WordPress endpoint. A successful response changes the interface to the **Price Locked In!** state and displays a 24-hour follow-up message.

## 9. Responsive Interaction Model

Desktop uses a two-column layout. The left side contains configuration controls, while the right side combines the rate dashboard and contact form.

Mobile uses a three-step wizard that mounts only the active step:

1. **Items:** select a storage module and number of units.
2. **Plan:** choose duration, valet service, and promo code.
3. **Contact:** review the estimate, expand the optional full breakdown, enter contact details, and submit.

The mobile step indicator allows returning to completed steps. Forward navigation remains explicit through full-width buttons. The form controls use a minimum 16-pixel font on mobile, visible borders, light backgrounds, and full-width stacking to avoid browser zoom and cramped fields.

## 10. Operational Notes

The visual guide on the homepage contains static starting rates for six practical footprints. The calculator obtains unit sizes and base rates through the backend `getUnitSizes` query. These are separate sources. The guide is therefore a marketing and orientation layer, while the live calculator response is the pricing source used for the submitted quote.

When rates or promotions change, update the backend unit-size data and the static guide together. Test the month-free mapping, total-cost calculation, savings, payload mapping, and mobile wizard after any pricing change.

## References

[1]: ./client/src/components/PricingCalculator.tsx "Current calculator interface, state model, validation, responsive wizard, and submission flow"
[2]: ./server/routers.ts "Current backend calculator procedure and pricing formulas"
[3]: ./client/src/lib/bookingForm.ts "Current email, mobile, and Fluent Forms payload helpers"
[4]: ./client/src/lib/siteConfig.ts "Current WordPress endpoint and centralized lead configuration"
[5]: ./client/src/pages/Home.tsx "Current homepage capacity guide and static starting-rate data"
[6]: ./server/calculator.test.ts "Current calculator regression tests"
