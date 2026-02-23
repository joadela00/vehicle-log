import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const branchCode = (searchParams.get("branchCode") ?? "").trim();
  const vehicleId = (searchParams.get("vehicleId") ?? "").trim();

  if (!vehicleId) {
    return NextResponse.json(
      { hipassBalance: null, odoEnd: null },
      { status: 200 },
    );
  }

  const latest = await prisma.trip.findFirst({
    where: { vehicleId },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    select: {
      hipassBalance: true,
      odoEnd: true,
    },
  });

  return NextResponse.json(
    {
      hipassBalance: latest?.hipassBalance ?? null,
      odoEnd: latest?.odoEnd ?? null,
    },
    { status: 200 },
  );
}