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
      odoEnd: true,
      evRemainPct: true,
      hipassBalance: true,
      distance: true,
      tollCost: true,
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
        <h1 className="text-xl font-bold sm:text-2xl">운행일지 수정</h1>
        <Link href="/trips" className="rounded border px-3 py-2 text-sm">
          목록으로
        </Link>
      </div>

      <div className="mt-5 rounded border p-4 text-sm sm:text-base">
        <div className="grid gap-2 sm:grid-cols-2">
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
            <b>현재 계산값</b>: 주행 {trip.distance}km / 통행료 {trip.tollCost}원
          </div>
        </div>

        <form method="POST" action="/api/trips/update" className="mt-5 grid gap-4">
          <input type="hidden" name="id" value={trip.id} />

          <label className="grid gap-1">
            <span className="text-sm sm:text-base">계기판 최종 주행거리(누적 km)</span>
            <input
              name="odoEnd"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              defaultValue={trip.odoEnd}
              className="rounded border px-3 py-3 text-base"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm sm:text-base">전기 잔여(%)</span>
            <select
              name="evRemainPct"
              required
              defaultValue={String(trip.evRemainPct)}
              className="rounded border px-3 py-3 text-base"
            >
              {[20, 40, 60, 80, 100].map((v) => (
                <option key={v} value={v}>
                  {v}%
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm sm:text-base">하이패스 잔액(원)</span>
            <input
              name="hipassBalance"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              defaultValue={trip.hipassBalance}
              className="rounded border px-3 py-3 text-base"
            />
          </label>

          <button className="rounded bg-black px-4 py-3 text-base font-semibold text-white">
            수정 저장
          </button>
        </form>
      </div>
    </main>
  );
}
