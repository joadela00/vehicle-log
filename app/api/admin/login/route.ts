import { NextResponse } from "next/server";

export async function GET(req: Request) {
  return NextResponse.redirect(new URL("/admin-login", req.url));
}

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") ?? "");

  const admin = process.env.ADMIN_PASSWORD ?? "";
  if (!admin) {
    return NextResponse.redirect(new URL("/admin-login?error=server", req.url));
  }

  if (password !== admin) {
    return NextResponse.redirect(new URL("/admin-login?error=1", req.url));
  }

  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set("admin_ok", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
  });
  return res;
}
