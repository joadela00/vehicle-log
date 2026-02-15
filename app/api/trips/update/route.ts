import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function toInt(raw: FormDataEntryValue | null): number {
  const s = String(raw ?? "").trim();
  const cleaned = s.replace(/[^\d]/g, "");
  return Number(cleaned);
}

export async function POST(req: Request) {
  const form = await req.formData();

  const id = String(form.get("id") || "");
  const odoEnd = toInt(form.get("odoEnd"));
  const evRemainPct = Number(form.get("evRemainPct"));
  const hipassBalance = toInt(form.get("hipassBalance"));

  if (!id) {
    return NextResponse.json({ error: "id missing" }, { status: 400 });
  }
  if (!Number.isFinite(odoEnd) || odoEnd < 0) {
    return NextResponse.json({ error: "invalid odoEnd" }, { status: 400 });
  }
  if (![20, 40, 60, 80, 100].includes(evRemainPct)) {
    return NextResponse.json({ error: "invalid evRemainPct" }, { status: 400 });
  }
  if (!Number.isFinite(hipassBalance) || hipassBalance < 0) {
    return NextResponse.json({ error: "invalid hipassBalance" }, { status: 400 });
  }

  // 현재 기록 조회
  const current = await prisma.trip.findUnique({
    where: { id },
    select: { id: true, vehicleId: true },
  });

  if (!current) {
    return NextResponse.json({ error: "record not found" }, { status: 404 });
  }

  // 1) 해당 기록 값 업데이트
  await prisma.trip.update({
    where: { id },
    data: {
      odoEnd,
      evRemainPct,
      hipassBalance,
    },
  });

  // 2) 같은 차량 기록 전부를 시간순으로 가져오기
  const trips = await prisma.trip.findMany({
    where: { vehicleId: current.vehicleId },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    select: { id: true, odoEnd: true, hipassBalance: true },
  });

  // 3) 순서대로 odoStart/distance/tollCost 재계산(연쇄)
  let prevOdo: number | null = null;
  let prevHipass: number | null = null;

  for (const t of trips) {
    const newDistance = prevOdo !== null ? t.odoEnd - prevOdo : 0;
    const safeDistance = newDistance >= 0 ? newDistance : 0;

    const newToll = prevHipass !== null ? prevHipass - t.hipassBalance : 0;
    const safeToll = newToll >= 0 ? newToll : 0;

    await prisma.trip.update({
      where: { id: t.id },
      data: {
        odoStart: prevOdo,
        distance: safeDistance,
        tollCost: safeToll,
      },
    });

    prevOdo = t.odoEnd;
    prevHipass = t.hipassBalance;
  }

  return NextResponse.redirect(new URL("/trips?saved=1", req.url));
}
