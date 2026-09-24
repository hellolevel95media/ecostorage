"use client";

import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import type { InquiryType } from "@/types/database";
import { Button } from "@/components/ui/Button";

interface ContactFormProps {
  type: InquiryType;
  title?: string;
  description?: string;
  showCompanyFields?: boolean;
  compact?: boolean;
}

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm({
  type,
  title = "Send us a message",
  description,
  showCompanyFields = false,
  compact = false,
}: ContactFormProps) {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const form = new FormData(event.currentTarget);
    const payload = {
      type,
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? "") || null,
      company_name: String(form.get("company_name") ?? "") || null,
      address: String(form.get("address") ?? "") || null,
      message: String(form.get("message") ?? "") || null,
    };

    try {
      const supabase = createClient();
      const { error } = await supabase.from("inquiries").insert(payload);
      if (error) throw error;
      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={`rounded-xl border border-brand/30 bg-card p-6 ${compact ? "text-sm" : ""}`}>
        <p className="font-semibold text-brand">Thanks — we&apos;ve got it.</p>
        <p className="mt-1 text-foreground/70">Our team will reach out within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`rounded-xl border border-border bg-card ${compact ? "p-4" : "p-6"}`}>
      {title && <h3 className={compact ? "text-base font-semibold" : "text-xl font-semibold"}>{title}</h3>}
      {description && <p className="mt-1 text-sm text-foreground/70">{description}</p>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field label="Email" name="email" type="email" required />
        <Field label="Mobile" name="phone" type="tel" />
        {showCompanyFields ? (
          <Field label="Company name" name="company_name" />
        ) : (
          <Field label="Address" name="address" />
        )}
        {showCompanyFields && (
          <div className="sm:col-span-2">
            <Field label="Address" name="address" />
          </div>
        )}
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-foreground/60">Message</label>
          <textarea
            name="message"
            rows={compact ? 2 : 4}
            maxLength={500}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
      </div>

      <Button type="submit" disabled={status === "submitting"} className="mt-4 w-full sm:w-auto">
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
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground/60">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
