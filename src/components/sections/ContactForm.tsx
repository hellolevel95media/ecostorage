"use client";

import { useId, useState, type FormEvent } from "react";
import type { InquiryType } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { showToast } from "@/lib/toast";

interface ContactFormProps {
  type: InquiryType;
  title?: string;
  description?: string;
  showCompanyFields?: boolean;
  compact?: boolean;
  /** Extra allow-listed fields merged into the submitted payload, e.g.
   * { partnerKind: "business" } on the /partner page. */
  metadata?: Record<string, unknown>;
}

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({
  type,
  title = "Send us a message",
  description,
  showCompanyFields = false,
  compact = false,
  metadata,
}: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");
  const messageId = useId();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    };

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("success");
      showToast("Thanks — we've got your message!");
      formEl.reset();
    } catch {
      setStatus("error");
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
        <h3 className={compact ? "text-xs font-semibold tracking-wide text-foreground/40 uppercase" : "text-xl font-semibold"}>
          {title}
        </h3>
      )}
      {description && <p className="mt-1 text-sm text-foreground/70">{description}</p>}

      <div className={`grid gap-2 ${compact ? "mt-2 sm:grid-cols-3" : "mt-3 sm:grid-cols-2"}`}>
        <Field label="Name" name="name" required compact={compact} />
        <Field label="Email" name="email" type="email" required compact={compact} />
        <Field label="Mobile" name="phone" type="tel" compact={compact} />
        {!compact && showCompanyFields && <Field label="Company name" name="company_name" />}
        {!compact && !showCompanyFields && <Field label="Address" name="address" />}
        {!compact && showCompanyFields && (
          <div className="sm:col-span-2">
            <Field label="Address" name="address" />
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
            maxLength={500}
            placeholder={compact ? "Message" : undefined}
            aria-label={compact ? "Message" : undefined}
            className={`w-full rounded-lg border border-border bg-background text-sm outline-none focus:border-brand ${compact ? "px-3 py-1.5" : "px-3 py-2"}`}
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={status === "submitting"}
        className={compact ? "mt-2 w-full sm:w-auto" : "mt-3 w-full sm:w-auto"}
      >
        {status === "submitting" ? "Sending..." : "Submit"}
      </Button>

      {status === "error" && (
        <p className="mt-2 text-sm text-red-500">Something went wrong — please try again.</p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  compact = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  compact?: boolean;
}) {
  const id = useId();
  return (
    <div>
      {!compact && (
        <label htmlFor={id} className="mb-1 block text-xs font-medium text-foreground/60">
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={compact ? label : undefined}
        aria-label={compact ? label : undefined}
        className={`w-full rounded-lg border border-border bg-background text-sm outline-none focus:border-brand ${compact ? "px-3 py-1.5" : "px-3 py-2"}`}
      />
    </div>
  );
}
