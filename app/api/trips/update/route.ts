import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function toInt(raw: FormDataEntryValue | null): number {
  const s = String(raw ?? "").trim();
  const cleaned = s.replace(/[^\d]/g, "");
  return Number(cleaned);
}

export async function POST(req: Request) {
  const form = await req.formData();

  const id = String(form.get("id"));
  const odoEnd = toInt(form.get("odoEnd"));
  const evRemainPct = Number(form.get("evRemainPct"));
  const hipassBalance = toInt(form.get("hipassBalance"));
  const tollCost = toInt(form.get("tollCost"));

  if (!id || !Number.isFinite(odoEnd)) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }

  // 현재 기록 조회
  const current = await prisma.trip.findUnique({
    where: { id },
    select: { vehicleId: true, date: true },
  });

  if (!current) {
    return NextResponse.json({ error: "record not found" }, { status: 404 });
  }

  // 같은 차량의 이전 기록 찾기
  const prev = await prisma.trip.findFirst({
    where: {
      vehicleId: current.vehicleId,
      date: { lt: current.date },
    },
    orderBy: { date: "desc" },
    select: { odoEnd: true },
  });

  const odoStart = prev?.odoEnd ?? null;
  const distance = prev ? odoEnd - prev.odoEnd : 0;

  if (prev && distance < 0) {
    return NextResponse.json(
      { error: `최종 주행거리가 이전 기록(${prev.odoEnd})보다 작습니다.` },
      { status: 400 }
    );
  }

  await prisma.trip.update({
    where: { id },
    data: {
      odoEnd,
      odoStart,
      distance,
      evRemainPct,
      hipassBalance,
      tollCost,
    },
  });

  return NextResponse.redirect(new URL("/trips", req.url));
}
