import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If not logged in and not on auth pages, redirect to login
  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/callback")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user) {
    const pathname = request.nextUrl.pathname;

    // Fetch role for logged-in users on dashboard routes (not /callback, not static)
    const INSTRUCTOR_ALLOWED = ["/calendar", "/attendance"];
    const needsRoleCheck =
      pathname.startsWith("/login") ||
      (!INSTRUCTOR_ALLOWED.some((p) => pathname.startsWith(p)) &&
        !pathname.startsWith("/callback"));

    if (needsRoleCheck) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role;

      // Redirect logged-in users from /login
      if (pathname.startsWith("/login")) {
        const url = request.nextUrl.clone();
        url.pathname = role === "instructor" ? "/attendance" : "/dashboard";
        return NextResponse.redirect(url);
      }

      // Block instructors from restricted routes
      if (role === "instructor") {
        const url = request.nextUrl.clone();
        url.pathname = "/attendance";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
