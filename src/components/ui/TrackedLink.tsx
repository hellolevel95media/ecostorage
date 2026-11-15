"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

type ClickEvent = "whatsapp_click" | "phone_click" | "email_click";

interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  /** GA4 event fired on click. */
  event: ClickEvent;
  /** Where on the site the link sits, e.g. "contact_page" or "floating_widget". */
  location: string;
  children: ReactNode;
}

/**
 * Plain anchor that reports a GA4 click event. Use for tel:, mailto: and
 * wa.me links inside Server Components, which can't attach handlers themselves.
 */
export function TrackedLink({ event, location, onClick, children, ...rest }: TrackedLinkProps) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        trackEvent(event, { location });
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
