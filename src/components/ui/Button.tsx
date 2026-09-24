import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-brand text-brand-foreground hover:bg-brand/90",
  secondary: "bg-card text-foreground border border-white/10 hover:border-brand/50",
  ghost: "text-foreground hover:text-brand",
};

const BASE_CLASS =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button className={`${BASE_CLASS} ${VARIANT_CLASS[variant]} ${className}`} {...props} />
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${BASE_CLASS} ${VARIANT_CLASS[variant]} ${className}`}>
      {children}
    </Link>
  );
}
