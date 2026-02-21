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

  const vehicleId = params?.vehicleId || "";
  const fromParam = params?.from || currentMonth.from;
  const toParam = params?.to || currentMonth.to;
  const deleted = params?.deleted === "1";
  const deleteError = params?.deleteError || "";

  const parsedPage = Number(params?.page || "1");
  const page = Number.isFinite(parsedPage)
    ? Math.max(1, Math.trunc(parsedPage))
    : 1;

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

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">

        {/* 모바일 카드 */}
        <div className="mt-5 grid gap-3 sm:hidden">
          {trips.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border border-red-100 bg-white p-3 text-sm shadow-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-semibold">
                    {t.date.toISOString().slice(0, 10)}
                  </div>
                  <div className="text-xs text-gray-500">
                    #{t.id.slice(0, 8)}
                  </div>
                </div>

                {/* 🔥 안정된 모바일 아이콘 영역 */}
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/trips/${t.id}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                    aria-label="수정"
                    title="수정"
                  >
                    <PencilIcon className="h-4 w-4 pointer-events-none" />
                  </Link>

                  <form
                    method="POST"
                    action="/api/trips/delete"
                    data-confirm-delete="1"
                  >
                    <input type="hidden" name="id" value={t.id} />
                    <button
                      type="submit"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="삭제"
                      title="삭제"
                    >
                      <Trash2Icon className="h-4 w-4 pointer-events-none" />
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>

        <DeleteConfirmScript />
      </section>
    </main>
  );
}
