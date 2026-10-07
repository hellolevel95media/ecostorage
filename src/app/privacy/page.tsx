import { buildMetadata } from "@/lib/site";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How we collect, use and protect your personal information when you use this website and our storage services in Singapore.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>
      <div className="mt-6 space-y-4 text-sm text-foreground/70">
        <p>
          EcoStorage collects only the information you provide through our forms — name,
          email, phone, address, and message content — to respond to inquiries and provide
          quotes.
        </p>
        <p>
          We never sell your data. Information submitted through this site is stored securely in
          our Supabase database and is only accessible to authenticated EcoStorage staff.
        </p>
        <p>
          If you were referred to us by an EcoStorage affiliate (through their link or referral
          code), we share your enquiry with our separate affiliate system so we can credit them.
          The affiliate never sees your full details: only a shortened version of your name, the
          last four digits of your mobile number and part of your email address, together with
          whether you became a customer.
        </p>
        <p>
          Our forms use Cloudflare Turnstile to block spam and automated submissions. It may
          process technical information about your browser and connection for that purpose.
        </p>
        <p>Contact hello@ecostorage.sg with any privacy questions or data requests.</p>
      </div>
    </section>
  );
}
