import Link from "next/link";
import { unstable_cache } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/number";
import DeleteConfirmScript from "@/app/trips/delete-confirm-script";
import UpdatedToast from "@/app/trips/updated-toast";
import DeletedToast from "@/app/trips/deleted-toast";
import DeleteErrorToast from "@/app/trips/delete-error-toast";

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
    updated?: string;
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
  const updated = params?.updated === "1";

  const parsedPage = Number(params?.page || "1");
  const page = Number.isFinite(parsedPage) ? Math.max(1, Math.trunc(parsedPage)) : 1;

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

  const currentListHref = makePageHref(page);

  const makeEditHref = (id: string) => {
    if (!branchCode) return `/trips/${id}`;
    return `/trips/${id}?branchCode=${encodeURIComponent(branchCode)}`;
  };

  const homeHref = branchCode
    ? `/?branch=${encodeURIComponent(branchCode)}`
    : "/";

  return (
    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            📋 {branchCode ? "지사 운행일지" : "운행일지 전체 목록"}
          </h1>
          <Link href={homeHref}>🏠 홈으로</Link>
        </div>

        <UpdatedToast show={updated} />
        <DeletedToast show={deleted} />
        <DeleteErrorToast code={deleteError} />

        {trips.map((t) => (
          <div key={t.id} className="mt-4 border-b pb-3">
            <div className="flex justify-between">
              <div>
                {t.date.toISOString().slice(0, 10)} /{" "}
                {t.vehicle?.model} {t.vehicle?.plate}
              </div>
              <div className="flex gap-2">
                <Link href={makeEditHref(t.id)}>수정</Link>

                <form
                  method="POST"
                  action="/api/trips/delete"
                  data-confirm-delete="1"
                >
                  <input type="hidden" name="id" value={t.id} />
                  <input
                    type="hidden"
                    name="returnTo"
                    value={currentListHref}
                  />
                  <button type="submit">삭제</button>
                </form>
              </div>
            </div>
          </div>
        ))}

        <DeleteConfirmScript />
      </section>
    </main>
  );
}
