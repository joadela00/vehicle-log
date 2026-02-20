import Link from "next/link";
import Script from "next/script";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/number";
import { Pencil, Trash2 } from "lucide-react";

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
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-sm sm:p-7">

        {/* 제목 */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">
            📋 운행일지 전체 목록
          </h1>
          <Link
            className="inline-flex shrink-0 items-center rounded-lg border border-red-200 bg-white px-3 py-2 hover:text-red-600"
            href="/"
          >
            🏠 홈으로
          </Link>
        </div>

        {/* 페이지 표시 */}
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

        {/* 모바일 카드 */}
        <div className="mt-5 grid gap-3 sm:hidden">
          {trips.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border border-red-100 bg-white p-3 text-sm shadow-sm"
            >
              {/* 상단 라인 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold">
                    {t.date.toISOString().slice(0, 10)}
                  </div>
                  <div className="text-xs text-gray-500">
                    #{t.id.slice(0, 8)}
                  </div>
                </div>

                {/* Lucide 아이콘 */}
                <div className="flex items-center gap-3 text-gray-600">
                  <Link
                    href={`/trips/${t.id}`}
                    className="hover:text-red-600 transition"
                  >
                    <Pencil size={18} strokeWidth={1.8} />
                  </Link>

                  <form
                    method="POST"
                    action="/api/trips/delete"
                    data-confirm-delete="1"
                  >
                    <input type="hidden" name="id" value={t.id} />
                    <button className="hover:text-red-600 transition">
                      <Trash2 size={18} strokeWidth={1.8} />
                    </button>
                  </form>
                </div>
              </div>

              {/* 내용 */}
              <dl className="mt-2 space-y-0.5">
                <div className="grid grid-cols-[64px_1fr] gap-1">
                  <dt className="text-gray-500">차량</dt>
                  <dd>{t.vehicle ? `${t.vehicle.model} / ${t.vehicle.plate}` : "-"}</dd>
                </div>
                <div className="grid grid-cols-[64px_1fr] gap-1">
                  <dt className="text-gray-500">운전자</dt>
                  <dd>{t.driver?.name ?? "-"}</dd>
                </div>
                <div className="grid grid-cols-[64px_1fr] gap-1">
                  <dt className="text-gray-500">주행거리</dt>
                  <dd>{formatNumber(t.distance)} km</dd>
                </div>
                <div className="grid grid-cols-[64px_1fr] gap-1">
                  <dt className="text-gray-500">통행료</dt>
                  <dd>{formatNumber(t.tollCost)} 원</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      {/* 삭제 확인 */}
      <Script id="confirm-trip-delete" strategy="afterInteractive">
        {`
          document.querySelectorAll('form[data-confirm-delete="1"]').forEach((form) => {
            form.addEventListener('submit', (event) => {
              const ok = window.confirm('정말 삭제하시겠습니까?');
              if (!ok) event.preventDefault();
            });
          });
        `}
      </Script>
    </main>
  );
}
