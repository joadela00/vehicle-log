import Link from "next/link";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 50;

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string; from?: string; to?: string; page?: string }>;
}) {
  const params = await searchParams;

  const vehicleId = params?.vehicleId || "";
  const page = Math.max(1, Number(params?.page || "1") || 1);

  const from = params?.from ? new Date(params.from + "T00:00:00") : undefined;
  const to = params?.to ? new Date(params.to + "T23:59:59") : undefined;

  const where: Prisma.TripWhereInput = {};

  if (vehicleId) {
    where.vehicleId = vehicleId;
  }

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) where.date.lte = to;
  }

  const [vehicles, totals, totalCount, trips] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { plate: "asc" } }),
    prisma.trip.aggregate({
      where,
      _sum: { distance: true, tollCost: true },
    }),
    prisma.trip.count({ where }),
    prisma.trip.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
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
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const makePageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (vehicleId) query.set("vehicleId", vehicleId);
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    query.set("page", String(nextPage));
    return `/trips?${query.toString()}`;
  };

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold">운행일지 전체 목록</h1>

      <form method="GET" className="mt-4 flex flex-wrap gap-3">
        <select
          name="vehicleId"
          defaultValue={vehicleId}
          className="border rounded px-3 py-2"
        >
          <option value="">전체 차량</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.model} / {v.plate}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="from"
          defaultValue={params?.from}
          className="border rounded px-3 py-2"
        />

        <input
          type="date"
          name="to"
          defaultValue={params?.to}
          className="border rounded px-3 py-2"
        />

        <button className="bg-black text-white rounded px-4 py-2">검색</button>
      </form>

      <div className="mt-4">
        <div>
          총 주행거리: <b>{totals._sum.distance ?? 0}</b> km
        </div>
        <div>
          총 통행료: <b>{totals._sum.tollCost ?? 0}</b> 원
        </div>
        <div>
          조회 건수: <b>{totalCount}</b>건 (페이지당 {PAGE_SIZE}건)
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm">
        <span>
          페이지 <b>{page}</b> / {totalPages}
        </span>
        {page > 1 ? (
          <Link className="underline" href={makePageHref(page - 1)}>
            이전
          </Link>
        ) : (
          <span className="opacity-40">이전</span>
        )}
        {page < totalPages ? (
          <Link className="underline" href={makePageHref(page + 1)}>
            다음
          </Link>
        ) : (
          <span className="opacity-40">다음</span>
        )}
      </div>

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
          </tbody>
        </table>
      </div>
    </main>
  );
}
