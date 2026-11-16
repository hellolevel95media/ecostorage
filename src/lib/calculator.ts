export const MODULE_SQFT = 20;
export const MODULE_BASE_RATE = 60;
/** Hard floor: no discount (promo codes included) may take a 20 sqft module below this per month. */
export const MODULE_MIN_RATE = 55;
export const CO2_PER_MODULE_PER_MONTH_KG = 12;
/** Collection or delivery by 14ft truck, per full truckload (with or without tailgate). Part loads are quoted.
 * Guaranteed (never higher) for Standard and Premium Valet; the current public rate for everyone else. */
export const TRUCKLOAD_14FT_RATE = 350;

/**
 * Premium tier shown beside the calculator. It is a fixed-price enquiry, not
 * part of calculateQuote: the standard estimate never includes it.
 */
export const PREMIUM_CRATE = {
  label: "Premium Wooden Crate",
  tagline: "Premium option",
  sqft: 100,
  monthlyRate: 500,
  summary: "Your own enclosed, private space inside our warehouse, built for the belongings you cannot afford to risk.",
  features: [
    "Enclosed wooden crate, 100 sqft of your own",
    "Private: your items stay in your crate, not on a shared pallet",
    "Climate-safe environment inside our warehouse",
    "Suited to fine furniture, antiques, collections and documents",
  ],
} as const;

export interface SizeGuideOption {
  sqft: number;
  /** Month-to-month, no valet. Derived from the calculator so they never drift. */
  monthlyRate: number;
  useCase: string;
  idealFor: string;
  items: string[];
}

const SIZE_GUIDE_CONTENT: Omit<SizeGuideOption, "monthlyRate">[] = [
  {
    sqft: 20,
    useCase: "Bedroom Declutter / Festive Storage",
    idealFor: "HDB storeroom or bedroom declutter.",
    items: ["10 cardboard boxes", "4 Toyogo storage boxes", "5 document boxes", "2 suitcases"],
  },
  {
    sqft: 40,
    useCase: "Living Room Cleanout",
    idealFor: "Compact dining area or small apartment refresh.",
    items: ["15 cardboard boxes", "6 Toyogo boxes", "Dining chairs and a compact table", "55-inch TV"],
  },
  {
    sqft: 60,
    useCase: "Kitchen Remodeling Storage",
    idealFor: "Two-room home move or document storage.",
    items: ["25 cardboard boxes", "Full-sized fridge", "Dining table and four chairs", "Document storage"],
  },
  {
    sqft: 80,
    useCase: "Single Bedroom Flat Storage",
    idealFor: "Family living room or medium office setup.",
    items: ["35 cardboard boxes", "Fridge", "Sofa set", "Dining set", "Toyogo stack"],
  },
  {
    sqft: 100,
    useCase: "3-Room HDB Renovation",
    idealFor: "Large home contents or heavier furniture.",
    items: ["45 cardboard boxes", "Upright piano or heavy furniture", "Fridge", "TV", "Document boxes"],
  },
  {
    sqft: 120,
    useCase: "Full Home Relocation / Office",
    idealFor: "Complete 3-bedroom HDB or condo layout equivalent.",
    items: ["Complete 3-bedroom HDB or condo layout", "Main living-room furniture", "Bedroom sets", "Packed household contents"],
  },
];

export const SIZE_GUIDE: SizeGuideOption[] = SIZE_GUIDE_CONTENT.map((option) => ({
  ...option,
  monthlyRate: monthlyStorageRate(option.sqft / MODULE_SQFT),
}));

/** "60" for whole dollars, "116.70" otherwise. */
export function formatDollars(amount: number): string {
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
}

export function moduleCountFromSqft(preferredSqft: number): number {
  return Math.max(1, Math.round(preferredSqft / MODULE_SQFT));
}

export type CommitmentId = "monthly" | "8mo" | "12mo" | "18mo" | "referral";

