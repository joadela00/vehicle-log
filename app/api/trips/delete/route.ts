import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get("id") || "");

  if (!id) {
    return NextResponse.json({ error: "id missing" }, { status: 400 });
  }

  await prisma.trip.delete({
    where: { id },
  });

  return NextResponse.redirect(new URL("/trips", req.url));
}
