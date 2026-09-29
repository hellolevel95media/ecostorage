import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const MAX_PATHS = 5;

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const paths = (body as { paths?: unknown } | null)?.paths;

  if (!Array.isArray(paths) || paths.length === 0 || paths.length > MAX_PATHS) {
    return NextResponse.json({ error: "Invalid paths" }, { status: 400 });
  }
  if (!paths.every((p) => typeof p === "string" && p.startsWith("/"))) {
    return NextResponse.json({ error: "Invalid paths" }, { status: 400 });
  }

  paths.forEach((path) => revalidatePath(path as string));

  return NextResponse.json({ revalidated: true });
}
