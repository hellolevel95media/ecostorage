import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Protects /admin/* behind an authenticated Supabase session. The login page
 * itself stays public so signed-out users can reach it. Also refreshes the
 * Supabase auth cookie on every request so sessions don't expire mid-visit.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  matcher: ["/admin/:path*", "/api/:path*"],
};
