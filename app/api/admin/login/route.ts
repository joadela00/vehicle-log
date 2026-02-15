import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") || "");

  const admin = process.env.ADMIN_PASSWORD;
  if (!admin) {
    return NextResponse.redirect(new URL("/admin-login?error=config", req.url));
  }

  if (password !== admin) {
    return NextResponse.redirect(new URL("/admin-login?error=invalid", req.url));
  }

  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set("admin_ok", "1", { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
