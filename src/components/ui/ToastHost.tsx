"use client";

import { useEffect, useState } from "react";
import { TOAST_EVENT } from "@/lib/toast";

interface ToastItem {
  id: number;
  message: string;
}

let nextId = 0;

export function ToastHost() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    function handleToast(event: Event) {
      const message = (event as CustomEvent<string>).detail;
      const id = nextId++;
      setToasts((prev) => [...prev, { id, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    }

    window.addEventListener(TOAST_EVENT, handleToast);
    return () => window.removeEventListener(TOAST_EVENT, handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed inset-x-0 z-[60] flex flex-col items-center gap-2 px-4"
      style={{ bottom: "calc(1.5rem + var(--safe-b))" }}
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast-pop rounded-full border border-brand/30 bg-foreground px-5 py-3 text-sm font-medium text-background shadow-card-hover"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
