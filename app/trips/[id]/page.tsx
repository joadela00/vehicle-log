import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/number";

export const revalidate = 0;

export default async function TripEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    select: {
      id: true,
      date: true,
      odoEnd: true,
      evRemainPct: true,
      hipassBalance: true,
      vehicle: { select: { model: true, plate: true } },
      driver: { select: { name: true } },
    },
  });

  if (!trip) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">✏️ 운행일지 수정</h1>
          <Link
            className="inline-flex shrink-0 items-center rounded-lg border border-red-200 bg-white px-3 py-2 hover:text-red-600"
            href="/trips"
          >
            📋 목록으로
          </Link>
        </div>

        <div className="mt-4 grid gap-2 rounded-2xl border border-red-100 bg-red-50/40 p-4 text-sm sm:text-base">
          <p>
            <b>날짜</b> {trip.date.toISOString().slice(0, 10)}
          </p>
          <p>
            <b>차량</b> {trip.vehicle ? `${trip.vehicle.model} / ${trip.vehicle.plate}` : "-"}
          </p>
          <p>
            <b>운전자</b> {trip.driver?.name ?? "-"}
          </p>
        </div>

        <form method="POST" action="/api/trips/update" className="mt-5 grid gap-4 rounded-2xl border border-red-100 bg-white/90 p-5 shadow-sm">
          <input type="hidden" name="id" value={trip.id} />

          <label className="grid gap-1">
            <span className="text-sm font-semibold sm:text-base">📍 최종 주행거리(누적 km)</span>
            <input
              name="odoEnd"
              required
              inputMode="numeric"
              defaultValue={trip.odoEnd}
              className="w-full rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold sm:text-base">🔋 전기 잔여(%)</span>
            <select
              name="evRemainPct"
              required
              defaultValue={String(trip.evRemainPct)}
              className="w-full rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
            >
              {[20, 40, 60, 80, 100].map((v) => (
                <option key={v} value={v}>
                  {v}%
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold sm:text-base">💳 하이패스 잔액(원)</span>
            <input
              name="hipassBalance"
              required
              inputMode="numeric"
              defaultValue={trip.hipassBalance}
              className="w-full rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
            />
          </label>

          <p className="text-xs text-gray-500 sm:text-sm">
            기존값: 주행거리 {formatNumber(trip.odoEnd)} km / 하이패스 {formatNumber(trip.hipassBalance)} 원
          </p>

          <button className="w-full rounded-2xl bg-red-600 px-4 py-3 text-base font-semibold text-white shadow-[0_10px_25px_rgba(220,38,38,0.35)] transition hover:bg-red-500 sm:w-auto">
            저장
          </button>
        </form>
      </section>
    </main>
  );
}
