import Link from "next/link";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string; from?: string; to?: string; limit?: string }>;
}) {
  const params = await searchParams;

  const vehicleId = params?.vehicleId || "";
  const limit = Math.min(Math.max(Number(params?.limit || 100), 20), 500); // 기본 100건, 최소 20, 최대 500

  const from = params?.from ? new Date(params.from + "T00:00:00") : undefined;
  const to = params?.to ? new Date(params.to + "T23:59:59") : undefined;

  const vehicles = await prisma.vehicle.findMany({ orderBy: { plate: "asc" } });

  const where: Prisma.TripWhereInput = {};

  if (vehicleId) where.vehicleId = vehicleId;

  if (from || to) {
    // Prisma DateTimeFilter 형태로 맞추기
    where.date = {
      ...(from ? { gte: from } : {}),
      ...(to ? { lte: to } : {}),
    };
  }

  // ✅ 최근 N건만 가져오기 + 필요한 필드만 select (속도 크게 개선)
  const trips = await prisma.trip.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: limit,
    select: {
      id: true,
      date: true,
      distance: true,
      tollCost: true,
      evRemainPct: true,
      hipassBalance: true,
      note: true,
      vehicle: { select: { model: true, plate: true } },
      driver: { select: { name: true } },
    },
  });

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold">운행일지 목록 (최근 {limit}건)</h1>

      <form method="GET" className="mt-4 flex flex-wrap gap-3 items-end">
        <div className="grid gap-1">
          <span className="text-sm opacity-70">차량</span>
          <select name="vehicleId" defaultValue={vehicleId} className="border rounded px-3 py-2">
            <option value="">전체 차량</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.model} / {v.plate}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-1">
          <span className="text-sm opacity-70">From</span>
          <input type="date" name="from" defaultValue={params?.from} className="border rounded px-3 py-2" />
        </div>

        <div className="grid gap-1">
          <span className="text-sm opacity-70">To</span>
          <input type="date" name="to" defaultValue={params?.to} className="border rounded px-3 py-2" />
        </div>

        <div className="grid gap-1">
          <span className="text-sm opacity-70">표시 개수</span>
          <select name="limit" defaultValue={String(limit)} className="border rounded px-3 py-2">
            {[50, 100, 200, 500].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <button className="bg-black text-white rounded px-4 py-2">검색</button>

        <Link className="underline text-sm ml-auto" href="/admin">
          관리자
        </Link>
        <Link className="underline text-sm" href="/">
          입력
        </Link>
      </form>

      <div className="overflow-x-auto mt-6">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">날짜</th>
              <th className="p-2 text-left">차량</th>
              <th className="p-2 text-left">운전자</th>
              <th className="p-2 text-right">주행(km)</th>
              <th className="p-2 text-right">통행료</th>
              <th className="p-2 text-right">전기(%)</th>
              <th className="p-2 text-right">하이패스</th>
              <th className="p-2 text-left">메모</th>
              <th className="p-2 text-right">수정</th>
              <th className="p-2 text-right">삭제</th>
            </tr>
          </thead>

          <tbody>
            {trips.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-2">{t.date.toISOString().slice(0, 10)}</td>
                <td className="p-2">
                  {t.vehicle.model} / {t.vehicle.plate}
                </td>
                <td className="p-2">{t.driver.name}</td>
                <td className="p-2 text-right">{t.distance}</td>
                <td className="p-2 text-right">{t.tollCost}</td>
                <td className="p-2 text-right">{t.evRemainPct}</td>
                <td className="p-2 text-right">{t.hipassBalance}</td>
                <td className="p-2">{t.note ?? ""}</td>

                <td className="p-2 text-right">
                  <Link href={`/trips/${t.id}`} className="text-blue-600 underline">
                    수정
                  </Link>
                </td>

                <td className="p-2 text-right">
                  <form method="POST" action="/api/trips/delete">
                    <input type="hidden" name="id" value={t.id} />
                    <button className="text-red-600 underline">삭제</button>
                  </form>
                </td>
              </tr>
            ))}

            {trips.length === 0 ? (
              <tr>
                <td className="p-4 opacity-70" colSpan={10}>
                  조건에 맞는 기록이 없습니다.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
