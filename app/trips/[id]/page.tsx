import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function generateStaticParams() {
  const trips = await prisma.trip.findMany({
    select: { id: true },
  });

  return trips.map((t) => ({ id: t.id }));
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    select: {
      id: true,
      date: true,
      vehicleId: true,
      driverId: true,
      distance: true,
      tollCost: true,
      hipassBalance: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!trip) return notFound();

  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUnique({
      where: { id: trip.vehicleId },
      select: { id: true, model: true, plate: true },
    }),
    trip.driverId
      ? prisma.driver.findUnique({
          where: { id: trip.driverId },
          select: { id: true, name: true },
        })
      : null,
  ]);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">운행일지 상세</h1>
        <Link href="/trips" className="underline">
          목록으로
        </Link>
      </div>

      <div className="mt-6 border rounded p-4 space-y-2">
        <div>
          <b>날짜</b>: {trip.date.toISOString().slice(0, 10)}
        </div>
        <div>
          <b>차량</b>: {vehicle ? `${vehicle.model} / ${vehicle.plate}` : "-"}
        </div>
        <div>
          <b>운전자</b>: {driver?.name ?? "-"}
        </div>
        <div>
          <b>실제주행거리(km)</b>: {trip.distance}
        </div>
        <div>
          <b>통행료(원)</b>: {trip.tollCost}
        </div>
        <div>
          <b>하이패스 잔액</b>: {trip.hipassBalance}
        </div>
      </div>
    </main>
  );
}
