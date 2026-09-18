import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/scholarships",
  "/applications",
  "/admin",
  "/documents",
  "/recommendations",
  "/eligibility",
  "/notifications",
  "/assistant",
];

// Simple in-memory IP rate limiter for /auth route
const authRateMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = authRateMap.get(ip);

  if (!record || now > record.resetTime) {
    authRateMap.set(ip, { count: 1, resetTime: now + 60000 });
    return false;
  }

  record.count += 1;
  if (record.count > 10) {
    return true; // Rate limited
  }

  return false;
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

  // Rate limiting check on /auth page
  if (pathname.startsWith("/auth")) {
    const isRateLimited = checkRateLimit(ip);
    if (isRateLimited) {
      response.headers.set("x-rate-limited", "true");
    }
  }

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
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check if current path matches any protected route
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  // Unauthenticated user attempting to access protected route -> redirect to /auth
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // If user is authenticated, determine role
  if (user) {
    let role = user.user_metadata?.role || user.app_metadata?.role || "";

    // If role is not yet known as admin or nodal_officer, query profiles table
    if (role !== "admin" && role !== "nodal_officer") {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.role) {
          role = profile.role;
        }
      } catch (err) {
        // Fallback to metadata
      }
    }

    const isOfficerOrAdmin = role === "admin" || role === "nodal_officer";

    // Requirement 4: /dashboard is only for students. If admin tries to access /dashboard, redirect to /admin
    if (pathname.startsWith("/dashboard") && isOfficerOrAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }

    // Role-based protection: Student / non-officer trying to access /admin -> redirect to /dashboard
    if (pathname.startsWith("/admin")) {
      if (!isOfficerOrAdmin) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
      return response;
    }

    // Authenticated user attempting to access /auth -> redirect to home based on role
    if (pathname.startsWith("/auth")) {
      const url = request.nextUrl.clone();
      url.pathname = isOfficerOrAdmin ? "/admin" : "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
