import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const password = String(form.get("password") || "");

  const admin = process.env.ADMIN_PASSWORD;
  if (!admin) {
    return NextResponse.json({ error: "ADMIN_PASSWORD not set" }, { status: 500 });
  }

  if (password !== admin) {
    return NextResponse.json({ error: "비밀번호가 틀렸습니다." }, { status: 401 });
  }

  const res = NextResponse.redirect(new URL("/admin", req.url));
  res.cookies.set("admin_ok", "1", { httpOnly: true, sameSite: "lax", path: "/" });
  return res;
}
