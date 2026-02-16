export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { plate: "asc" },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vehicles" },
      { status: 500 }
    );
  }
}
