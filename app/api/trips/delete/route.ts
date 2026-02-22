import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function safeTripsReturnTo(returnToRaw: string) {
  const s = String(returnToRaw || "").trim();

  // ✅ open redirect 방지
  return s.startsWith("/trips") ? s : "/trips";
}

export async function POST(req: Request) {
  const form = await req.formData();

  const id = String(form.get("id") || "");
  const inputPassword = String(form.get("deletePassword") || "");
  const returnToRaw = String(form.get("returnTo") || "").trim();

  // ✅ 삭제 전용 비밀번호 (관리자 로그인과 분리)
  const configuredPassword = process.env.TRIPS_DELETE_PASSWORD ?? "";

  if (!id) {
    return NextResponse.json({ error: "id missing" }, { status: 400 });
  }

  const safeReturnTo = safeTripsReturnTo(returnToRaw);

  // 서버 설정 문제
  if (!configuredPassword) {
    const url = new URL(safeReturnTo, req.url);
    url.searchParams.set("deleteError", "server");
    return NextResponse.redirect(url, 303);
  }

  // 비밀번호 불일치
  if (!inputPassword || inputPassword !== configuredPassword) {
    const url = new URL(safeReturnTo, req.url);
    url.searchParams.set("deleteError", "auth");
    return NextResponse.redirect(url, 303);
  }

  await prisma.trip.delete({
    where: { id },
  });

  const url = new URL(safeReturnTo, req.url);
  url.searchParams.set("deleted", "1");

  return NextResponse.redirect(url, 303);
}
