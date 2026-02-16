import { NextResponse } from "next/server";

export async function GET(req: Request) {
  // 실수로 GET으로 접근해도 로그인 페이지로 보내기
  return NextResponse.redirect(new URL("/admin-login", req.url));
}

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
  res.cookies.set("admin_ok", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return res;
}
