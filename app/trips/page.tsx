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
  { revalidate: 3600 }
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
  }>;
}) {
  const params = await searchParams;
  const currentMonth = getCurrentMonthDateRange();

  const vehicleId = params?.vehicleId || "";
  const fromParam = params?.from || currentMonth.from;
  const toParam = params?.to || currentMonth.to;

  const page = Math.max(1, Number(params?.page || 1));

  const from = new Date(fromParam + "T00:00:00");
  const to = new Date(toParam + "T23:59:59");

  const where: Prisma.TripWhereInput = {
    date: { gte: from, lte: to },
    ...(vehicleId ? { vehicleId } : {}),
  };

  const [vehicles, trips] = await Promise.all([
    getVehicles(),
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
        vehicle: { select: { model: true, plate: true } },
        driver: { select: { name: true } },
      },
    }),
  ]);

  const ActionLinkClass =
    "inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition";

  return (
    <main className="mx-auto w-full max-w-6xl p-4 sm:p-6">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold sm:text-2xl">
            📋 운행일지 전체 목록
          </h1>
          <Link
            href="/"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
          >
            🏠 홈으로
          </Link>
        </div>

        {/* 🔥 고급형 필터 바 */}
        <form
          method="GET"
          className="mt-6 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 shadow-inner"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">

            <div className="flex flex-col gap-1 sm:w-56">
              <label className="text-sm font-semibold text-gray-600">
                🚗 차량
              </label>
              <select
                name="vehicleId"
                defaultValue={vehicleId}
                className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-red-400 focus:ring-2 focus:ring-red-100"
              >
                <option value="">전체 차량</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.model} / {v.plate}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 sm:w-48">
              <label className="text-sm font-semibold text-gray-600">
                📅 시작일자
              </label>
              <input
                type="date"
                name="from"
                defaultValue={fromParam}
                className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="flex flex-col gap-1 sm:w-48">
              <label className="text-sm font-semibold text-gray-600">
                📅 종료일자
              </label>
              <input
                type="date"
                name="to"
                defaultValue={toParam}
                className="h-11 rounded-xl border border-gray-300 bg-white px-3 text-sm shadow-sm focus:border-red-400 focus:ring-2 focus:ring-red-100"
              />
            </div>

            <div className="sm:ml-auto">
              <button className="h-11 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700">
                🔍 검색
              </button>
            </div>

          </div>
        </form>

        {/* 이하 기존 리스트 영역 그대로 유지 */}
      </section>

      <DeleteConfirmScript />
    </main>
  );
}
