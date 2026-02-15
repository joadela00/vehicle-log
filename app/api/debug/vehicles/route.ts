import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { plate: "asc" } });
  return NextResponse.json({
    count: vehicles.length,
    vehicles,
  });
}
