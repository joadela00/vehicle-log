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
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold sm:text-2xl">운행일지 상세</h1>
        <Link href="/trips" className="rounded border px-3 py-2 text-sm">
          목록으로
        </Link>
      </div>

      <div className="mt-5 space-y-2 rounded border p-4 text-sm sm:text-base">
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
