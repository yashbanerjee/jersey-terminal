import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  // Never cache sensitive commerce routes at the edge
  const path = req.nextUrl.pathname;
  if (
    path.startsWith("/api/cart") ||
    path.startsWith("/api/checkout") ||
    path.startsWith("/api/auth") ||
    path.startsWith("/account") ||
    path.startsWith("/checkout")
  ) {
    res.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private",
    );
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/).*)"],
};
