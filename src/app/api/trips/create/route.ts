import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();

  const dateStr = String(form.get("date") || "");
  const vehicleId = String(form.get("vehicleId") || "");
  const driverId = String(form.get("driverId") || "");

  const odoStart = Number(form.get("odoStart"));
  const odoEnd = Number(form.get("odoEnd"));

  const evRemainPct = Number(form.get("evRemainPct"));
  const hipassBalance = Number(form.get("hipassBalance"));
  const tollCost = Number(form.get("tollCost"));

  const note = String(form.get("note") || "").trim() || null;

  if (!dateStr || !vehicleId || !driverId) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (!Number.isFinite(odoStart) || !Number.isFinite(odoEnd) || odoEnd < odoStart) {
    return NextResponse.json({ error: "invalid odometer" }, { status: 400 });
  }
  if (evRemainPct < 0 || evRemainPct > 100) {
    return NextResponse.json({ error: "evRemainPct must be 0~100" }, { status: 400 });
  }

  const distance = odoEnd - odoStart;

  await prisma.trip.create({
    data: {
      date: new Date(dateStr + "T00:00:00"),
      vehicleId,
      driverId,
      odoStart,
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

