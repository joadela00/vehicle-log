import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function monthRange(base = new Date()) {
  const y = base.getFullYear();
  const m = base.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 1);
  return { start, end };
}

export default async function AdminPage() {
  // ✅ Next.js 16 환경에서 cookies()가 Promise로 잡히는 케이스 대응
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
      <h1 className="text-xl font-bold sm:text-2xl">관리자 누적 (이번달)</h1>
      <p className="mt-1 text-xs opacity-70 sm:text-sm">
        기간: {start.toISOString().slice(0, 10)} ~ {new Date(end.getTime() - 1).toISOString().slice(0, 10)}
      </p>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        <div className="rounded border px-3 py-3 text-sm sm:text-base">
          이번달 운행 건수: <b>{totals._count}</b>
        </div>
        <div className="rounded border px-3 py-3 text-sm sm:text-base">
          이번달 주행 합계: <b>{totals._sum.distance ?? 0}</b> km
        </div>
        <div className="rounded border px-3 py-3 text-sm sm:text-base">
          이번달 통행료 합계: <b>{totals._sum.tollCost ?? 0}</b> 원
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold sm:text-xl">차량별</h2>
      <div className="mt-2 overflow-x-auto rounded border">
        <table className="w-full min-w-[900px] border-collapse text-sm sm:text-base">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-white/5">
              <th className="p-2 text-left whitespace-nowrap">차량</th>
              <th className="p-2 text-right whitespace-nowrap">월 건수</th>
              <th className="p-2 text-right whitespace-nowrap">월 주행(km)</th>
              <th className="p-2 text-right whitespace-nowrap">월 통행료(원)</th>
              <th className="p-2 text-right whitespace-nowrap">최근 전기(%)</th>
              <th className="p-2 text-right whitespace-nowrap">최근 하이패스 잔액(원)</th>
              <th className="p-2 text-right whitespace-nowrap">최근 계기판(km)</th>
            </tr>
          </thead>
          <tbody>
            {byVehicle.map(({ v, agg, latest }) => (
              <tr key={v.id} className="border-b align-top">
                <td className="p-2 whitespace-nowrap">
                  <b>{v.model}</b> / {v.plate}
                  {latest?.date ? (
                    <div className="text-xs opacity-70">최근기록: {latest.date.toISOString().slice(0, 10)}</div>
                  ) : (
                    <div className="text-xs opacity-70">기록 없음</div>
                  )}
                </td>
                <td className="p-2 text-right whitespace-nowrap">{agg._count ?? 0}</td>
                <td className="p-2 text-right whitespace-nowrap">{agg._sum.distance ?? 0}</td>
                <td className="p-2 text-right whitespace-nowrap">{agg._sum.tollCost ?? 0}</td>
                <td className="p-2 text-right whitespace-nowrap">{latest?.evRemainPct ?? 0}</td>
                <td className="p-2 text-right whitespace-nowrap">{latest?.hipassBalance ?? 0}</td>
                <td className="p-2 text-right whitespace-nowrap">{latest?.odoEnd ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-lg font-semibold sm:text-xl">최근 운행일지 20건</h2>
      <div className="mt-2 overflow-x-auto rounded border">
        <table className="w-full min-w-[980px] border-collapse text-sm sm:text-base">
          <thead>
            <tr className="border-b bg-gray-50 dark:bg-white/5">
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
              <tr key={t.id} className="border-b align-top">
                <td className="p-2 whitespace-nowrap">{t.date.toISOString().slice(0, 10)}</td>
                <td className="p-2 whitespace-nowrap">
                  {t.vehicle.model} / {t.vehicle.plate}
                </td>
                <td className="p-2 whitespace-nowrap">{t.driver.name}</td>
                <td className="p-2 text-right whitespace-nowrap">{t.distance}</td>
                <td className="p-2 text-right whitespace-nowrap">{t.tollCost}</td>
                <td className="p-2 text-right whitespace-nowrap">{t.evRemainPct}</td>
                <td className="p-2 text-right whitespace-nowrap">{t.hipassBalance}</td>
                <td className="max-w-[280px] p-2">{t.note ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6">
        <Link className="underline" href="/">
          입력으로
        </Link>
      </p>
    </main>
  );
}
