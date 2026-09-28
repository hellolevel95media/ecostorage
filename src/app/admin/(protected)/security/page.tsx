"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

interface Factor {
  id: string;
  status: string;
  friendly_name?: string;
}

export default function SecurityPage() {
  const [factors, setFactors] = useState<Factor[] | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [enrolling, setEnrolling] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.mfa.listFactors().then(({ data }) => setFactors(data?.totp ?? []));
  }, [refreshKey]);

  async function startEnroll() {
    setError(null);
    setEnrolling(true);
    const supabase = createClient();
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" });

    if (enrollError || !data) {
      setError(enrollError?.message ?? "Could not start 2FA enrollment.");
      setEnrolling(false);
      return;
    }

    setQrCode(data.totp.qr_code);
    setSecret(data.totp.secret);
    setPendingFactorId(data.id);
  }

  async function confirmEnroll(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pendingFactorId) return;
    setVerifying(true);
    setError(null);

    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    const supabase = createClient();

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: pendingFactorId,
    });
    if (challengeError || !challenge) {
      setVerifying(false);
      setError(challengeError?.message ?? "Could not start the verification challenge.");
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: pendingFactorId,
      challengeId: challenge.id,
      code,
    });

    setVerifying(false);

    if (verifyError) {
      setError(verifyError.message);
      return;
    }

    setQrCode(null);
    setSecret(null);
    setPendingFactorId(null);
    setEnrolling(false);
    setRefreshKey((k) => k + 1);
  }

  async function removeFactor(factorId: string) {
    const supabase = createClient();
    await supabase.auth.mfa.unenroll({ factorId });
    setRefreshKey((k) => k + 1);
  }

  const verifiedFactor = factors?.find((f) => f.status === "verified");

  return (
    <div className="max-w-lg">
      <h2 className="text-lg font-semibold">Two-factor authentication</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Require an authenticator app code at sign-in, in addition to your password.
      </p>

      {factors === null && <p className="mt-6 text-sm text-foreground/60">Loading...</p>}

      {factors !== null && verifiedFactor && !enrolling && (
        <div className="mt-6 rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-brand">2FA is enabled</p>
          <Button variant="ghost" className="mt-3" onClick={() => removeFactor(verifiedFactor.id)}>
            Disable 2FA
          </Button>
        </div>
      )}

      {factors !== null && !verifiedFactor && !enrolling && (
        <Button className="mt-6" onClick={startEnroll}>
          Enable 2FA
        </Button>
      )}

      {enrolling && qrCode && (
        <form onSubmit={confirmEnroll} className="mt-6 rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-foreground/70">Scan this QR code with your authenticator app:</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrCode} alt="2FA QR code" className="mt-3 h-40 w-40 rounded-lg bg-white p-2" />
          {secret && (
            <p className="mt-2 font-mono text-xs break-all text-foreground/50">Manual entry key: {secret}</p>
          )}

          <div className="mt-4">
            <label className="mb-1 block text-xs font-medium text-foreground/60">Enter the 6-digit code</label>
            <input
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm tracking-widest outline-none focus:border-brand"
            />
          </div>

          {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

          <Button type="submit" disabled={verifying} className="mt-4 w-full">
            {verifying ? "Confirming..." : "Confirm and enable"}
          </Button>
        </form>
      )}

      {error && !enrolling && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
