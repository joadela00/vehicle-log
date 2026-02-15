import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string; from?: string; to?: string; saved?: string }>;
}) {
  const params = await searchParams;

  const saved = params?.saved === "1";
  const vehicleId = params?.vehicleId || "";

  const from = params?.from
    ? new Date(params.from + "T00:00:00")
    : undefined;

  const to = params?.to
    ? new Date(params.to + "T23:59:59")
    : undefined;

  const vehicles = await prisma.vehicle.findMany({
    orderBy: { plate: "asc" },
  });

  // 필터 조건 만들기
  const where: { vehicleId?: string; date?: { gte?: Date; lte?: Date } } = {};

  if (vehicleId) {
    where.vehicleId = vehicleId;
  }

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = from;
    if (to) where.date.lte = to;
  }

  const trips = await prisma.trip.findMany({
    where,
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: { vehicle: true, driver: true },
  });

  const totalDistance = trips.reduce((sum, t) => sum + t.distance, 0);
  const totalToll = trips.reduce((sum, t) => sum + t.tollCost, 0);

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold">운행일지 전체 목록</h1>


      {saved ? (
        <p className="mt-4 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-700">
          수정 저장이 완료되었습니다.
        </p>
      ) : null}

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

        <button className="bg-black text-white rounded px-4 py-2">
          검색
        </button>
      </form>

      <div className="mt-4">
        <div>총 주행거리: <b>{totalDistance}</b> km</div>
        <div>총 통행료: <b>{totalToll}</b> 원</div>
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
                <td className="p-2">{t.vehicle.model} / {t.vehicle.plate}</td>
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
                    <button className="text-red-600 underline">
                      삭제
                    </button>
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
