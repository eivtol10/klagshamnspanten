import { NextRequest, NextResponse } from "next/server";

const PASSWORD = process.env.PADEL_ADMIN_PASSWORD || "padel2025";

export async function POST(req: NextRequest) {
  const { password, action } = await req.json();
  if (action === "logout") {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("padel_auth", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 0, path: "/" });
    return res;
  }
  if (password !== PASSWORD) {
    return NextResponse.json({ ok: false, error: "Fel lösenord" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("padel_auth", "true", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
  return res;
}

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("padel_auth");
  return NextResponse.json({ authenticated: cookie?.value === "true" });
}
