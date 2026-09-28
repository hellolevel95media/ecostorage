import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sendInquiryNotification } from "@/lib/email";
import type { InquiryType } from "@/types/database";

const VALID_TYPES: InquiryType[] = ["contact", "personal", "corporate", "partner"];
const MAX_BODY_BYTES = 20_000;

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request too large" }, { status: 413 });
  }

  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, name, email, phone, company_name, address, message, website } = body as Record<string, unknown>;

  // Honeypot: real users never fill this hidden field. Bots that do get a
  // fake success response so they don't learn to skip it.
  if (typeof website === "string" && website.trim()) {
    return NextResponse.json({ ok: true });
  }

  if (!VALID_TYPES.includes(type as InquiryType)) {
    return NextResponse.json({ error: "Invalid inquiry type" }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim() || typeof email !== "string" || !email.trim()) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }

  const inquiry = {
    type: type as InquiryType,
    name: name.trim(),
    email: email.trim(),
    phone: typeof phone === "string" && phone.trim() ? phone.trim() : null,
    company_name: typeof company_name === "string" && company_name.trim() ? company_name.trim() : null,
    address: typeof address === "string" && address.trim() ? address.trim() : null,
    message: typeof message === "string" && message.trim() ? message.trim() : null,
  };

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("inquiries").insert(inquiry);
    if (error) throw error;
  } catch {
    return NextResponse.json({ error: "Could not save your message. Please try again." }, { status: 500 });
  }

  sendInquiryNotification(inquiry).catch(() => {});

  return NextResponse.json({ ok: true });
}
