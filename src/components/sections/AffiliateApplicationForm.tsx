"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "submitting" | "success" | "error";

interface AffiliateApplicationPayload {
  name: string;
  email: string;
  phone: string;
  promotionPlan: string;
}

/**
 * Isolated on purpose — this currently submits to the main site's
 * /api/inquiries, but will later be re-pointed to the separate affiliate
 * system's own application endpoint once that's live. Keeping the call in
 * one function means that's a one-line change, not a form rewrite.
 */
async function submitAffiliateApplication(payload: AffiliateApplicationPayload) {
  const res = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "partner",
      name: payload.name,
      email: payload.email,
      phone: payload.phone || null,
      message: payload.promotionPlan || null,
      metadata: { partnerKind: "affiliate" },
    }),
  });
  if (!res.ok) throw new Error("request failed");
}

const BENEFITS = [
  "Earn rewards for every customer you refer",
  "Tiered rewards that grow with your referrals",
  "Your referrals get an exclusive welcome offer",
  "Every application is personally reviewed",
  "Full programme details and terms are shared once approved",
];

export function AffiliateApplicationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const promotionId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    // Capture the form element before the first await — event.currentTarget
    // is nulled once the synchronous event-dispatch phase ends, so reading
    // it after an await throws (caught below as a false "error" status even
    // though the request already succeeded).
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    try {
      await submitAffiliateApplication({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        promotionPlan: String(form.get("promotion_plan") ?? ""),
      });
      setStatus("success");
      formEl.reset();
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="text-xl font-semibold">Become an EcoStorage affiliate</h3>
      <ul className="mt-3 space-y-1.5 text-sm text-foreground/70">
        {BENEFITS.map((benefit) => (
          <li key={benefit} className="flex gap-2">
            <span aria-hidden className="text-brand-ink">
              ✓
            </span>
            {benefit}
          </li>
        ))}
      </ul>

      {status === "success" ? (
        <div className="mt-4 rounded-lg border border-brand/30 bg-background p-4">
          <p className="font-semibold text-brand-ink">Thanks, we review every application personally and will be in touch.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField label="Name" name="name" required />
            <TextField label="Email" name="email" type="email" required />
            <TextField label="Mobile" name="phone" type="tel" />
            <div className="sm:col-span-2">
              <label htmlFor={promotionId} className="mb-1 block text-xs font-medium text-foreground/60">
                How do you plan to promote EcoStorage?
              </label>
              <textarea
                id={promotionId}
                name="promotion_plan"
                rows={3}
                maxLength={500}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
              />
            </div>
          </div>

          <label className="mt-3 flex items-start gap-2 text-sm text-foreground/70">
            <input type="checkbox" name="consent" required className="mt-0.5" />
            <span>I agree to be contacted about the affiliate programme.</span>
          </label>
          <p className="mt-1 text-xs text-foreground/50">
            This isn&apos;t the full programme terms — those are shared and accepted later, inside the affiliate
            portal.
          </p>

          <Button type="submit" disabled={status === "submitting"} className="mt-3 w-full sm:w-auto">
            {status === "submitting" ? "Sending..." : "Apply"}
          </Button>

          {status === "error" && (
            <p className="mt-2 text-sm text-red-500">Something went wrong — please try again.</p>
          )}
        </form>
      )}
    </div>
  );
}

function TextField({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-foreground/60">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
