import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function safeTripsReturnTo(returnToRaw: string) {
  const s = String(returnToRaw || "").trim();
  // ✅ open redirect 방지: /trips 로 시작하는 상대경로만 허용
  return s.startsWith("/trips") ? s : "/trips";
}

export async function POST(req: Request) {
  const form = await req.formData();

  const id = String(form.get("id") || "");
  const inputPassword = String(form.get("deletePassword") || ""); // ✅ deletePassword
  const returnToRaw = String(form.get("returnTo") || "").trim();

  // ✅ 삭제 전용 비밀번호(관리자 로그인 비번과 분리)
  const configuredPassword = process.env.TRIPS_DELETE_PASSWORD ?? "";

  if (!id) {
    return NextResponse.json({ error: "id missing" }, { status: 400 });
  }

  const safeReturnTo = safeTripsReturnTo(returnToRaw);

  if (!configuredPassword) {
    const url = new URL(safeReturnTo, req.url);
    url.searchParams.set("deleteError", "server");
    return NextResponse.redirect(url, 303);
  }

  if (!inputPassword || inputPassword !== configuredPassword) {
    const url = new URL(safeReturnTo, req.url);
    url.searchParams.set("deleteError", "auth");
    return NextResponse.redirect(url, 303);
  }

  await prisma.trip.delete({ where: { id } });

  const url = new URL(safeReturnTo, req.url);
  url.searchParams.set("deleted", "1");
  return NextResponse.redirect(url, 303);
}