export interface CommitmentOption {
  id: CommitmentId;
  label: string;
  /** Total occupancy months covered by the offer (billed + free). */
  months: number;
  freeMonths: number;
  /** The lock-in: months the customer pays for. Free months come after. */
  billedMonths: number;
}

/** A lock-in of N paid months with F free months added at the end (N + F). */
function lockIn(id: CommitmentId, label: string, billedMonths: number, freeMonths: number): CommitmentOption {
  return { id, label, months: billedMonths + freeMonths, freeMonths, billedMonths };
}

// Plans read as "paid + free", e.g. 12-Month Lock-in = 12 months + 2 months:
// 14 months of storage, 12 billed, the last 2 free.
export const COMMITMENT_OPTIONS: CommitmentOption[] = [
  lockIn("monthly", "Month-to-Month", 1, 0),
  lockIn("8mo", "8-Month Lock-in", 8, 1),
  lockIn("12mo", "12-Month Lock-in", 12, 2),
  lockIn("18mo", "18-Month Lock-in", 18, 3),
];

/** Offer returned by the affiliate system for a valid referral code. */
export interface ReferralOffer {
  commitment_months: number;
  free_months: number;
}

/**
 * The extra plan unlocked by a valid affiliate code (e.g. 1 month free on a
 * 4-month commitment = 4 paid + 1 free). Shown only after the code is checked
 * server-side; never listed in COMMITMENT_OPTIONS so it can't be picked
 * without one.
 */
export function referralCommitment(offer: ReferralOffer): CommitmentOption {
  const free = Math.max(0, Math.min(offer.free_months, offer.commitment_months));
  return lockIn("referral", `${offer.commitment_months}-Month Referral Plan`, offer.commitment_months, free);
}

export type ValetId = "none" | "standard" | "premium";

export interface ValetOption {
  id: ValetId;
  label: string;
  description: string;
  monthlyFee: number;
}

export const VALET_OPTIONS: ValetOption[] = [
  {
    id: "none",
    label: "No Valet",
    description: `Storage only. Book a collection or delivery whenever you need it, at our current rate of S$${TRUCKLOAD_14FT_RATE} per full 14ft truckload.`,
    monthlyFee: 0,
  },
  {
    id: "standard",
    label: "Standard Valet",
    description: `Collection and delivery at a guaranteed S$${TRUCKLOAD_14FT_RATE} per full 14ft truckload, plus complimentary partial extraction.`,
    monthlyFee: 15,
  },
  {
    id: "premium",
    label: "Premium Valet",
    description: `Everything in Standard Valet, including the S$${TRUCKLOAD_14FT_RATE} truckload price guarantee, plus full inventory cataloging and box-level labeling on every item we receive.`,
    monthlyFee: 30,
  },
];

/** Rounds a dollar amount up to the next 10 cents (116.66 -> 116.70). */
function roundUpTo10Cents(amount: number): number {
  const cents = Math.round(amount * 100);
  return (Math.ceil(cents / 10) * 10) / 100;
}

/** Monthly storage rent for a number of modules, before valet and offers. One price for every size. */
export function monthlyStorageRate(numUnits: number): number {
  return roundUpTo10Cents(MODULE_BASE_RATE * numUnits);
}

/**
 * Stand-alone promo code, as answered by the affiliate system (Novac) for
 * a code that isn't an affiliate referral code. Discounts apply to the monthly
 * storage fee only, never valet, deposit or admin fee.
 */
export interface PromoDiscount {
  type: "percent" | "amount";
  value: number;
  max_per_month: number | null;
  /** Lowest storage price per 20 sqft module per month after the discount; Novac sends 55. Missing means 55. */
  floor_per_module?: number | null;
  duration: "first_month" | "months" | "contract";
  months: number | null;
  label: string;
}

export interface PromoConditions {
  new_customers_only: boolean;
  /** False: the code only works on Month-to-Month (plans with free months are excluded). */
  plans_with_free_months: boolean;
  not_with_referral: boolean;
}

