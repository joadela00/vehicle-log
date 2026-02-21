import Link from "next/link";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/number";
import DeleteConfirmScript from "@/app/trips/delete-confirm-script";

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function Trash2Icon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

export const revalidate = 30;

const PAGE_SIZE = 50;

const getVehicles = unstable_cache(
  () =>
    prisma.vehicle.findMany({
      orderBy: { plate: "asc" },
      select: { id: true, model: true, plate: true },
    }),
  ["vehicles-list"],
  { revalidate: 60 * 60 }
);

function getCurrentMonthDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export default async function TripsPage({
  searchParams,
}: {
  searchParams: Promise<{
    branchCode?: string;
    vehicleId?: string;
    from?: string;
    to?: string;
    page?: string;
    deleted?: string;
    deleteError?: string;
  }>;
}) {
  const params = await searchParams;
  const currentMonth = getCurrentMonthDateRange();

  const branchCode = (params?.branchCode || "").trim();
  const vehicleId = params?.vehicleId || "";
  const fromParam = params?.from || currentMonth.from;
  const toParam = params?.to || currentMonth.to;
  const deleted = params?.deleted === "1";
  const deleteError = params?.deleteError || "";

  // ✅ 지사명 조회(제목에 사용)
  const branchName = branchCode
    ? (
        await prisma.vehicle.findFirst({
          where: { branchCode },
          select: { branchName: true },
        })
      )?.branchName || branchCode
    : "";

  const parsedPage = Number(params?.page || "1");
  const page = Number.isFinite(parsedPage)
    ? Math.max(1, Math.trunc(parsedPage))
    : 1;

  const from = new Date(fromParam + "T00:00:00");
  const to = new Date(toParam + "T23:59:59");

  const where: Prisma.TripWhereInput = {
    date: { gte: from, lte: to },
    ...(vehicleId ? { vehicleId } : {}),
    ...(branchCode ? { vehicle: { branchCode } } : {}),
  };

  const vehiclesPromise = branchCode
    ? prisma.vehicle.findMany({
        where: { branchCode },
        orderBy: { plate: "asc" },
        select: { id: true, model: true, plate: true },
      })
    : getVehicles();

  const [vehicles, tripsRaw] = await Promise.all([
    vehiclesPromise,
    prisma.trip.findMany({
      where,
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE + 1,
      select: {
        id: true,
        date: true,
        vehicleId: true,
        distance: true,
        tollCost: true,
        vehicle: { select: { model: true, plate: true } },
        driver: { select: { name: true } },
      },
    }),
  ]);

  const hasNextPage = tripsRaw.length > PAGE_SIZE;
  const trips = hasNextPage ? tripsRaw.slice(0, PAGE_SIZE) : tripsRaw;

  const makePageHref = (nextPage: number) => {
    const query = new URLSearchParams();
    if (branchCode) query.set("branchCode", branchCode);
    if (vehicleId) query.set("vehicleId", vehicleId);
    query.set("from", fromParam);
    query.set("to", toParam);
    query.set("page", String(nextPage));
    return `/trips?${query.toString()}`;
  };

  const ActionLinkClass =
    "inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition touch-manipulation";

  const FieldClass =
    "h-11 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-red-400 focus:ring-2 focus:ring-red-100";

  // ✅ 홈으로 404 수정: 메인(0230)은 /, 그 외는 /branches/{code}
  const homeHref =
    branchCode === "0230"
      ? "/"
      : branchCode
        ? `/branches/${encodeURIComponent(branchCode)}`
        : "/";

  const titleText = branchCode ? `${branchName} 운행일지` : "운행일지 전체 목록";

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">📋 {titleText}</h1>
          <Link
            className="inline-flex shrink-0 items-center rounded-lg border border-red-200 bg-white px-3 py-2 hover:text-red-600"
            href={homeHref}
          >
            🏠 홈으로
          </Link>
        </div>

        {deleted ? (
          <p className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            🗑️ 삭제되었습니다.
          </p>
        ) : null}

        {deleteError ? (
          <p className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {deleteError === "auth"
              ? "관리자 비밀번호가 틀려 삭제할 수 없습니다."
              : "서버 설정 오류로 삭제할 수 없습니다."}
          </p>
        ) : null}

        <form
          method="GET"
          className="mt-5 rounded-2xl border border-red-100 bg-white/90 p-4 shadow-sm"
        >
          {/* ✅ 검색해도 branchCode 유지 */}
          {branchCode ? (
            <input type="hidden" name="branchCode" value={branchCode} />
          ) : null}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_0.9fr_0.9fr_auto] sm:items-end">
            <label className="grid gap-1 min-w-0">
              <select name="vehicleId" defaultValue={vehicleId} className={FieldClass}>
                <option value="">{branchCode ? "지사 전체 차량" : "전체 차량"}</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} / {v.plate}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 min-w-0">
              <input
                type="date"
                name="from"
                defaultValue={fromParam}
                className={FieldClass}
                style={{ WebkitAppearance: "none", appearance: "none" }}
              />
            </label>

            <label className="grid gap-1 min-w-0">
              <input
                type="date"
                name="to"
                defaultValue={toParam}
                className={FieldClass}
                style={{ WebkitAppearance: "none", appearance: "none" }}
              />
            </label>

            <button className="h-11 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-sm hover:bg-red-700 sm:justify-self-end">
              검색
            </button>
          </div>
        </form>

        <div className="mt-4 flex items-center gap-3 text-sm sm:text-base">
          <span>
            페이지 <b>{page}</b>
          </span>

          {page > 1 ? (
            <Link
              className="rounded-lg border border-red-200 px-2 py-1 hover:text-red-600"
              href={makePageHref(page - 1)}
            >
              이전
            </Link>
          ) : (
            <span className="opacity-40">이전</span>
          )}

          {hasNextPage ? (
            <Link
              className="rounded-lg border border-red-200 px-2 py-1 hover:text-red-600"
              href={makePageHref(page + 1)}
            >
              다음
            </Link>
          ) : (
            <span className="opacity-40">다음</span>
          )}
        </div>

        {trips.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-red-100 bg-red-50/40 px-4 py-6 text-center text-sm text-gray-600">
            조회 조건에 해당하는 운행일지가 없습니다.
          </p>
        ) : (
          <>
            {/* ✅ 모바일 카드 */}
            <div className="mt-6 grid gap-3 sm:hidden">
              {trips.map((t) => (
                <article
                  key={t.id}
                  className="min-h-[150px] rounded-2xl border border-red-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-base font-semibold tracking-tight">
                        {t.date.toISOString().slice(0, 10)}
                      </div>
                      <div className="text-xs text-gray-400">#{t.id.slice(0, 8)}</div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <Link
                        href={`/trips/${t.id}`}
                        className={ActionLinkClass}
                        aria-label="수정"
                        title="수정"
                      >
                        <PencilIcon className="h-4 w-4 pointer-events-none" />
                        수정
                      </Link>

                      <form
                        method="POST"
                        action="/api/trips/delete"
                        data-confirm-delete="1"
                        className="m-0"
                      >
                        <input type="hidden" name="id" value={t.id} />
                        <button
                          type="submit"
                          className={ActionLinkClass}
                          aria-label="삭제"
                          title="삭제"
                        >
                          <Trash2Icon className="h-4 w-4 pointer-events-none" />
                          삭제
                        </button>
                      </form>
                    </div>
                  </div>

                  <dl className="mt-3 space-y-1.5 text-sm">
                    <div className="grid grid-cols-[64px_1fr] items-start gap-2">
                      <dt className="whitespace-nowrap text-gray-500">차량</dt>
                      <dd className="break-keep leading-5">
                        {t.vehicle ? `${t.vehicle.model} / ${t.vehicle.plate}` : "-"}
                      </dd>
                    </div>

                    <div className="grid grid-cols-[64px_1fr] items-start gap-2">
                      <dt className="whitespace-nowrap text-gray-500">운전자</dt>
                      <dd className="break-keep leading-5">{t.driver?.name ?? "-"}</dd>
                    </div>

                    <div className="grid grid-cols-[64px_1fr] items-start gap-2">
                      <dt className="whitespace-nowrap text-gray-500">주행거리</dt>
                      <dd className="leading-5">{formatNumber(t.distance)} km</dd>
                    </div>

                    <div className="grid grid-cols-[64px_1fr] items-start gap-2">
                      <dt className="whitespace-nowrap text-gray-500">통행료</dt>
                      <dd className="leading-5">{formatNumber(t.tollCost)} 원</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            {/* ✅ PC 테이블 */}
            <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-red-100 bg-white/95 shadow-sm sm:block">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="p-2 text-left">날짜</th>
                    <th className="p-2 text-left">차량</th>
                    <th className="p-2 text-left">운전자</th>
                    <th className="p-2 text-right">실제주행거리(km)</th>
                    <th className="p-2 text-right">통행료(원)</th>
                    <th className="p-2 text-right">수정&nbsp;&nbsp;삭제</th>
                  </tr>
                </thead>

                <tbody>
                  {trips.map((t) => (
                    <tr key={t.id} className="border-b">
                      <td className="whitespace-nowrap p-2">
                        {t.date.toISOString().slice(0, 10)}
                      </td>
                      <td className="whitespace-nowrap p-2">
                        {t.vehicle ? `${t.vehicle.model} / ${t.vehicle.plate}` : "-"}
                      </td>
                      <td className="whitespace-nowrap p-2">{t.driver?.name ?? "-"}</td>
                      <td className="p-2 text-right">{formatNumber(t.distance)}</td>
                      <td className="p-2 text-right">{formatNumber(t.tollCost)}</td>
                      <td className="p-2">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/trips/${t.id}`}
                            className={ActionLinkClass}
                            aria-label="수정"
                            title="수정"
                          >
                            <PencilIcon className="h-4 w-4 pointer-events-none" />
                            수정
                          </Link>

                          <form
                            method="POST"
                            action="/api/trips/delete"
                            data-confirm-delete="1"
                            className="m-0"
                          >
                            <input type="hidden" name="id" value={t.id} />
                            <button
                              type="submit"
                              className={ActionLinkClass}
                              aria-label="삭제"
                              title="삭제"
                            >
                              <Trash2Icon className="h-4 w-4 pointer-events-none" />
                              삭제
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <DeleteConfirmScript />
    </main>
  );
}
