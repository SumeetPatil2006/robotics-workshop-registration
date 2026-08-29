import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from "@/lib/admin-auth";

const isPublicAdminRoute = (pathname: string) => {
  return pathname === "/admin/login" || pathname === "/api/admin/login" || pathname === "/api/admin/logout";
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const sessionValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? null;
    const isAuthenticated = await verifyAdminSessionToken(sessionValue);

    if (pathname === "/admin/login") {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }

      return NextResponse.next();
    }

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/")) {
    if (isPublicAdminRoute(pathname)) {
      return NextResponse.next();
    }

    const sessionValue = request.cookies.get(ADMIN_SESSION_COOKIE)?.value ?? null;

    if (!(await verifyAdminSessionToken(sessionValue))) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        { status: 401 },
      );
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
