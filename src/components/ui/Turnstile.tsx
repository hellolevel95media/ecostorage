"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let scriptPromise: Promise<void> | null = null;

function loadScript() {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Turnstile failed to load"));
    };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

/** True when the bot check is configured; forms only require a token then. */
export const turnstileEnabled = Boolean(SITE_KEY);

/**
 * Cloudflare Turnstile bot check. Calls `onToken` with a single-use token, or
 * null when it expires/errors. Bump `resetKey` after a submission to get a
 * fresh token. Renders nothing when no site key is configured.
 */
export function Turnstile({ onToken, resetKey = 0 }: { onToken: (token: string | null) => void; resetKey?: number }) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    callback.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!SITE_KEY) return;
    let widgetId: string | undefined;
    let cancelled = false;
    callback.current(null);

    loadScript()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId = window.turnstile.render(container.current, {
          sitekey: SITE_KEY,
          theme: "auto",
          size: "flexible",
          callback: (token: string) => {
            setState("ready");
            callback.current(token);
          },
          "expired-callback": () => callback.current(null),
          "error-callback": () => {
            setState("failed");
            callback.current(null);
          },
        });
      })
      .catch(() => {
        if (cancelled) return;
        setState("failed");
        callback.current(null);
      });

    return () => {
      cancelled = true;
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [resetKey, attempt]);

  if (!SITE_KEY) return null;
  return (
    <div>
      <div ref={container} className="min-h-[65px]" />
      {state === "loading" && (
        <p role="status" className="mt-1 text-xs text-foreground/60">
          Running a quick security check. The Submit button turns on when it&apos;s done.
        </p>
      )}
      {state === "failed" && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          The security check couldn&apos;t load. An ad blocker or privacy extension may be blocking it.{" "}
          <button
            type="button"
            onClick={() => {
              setState("loading");
              setAttempt((n) => n + 1);
            }}
            className="font-medium underline"
          >
            Try again
          </button>
        </p>
      )}
    </div>
  );
}
