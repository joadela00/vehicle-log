import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/number";

function monthRange(base = new Date()) {
  const y = base.getFullYear();
  const m = base.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 1);
  return { start, end };
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = cookieStore.get("admin_ok")?.value === "1";
  if (!authed) redirect("/admin-login");

  const { start, end } = monthRange();

  const vehicles = await prisma.vehicle.findMany({ orderBy: { plate: "asc" } });

  const totals = await prisma.trip.aggregate({
    where: { date: { gte: start, lt: end } },
    _sum: { distance: true, tollCost: true },
    _count: true,
  });

  const byVehicle = await Promise.all(
    vehicles.map(async (v) => {
      const [agg, latest] = await Promise.all([
        prisma.trip.aggregate({
          where: { vehicleId: v.id, date: { gte: start, lt: end } },
          _sum: { distance: true, tollCost: true },
          _count: true,
        }),
        prisma.trip.findFirst({
          where: { vehicleId: v.id },
          orderBy: [{ date: "desc" }, { createdAt: "desc" }],
          select: {
            date: true,
            evRemainPct: true,
            hipassBalance: true,
            odoEnd: true,
          },
        }),
      ]);

      return { v, agg, latest };
    })
  );

  const recentTrips = await prisma.trip.findMany({
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 20,
    include: { vehicle: true, driver: true },
  });

  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-[0_15px_45px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-wider text-red-500">ADMIN DASHBOARD</p>
            <h1 className="text-xl font-bold sm:text-2xl">📊 관리자 대시보드</h1>
          </div>
          <p className="text-xs text-gray-500 sm:text-sm">
            기간: {start.toISOString().slice(0, 10)} ~ {new Date(end.getTime() - 1).toISOString().slice(0, 10)}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-red-100 bg-gradient-to-b from-[#f8f8fa] to-white px-4 py-4">
            <p className="text-sm text-gray-500">이번달 운행 건수</p>
            <b className="mt-1 block text-2xl text-red-600">{formatNumber(totals._count)}건</b>
          </div>
          <div className="rounded-2xl border border-red-100 bg-gradient-to-b from-[#f8f8fa] to-white px-4 py-4">
            <p className="text-sm text-gray-500">이번달 주행 합계</p>
            <b className="mt-1 block text-2xl text-red-600">{formatNumber(totals._sum.distance)} km</b>
          </div>
          <div className="rounded-2xl border border-red-100 bg-gradient-to-b from-[#f8f8fa] to-white px-4 py-4">
            <p className="text-sm text-gray-500">이번달 통행료 합계</p>
            <b className="mt-1 block text-2xl text-red-600">{formatNumber(totals._sum.tollCost)} 원</b>
          </div>
        </div>

        <h2 className="mt-8 text-lg font-semibold sm:text-xl">🚘 차량별 현황</h2>
        <div className="mt-2 overflow-x-auto rounded-2xl border border-red-100 bg-white">
          <table className="w-full min-w-[900px] border-separate border-spacing-0 text-sm sm:text-base">
            <thead>
              <tr className="bg-[#f7f7f9] text-gray-700">
                <th className="sticky left-0 z-10 border-b border-red-100 bg-[#f7f7f9] p-3 text-left">차량</th>
                <th className="border-b border-red-100 p-3 text-right">월 건수</th>
                <th className="border-b border-red-100 p-3 text-right">월 주행(km)</th>
                <th className="border-b border-red-100 p-3 text-right">월 통행료(원)</th>
                <th className="border-b border-red-100 p-3 text-right">최근 전기(%)</th>
                <th className="border-b border-red-100 p-3 text-right">최근 하이패스 잔액(원)</th>
                <th className="border-b border-red-100 p-3 text-right">최근 계기판(km)</th>
              </tr>
            </thead>
            <tbody>
              {byVehicle.map(({ v, agg, latest }, idx) => (
                <tr key={v.id} className={idx % 2 ? "bg-[#fcfcfd]" : "bg-white"}>
                  <td className="sticky left-0 z-[1] border-b border-red-50 p-3 whitespace-nowrap">
                    <b>{v.model}</b> / {v.plate}
                    <div className="text-xs text-gray-500">
                      {latest?.date ? `최근기록: ${latest.date.toISOString().slice(0, 10)}` : "기록 없음"}
                    </div>
                  </td>
                  <td className="border-b border-red-50 p-3 text-right whitespace-nowrap">{formatNumber(agg._count)}</td>
                  <td className="border-b border-red-50 p-3 text-right whitespace-nowrap">{formatNumber(agg._sum.distance)}</td>
                  <td className="border-b border-red-50 p-3 text-right whitespace-nowrap">{formatNumber(agg._sum.tollCost)}</td>
                  <td className="border-b border-red-50 p-3 text-right whitespace-nowrap">{formatNumber(latest?.evRemainPct)}%</td>
                  <td className="border-b border-red-50 p-3 text-right whitespace-nowrap">{formatNumber(latest?.hipassBalance)}</td>
                  <td className="border-b border-red-50 p-3 text-right whitespace-nowrap">{formatNumber(latest?.odoEnd)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="mt-10 text-lg font-semibold sm:text-xl">🕒 최근 운행일지 20건</h2>
        <div className="mt-2 overflow-x-auto rounded-2xl border border-red-100 bg-white">
          <table className="w-full min-w-[980px] border-separate border-spacing-0 text-sm sm:text-base">
            <thead>
              <tr className="bg-[#f7f7f9] text-gray-700">
                <th className="border-b border-red-100 p-3 text-left">날짜</th>
                <th className="border-b border-red-100 p-3 text-left">차량</th>
                <th className="border-b border-red-100 p-3 text-left">운전자</th>
                <th className="border-b border-red-100 p-3 text-right">주행(km)</th>
                <th className="border-b border-red-100 p-3 text-right">통행료(원)</th>
                <th className="border-b border-red-100 p-3 text-right">전기(%)</th>
                <th className="border-b border-red-100 p-3 text-right">하이패스(원)</th>
                <th className="border-b border-red-100 p-3 text-left">메모</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((t, idx) => (
                <tr key={t.id} className={idx % 2 ? "bg-[#fcfcfd]" : "bg-white"}>
                  <td className="border-b border-red-50 p-3 whitespace-nowrap">{t.date.toISOString().slice(0, 10)}</td>
                  <td className="border-b border-red-50 p-3 whitespace-nowrap">
                    {t.vehicle.model} / {t.vehicle.plate}
                  </td>
                  <td className="border-b border-red-50 p-3 whitespace-nowrap">{t.driver.name}</td>
                  <td className="border-b border-red-50 p-3 text-right whitespace-nowrap">{formatNumber(t.distance)}</td>
                  <td className="border-b border-red-50 p-3 text-right whitespace-nowrap">{formatNumber(t.tollCost)}</td>
                  <td className="border-b border-red-50 p-3 text-right whitespace-nowrap">{formatNumber(t.evRemainPct)}%</td>
                  <td className="border-b border-red-50 p-3 text-right whitespace-nowrap">{formatNumber(t.hipassBalance)}</td>
                  <td className="max-w-[280px] border-b border-red-50 p-3">{t.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6">
          <Link className="inline-flex rounded-xl border border-red-200 px-3 py-2 hover:text-red-600" href="/">
            ⬅️ 입력으로
          </Link>
        </p>
      </section>
    </main>
  );
}
