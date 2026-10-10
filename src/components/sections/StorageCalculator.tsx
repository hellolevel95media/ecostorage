"use client";

import { useId, useMemo, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { PromoCodeInput, type AppliedPromo } from "@/components/ui/PromoCodeInput";
import { Turnstile, turnstileEnabled } from "@/components/ui/Turnstile";
import { showToast } from "@/lib/toast";
import { NETWORK_ERROR_MESSAGE, submitErrorMessage } from "@/lib/form-errors";
import {
  SIZE_GUIDE,
  formatDollars,
  MODULE_SQFT,
  COMMITMENT_OPTIONS,
  VALET_OPTIONS,
  moduleCountFromSqft,
  calculateQuote,
  referralCommitment,
  isValidEmail,
  isValidMobile,
  type CommitmentId,
  type CommitmentOption,
  type ValetId,
  type ValetOption,
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

// Mobile and desktop layouts are both in the DOM (one hidden by CSS); the
// bot-check widget must only render in the visible one.
const DESKTOP_QUERY = "(min-width: 1024px)";
function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(DESKTOP_QUERY);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

const EMPTY_CONTACT: ContactState = { firstName: "", lastName: "", email: "", phone: "", address: "" };

export function StorageCalculator() {
  const [selectedGuideSqft, setSelectedGuideSqft] = useState(20);
  const [numUnits, setNumUnits] = useState(() => moduleCountFromSqft(20));
  const [commitmentId, setCommitmentId] = useState<CommitmentId>("monthly");
  const [valetId, setValetId] = useState<ValetId>("none");
  const [promo, setPromo] = useState<AppliedPromo>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const isDesktop = useIsDesktop();
  // Load the bot check only once the visitor starts on their contact details.
  const [engaged, setEngaged] = useState(false);
  const [mobileStep, setMobileStep] = useState<MobileStep>("items");
  const [maxMobileStep, setMaxMobileStep] = useState<MobileStep>("items");
  const [contact, setContact] = useState<ContactState>(EMPTY_CONTACT);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactState, string>>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const guide = SIZE_GUIDE.find((g) => g.sqft === selectedGuideSqft) ?? SIZE_GUIDE[0];
  // A valid referral code unlocks one extra plan (e.g. 1 month free on 4).
  const commitmentOptions = useMemo<CommitmentOption[]>(
    () => (promo ? [...COMMITMENT_OPTIONS, referralCommitment(promo.offer)] : COMMITMENT_OPTIONS),
    [promo]
  );
  const commitment = commitmentOptions.find((c) => c.id === commitmentId) ?? COMMITMENT_OPTIONS[0];
  const valet = VALET_OPTIONS.find((v) => v.id === valetId)!;
  const quote = useMemo(() => calculateQuote({ numUnits, commitment, valet }), [numUnits, commitment, valet]);

  function applyPromo(next: AppliedPromo) {
    setPromo(next);
    if (next) setCommitmentId("referral");
    else if (commitmentId === "referral") setCommitmentId("monthly");
  }

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
    if (!validateContact()) {
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>('form [aria-invalid="true"]')?.focus()
      );
      return;
    }
    if (turnstileEnabled && !captchaToken) {
      setEngaged(true);
      setErrorMessage("Please wait a moment for the security check to finish, then try again.");
      setStatus("error");
      return;
    }
    setStatus("submitting");

    const payload = {
      type: "contact" as const,
      name: [contact.firstName, contact.lastName].filter(Boolean).join(" "),
      email: contact.email,
      phone: contact.phone,
      address: contact.address || null,
      // Selections only; the server recomputes the quote itself.
      calculator: { numUnits, commitment: commitment.id, valet: valet.id },
      promo_code: promo?.code ?? null,
      turnstile_token: captchaToken,
    };

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(submitErrorMessage(res.status));
      setStatus("success");
      showToast("Thanks — we've got your request!");
    } catch (err) {
      setErrorMessage(err instanceof Error && err.message !== "Failed to fetch" ? err.message : NETWORK_ERROR_MESSAGE);
      setStatus("error");
      // Turnstile tokens are single-use; get a fresh one for the retry.
      setCaptchaKey((k) => k + 1);
    }
  }

  if (status === "success") {
    return (
      <section className="snap-section-flow mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-brand/30 bg-brand/5 p-10 text-center shadow-card">
          <p className="text-2xl font-bold text-brand-ink">Request received!</p>
          <p className="mt-2 text-foreground/70">
            Our team will follow up within one business day to confirm your pickup and finalise your quote.
          </p>
        </div>
      </section>
    );
  }

  return (
    // Full-bleed grey band (not just constrained to the content column) so
    // the calculator card has visible contrast against the page's white
    // background on either side — the card itself was previously a near-white
    // bg-surface/60 sitting directly on the white page, which is why it read
    // as flat/low-contrast before.
    <section className="snap-section-flow bg-surface py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border-2 border-foreground/15 bg-card p-5 shadow-card sm:p-8 lg:p-10">
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

        <div className="mt-10 border-t-2 border-foreground/15 pt-8">
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
                <CommitmentSelector options={commitmentOptions} selected={commitmentId} onSelect={setCommitmentId} />
                <ValetSelector selected={valetId} onSelect={setValetId} />
                <ValetNotice valet={valet} />
                <PromoCodeInput applied={promo} onApplied={applyPromo} />
                <Button type="button" className="w-full" onClick={() => advanceStep("contact")}>
                  Next: Review &amp; contact
                </Button>
              </div>
            )}

            {mobileStep === "contact" && (
              <div className="mt-6 space-y-6">
                <RateDashboard quote={quote} numUnits={numUnits} />
                <form noValidate onSubmit={handleSubmit} onFocusCapture={() => setEngaged(true)} className="space-y-3">
                  <ContactFields contact={contact} errors={errors} onChange={setContact} />
                  {engaged && !isDesktop && <Turnstile onToken={setCaptchaToken} resetKey={captchaKey} />}
                  <Button type="submit" disabled={status === "submitting" || (turnstileEnabled && engaged && !captchaToken)} className="w-full">
                    {status === "submitting" ? "Sending your request..." : "Get My Quote"}
                  </Button>
                  {status === "error" && (
                    <p role="alert" className="text-sm text-red-500">{errorMessage}</p>
                  )}
                </form>
              </div>
            )}
          </div>

          {/* Desktop two-column layout */}
          <div className="hidden lg:grid lg:grid-cols-2 lg:gap-10">
            <div className="space-y-8">
              <UnitStepper numUnits={numUnits} onChange={setNumUnits} />
              <CommitmentSelector options={commitmentOptions} selected={commitmentId} onSelect={setCommitmentId} />
              <ValetSelector selected={valetId} onSelect={setValetId} />
              <ValetNotice valet={valet} />
              <PromoCodeInput applied={promo} onApplied={applyPromo} />
            </div>

            <div className="space-y-6 rounded-2xl border-2 border-foreground/15 bg-card p-6 shadow-card">
              <RateDashboard quote={quote} numUnits={numUnits} />
              <form noValidate onSubmit={handleSubmit} onFocusCapture={() => setEngaged(true)} className="space-y-3 border-t-2 border-foreground/15 pt-6">
                <ContactFields contact={contact} errors={errors} onChange={setContact} />
                {engaged && isDesktop && <Turnstile onToken={setCaptchaToken} resetKey={captchaKey} />}
                <Button type="submit" disabled={status === "submitting" || (turnstileEnabled && engaged && !captchaToken)} className="w-full">
                  {status === "submitting" ? "Sending your request..." : "Get My Quote"}
                </Button>
                {status === "error" && (
                  <p role="alert" className="text-sm text-red-500">{errorMessage}</p>
                )}
              </form>
            </div>
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
                : "border-2 border-foreground/20 bg-card text-foreground hover:border-brand/60"
            }`}
          >
            <span className="text-sm font-bold whitespace-nowrap">{option.sqft} sqft</span>
            <span className={`mt-0.5 text-xs whitespace-nowrap tabular-nums ${active ? "text-brand-foreground/80" : "text-foreground/60"}`}>
              From ${formatDollars(option.monthlyRate)}/mo
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
      <span className="inline-flex w-fit items-center rounded-full bg-brand-foreground/10 px-3 py-1 text-sm font-bold tabular-nums">
        From ${formatDollars(guide.monthlyRate)}/mo
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
          className="flex items-center gap-2 rounded-lg border-2 border-foreground/15 bg-card p-3 text-sm"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-ink"
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
              active ? "text-brand-ink" : reached ? "text-foreground/80" : "text-foreground/60"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                active
                  ? "border-brand bg-brand text-brand-foreground"
                  : reached
                    ? "border-brand/60 text-brand-ink"
                    : "border-foreground/20"
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
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground/20 text-lg font-bold hover:border-brand/60"
          aria-label="Decrease module count"
        >
          −
        </button>
        <span className="w-16 text-center text-2xl font-bold tabular-nums">{numUnits}</span>
        <button
          type="button"
          onClick={() => onChange(numUnits + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-foreground/20 text-lg font-bold hover:border-brand/60"
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
  options,
  selected,
  onSelect,
}: {
  options: CommitmentOption[];
  selected: CommitmentId;
  onSelect: (id: CommitmentId) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground/60">Commitment period</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {options.map((option) => (
          <RadioCard
            key={option.id}
            active={option.id === selected}
            onClick={() => onSelect(option.id)}
          >
            <span className="font-semibold">{option.label}</span>
            {option.freeMonths > 0 && (
              <span className="mt-0.5 block text-xs text-brand-ink">
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

function ValetNotice({ valet }: { valet: ValetOption }) {
  if (valet.id === "none") return null;
  return (
    <div className="rounded-lg bg-brand/5 p-3 text-xs text-foreground/70">
      <span className="font-semibold text-brand-ink">
        {valet.label} (+${valet.monthlyFee}/mo):
      </span>{" "}
      {valet.description}
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
        active ? "border-2 border-brand bg-brand/10 text-brand-ink" : "border-2 border-foreground/20 text-foreground/70 hover:border-brand/60"
      }`}
    >
      {children}
    </button>
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
      <p className="text-xs font-semibold tracking-wide text-foreground/60 uppercase">Estimated monthly rate</p>
      <p className="mt-1 text-4xl font-bold text-brand-ink tabular-nums">
        ${quote.discountedMonthly.toFixed(2)}
        <span className="text-base font-medium text-foreground/60">/mo</span>
      </p>
      <p className="mt-1 text-sm text-foreground/60 tabular-nums">
        {quote.billedMonths} billed month{quote.billedMonths > 1 ? "s" : ""} · {numUnits} module
        {numUnits > 1 ? "s" : ""}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-brand/5 p-3">
          <p className="text-lg font-bold text-brand-ink tabular-nums">${quote.savings.toFixed(0)}</p>
          <p className="text-xs text-foreground/60">Savings</p>
        </div>
        <div className="rounded-lg bg-brand/5 p-3">
          <p className="text-lg font-bold text-brand-ink tabular-nums">{quote.co2SavedKg}kg</p>
          <p className="text-xs text-foreground/60">CO₂ saved</p>
        </div>
        <div className="rounded-lg bg-brand/5 p-3">
          <p className="text-lg font-bold text-brand-ink tabular-nums">{quote.treesSaved}</p>
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
  const id = useId();
  const errorId = `${id}-error`;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-foreground/60">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border-2 bg-background px-3 py-2 text-base outline-none focus:border-brand sm:text-sm ${
          error ? "border-red-500" : "border-foreground/20"
        }`}
      />
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
