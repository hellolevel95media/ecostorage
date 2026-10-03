import { Resend } from "resend";
import type { InquiryType, PartnerKind } from "@/types/database";

const INQUIRY_LABELS: Record<InquiryType, string> = {
  contact: "General contact",
  personal: "Personal storage",
  corporate: "Corporate storage",
  partner: "Partnership",
};

interface InquiryPayload {
  type: InquiryType;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  address: string | null;
  message: string | null;
  metadata?: Record<string, unknown>;
}

const PARTNER_KIND_LABELS: Record<PartnerKind, string> = {
  affiliate: "Individual affiliate",
  business: "Business partner",
};

/**
 * Sends a staff notification for a new inquiry. Silently no-ops if
 * RESEND_API_KEY / INQUIRY_NOTIFICATION_EMAIL aren't configured, so this is
 * safe to call in every environment without breaking the inquiry flow.
 */
export async function sendInquiryNotification(inquiry: InquiryPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.INQUIRY_NOTIFICATION_EMAIL;
  const from = process.env.INQUIRY_NOTIFICATION_FROM;

  if (!apiKey || !to || !from) return;

  const resend = new Resend(apiKey);
  const partnerKind = inquiry.metadata?.partnerKind as PartnerKind | undefined;

  await resend.emails.send({
    from,
    to,
    subject: `New ${INQUIRY_LABELS[inquiry.type]} inquiry — ${inquiry.name}`,
    text: [
      `Type: ${INQUIRY_LABELS[inquiry.type]}`,
      partnerKind ? `Partner kind: ${PARTNER_KIND_LABELS[partnerKind]}` : null,
      `Name: ${inquiry.name}`,
      `Email: ${inquiry.email}`,
      inquiry.phone ? `Phone: ${inquiry.phone}` : null,
      inquiry.company_name ? `Company: ${inquiry.company_name}` : null,
      inquiry.address ? `Address: ${inquiry.address}` : null,
      inquiry.message ? `\nMessage:\n${inquiry.message}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  });
}
