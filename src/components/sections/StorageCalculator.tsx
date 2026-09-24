"use client";

import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import {
  SIZE_GUIDE,
  MODULE_SQFT,
  COMMITMENT_OPTIONS,
  VALET_OPTIONS,
  moduleCountFromSqft,
  calculateQuote,
  isValidEmail,
  isValidMobile,
  type CommitmentId,
  type ValetId,
  type SizeGuideOption,
} from "@/lib/calculator";

type MobileStep = "items" | "plan" | "contact";
const MOBILE_STEPS: { id: MobileStep; label: string }[] = [
  { id: "items", label: "Items" },
  { id: "plan", label: "Plan" },
  { id: "contact", label: "Contact" },
];

interface ContactState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

const EMPTY_CONTACT: ContactState = { firstName: "", lastName: "", email: "", phone: "", address: "" };

export function StorageCalculator() {
  const [selectedGuideSqft, setSelectedGuideSqft] = useState(20);
  const [numUnits, setNumUnits] = useState(() => moduleCountFromSqft(20));
  const [commitmentId, setCommitmentId] = useState<CommitmentId>("monthly");
  const [valetId, setValetId] = useState<ValetId>("none");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [mobileStep, setMobileStep] = useState<MobileStep>("items");
  const [maxMobileStep, setMaxMobileStep] = useState<MobileStep>("items");
  const [contact, setContact] = useState<ContactState>(EMPTY_CONTACT);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const guide = SIZE_GUIDE.find((g) => g.sqft === selectedGuideSqft) ?? SIZE_GUIDE[0];
  const commitment = COMMITMENT_OPTIONS.find((c) => c.id === commitmentId)!;
  const valet = VALET_OPTIONS.find((v) => v.id === valetId)!;
  const quote = useMemo(() => calculateQuote({ numUnits, commitment, valet }), [numUnits, commitment, valet]);

  function selectGuide(sqft: number) {
    setSelectedGuideSqft(sqft);
    setNumUnits(moduleCountFromSqft(sqft));
  }

  function goToStep(step: MobileStep) {
    const order = MOBILE_STEPS.map((s) => s.id);
    if (order.indexOf(step) <= order.indexOf(maxMobileStep)) setMobileStep(step);
  }

  function advanceStep(step: MobileStep) {
    setMobileStep(step);
    const order = MOBILE_STEPS.map((s) => s.id);
    if (order.indexOf(step) > order.indexOf(maxMobileStep)) setMaxMobileStep(step);
  }

  function validateContact() {
    const next: Partial<Record<keyof ContactState, string>> = {};
    if (!contact.firstName.trim()) next.firstName = "First name is required.";
    if (!isValidEmail(contact.email)) next.email = "Enter a valid email address.";
    if (!isValidMobile(contact.phone)) next.phone = "Enter a valid mobile number.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!validateContact()) return;
    setStatus("submitting");

    const payload = {
      type: "contact" as const,
      name: [contact.firstName, contact.lastName].filter(Boolean).join(" "),
      email: contact.email,
      phone: contact.phone,
      company_name: null,
      address: contact.address || null,
      message: null,
      metadata: {
        source: "storage_calculator",
        moduleSqft: MODULE_SQFT,
        numUnits,
        commitment: commitment.id,
        billedMonths: quote.billedMonths,
        valet: valet.id,
        promoCode: promoApplied ? promoCode : null,
        estimatedMonthly: quote.discountedMonthly,
        estimatedTotal: quote.totalCost,
        savings: quote.savings,
        co2SavedKg: quote.co2SavedKg,
        treesSaved: quote.treesSaved,
      },
    };

    try {
      const supabase = createClient();
      const { error } = await supabase.from("inquiries").insert(payload);
      if (error) throw error;
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-brand/30 bg-brand/5 p-10 text-center shadow-card">
          <p className="text-2xl font-bold text-brand">Price Locked In!</p>
          <p className="mt-2 text-foreground/70">
            Our team will follow up within 24 hours to confirm your pickup and finalize your quote.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-surface/60 p-5 shadow-card sm:p-8 lg:p-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-balance sm:text-3xl">
            Not sure how much space you need?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-foreground/70">
            Pick a familiar scenario below, then fine-tune your estimate in the calculator.
          </p>
        </div>

        <SizeGuideSelector selected={selectedGuideSqft} onSelect={selectGuide} />
        <GuideHeaderBanner guide={guide} />
        <ItemBreakdownGrid guide={guide} />

        <div className="mt-10 border-t border-border pt-8">
          {/* Mobile wizard */}
          <div className="lg:hidden">
            <StepIndicator current={mobileStep} maxStep={maxMobileStep} onSelect={goToStep} />

            {mobileStep === "items" && (
              <div className="mt-6 space-y-6">
                <UnitStepper numUnits={numUnits} onChange={setNumUnits} />
                <Button type="button" className="w-full" onClick={() => advanceStep("plan")}>
                  Next: Choose a plan
                </Button>
              </div>
            )}

            {mobileStep === "plan" && (
              <div className="mt-6 space-y-6">
                <CommitmentSelector selected={commitmentId} onSelect={setCommitmentId} />
                <ValetSelector selected={valetId} onSelect={setValetId} />
                <PromoCodeField
                  value={promoCode}
                  applied={promoApplied}
                  onChange={setPromoCode}
                  onApply={() => setPromoApplied(true)}
                />
                <Button type="button" className="w-full" onClick={() => advanceStep("contact")}>
                  Next: Review &amp; contact
                </Button>
              </div>
            )}

            {mobileStep === "contact" && (
              <div className="mt-6 space-y-6">
                <RateDashboard quote={quote} numUnits={numUnits} />
                <form onSubmit={handleSubmit} className="space-y-3">
                  <ContactFields contact={contact} errors={errors} onChange={setContact} />
                  <Button type="submit" disabled={status === "submitting"} className="w-full">
                    {status === "submitting" ? "Locking in your rate..." : "Lock In My Rate"}
                  </Button>
                  {status === "error" && (
                    <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
                  )}
                </form>
              </div>
            )}
          </div>

          {/* Desktop two-column layout */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-10">
            <div className="space-y-8">
              <UnitStepper numUnits={numUnits} onChange={setNumUnits} />
              <CommitmentSelector selected={commitmentId} onSelect={setCommitmentId} />
              <ValetSelector selected={valetId} onSelect={setValetId} />
              <PromoCodeField
                value={promoCode}
                applied={promoApplied}
                onChange={setPromoCode}
                onApply={() => setPromoApplied(true)}
              />
            </div>

            <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-card">
              <RateDashboard quote={quote} numUnits={numUnits} />
              <form onSubmit={handleSubmit} className="space-y-3 border-t border-border pt-6">
                <ContactFields contact={contact} errors={errors} onChange={setContact} />
                <Button type="submit" disabled={status === "submitting"} className="w-full">
                  {status === "submitting" ? "Locking in your rate..." : "Lock In My Rate"}
                </Button>
                {status === "error" && (
                  <p className="text-sm text-red-500">Something went wrong. Please try again.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SizeGuideSelector({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (sqft: number) => void;
}) {
  return (
    <div
      className="mt-8 flex gap-2 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 lg:grid-cols-6"
      role="tablist"
      aria-label="Storage capacity guide"
    >
      {SIZE_GUIDE.map((option) => {
        const active = option.sqft === selected;
        return (
          <button
            key={option.sqft}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls="storage-capacity-guide"
            onClick={() => onSelect(option.sqft)}
            className={`flex shrink-0 flex-col rounded-xl border px-4 py-3 text-left shadow-card transition-colors sm:shrink ${
              active
                ? "border-brand bg-brand text-brand-foreground shadow-glow"
                : "border-border bg-card text-foreground hover:border-brand/40"
            }`}
          >
            <span className="text-sm font-bold whitespace-nowrap">{option.sqft} sqft</span>
            <span className={`mt-0.5 text-xs whitespace-nowrap ${active ? "text-brand-foreground/80" : "text-foreground/60"}`}>
              From ${option.monthlyRate}/mo
            </span>
          </button>
        );
      })}
    </div>
  );
}

function GuideHeaderBanner({ guide }: { guide: SizeGuideOption }) {
  return (
    <div
      id="storage-capacity-guide"
      className="mt-6 flex flex-col gap-3 rounded-xl bg-brand px-5 py-4 text-brand-foreground sm:flex-row sm:items-center sm:justify-between"
    >
      <div>
        <p className="text-xs font-semibold tracking-wide uppercase opacity-80">Singapore space guide</p>
        <p className="mt-1 font-bold">
          {guide.sqft} sqft — {guide.useCase}
        </p>
        <p className="text-sm opacity-90">Ideal for: {guide.idealFor}</p>
      </div>
      <span className="inline-flex w-fit items-center rounded-full bg-brand-foreground/10 px-3 py-1 text-sm font-bold">
        From ${guide.monthlyRate}/mo
      </span>
    </div>
  );
}

function ItemBreakdownGrid({ guide }: { guide: SizeGuideOption }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {guide.items.map((item) => (
        <div
          key={item}
          className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand"
          >
            <BoxIcon />
          </span>
          <span className="text-foreground/80">{item}</span>
        </div>
      ))}
    </div>
  );
}

function BoxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 8L12 3 3 8l9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  );
}

function StepIndicator({
  current,
  maxStep,
  onSelect,
}: {
  current: MobileStep;
  maxStep: MobileStep;
  onSelect: (step: MobileStep) => void;
}) {
  const order = MOBILE_STEPS.map((s) => s.id);
  return (
    <div className="flex items-center gap-2">
      {MOBILE_STEPS.map((step, i) => {
        const reached = order.indexOf(step.id) <= order.indexOf(maxStep);
        const active = step.id === current;
        return (
          <button
            key={step.id}
            type="button"
            disabled={!reached}
            onClick={() => onSelect(step.id)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs font-medium transition-colors ${
              active ? "text-brand" : reached ? "text-foreground/70" : "text-foreground/30"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                active
                  ? "border-brand bg-brand text-brand-foreground"
                  : reached
                    ? "border-brand/40 text-brand"
                    : "border-border"
              }`}
            >
              {i + 1}
            </span>
            {step.label}
          </button>
        );
      })}
    </div>
  );
}

function UnitStepper({ numUnits, onChange }: { numUnits: number; onChange: (n: number) => void }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground/60">
        Storage modules ({MODULE_SQFT} sqft each)
      </p>
      <div className="mt-2 flex items-center gap-4">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, numUnits - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg font-bold hover:border-brand/50"
          aria-label="Decrease module count"
        >
          −
        </button>
        <span className="w-16 text-center text-2xl font-bold">{numUnits}</span>
        <button
          type="button"
          onClick={() => onChange(numUnits + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg font-bold hover:border-brand/50"
          aria-label="Increase module count"
        >
          +
        </button>
        <span className="text-sm text-foreground/60">= {numUnits * MODULE_SQFT} sqft</span>
      </div>
    </div>
  );
}

function CommitmentSelector({
  selected,
  onSelect,
}: {
  selected: CommitmentId;
  onSelect: (id: CommitmentId) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground/60">Commitment period</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {COMMITMENT_OPTIONS.map((option) => (
          <RadioCard
            key={option.id}
            active={option.id === selected}
            onClick={() => onSelect(option.id)}
          >
            <span className="font-semibold">{option.label}</span>
            {option.freeMonths > 0 && (
              <span className="mt-0.5 block text-xs text-brand">
                +{option.freeMonths} month{option.freeMonths > 1 ? "s" : ""} free
              </span>
            )}
          </RadioCard>
        ))}
      </div>
    </div>
  );
}

function ValetSelector({
  selected,
  onSelect,
}: {
  selected: ValetId;
  onSelect: (id: ValetId) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground/60">Valet service</p>
      <div className="mt-2 grid grid-cols-3 gap-2">
        {VALET_OPTIONS.map((option) => (
          <RadioCard key={option.id} active={option.id === selected} onClick={() => onSelect(option.id)}>
            <span className="font-semibold">{option.label}</span>
            <span className="mt-0.5 block text-xs text-foreground/60">
              {option.monthlyFee > 0 ? `+$${option.monthlyFee}/mo` : "Included"}
            </span>
          </RadioCard>
        ))}
      </div>
    </div>
  );
}

function RadioCard({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
        active ? "border-brand bg-brand/10 text-brand" : "border-border text-foreground/70 hover:border-brand/40"
      }`}
    >
      {children}
    </button>
  );
}

function PromoCodeField({
  value,
  applied,
  onChange,
  onApply,
}: {
  value: string;
  applied: boolean;
  onChange: (value: string) => void;
  onApply: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground/60">Promo code (optional)</p>
      <div className="mt-2 flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          placeholder="ENTER CODE"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button
          type="button"
          onClick={onApply}
          disabled={!value.trim()}
          className="shrink-0 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground/70 hover:border-brand/50 disabled:opacity-40"
        >
          Apply
        </button>
      </div>
      {applied && <p className="mt-1 text-xs text-foreground/50">Code submitted for review with your quote.</p>}
    </div>
  );
}

function RateDashboard({
  quote,
  numUnits,
}: {
  quote: ReturnType<typeof calculateQuote>;
  numUnits: number;
}) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-foreground/50 uppercase">Estimated monthly rate</p>
      <p className="mt-1 text-4xl font-bold text-brand">
        ${quote.discountedMonthly.toFixed(2)}
        <span className="text-base font-medium text-foreground/50">/mo</span>
      </p>
      <p className="mt-1 text-sm text-foreground/60">
        {quote.billedMonths} billed month{quote.billedMonths > 1 ? "s" : ""} · {numUnits} module
        {numUnits > 1 ? "s" : ""}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-brand/5 p-3">
          <p className="text-lg font-bold text-brand">${quote.savings.toFixed(0)}</p>
          <p className="text-xs text-foreground/60">Savings</p>
        </div>
        <div className="rounded-lg bg-brand/5 p-3">
          <p className="text-lg font-bold text-brand">{quote.co2SavedKg}kg</p>
          <p className="text-xs text-foreground/60">CO₂ saved</p>
        </div>
        <div className="rounded-lg bg-brand/5 p-3">
          <p className="text-lg font-bold text-brand">{quote.treesSaved}</p>
          <p className="text-xs text-foreground/60">Trees saved</p>
        </div>
      </div>
    </div>
  );
}

function ContactFields({
  contact,
  errors,
  onChange,
}: {
  contact: ContactState;
  errors: Partial<Record<keyof ContactState, string>>;
  onChange: (contact: ContactState) => void;
}) {
  function set<K extends keyof ContactState>(key: K, value: ContactState[K]) {
    onChange({ ...contact, [key]: value });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextField
        label="First name"
        value={contact.firstName}
        onChange={(v) => set("firstName", v)}
        error={errors.firstName}
        required
      />
      <TextField label="Last name" value={contact.lastName} onChange={(v) => set("lastName", v)} />
      <TextField
        label="Email"
        type="email"
        value={contact.email}
        onChange={(v) => set("email", v)}
        error={errors.email}
        required
      />
      <TextField
        label="Mobile"
        type="tel"
        value={contact.phone}
        onChange={(v) => set("phone", v)}
        error={errors.phone}
        required
      />
      <div className="sm:col-span-2">
        <TextField
          label="Delivery address (optional)"
          value={contact.address}
          onChange={(v) => set("address", v)}
        />
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground/60">{label}</label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-lg border bg-background px-3 py-2 text-base outline-none focus:border-brand sm:text-sm ${
          error ? "border-red-500" : "border-border"
        }`}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
