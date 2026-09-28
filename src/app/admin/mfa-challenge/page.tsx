"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

export default function MfaChallengePage() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.mfa.listFactors().then(({ data, error: listError }) => {
      if (listError || !data) {
        setError(listError?.message ?? "Could not load your 2FA factor.");
        setReady(true);
        return;
      }
      const totp = data.totp.find((f) => f.status === "verified");
      setFactorId(totp?.id ?? null);
      setReady(true);
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!factorId) return;
    setLoading(true);
    setError(null);

    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    const supabase = createClient();

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError || !challenge) {
      setLoading(false);
      setError(challengeError?.message ?? "Could not start the 2FA challenge.");
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    router.replace("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8"
      >
        <h1 className="text-xl font-bold">Two-factor verification</h1>
        <p className="mt-1 text-sm text-foreground/60">Enter the 6-digit code from your authenticator app.</p>

        <div className="mt-6">
          <label className="mb-1 block text-xs font-medium text-foreground/60">Code</label>
          <input
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tracking-widest outline-none focus:border-brand"
          />
        </div>

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
        {ready && !factorId && !error && (
          <p className="mt-4 text-sm text-red-500">No verified authenticator found for this account.</p>
        )}

        <Button type="submit" disabled={loading || !factorId} className="mt-6 w-full">
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </div>
  );
}
