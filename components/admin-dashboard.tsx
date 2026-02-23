import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/number";
import { getBranchOptions, MAIN_BRANCH_CODE } from "@/lib/branches";

const ALL_BRANCH_CODE = "__ALL__";

function monthRange(base = new Date()) {
  const y = base.getFullYear();
  const m = base.getMonth();
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 1);
  return { start, end };
}

function daysBetween(a: Date, b: Date) {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export default async function AdminDashboard({
  branchCode,
  rt = "month",
  startDate,
  endDate,
}: {
  branchCode: string;
  rt?: string; // "month" | "7d" | "all"
  startDate?: string;
  endDate?: string;
}) {
  const cookieStore = await cookies();
  const authed = cookieStore.get("admin_ok")?.value === "1";
  if (!authed) redirect("/admin-login");

  const showAll = branchCode === ALL_BRANCH_CODE;

  const branches = await getBranchOptions();
  const mainBranchLabel = "지역본부";
  const mainBranch = branches.find((b) => b.code === MAIN_BRANCH_CODE);
  const others = branches.filter((b) => b.code !== MAIN_BRANCH_CODE);

  let currentName = "전체";
  if (!showAll) {
    const branchInfo = await prisma.vehicle.findFirst({
      where: { branchCode },
      select: { branchName: true },
    });
    if (!branchInfo) redirect("/admin");
    currentName = branchInfo.branchName;
  }

  const selectedLabel = showAll
    ? "전체"
    : branchCode === MAIN_BRANCH_CODE
      ? mainBranchLabel
      : currentName;

  const now = new Date();
  const { start: monthStart, end: monthEnd } = monthRange();

  const isValidDateString = (value?: string) =>
    !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00`).getTime());

  const resolvedPeriodStart = isValidDateString(startDate)
    ? new Date(`${startDate}T00:00:00`)
    : monthStart;
  const resolvedPeriodEndExclusive = isValidDateString(endDate)
    ? new Date(new Date(`${endDate}T00:00:00`).getTime() + 24 * 60 * 60 * 1000)
    : monthEnd;

  const periodStart = resolvedPeriodStart.toISOString().slice(0, 10);
  const periodEnd = new Date(resolvedPeriodEndExclusive.getTime() - 1).toISOString().slice(0, 10);

  // ✅ 최근 운행일지 필터(rt)
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentTripDateFilter =
    rt === "month"
      ? { date: { gte: resolvedPeriodStart, lt: resolvedPeriodEndExclusive } }
      : rt === "7d"
        ? { date: { gte: sevenDaysAgo } }
        : {};

  // ✅ 기간내 totals
  const totalsWhere = showAll
    ? { date: { gte: resolvedPeriodStart, lt: resolvedPeriodEndExclusive } }
    : { date: { gte: resolvedPeriodStart, lt: resolvedPeriodEndExclusive }, vehicle: { branchCode } };

  const totals = await prisma.trip.aggregate({
    where: totalsWhere,
    _sum: { distance: true, tollCost: true },
    _count: true,
  });

  // ✅ 차량 목록
  const vehicleWhere = showAll ? {} : { branchCode };
  const vehicles = await prisma.vehicle.findMany({
    where: vehicleWhere,
    orderBy: [{ branchCode: "asc" }, { plate: "asc" }],
  });

  // ✅ 차량별(기간내 집계 + 최신 기록)
  const byVehicle = await Promise.all(
    vehicles.map(async (vehicle) => {
      const [agg, latest] = await Promise.all([
        prisma.trip.aggregate({
          where: { vehicleId: vehicle.id, date: { gte: resolvedPeriodStart, lt: resolvedPeriodEndExclusive } },
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

      const staleDays = latest?.date ? daysBetween(now, latest.date) : null;
      return { v: vehicle, agg, latest, staleDays };
    }),
  );

  const totalStaleVehicles = byVehicle.filter(
    ({ latest, staleDays }) => !latest?.date || (typeof staleDays === "number" && staleDays >= 30),
  ).length;

  // ✅ 최근 운행일지 20건
  const recentTrips = await prisma.trip.findMany({
    where: showAll
      ? { ...recentTripDateFilter }
      : { ...recentTripDateFilter, vehicle: { branchCode } },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: 20,
    include: { vehicle: true, driver: true },
  });

  // ✅ 전체 화면: 지사별 요약 + 운행저조(30일+) 차량 수
  const staleCutoff = new Date(now);
  staleCutoff.setDate(staleCutoff.getDate() - 30);

  const branchMonthlySummary = showAll
    ? await Promise.all(
        branches.map(async (b) => {
          const monthAgg = await prisma.trip.aggregate({
            where: { date: { gte: resolvedPeriodStart, lt: resolvedPeriodEndExclusive }, vehicle: { branchCode: b.code } },
            _sum: { distance: true, tollCost: true },
            _count: true,
          });

          const vehiclesInBranch = await prisma.vehicle.findMany({
            where: { branchCode: b.code },
            select: { id: true },
          });

          const vehicleIds = vehiclesInBranch.map((v) => v.id);
          const vehicleCount = vehicleIds.length;

          const latestByVehicle =
            vehicleIds.length === 0
              ? []
              : await prisma.trip.groupBy({
                  by: ["vehicleId"],
                  where: { vehicleId: { in: vehicleIds } },
                  _max: { date: true },
                });

          const latestMap = new Map<string, Date>();
          for (const row of latestByVehicle) {
            const d = row._max.date;
            if (d) latestMap.set(row.vehicleId, d);
          }

          let staleCount = 0;
          for (const vid of vehicleIds) {
            const last = latestMap.get(vid);
            if (!last || last < staleCutoff) staleCount += 1;
          }

          return {
            code: b.code,
            name: b.name,
            vehicleCount,
            staleCount,
            count: monthAgg._count,
            distance: monthAgg._sum.distance ?? 0,
            toll: monthAgg._sum.tollCost ?? 0,
          };
        }),
      )
    : [];

  const totalStaleBranches = branchMonthlySummary.reduce((acc, b) => acc + b.staleCount, 0);

  const adminPath = showAll ? "/admin" : `/admin/${branchCode}`;

  const makeHref = (base: string, nextRt?: string, overrides?: { start?: string; end?: string }) => {
    const p = new URLSearchParams();
    const nrt = (nextRt ?? rt ?? "month").trim();
    if (nrt && nrt !== "month") p.set("rt", nrt);

    const nextStart = overrides?.start ?? periodStart;
    const nextEnd = overrides?.end ?? periodEnd;

    if (nextStart) p.set("start", nextStart);
    if (nextEnd) p.set("end", nextEnd);

    const qs = p.toString();
    return qs ? `${base}?${qs}` : base;
  };

const homeHref = "/";

  const activeClass = "border-red-500 bg-red-600 text-white";
  const normalClass = "border-red-200 bg-white hover:text-red-600";

  // ✅ 더 컴팩트한 토글 버튼
  const togglePill =
    "shrink-0 rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium hover:border-red-300 hover:bg-red-50 hover:text-red-600";

  const infoChip = (danger: boolean) =>
    `rounded-lg border px-2 py-1 text-xs font-medium ${
      danger ? "border-red-200 bg-red-50 text-red-700" : "border-gray-200 bg-gray-50 text-gray-700"
    }`;

  // ✅ “전체 화면”에서만 접히는 섹션의 summary
  const renderSummaryRow = (
    title: string,
    monthCount: number,
    staleCount: number,
    showStats = true,
  ) => (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-lg font-semibold sm:text-xl">{title}</div>
        {showStats ? (
          <div className="mt-1 flex flex-wrap gap-2">
            <span className={infoChip(false)}>기간내 {formatNumber(monthCount)}회</span>
            <span className={infoChip(staleCount > 0)}>운행저조 {formatNumber(staleCount)}대</span>
          </div>
        ) : null}
      </div>
      <span className={togglePill}>
        <span className="group-open:hidden">보기</span>
        <span className="hidden group-open:inline">닫기</span>
      </span>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">📊 관리자 대시보드</h1>
            <p className="mt-2 text-xs text-gray-500 sm:text-sm">
              기간: {periodStart} ~ {periodEnd}
            </p>
          </div>

          <Link
            className="inline-flex shrink-0 items-center rounded-lg border border-red-200 bg-white px-3 py-2 hover:text-red-600"
            href={homeHref}
          >
            🏠 홈으로
          </Link>
        </div>

        <form method="GET" className="mt-4 flex flex-wrap items-end gap-2 rounded-2xl border border-red-100 bg-white p-3">
          <input type="hidden" name="rt" value={rt} />
          <label className="grid gap-1 text-xs text-gray-600">
            <span>시작일</span>
            <input name="start" type="date" defaultValue={periodStart} className="rounded-lg border border-red-200 px-2 py-1.5 text-sm" />
          </label>
          <label className="grid gap-1 text-xs text-gray-600">
            <span>종료일</span>
            <input name="end" type="date" defaultValue={periodEnd} className="rounded-lg border border-red-200 px-2 py-1.5 text-sm" />
          </label>
          <button className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-red-50" type="submit">
            기간 적용
          </button>
        </form>

        {/* 지사 선택 */}
        <details className="group mt-4 rounded-2xl border border-red-100 bg-white">
         <summary className="cursor-pointer list-none px-3 py-3">
  <div className="flex items-center gap-2">
    <div className="min-w-0 flex-1 rounded-xl border border-red-200 bg-white px-3 py-2 text-left text-sm font-semibold text-gray-900">
      <span className="block truncate">{selectedLabel}</span>
    </div>

    <div className="inline-flex items-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-red-50">
      <span className="group-open:hidden">변경</span>
      <span className="hidden group-open:inline">닫기</span>
    </div>
  </div>
</summary>

          <div className="border-t border-red-100 p-3">
            <div className="flex flex-wrap gap-2 text-sm">
              <Link
                className={`rounded-lg border px-2 py-1 ${showAll ? activeClass : normalClass}`}
                href={makeHref("/admin")}
              >
                전체
              </Link>

              {mainBranch ? (
                <Link
                  className={`rounded-lg border px-2 py-1 ${
                    !showAll && branchCode === MAIN_BRANCH_CODE ? activeClass : normalClass
                  }`}
                  href={makeHref(`/admin/${MAIN_BRANCH_CODE}`)}
                >
                  {mainBranchLabel}
                </Link>
              ) : null}

              {others.map((branch) => (
                <Link
                  key={branch.code}
                  className={`rounded-lg border px-2 py-1 ${
                    !showAll && branch.code === branchCode ? activeClass : normalClass
                  }`}
                  href={makeHref(`/admin/${branch.code}`)}
                >
                  {branch.name}
                </Link>
              ))}
            </div>
          </div>
        </details>

        {/* KPI */}
<div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
  <div className="rounded-2xl border border-red-100 bg-white px-3 py-2 shadow-sm">
    <div className="text-[11px] text-gray-500">기간내 운행</div>
    <div className="mt-0.5 text-base font-bold sm:text-lg">
      {formatNumber(totals._count)} 회
    </div>
  </div>

  <div className="rounded-2xl border border-red-100 bg-white px-3 py-2 shadow-sm">
    <div className="text-[11px] text-gray-500">기간내 주행</div>
    <div className="mt-0.5 text-base font-bold sm:text-lg">
      {formatNumber(totals._sum.distance)} km
    </div>
  </div>

  <div className="rounded-2xl border border-red-100 bg-white px-3 py-2 shadow-sm">
    <div className="text-[11px] text-gray-500">기간내 통행료</div>
    <div className="mt-0.5 text-base font-bold sm:text-lg">
      {formatNumber(totals._sum.tollCost)} 원
    </div>
  </div>
</div>

        {/* ✅ 전체에서만 접힘 / 지역본부(0230) 포함 지사 선택 시에는 접지 않고 아래 “차량별 현황”은 항상 표시 */}
        {showAll ? (
          <details className="group mt-6 rounded-2xl border border-red-100 bg-white">
            <summary className="cursor-pointer list-none px-4 py-3">
              {renderSummaryRow("🏢 지사별 기간 요약", totals._count, totalStaleBranches)}
            </summary>

            <div className="border-t border-red-100 p-4">
              <p className="mb-3 text-xs text-gray-500 sm:text-sm">
                운행저조(30일+) = 기록 없음 또는 최근 운행일이 30일 이상 지난 차량
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {branchMonthlySummary
                  .slice()
                  .sort((a, b) => b.count - a.count)
                  .map((b) => {
                    const staleHot = b.staleCount > 0;
                    return (
                      <Link
                        key={b.code}
                        href={makeHref(`/admin/${b.code}`)}
                        className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm hover:border-red-200"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="truncate text-base font-semibold">{b.name}</div>
                            <div className="mt-1 text-xs text-gray-500">
                              차량 {formatNumber(b.vehicleCount)}대
                            </div>
                          </div>
                          <div className={infoChip(staleHot)}>운행저조 {formatNumber(b.staleCount)}</div>
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                          <div className="rounded-xl border border-gray-100 bg-[#fcfcfd] px-3 py-2">
                            <div className="text-[11px] text-gray-500">건수</div>
                            <div className="mt-0.5 font-bold">{formatNumber(b.count)}</div>
                          </div>
                          <div className="rounded-xl border border-gray-100 bg-[#fcfcfd] px-3 py-2">
                            <div className="text-[11px] text-gray-500">주행</div>
                            <div className="mt-0.5 font-bold">{formatNumber(b.distance)}</div>
                          </div>
                          <div className="rounded-xl border border-gray-100 bg-[#fcfcfd] px-3 py-2">
                            <div className="text-[11px] text-gray-500">통행료</div>
                            <div className="mt-0.5 font-bold">{formatNumber(b.toll)}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </details>
        ) : null}

        {/* ✅ 차량별 현황: 전체면 접힘 / 지사(지역본부 포함)면 항상 펼침 */}
        {showAll ? (
          <details className="group mt-6 rounded-2xl border border-red-100 bg-white">
            <summary className="cursor-pointer list-none px-4 py-3">
              {renderSummaryRow("🚘 차량별 현황", totals._count, totalStaleVehicles, false)}
            </summary>

            <div className="border-t border-red-100 p-4">
              <div className="overflow-x-auto rounded-2xl border border-red-100 bg-white">
                <table className="w-full min-w-[560px] border-collapse text-sm sm:min-w-[720px] sm:text-base">
                  <thead>
                    <tr className="border-b bg-[#f5f5f7]">
                      <th className="w-[88px] p-2 text-left whitespace-nowrap">소속</th>
                      <th className="p-2 text-left whitespace-nowrap">차량</th>
                      <th className="w-[70px] p-2 pl-1 pr-1 text-right whitespace-nowrap">기간내</th>
                                          </tr>
                  </thead>
                  <tbody>
                    {byVehicle.map(({ v, agg, latest, staleDays }) => {
                      const isStale = !latest?.date || (typeof staleDays === "number" && staleDays >= 30);
                      const lastDate = latest?.date ? latest.date.toISOString().slice(0, 10) : null;

                      return (
                        <tr key={v.id} className="border-b align-top last:border-b-0">
                          <td className="p-2 whitespace-nowrap">{v.branchName}</td>

                          <td className="p-2">
                            <div className="whitespace-nowrap">
                              <b>{v.model}</b> / {v.plate}
                            </div>
                            <div className="mt-0.5 text-xs text-gray-500">
                              최근: {lastDate ?? "기록 없음"}
                              {typeof staleDays === "number" ? ` · ${staleDays}일 전` : ""}
                              {isStale ? <span className="font-semibold text-red-600"> ⚠️ 운행저조 </span> : null}
                            </div>
                            <div className="mt-0.5 text-xs text-gray-500">
                              전기 {formatNumber(latest?.evRemainPct)}% · 하이패스 {formatNumber(latest?.hipassBalance)}원 · 계기판{" "}
                              {formatNumber(latest?.odoEnd)}km
                            </div>
                          </td>

                          <td className="p-2 pl-1 text-right whitespace-nowrap">
                            <div className="font-semibold">{formatNumber(agg._count)}회</div>
                            <div className="text-xs text-gray-500">
                              {formatNumber(agg._sum.distance)}km · {formatNumber(agg._sum.tollCost)}원
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </details>
        ) : (
          <>
            <h2 className="mt-6 text-lg font-semibold sm:text-xl">🚘 차량별 현황</h2>
            <div className="mt-2 overflow-x-auto rounded-2xl border border-red-100 bg-white">
              <table className="w-full min-w-[560px] border-collapse text-sm sm:min-w-[720px] sm:text-base">
                <thead>
                  <tr className="border-b bg-[#f5f5f7]">
                    <th className="w-[88px] p-2 text-left whitespace-nowrap">소속</th>
                    <th className="p-2 text-left whitespace-nowrap">차량</th>
                    <th className="w-[84px] p-2 pl-1 pr-1 text-right whitespace-nowrap">기간내</th>
                                      </tr>
                </thead>
                <tbody>
                  {byVehicle.map(({ v, agg, latest, staleDays }) => {
                    const isStale = !latest?.date || (typeof staleDays === "number" && staleDays >= 30);
                    const lastDate = latest?.date ? latest.date.toISOString().slice(0, 10) : null;

                    return (
                      <tr key={v.id} className="border-b align-top last:border-b-0">
                        <td className="p-2 whitespace-nowrap">{v.branchName}</td>

                        <td className="p-2">
                          <div className="whitespace-nowrap">
                            <b>{v.model}</b> / {v.plate}
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500">
                            최근: {lastDate ?? "기록 없음"}
                            {typeof staleDays === "number" ? ` · ${staleDays}일 전` : ""}
                            {isStale ? <span className="font-semibold text-red-600"> ⚠️ 운행저조 </span> : null}
                          </div>
                          <div className="mt-0.5 text-xs text-gray-500">
                            전기 {formatNumber(latest?.evRemainPct)}% · 하이패스 {formatNumber(latest?.hipassBalance)}원 · 계기판{" "}
                            {formatNumber(latest?.odoEnd)}km
                          </div>
                        </td>

                        <td className="p-2 pl-1 text-right whitespace-nowrap">
                          <div className="font-semibold">{formatNumber(agg._count)}회</div>
                          <div className="text-xs text-gray-500">
                            {formatNumber(agg._sum.distance)}km · {formatNumber(agg._sum.tollCost)}원
                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ✅ 최근 운행일지: 토글 + 표 (복구) */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold sm:text-xl">🕒 최근 운행일지 20건</h2>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              className={`rounded-xl border px-3 py-2 ${rt === "month" ? activeClass : normalClass}`}
              href={makeHref(adminPath, "month")}
            >
              기간내
            </Link>
            <Link
              className={`rounded-xl border px-3 py-2 ${rt === "7d" ? activeClass : normalClass}`}
              href={makeHref(adminPath, "7d")}
            >
              최근 7일
            </Link>
            <Link
              className={`rounded-xl border px-3 py-2 ${rt === "all" ? activeClass : normalClass}`}
              href={makeHref(adminPath, "all")}
            >
              전체
            </Link>
          </div>
        </div>

        <div className="mt-2 overflow-x-auto rounded-2xl border border-red-100 bg-white">
          <table className="w-full min-w-[640px] border-collapse text-sm sm:min-w-[820px] sm:text-base">
            <thead>
              <tr className="border-b bg-[#f5f5f7]">
                <th className="p-2 text-left whitespace-nowrap">날짜</th>
                <th className="p-2 text-left whitespace-nowrap">지사/차량</th>
                <th className="p-2 text-left whitespace-nowrap">운전자</th>
                <th className="p-2 text-right whitespace-nowrap">주행</th>
                <th className="p-2 text-right whitespace-nowrap">통행료</th>
                <th className="p-2 text-right whitespace-nowrap">메모</th>
              </tr>
            </thead>
            <tbody>
              {recentTrips.map((t) => (
                <tr key={t.id} className="border-b align-top last:border-b-0">
                  <td className="p-2 whitespace-nowrap">{t.date.toISOString().slice(0, 10)}</td>
                  <td className="p-2">
                    <div className="whitespace-nowrap font-semibold">{t.vehicle.branchName}</div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {t.vehicle.model} / {t.vehicle.plate}
                    </div>
                  </td>
                  <td className="p-2 whitespace-nowrap">{t.driver.name}</td>
                  <td className="p-2 text-right whitespace-nowrap">{formatNumber(t.distance)} km</td>
                  <td className="p-2 text-right whitespace-nowrap">{formatNumber(t.tollCost)} 원</td>
                  <td className="p-2 text-right max-w-[260px]">
                    <div className="truncate text-right" title={t.note ?? ""}>
                      {t.note ?? ""}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
