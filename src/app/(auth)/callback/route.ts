import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ALLOWED_PREFIXES = ["/dashboard", "/students", "/groups", "/payments", "/attendance", "/schedule", "/settings", "/studios"];

function isValidRedirectPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) return false;
  return ALLOWED_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + "/") || path.startsWith(prefix + "?"));
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";
  const next = isValidRedirectPath(rawNext) ? rawNext : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
