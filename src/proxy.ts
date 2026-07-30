import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/session";
import { isTrainerProtectedRoute } from "@/lib/nav/trainer-routes";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!isTrainerProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySession(token) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/connect";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session.role !== "ADMIN") {
    const url = request.nextUrl.clone();
    url.pathname = "/connect";
    url.searchParams.set("error", "forbidden");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/schedule/:path*",
    "/clients/:path*",
    "/programs/:path*",
    "/ai/:path*",
    "/apps/:path*",
    "/contacts/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
