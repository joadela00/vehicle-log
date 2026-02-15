import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function toInt(raw: FormDataEntryValue | null): number {
  const s = String(raw ?? "").trim();
  // 숫자 외 문자 제거(쉼표 등 들어와도 처리)
  const cleaned = s.replace(/[^\d]/g, "");
  return Number(cleaned);
}

export async function POST(req: Request) {
  const form = await req.formData();

  const dateStr = String(form.get("date") || "");
  const vehicleId = String(form.get("vehicleId") || "");

  const driverName = String(form.get("driverName") || "").trim();
  const odoEnd = toInt(form.get("odoEnd"));

  const evRemainPct = Number(form.get("evRemainPct")); // 20/40/60/80/100
  const hipassBalance = toInt(form.get("hipassBalance"));
  const tollCost = toInt(form.get("tollCost"));

  const note = String(form.get("note") || "").trim() || null;

  if (!dateStr || !vehicleId || !driverName) {
    return NextResponse.json({ error: "필수값(날짜/차량/운전자)을 입력하세요." }, { status: 400 });
  }
  if (!Number.isFinite(odoEnd) || odoEnd < 0) {
    return NextResponse.json({ error: "최종 주행거리를 올바르게 입력하세요." }, { status: 400 });
  }
  if (![20, 40, 60, 80, 100].includes(evRemainPct)) {
    return NextResponse.json({ error: "전기 잔여%는 20/40/60/80/100 중 선택하세요." }, { status: 400 });
  }

  // ✅ 운전자 이름으로 자동 생성/연결
  const driver = await prisma.driver.upsert({
    where: { name: driverName },
    update: {},
    create: { name: driverName },
  });

  // ✅ 같은 차량의 이전 기록(가장 최근) 조회
  const prev = await prisma.trip.findFirst({
    where: { vehicleId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
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

  await prisma.trip.create({
    data: {
      date: new Date(dateStr + "T00:00:00"),
      vehicleId,
      driverId: driver.id,
      odoStart, // null 또는 이전 odoEnd
      odoEnd,
      distance,
      evRemainPct,
      hipassBalance: Math.max(0, hipassBalance || 0),
      tollCost: Math.max(0, tollCost || 0),
      note,
    },
  });

  return NextResponse.redirect(new URL("/", req.url));
}
