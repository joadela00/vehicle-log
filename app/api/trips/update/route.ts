import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function toInt(raw: FormDataEntryValue | null): number {
  const s = String(raw ?? "").trim();
  const cleaned = s.replace(/[^\d]/g, "");
  return Number(cleaned);
}

function redirectToEdit(req: Request, id: string, error: string) {
  return NextResponse.redirect(new URL(`/trips/${id}?error=${error}`, req.url), 303);
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
    return redirectToEdit(req, id, "invalid_odo");
  }
  if (![20, 40, 60, 80, 100].includes(evRemainPct)) {
    return redirectToEdit(req, id, "invalid_ev");
  }
  if (!Number.isFinite(hipassBalance) || hipassBalance < 0) {
    return redirectToEdit(req, id, "invalid_hipass");
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
        OR: [{ date: { lt: current.date } }, { date: current.date, createdAt: { lt: current.createdAt } }],
      },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      select: { odoEnd: true },
    }),
    prisma.trip.findFirst({
      where: {
        vehicleId: current.vehicleId,
        OR: [{ date: { gt: current.date } }, { date: current.date, createdAt: { gt: current.createdAt } }],
      },
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      select: { odoEnd: true },
    }),
  ]);

  if (prevTrip && odoEnd < prevTrip.odoEnd) {
    return redirectToEdit(req, id, "prev_odo");
  }

  if (nextTrip && odoEnd > nextTrip.odoEnd) {
    return redirectToEdit(req, id, "next_odo");
  }

  await prisma.trip.update({
    where: { id },
    data: { odoEnd, evRemainPct, hipassBalance },
  });

  const allTrips = await prisma.trip.findMany({
    where: { vehicleId: current.vehicleId },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    select: { id: true, odoEnd: true, hipassBalance: true },
  });

  let prevOdo: number | null = null;
  let prevHipass: number | null = null;

  const updates = allTrips.map((trip) => {
    const distance = prevOdo === null ? 0 : Math.max(0, trip.odoEnd - prevOdo);
    const tollCost = prevHipass === null ? 0 : Math.max(0, prevHipass - trip.hipassBalance);

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

  return NextResponse.redirect(new URL(`/trips/${id}?updated=1`, req.url), 303);
}
