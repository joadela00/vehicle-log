import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function toInt(raw: FormDataEntryValue | null): number {
  const s = String(raw ?? "").trim();
  const cleaned = s.replace(/[^\d]/g, "");
  return Number(cleaned);
}

function redirectToEdit(req: Request, id: string, error: string, branchCode?: string) {
  const url = new URL(`/trips/${id}`, req.url);
  url.searchParams.set("error", error);
  if (branchCode) url.searchParams.set("branchCode", branchCode);
  return NextResponse.redirect(url, 303);
}

export async function POST(req: Request) {
  const form = await req.formData();

  const id = String(form.get("id") || "");
  const odoEnd = toInt(form.get("odoEnd"));
  const evRemainPct = Number(form.get("evRemainPct"));
  const hipassBalance = toInt(form.get("hipassBalance"));

  const returnToRaw = String(form.get("returnTo") || "").trim();
  const branchCode = String(form.get("branchCode") || "").trim();

  // ✅ (추가) 수정 폼에 hipassCharge가 "있는 경우에만" 반영 (없으면 기존 값 유지)
  const hasHipassChargeField = form.has("hipassCharge");
  const hipassChargeRaw = hasHipassChargeField ? form.get("hipassCharge") : null;
  const hipassCharge =
    !hasHipassChargeField
      ? undefined
      : hipassChargeRaw === null || String(hipassChargeRaw).trim() === ""
        ? null
        : toInt(hipassChargeRaw);

  if (!id) {
    return NextResponse.json({ error: "id missing" }, { status: 400 });
  }
  if (!Number.isFinite(odoEnd) || odoEnd < 0) {
    return redirectToEdit(req, id, "invalid_odo", branchCode);
  }
  if (![20, 40, 60, 80, 100].includes(evRemainPct)) {
    return redirectToEdit(req, id, "invalid_ev", branchCode);
  }
  if (!Number.isFinite(hipassBalance) || hipassBalance < 0) {
    return redirectToEdit(req, id, "invalid_hipass", branchCode);
  }

  // ✅ (추가) 충전금액 검증(폼에 있을 때만)
  if (hipassCharge !== undefined && hipassCharge !== null) {
    if (!Number.isFinite(hipassCharge) || hipassCharge < 0) {
      return redirectToEdit(req, id, "invalid_hipass_charge", branchCode);
    }
  }

  const current = await prisma.trip.findUnique({
    where: { id },
    select: { id: true, vehicleId: true, date: true, createdAt: true },
  });

  if (!current) {
    return NextResponse.json({ error: "record not found" }, { status: 404 });
  }

  const [prevTrip, nextTrip] = await Promise.all([
    prisma.trip.findFirst({
      where: {
        vehicleId: current.vehicleId,
        OR: [
          { date: { lt: current.date } },
          { date: current.date, createdAt: { lt: current.createdAt } },
        ],
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: { odoEnd: true },
    }),
    prisma.trip.findFirst({
      where: {
        vehicleId: current.vehicleId,
        OR: [
          { date: { gt: current.date } },
          { date: current.date, createdAt: { gt: current.createdAt } },
        ],
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      select: { odoEnd: true },
    }),
  ]);

  if (prevTrip && odoEnd < prevTrip.odoEnd) {
    return redirectToEdit(req, id, "prev_odo", branchCode);
  }

  if (nextTrip && odoEnd > nextTrip.odoEnd) {
    return redirectToEdit(req, id, "next_odo", branchCode);
  }

  // ✅ (수정) hipassCharge는 "폼에 있을 때만" update data에 포함
  const updateData: {
    odoEnd: number;
    evRemainPct: number;
    hipassBalance: number;
    hipassCharge?: number | null;
  } = { odoEnd, evRemainPct, hipassBalance };

  if (hipassCharge !== undefined) {
    updateData.hipassCharge = hipassCharge; // null 가능
  }

  await prisma.trip.update({
    where: { id },
    data: updateData,
  });

  const allTrips = await prisma.trip.findMany({
    where: { vehicleId: current.vehicleId },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    select: { id: true, odoEnd: true, hipassBalance: true, hipassCharge: true }, // ✅ hipassCharge 추가
  });

  let prevOdo: number | null = null;
  let prevHipass: number | null = null;

  const updates = allTrips.map((trip) => {
    const distance = prevOdo === null ? 0 : Math.max(0, trip.odoEnd - prevOdo);

    // ✅ (수정) 통행료 = (이전잔액 + 충전금액) - 현재잔액
    const charge = trip.hipassCharge ?? 0;
    const tollCost =
      prevHipass === null ? 0 : Math.max(0, prevHipass + charge - trip.hipassBalance);

    const data = {
      odoStart: prevOdo,
      distance,
      tollCost,
    };

    prevOdo = trip.odoEnd;
    prevHipass = trip.hipassBalance;

    return prisma.trip.update({
      where: { id: trip.id },
      data,
    });
  });

  if (updates.length) {
    await prisma.$transaction(updates);
  }

  // ✅ 저장 후: 목록으로 + updated=1 붙여서 토스트 트리거
  // ✅ open redirect 방지: /trips 로 시작하는 상대경로만 허용
  const safeReturnTo = returnToRaw.startsWith("/trips") ? returnToRaw : "/trips";
  const url = new URL(safeReturnTo, req.url);
  url.searchParams.set("updated", "1");

  return NextResponse.redirect(url, 303);
}