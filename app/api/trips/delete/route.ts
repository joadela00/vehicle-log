import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const id = String(form.get("id") || "");
  const adminPassword = String(form.get("adminPassword") || "");
  const configuredPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!id) {
    return NextResponse.json({ error: "id missing" }, { status: 400 });
  }

  if (!configuredPassword) {
    return NextResponse.redirect(new URL("/trips?deleteError=server", req.url), 303);
  }

  if (!adminPassword || adminPassword !== configuredPassword) {
    return NextResponse.redirect(new URL("/trips?deleteError=auth", req.url), 303);
  }

  await prisma.trip.delete({
    where: { id },
  });

  return NextResponse.redirect(new URL("/trips?deleted=1", req.url), 303);
}
