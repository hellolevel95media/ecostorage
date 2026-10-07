import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { REFERRAL_COOKIE, refParamCode, referralCookieMaxAge, serializeReferral } from "@/lib/affiliate/referral-cookie";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Protects /admin/* behind an authenticated Supabase session. The login page
 * itself stays public so signed-out users can reach it. Also refreshes the
 * Supabase auth cookie on every request so sessions don't expire mid-visit.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public pages only reach the proxy when they carry ?ref= (see matcher):
  // remember the affiliate referral for 14 days. Last click wins.
  if (!pathname.startsWith("/api/") && !pathname.startsWith("/admin")) {
    const response = NextResponse.next();
    const code = refParamCode(request.nextUrl.searchParams.get("ref"));
    if (code) {
      response.cookies.set(REFERRAL_COOKIE, serializeReferral(code), {
        maxAge: referralCookieMaxAge(),
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });
    }
    return response;
  }

  if (pathname.startsWith("/api/")) {
    const { allowed } = checkRateLimit(`api:${clientIp(request)}:${pathname}`, 20, 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
    }
    return NextResponse.next({ request });
  }

  if (pathname === "/admin/login") {
    const { allowed } = checkRateLimit(`login:${clientIp(request)}`, 10, 5 * 60_000);
    if (!allowed) {
      return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
    }
  }

  let response = NextResponse.next({ request });

  // createServerClient throws synchronously if the Supabase env vars are
  // missing/invalid — without this guard that crashes every /admin and
  // /api request with Next's generic 500 page instead of something useful.
  let supabase;
  try {
    supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });
  } catch {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Service temporarily unavailable." },
        { status: 503 }
      );
    }
    return NextResponse.redirect(new URL("/config-error", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginRoute = pathname === "/admin/login";

  if (!user && !isLoginRoute) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (user && isLoginRoute) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
    // Any public page, but only when an affiliate ?ref= is present, so
    // normal page views never pay for the proxy.
    {
      source: "/((?!api|admin|_next/static|_next/image|favicon.ico|.*\\..*).*)",
      has: [{ type: "query", key: "ref" }],
    },
  ],
};
