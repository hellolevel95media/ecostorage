"use client";

import { useId, useState, type FormEvent } from "react";
import type { InquiryType } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { PromoCodeInput, type AppliedPromo } from "@/components/ui/PromoCodeInput";
import { Turnstile, turnstileEnabled } from "@/components/ui/Turnstile";
import { NETWORK_ERROR_MESSAGE, submitErrorMessage } from "@/lib/form-errors";
import { showToast } from "@/lib/toast";

interface ContactFormProps {
  type: InquiryType;
  title?: string;
  description?: string;
  showCompanyFields?: boolean;
  compact?: boolean;
  headingAs?: "h2" | "h3";
  /** Extra allow-listed fields merged into the submitted payload, e.g.
   * { partnerKind: "business" } on the /partner page. */
  metadata?: Record<string, unknown>;
}

type Status = "idle" | "submitting" | "success" | "error";

const MESSAGE_MAX = 2000;
const EMAIL_PATTERN = "[^\\s@]+@[^\\s@]+\\.[^\\s@]+";

export function ContactForm({
  type,
  title = "Send us a message",
  description,
  showCompanyFields = false,
  compact = false,
  headingAs: Heading = "h3",
  metadata,
}: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const messageId = useId();
  const [promo, setPromo] = useState<AppliedPromo>(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [messageLength, setMessageLength] = useState(0);
  // The bot check loads only once someone starts using the form, so pages
  // with the footer form don't all pull in Cloudflare's script.
  const [engaged, setEngaged] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const showPromo = !compact && type !== "partner";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (turnstileEnabled && !captchaToken) {
      setEngaged(true);
      setErrorMessage("Please wait a moment for the security check to finish, then press Submit again.");
      setStatus("error");
      return;
    }

    setStatus("submitting");

    // Capture the form element before the first await — event.currentTarget
    // is nulled by the browser once the synchronous event-dispatch phase
    // ends, so reading it after an await throws (caught below as a false
    // "error" status even though the request already succeeded).
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const payload = {
      type,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? "") || null,
      company_name: String(form.get("company_name") ?? "") || null,
      address: String(form.get("address") ?? "") || null,
      message: String(form.get("message") ?? "") || null,
      website: String(form.get("website") ?? ""),
      metadata,
      promo_code: showPromo ? (promo?.code ?? null) : null,
      turnstile_token: captchaToken,
    };

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        setErrorMessage(submitErrorMessage(res.status));
        setStatus("error");
        // Turnstile tokens are single-use; get a fresh one for the retry.
        setCaptchaKey((k) => k + 1);
        return;
      }
      setStatus("success");
      showToast("Thanks — we've got your message!");
      formEl.reset();
    } catch {
      setErrorMessage(NETWORK_ERROR_MESSAGE);
      setStatus("error");
      setCaptchaKey((k) => k + 1);
    }
  }

  if (status === "success") {
    return (
      <div className={`rounded-xl border border-brand/30 bg-card p-6 ${compact ? "text-sm" : ""}`}>
        <p className="font-semibold text-brand-ink">Thanks — we&apos;ve got it.</p>
        <p className="mt-1 text-foreground/70">Our team will reach out within one business day.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onFocusCapture={() => setEngaged(true)}
      className={compact ? "" : "rounded-xl border border-border bg-card p-6"}
    >
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        aria-hidden="true"
      />
      {title && (
        <Heading className={compact ? "text-xs font-semibold tracking-wide text-foreground/60 uppercase" : "text-xl font-semibold"}>
          {title}
        </Heading>
      )}
      {description && <p className="mt-1 text-sm text-foreground/70">{description}</p>}

      <div className={`grid gap-2 ${compact ? "mt-2 sm:grid-cols-3" : "mt-3 gap-3 sm:grid-cols-2"}`}>
        <Field label="Name" name="name" autoComplete="name" required compact={compact} />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          pattern={EMAIL_PATTERN}
          title="Enter an email address like name@example.com"
          required
          compact={compact}
        />
        <Field label="Mobile" name="phone" type="tel" autoComplete="tel" optional={!compact} compact={compact} />
        {!compact && showCompanyFields && <Field label="Company name" name="company_name" autoComplete="organization" />}
        {!compact && !showCompanyFields && (
          <Field label="Address" name="address" autoComplete="street-address" optional />
        )}
        {!compact && showCompanyFields && (
          <div className="sm:col-span-2">
            <Field label="Address" name="address" autoComplete="street-address" optional />
          </div>
        )}
        <div className={compact ? "sm:col-span-3" : "sm:col-span-2"}>
          {!compact && (
            <label htmlFor={messageId} className="mb-1 block text-xs font-medium text-foreground/60">
              Message
            </label>
          )}
          <textarea
            id={messageId}
            name="message"
            rows={compact ? 1 : 4}
            maxLength={MESSAGE_MAX}
            onChange={(e) => setMessageLength(e.target.value.length)}
            placeholder={compact ? "Message" : undefined}
            aria-label={compact ? "Message" : undefined}
            className={`w-full rounded-lg border border-border bg-background text-sm outline-none focus:border-brand ${compact ? "px-3 py-2.5 sm:py-1.5" : "px-3 py-2"}`}
          />
          {!compact && messageLength > MESSAGE_MAX * 0.8 && (
            <p className="mt-1 text-right text-xs text-foreground/60">
              {messageLength} / {MESSAGE_MAX}
            </p>
          )}
        </div>
      </div>

      {showPromo && (
        <div className="mt-3">
          {promoOpen || promo ? (
            <PromoCodeInput applied={promo} onApplied={setPromo} />
          ) : (
            <button
              type="button"
              onClick={() => setPromoOpen(true)}
              className="inline-flex min-h-11 items-center text-sm font-medium text-brand-ink hover:underline"
            >
              Have a promo or referral code?
            </button>
          )}
        </div>
      )}

      {engaged && (
        <div className="mt-3">
          <Turnstile onToken={setCaptchaToken} resetKey={captchaKey} />
        </div>
      )}

      <Button
        type="submit"
        disabled={status === "submitting" || (turnstileEnabled && engaged && !captchaToken)}
        className={compact ? "mt-2 w-full sm:w-auto" : "mt-3 w-full sm:w-auto"}
      >
        {status === "submitting" ? "Sending..." : "Submit"}
      </Button>

      {status === "error" && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  optional = false,
  compact = false,
  autoComplete,
  pattern,
  title,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
  compact?: boolean;
  autoComplete?: string;
  pattern?: string;
  title?: string;
}) {
  const id = useId();
  return (
    <div>
      {!compact && (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-foreground/60">
          {label}
          {required && <span aria-hidden="true"> *</span>}
          {optional && <span className="font-normal"> (optional)</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        pattern={pattern}
        title={title}
        placeholder={compact ? `${label}${required ? " *" : ""}` : undefined}
        aria-label={compact ? label : undefined}
        className={`w-full rounded-lg border border-border bg-background text-sm outline-none focus:border-brand ${compact ? "px-3 py-2.5 sm:py-1.5" : "px-3 py-2"}`}
      />
    </div>
  );
}
