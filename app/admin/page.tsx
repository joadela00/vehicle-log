import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/number";

function monthRange(base = new Date()) {
  const year = base.getFullYear();
  const month = base.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);
  return { start, end };
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get("admin_ok")?.value === "1";
  if (!authed) redirect("/admin-login");

  const { start, end } = monthRange();
  const periodStart = start.toISOString().slice(0, 10);
  const periodEnd = new Date(end.getTime() - 1).toISOString().slice(0, 10);

  const vehicles = await prisma.vehicle.findMany({ orderBy: { plate: "asc" } });

  const totals = await prisma.trip.aggregate({
    where: { date: { gte: start, lt: end } },
    _sum: { distance: true, tollCost: true },
    _count: true,
  });

  const byVehicle = await Promise.all(
    vehicles.map(async (vehicle) => {
      const [agg, latest] = await Promise.all([
        prisma.trip.aggregate({
          where: { vehicleId: vehicle.id, date: { gte: start, lt: end } },
          _sum: { distance: true, tollCost: true },
          _count: true,
        }),
        prisma.trip.findFirst({
          where: { vehicleId: vehicle.id },
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
          select: {
            date: true,
            evRemainPct: true,
            hipassBalance: true,
            odoEnd: true,
          },
        }),
      ]);

      return { v: vehicle, agg, latest };
    }),
  );

  const recentTrips = await prisma.trip.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 20,
    include: { vehicle: true, driver: true },
  });

  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">📊 관리자 대시보드</h1>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              기간: {periodStart} ~ {periodEnd}
            </p>
          </div>

          <Link
            className="inline-flex shrink-0 items-center rounded-lg border border-red-200 bg-white px-3 py-2 hover:text-red-600"
            href="/"
          >
            🏠 홈으로
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
          <div className="rounded-2xl border border-red-100 bg-white/95 px-3 py-3 text-sm shadow-sm sm:text-base">
            이번달 운행 건수: <b>{totals._count}</b> 회
          </div>
          <div className="rounded-2xl border border-red-100 bg-white/95 px-3 py-3 text-sm shadow-sm sm:text-base">
            이번달 주행 합계: <b>{formatNumber(totals._sum.distance)}</b> km
          </div>
          <div className="rounded-2xl border border-red-100 bg-white/95 px-3 py-3 text-sm shadow-sm sm:text-base">
            이번달 통행료 합계: <b>{formatNumber(totals._sum.tollCost)}</b> 원
          </div>
        </div>

        <h2 className="mt-8 text-lg font-semibold sm:text-xl">🚘 차량별 현황</h2>
        <div className="mt-2 overflow-x-auto rounded-2xl border border-red-100 bg-white">
          <table className="w-full min-w-[900px] border-collapse text-sm sm:text-base">
            <thead>
              <tr className="border-b bg-[#f5f5f7]">
                <th className="p-2 text-left whitespace-nowrap">차량</th>
                <th className="p-2 text-right whitespace-nowrap">월 건수</th>
                <th className="p-2 text-right whitespace-nowrap">월 주행(km)</th>
                <th className="p-2 text-right whitespace-nowrap">월 통행료(원)</th>
                <th className="p-2 text-right whitespace-nowrap">최근 전기(%)</th>
                <th className="p-2 text-right whitespace-nowrap">
                  최근 하이패스 잔액(원)
                </th>
                <th className="p-2 text-right whitespace-nowrap">최근 계기판(km)</th>
              </tr>
            </thead>
            <tbody>
              {byVehicle.map(({ v, agg, latest }) => (
                <tr key={v.id} className="border-b align-top last:border-b-0">
                  <td className="p-2 whitespace-nowrap">
                    <b>{v.model}</b> / {v.plate}
                    {latest?.date ? (
                      <div className="text-xs text-gray-500">
                        최근기록: {latest.date.toISOString().slice(0, 10)}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">기록 없음</div>
                    )}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {formatNumber(agg._count)}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {formatNumber(agg._sum.distance)}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {formatNumber(agg._sum.tollCost)}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {formatNumber(latest?.evRemainPct)}%
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {formatNumber(latest?.hipassBalance)}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {formatNumber(latest?.odoEnd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-lg font-semibold sm:text-xl">
          🕒 최근 운행일지 20건
        </h2>
        <div className="mt-2 overflow-x-auto rounded-2xl border border-red-100 bg-white">
          <table className="w-full min-w-[980px] border-collapse text-sm sm:text-base">
            <thead>
              <tr className="border-b bg-[#f5f5f7]">
                <th className="p-2 text-left whitespace-nowrap">날짜</th>
                <th className="p-2 text-left whitespace-nowrap">차량</th>
                <th className="p-2 text-left whitespace-nowrap">운전자</th>
                <th className="p-2 text-right whitespace-nowrap">주행(km)</th>
                <th className="p-2 text-right whitespace-nowrap">통행료(원)</th>
                <th className="p-2 text-right whitespace-nowrap">전기(%)</th>
                <th className="p-2 text-right whitespace-nowrap">하이패스(원)</th>
                <th className="p-2 text-left whitespace-nowrap">메모</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((t) => (
                <tr key={t.id} className="border-b align-top last:border-b-0">
                  <td className="p-2 whitespace-nowrap">
                    {t.date.toISOString().slice(0, 10)}
                  </td>
                  <td className="p-2 whitespace-nowrap">
                    {t.vehicle.model} / {t.vehicle.plate}
                  </td>
                  <td className="p-2 whitespace-nowrap">{t.driver.name}</td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {formatNumber(t.distance)}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {formatNumber(t.tollCost)}
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {formatNumber(t.evRemainPct)}%
                  </td>
                  <td className="p-2 text-right whitespace-nowrap">
                    {formatNumber(t.hipassBalance)}
                  </td>
                  <td className="max-w-[280px] p-2">{t.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
