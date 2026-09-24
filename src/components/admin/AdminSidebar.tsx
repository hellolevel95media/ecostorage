"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/articles", label: "Articles" },
  { href: "/admin/pages", label: "Page Copy" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/media", label: "Media Library" },
  { href: "/admin/inquiries", label: "Inquiries" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-white/10 pb-2 lg:w-56 lg:flex-col lg:border-b-0 lg:border-r lg:pb-0 lg:pr-4">
      {LINKS.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap ${
              active ? "bg-card text-brand" : "text-foreground/60 hover:text-brand"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
