import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CommaNumberInput from "@/components/comma-number-input";
import { formatNumber } from "@/lib/number";

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
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">🧾 운행일지 상세</h1>
          <Link
            href="/trips"
            className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm underline decoration-red-300 underline-offset-4 hover:text-red-600"
          >
            ⬅️ 목록으로
          </Link>
        </div>

        <div className="mt-5 space-y-2 rounded-2xl border border-red-100 bg-white/95 p-5 text-sm shadow-sm sm:text-base">
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
            <b>실제주행거리(km)</b>: {formatNumber(trip.distance)}
          </div>
          <div>
            <b>통행료(원)</b>: {formatNumber(trip.tollCost)}
          </div>
          <div>
            <b>하이패스 잔액</b>: {formatNumber(trip.hipassBalance)}
          </div>

          <form method="POST" action="/api/trips/update" className="mt-5 grid gap-4">
            <input type="hidden" name="id" value={trip.id} />

            <label className="grid gap-1">
              <span className="text-sm sm:text-base">계기판 최종 주행거리(누적 km)</span>
              <CommaNumberInput
                name="odoEnd"
                required
                defaultValue={trip.odoEnd}
                className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-sm sm:text-base">전기 잔여(%)</span>
              <select
                name="evRemainPct"
                required
                defaultValue={String(trip.evRemainPct)}
                className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
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
              <CommaNumberInput
                name="hipassBalance"
                required
                defaultValue={trip.hipassBalance}
                className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
              />
            </label>

            <button className="rounded bg-red-600 px-4 py-3 text-base font-semibold text-white">
              ✅ 수정 저장
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
