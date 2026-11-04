import { NextRequest, NextResponse } from "next/server";
import { wooRest } from "@/lib/woo/client";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  try {
    const customer = await wooRest<{ id: number; email: string }>("/customers", {
      method: "POST",
      body: JSON.stringify({
        email: body.email,
        password: body.password,
        first_name: body.first_name ?? "",
        last_name: body.last_name ?? "",
        username: body.email,
      }),
    });
    return NextResponse.json({ ok: true, id: customer.id, email: customer.email });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Registration failed" },
      { status: 400 },
    );
  }
}
