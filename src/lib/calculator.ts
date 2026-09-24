export const MODULE_SQFT = 20;
export const MODULE_BASE_RATE = 60;
export const CO2_PER_MODULE_PER_MONTH_KG = 12;

export interface SizeGuideOption {
  sqft: number;
  monthlyRate: number;
  useCase: string;
  idealFor: string;
  items: string[];
}

export const SIZE_GUIDE: SizeGuideOption[] = [
  {
    sqft: 20,
    monthlyRate: 60,
    useCase: "Bedroom Declutter / Festive Storage",
    idealFor: "HDB storeroom or bedroom declutter.",
    items: ["10 cardboard boxes", "4 Toyogo storage boxes", "5 document boxes", "2 suitcases"],
  },
  {
    sqft: 40,
    monthlyRate: 118,
    useCase: "Living Room Cleanout",
    idealFor: "Compact dining area or small apartment refresh.",
    items: ["15 cardboard boxes", "6 Toyogo boxes", "Dining chairs and a compact table", "55-inch TV"],
  },
  {
    sqft: 60,
    monthlyRate: 174,
    useCase: "Kitchen Remodeling Storage",
    idealFor: "Two-room home move or document storage.",
    items: ["25 cardboard boxes", "Full-sized fridge", "Dining table and four chairs", "Document storage"],
  },
  {
    sqft: 80,
    monthlyRate: 232,
    useCase: "Single Bedroom Flat Storage",
    idealFor: "Family living room or medium office setup.",
    items: ["35 cardboard boxes", "Fridge", "Sofa set", "Dining set", "Toyogo stack"],
  },
  {
    sqft: 100,
    monthlyRate: 285,
    useCase: "3-Room HDB Renovation",
    idealFor: "Large home contents or heavier furniture.",
    items: ["45 cardboard boxes", "Upright piano or heavy furniture", "Fridge", "TV", "Document boxes"],
  },
  {
    sqft: 120,
    monthlyRate: 342,
    useCase: "Full Home Relocation / Office",
    idealFor: "Complete 3-bedroom HDB or condo layout equivalent.",
    items: ["Complete 3-bedroom HDB or condo layout", "Main living-room furniture", "Bedroom sets", "Packed household contents"],
  },
];

export function moduleCountFromSqft(preferredSqft: number): number {
  return Math.max(1, Math.round(preferredSqft / MODULE_SQFT));
}

export type CommitmentId = "monthly" | "8mo" | "12mo" | "18mo";

export interface CommitmentOption {
  id: CommitmentId;
  label: string;
  /** Total occupancy months covered by the offer (billed + free). */
  months: number;
  freeMonths: number;
  billedMonths: number;
}

// The source spec's "Duration" column mixes billed months (8-month tier) and
// occupancy months (12/18-month tiers). These values are derived instead from
// its literal "N billed months" wording so billedMonths = months - freeMonths
// holds consistently across every tier.
export const COMMITMENT_OPTIONS: CommitmentOption[] = [
  { id: "monthly", label: "Month-to-Month", months: 1, freeMonths: 0, billedMonths: 1 },
  { id: "8mo", label: "8-Month Lock-in", months: 9, freeMonths: 1, billedMonths: 8 },
  { id: "12mo", label: "12-Month Lock-in", months: 12, freeMonths: 2, billedMonths: 10 },
  { id: "18mo", label: "18-Month Lock-in", months: 18, freeMonths: 3, billedMonths: 15 },
];

export type ValetId = "none" | "standard" | "premium";

export interface ValetOption {
  id: ValetId;
  label: string;
  description: string;
  monthlyFee: number;
}

export const VALET_OPTIONS: ValetOption[] = [
  { id: "none", label: "No Valet", description: "Self-access only.", monthlyFee: 0 },
  { id: "standard", label: "Standard Valet", description: "Doorstep pickup and delivery.", monthlyFee: 15 },
  { id: "premium", label: "Premium Valet", description: "Full itemisation and priority service.", monthlyFee: 30 },
];

export function volumeDiscountPerUnit(numUnits: number): number {
  if (numUnits <= 1) return 0;
  if (numUnits === 2) return 1.67;
  if (numUnits <= 4) return 3.33;
  return 5;
}

export interface QuoteInput {
  numUnits: number;
  commitment: CommitmentOption;
  valet: ValetOption;
}

export interface QuoteResult {
  ratePerUnit: number;
  monthlyTotal: number;
  discountedMonthly: number;
  billedMonths: number;
  totalCost: number;
  standardTotal: number;
  savings: number;
  volumeDiscountPct: number;
  co2SavedKg: number;
  treesSaved: number;
}

export function calculateQuote({ numUnits, commitment, valet }: QuoteInput): QuoteResult {
  const volumeDiscount = volumeDiscountPerUnit(numUnits);
  const ratePerUnit = MODULE_BASE_RATE - volumeDiscount;
  const monthlyTotal = ratePerUnit * numUnits;
  const discountedMonthly = Math.max(0, monthlyTotal) + valet.monthlyFee;
  const billedMonths = commitment.billedMonths;
  const totalCost = discountedMonthly * billedMonths;
  const standardTotal = MODULE_BASE_RATE * numUnits * commitment.months + valet.monthlyFee * commitment.months;
  const savings = Math.max(0, standardTotal - totalCost);

  const co2SavedKg = CO2_PER_MODULE_PER_MONTH_KG * numUnits * commitment.months;
  const treesSaved = Math.max(1, Math.round(co2SavedKg / 21));

  return {
    ratePerUnit,
    monthlyTotal,
    discountedMonthly,
    billedMonths,
    totalCost,
    standardTotal,
    savings,
    volumeDiscountPct: volumeDiscount,
    co2SavedKg,
    treesSaved,
  };
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value.trim());
}

export function isValidMobile(value: string): boolean {
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 8;
}
