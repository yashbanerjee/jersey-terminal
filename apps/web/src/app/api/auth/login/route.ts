import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { AUTH_COOKIE } from "@/lib/woo/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { username: string; password: string };
  if (!body.username || !body.password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  // WordPress JWT / application password compatible token endpoint
  const res = await fetch(
    `${env.wordpressUrl.replace(/\/$/, "")}/wp-json/jwt-auth/v1/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: body.username,
        password: body.password,
      }),
    },
  );

  if (!res.ok) {
    // Fallback: Woo Store API customer login is plugin-dependent
    return NextResponse.json(
      { error: "Invalid credentials or auth plugin not configured" },
      { status: 401 },
    );
  }

  const data = (await res.json()) as { token: string; user_email?: string; user_display_name?: string };
  const response = NextResponse.json({
    ok: true,
    email: data.user_email,
    name: data.user_display_name,
  });

  response.cookies.set(AUTH_COOKIE, data.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
