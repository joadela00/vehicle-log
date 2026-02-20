import Link from "next/link";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/number";
import Script from "next/script";  // Script 컴포넌트 import 추가

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
    vehicleId?: string;
    from?: string;
    to?: string;
    page?: string;
    deleted?: string;
  }>;
}) {
  const confirmDeleteScript = [
    "document.querySelectorAll('form[data-confirm-delete=\"1\"]').forEach((form) => {",
    "  form.addEventListener('submit', (event) => {",
    "    const ok = window.confirm('정말 삭제하시겠습니까?');",
    "    if (!ok) {",
    "      event.preventDefault();",
    "    }",
    "  });",
    "});",
  ].join("\n");

  const params = await searchParams;
  const currentMonth = getCurrentMonthDateRange();

  const vehicleId = params?.vehicleId || "";
  const fromParam = params?.from || currentMonth.from;
  const toParam = params?.to || currentMonth.to;
  const deleted = params?.deleted === "1";

  const parsedPage = Number(params?.page || "1");
  const page = Number.isFinite(parsedPage) ? Math.max(1, Math.trunc(parsedPage)) : 1;

  const from = new Date(fromParam + "T00:00:00");
  const to = new Date(toParam + "T23:59:59");

  const where: Prisma.TripWhereInput = {
    date: { gte: from, lte: to },
    ...(vehicleId ? { vehicleId } : {}),
  };

  const [vehicles, tripsRaw] = await Promise.all([
    getVehicles(),
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
    if (vehicleId) query.set("vehicleId", vehicleId);
    query.set("from", fromParam);
    query.set("to", toParam);
    query.set("page", String(nextPage));
    return `/trips?${query.toString()}`;
  };

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h1 className="text-xl font-bold sm:text-2xl">📋 운행일지 전체 목록</h1>
        <Link
          className="inline-flex items-center rounded-lg border border-red-200 px-3 py-2 underline decoration-red-300 underline-offset-4 hover:text-red-600"
          href="/"
        >
          🏠 홈으로
        </Link>
      </div>

      {deleted ? (
        <p className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
          🗑️ 삭제되었습니다.
        </p>
      ) : null}

      <form method="GET" className="mt-4 grid grid-cols-1 gap-2 rounded-2xl border border-red-100 bg-white/90 p-4 shadow-sm sm:flex sm:flex-wrap sm:gap-3">
        <select name="vehicleId" defaultValue={vehicleId} className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm">
          <option value="">전체 차량</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.model} / {v.plate}
            </option>
          ))}
        </select>

        <input type="date" name="from" defaultValue={fromParam} className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm" />
        <input type="date" name="to" defaultValue={toParam} className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm" />

        <button className="rounded border border-red-200 bg-red-600 px-4 py-3 text-base font-semibold text-white">🔍 검색</button>
      </form>

      <div className="mt-4 flex items-center gap-3 text-sm sm:text-base">
        <span>
          페이지 <b>{page}</b>
        </span>
        {page > 1 ? (
          <Link className="rounded-lg border border-red-200 px-2 py-1 underline decoration-red-300 underline-offset-4 hover:text-red-600" href={makePageHref(page - 1)}>
            이전
          </Link>
        ) : (
          <span className="opacity-40">이전</span>
        )}
        {hasNextPage ? (
          <Link className="rounded-lg border border-red-200 px-2 py-1 underline decoration-red-300 underline-offset-4 hover:text-red-600" href={makePageHref(page + 1)}>
            다음
          </Link>
        ) : (
          <span className="opacity-40">다음</span>
        )}
      </div>

      <Script id="confirm-trip-delete" strategy="afterInteractive">
        {`
          document.querySelectorAll('form[data-confirm-delete="1"]').forEach((form) => {
            form.addEventListener('submit', (event) => {
              const ok = window.confirm('정말 삭제하시겠습니까?');
              if (!ok) {
                event.preventDefault();
              }
            });
          });
        `}
      </Script>
    </main>
  );
}
