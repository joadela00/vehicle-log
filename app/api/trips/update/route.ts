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

  if (!id) return NextResponse.json({ error: "id missing" }, { status: 400 });
  if (!Number.isFinite(odoEnd) || odoEnd < 0) return NextResponse.json({ error: "invalid odoEnd" }, { status: 400 });
  if (![20, 40, 60, 80, 100].includes(evRemainPct)) return NextResponse.json({ error: "invalid evRemainPct" }, { status: 400 });
  if (!Number.isFinite(hipassBalance) || hipassBalance < 0) return NextResponse.json({ error: "invalid hipassBalance" }, { status: 400 });

  // 현재 레코드(기준점) 읽기
  const current = await prisma.trip.findUnique({
    where: { id },
    select: { id: true, vehicleId: true, date: true, createdAt: true },
  });
  if (!current) return NextResponse.json({ error: "record not found" }, { status: 404 });

  // 1) 현재 레코드 값 업데이트
  await prisma.trip.update({
    where: { id },
    data: { odoEnd, evRemainPct, hipassBalance },
  });

  // 2) 현재 레코드 "이전 1건" 찾기 (기준 odo/hipass)
  const prev = await prisma.trip.findFirst({
    where: {
      vehicleId: current.vehicleId,
      OR: [
        { date: { lt: current.date } },
        { date: current.date, createdAt: { lt: current.createdAt } },
      ],
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select: { odoEnd: true, hipassBalance: true },
  });

  let prevOdo: number | null = prev?.odoEnd ?? null;
  let prevHipass: number | null = prev?.hipassBalance ?? null;

  // 3) 현재 레코드 포함해서 "이후 레코드만" 가져오기
  const affected = await prisma.trip.findMany({
    where: {
      vehicleId: current.vehicleId,
      OR: [
        { date: { gt: current.date } },
        { date: current.date, createdAt: { gte: current.createdAt } },
      ],
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    select: { id: true, odoEnd: true, hipassBalance: true },
  });

  // 4) 영향 구간만 재계산 (업데이트 묶어서 왕복 줄이기)
  const updates = affected.map((t) => {
    const newDistance = prevOdo !== null ? t.odoEnd - prevOdo : 0;
    const safeDistance = newDistance >= 0 ? newDistance : 0;

    const newToll = prevHipass !== null ? prevHipass - t.hipassBalance : 0;
    const safeToll = newToll >= 0 ? newToll : 0;

    // 다음 레코드 계산을 위해 prev 갱신
    prevOdo = t.odoEnd;
    prevHipass = t.hipassBalance;

    return prisma.trip.update({
      where: { id: t.id },
      data: {
        odoStart: prevOdo === null ? null : (prevOdo - safeDistance),
        distance: safeDistance,
        tollCost: safeToll,
      },
    });
  });

  // 트랜잭션으로 묶어 DB 왕복 최소화
  if (updates.length) {
    await prisma.$transaction(updates);
  }

  return NextResponse.redirect(new URL("/trips", req.url));
}
