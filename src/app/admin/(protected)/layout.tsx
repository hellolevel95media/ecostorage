import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SignOutButton } from "@/components/admin/SignOutButton";

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // RLS grants CMS/inquiry access to any *authenticated* Supabase user, not
  // specifically an admin — if public sign-up is ever left enabled on the
  // Supabase project, a stranger creating an account would otherwise land
  // here with full access. This allowlist is the app-level backstop; the
  // Supabase dashboard's own "allow new users to sign up" toggle should also
  // be disabled as the primary defense (see todo.txt).
  const allowedEmails = (process.env.ADMIN_ALLOWED_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!user.email || !allowedEmails.includes(user.email.toLowerCase())) {
    await supabase.auth.signOut();
    redirect("/admin/login");
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.nextLevel !== aal.currentLevel) {
    redirect("/admin/mfa-challenge");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wide text-brand-ink uppercase">Admin</p>
          <h1 className="text-2xl font-bold">EcoStorage CMS</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-foreground/60 sm:inline">{user.email}</span>
          <SignOutButton />
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