export interface PromoOffer {
  discount: PromoDiscount;
  conditions: PromoConditions;
}

/** Whether a promo code can be used on this commitment plan. */
export function promoAppliesToPlan(conditions: PromoConditions, commitment: CommitmentOption): boolean {
  return conditions.plans_with_free_months || commitment.freeMonths === 0;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Saving from a promo on the monthly storage fee only (never valet), over the billed
 * months the quote covers. It never takes storage below the floor price per module
 * (S$55 x modules): 5 modules = S$300 -> at most S$25 off; 1 module = S$60 -> at most S$5.
 */
export function promoSaving(storageMonthly: number, numUnits: number, billedMonths: number, discount: PromoDiscount) {
  const floor = discount.floor_per_module ?? MODULE_MIN_RATE;
  const room = Math.max(0, storageMonthly - floor * numUnits);
  const wanted = discount.type === "percent" ? (storageMonthly * discount.value) / 100 : discount.value;
  const wantedCapped = Math.min(wanted, discount.max_per_month ?? Infinity);
  const perMonth = round2(Math.max(0, Math.min(wantedCapped, room)));
  const lasts =
    discount.duration === "first_month" ? 1 : discount.duration === "months" ? Math.max(1, discount.months ?? 1) : billedMonths;
  const months = Math.min(lasts, billedMonths);
  return { perMonth, months, total: round2(perMonth * months), floorLimited: wantedCapped > room };
}

export interface QuoteInput {
  numUnits: number;
  commitment: CommitmentOption;
  valet: ValetOption;
  /** A validated stand-alone promo code; ignored if it doesn't apply to the chosen plan. */
  promo?: PromoOffer | null;
}

export interface QuoteResult {
  ratePerUnit: number;
  monthlyTotal: number;
  discountedMonthly: number;
  billedMonths: number;
  totalCost: number;
  standardTotal: number;
  savings: number;
  co2SavedKg: number;
  treesSaved: number;
  /** Promo saving per discounted month, months it lasts, total, and the total after it. 0 when no promo applies. */
  promoPerMonth: number;
  promoMonths: number;
  promoSavings: number;
  totalAfterPromo: number;
  /** True when the code would take more off than the S$55-per-module floor allows. */
  promoFloorLimited: boolean;
}

export function calculateQuote({ numUnits, commitment, valet, promo }: QuoteInput): QuoteResult {
  const ratePerUnit = MODULE_BASE_RATE;
  const monthlyTotal = monthlyStorageRate(numUnits);
  const discountedMonthly = Math.max(0, monthlyTotal) + valet.monthlyFee;
  const billedMonths = commitment.billedMonths;
  const totalCost = Math.round(discountedMonthly * billedMonths * 100) / 100;
  const standardTotal = MODULE_BASE_RATE * numUnits * commitment.months + valet.monthlyFee * commitment.months;
  const savings = Math.max(0, standardTotal - totalCost);

  const co2SavedKg = CO2_PER_MODULE_PER_MONTH_KG * numUnits * commitment.months;
  const treesSaved = Math.max(1, Math.round(co2SavedKg / 21));

  const promoApplies = promo ? promoAppliesToPlan(promo.conditions, commitment) : false;
  const saving =
    promo && promoApplies
      ? promoSaving(monthlyTotal, numUnits, billedMonths, promo.discount)
      : { perMonth: 0, months: 0, total: 0, floorLimited: false };

  return {
    ratePerUnit,
    monthlyTotal,
    discountedMonthly,
    billedMonths,
    totalCost,
    standardTotal,
    savings,
    co2SavedKg,
    treesSaved,
    promoPerMonth: saving.perMonth,
    promoMonths: saving.months,
    promoSavings: saving.total,
    totalAfterPromo: round2(totalCost - saving.total),
    promoFloorLimited: saving.floorLimited,
  };
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value.trim());
}

export function isValidMobile(value: string): boolean {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 8;
}
