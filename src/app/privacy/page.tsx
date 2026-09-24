import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | EcoStorage",
};

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
        <p>Contact hello@storagespace.com with any privacy questions or data requests.</p>
      </div>
    </section>
  );
}
