import Link from "next/link";
import { prisma } from "@/lib/prisma";

function monthRange(base = new Date()) {
  const y = base.getFullYear();
  const m = base.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 1);
  return { start, end };
}

export default async function AdminPage() {
  const { start, end } = monthRange();

  const [vehicles, totals, monthlyByVehicle, latestByVehicle, recentTrips] = await Promise.all([
    prisma.vehicle.findMany({ orderBy: { plate: "asc" } }),
    prisma.trip.aggregate({
      where: { date: { gte: start, lt: end } },
      _sum: { distance: true, tollCost: true },
      _count: true,
    }),
    prisma.trip.groupBy({
      by: ["vehicleId"],
      where: { date: { gte: start, lt: end } },
      _sum: { distance: true, tollCost: true },
      _count: true,
    }),
    prisma.trip.findMany({
      distinct: ["vehicleId"],
      orderBy: [{ vehicleId: "asc" }, { date: "desc" }, { createdAt: "desc" }],
      select: { vehicleId: true, date: true, evRemainPct: true, hipassBalance: true, odoEnd: true },
    }),
    prisma.trip.findMany({
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      take: 20,
      include: { vehicle: true, driver: true },
    }),
  ]);

  const monthlyByVehicleMap = new Map(monthlyByVehicle.map((item) => [item.vehicleId, item]));
  const latestByVehicleMap = new Map(latestByVehicle.map((item) => [item.vehicleId, item]));

  return (
    <main className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold">관리자 누적 (이번달)</h1>
      <p className="text-sm opacity-70 mt-1">
        기간: {start.toISOString().slice(0, 10)} ~ {new Date(end.getTime() - 1).toISOString().slice(0, 10)}
      </p>

      <div className="mt-5 grid gap-2">
        <div>이번달 운행 건수: <b>{totals._count}</b></div>
        <div>이번달 주행 합계: <b>{totals._sum.distance ?? 0}</b> km</div>
        <div>이번달 통행료 합계: <b>{totals._sum.tollCost ?? 0}</b> 원</div>
      </div>

      <h2 className="text-xl font-semibold mt-8">차량별</h2>
      <div className="overflow-x-auto mt-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">차량</th>
              <th className="text-right p-2">월 건수</th>
              <th className="text-right p-2">월 주행(km)</th>
              <th className="text-right p-2">월 통행료(원)</th>
              <th className="text-right p-2">최근 전기(%)</th>
              <th className="text-right p-2">최근 하이패스 잔액(원)</th>
              <th className="text-right p-2">최근 계기판(km)</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => {
              const agg = monthlyByVehicleMap.get(v.id);
              const latest = latestByVehicleMap.get(v.id);

              return (
                <tr key={v.id} className="border-b">
                  <td className="p-2">
                    <b>{v.model}</b> / {v.plate}
                    {latest?.date ? (
                      <div className="text-xs opacity-70">최근기록: {latest.date.toISOString().slice(0, 10)}</div>
                    ) : (
                      <div className="text-xs opacity-70">기록 없음</div>
                    )}
                  </td>
                  <td className="p-2 text-right">{agg?._count ?? 0}</td>
                  <td className="p-2 text-right">{agg?._sum.distance ?? 0}</td>
                  <td className="p-2 text-right">{agg?._sum.tollCost ?? 0}</td>
                  <td className="p-2 text-right">{latest?.evRemainPct ?? 0}</td>
                  <td className="p-2 text-right">{latest?.hipassBalance ?? 0}</td>
                  <td className="p-2 text-right">{latest?.odoEnd ?? 0}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="text-xl font-semibold mt-10">최근 운행일지 20건</h2>
      <div className="overflow-x-auto mt-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">날짜</th>
              <th className="text-left p-2">차량</th>
              <th className="text-left p-2">운전자</th>
              <th className="text-right p-2">주행(km)</th>
              <th className="text-right p-2">통행료(원)</th>
              <th className="text-right p-2">전기(%)</th>
              <th className="text-right p-2">하이패스(원)</th>
              <th className="text-left p-2">메모</th>
            </tr>
          </thead>
          <tbody>
            {recentTrips.map((t) => (
              <tr key={t.id} className="border-b">
                <td className="p-2">{t.date.toISOString().slice(0, 10)}</td>
                <td className="p-2">{t.vehicle.model} / {t.vehicle.plate}</td>
                <td className="p-2">{t.driver.name}</td>
                <td className="p-2 text-right">{t.distance}</td>
                <td className="p-2 text-right">{t.tollCost}</td>
                <td className="p-2 text-right">{t.evRemainPct}</td>
                <td className="p-2 text-right">{t.hipassBalance}</td>
                <td className="p-2">{t.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6">
        <Link className="underline" href="/">입력으로</Link>
      </p>
    </main>
  );
}
