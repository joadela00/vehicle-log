import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 30;

export default async function AdminByBranchPage({
  params,
}: {
  params: Promise<{ branchCode: string }>;
}) {
  const { branchCode } = await params;

  const branchInfo = await prisma.vehicle.findFirst({
    where: { branchCode },
    select: { branchName: true },
  });

  const branchName = branchInfo?.branchName || branchCode;

  const vehicles = await prisma.vehicle.findMany({
    where: { branchCode },
    orderBy: { plate: "asc" },
    select: { id: true, model: true, plate: true, branchCode: true, branchName: true },
  });

  const homeHref =
    branchCode === "0230" ? "/" : `/branches/${encodeURIComponent(branchCode)}`;

  return (
    <main className="mx-auto w-full max-w-4xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-extrabold sm:text-2xl">🛠️ {branchName} 관리자</h1>

          <div className="flex items-center gap-2">
            <Link
              href={`/trips?branchCode=${encodeURIComponent(branchCode)}`}
              className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium hover:border-red-400 hover:text-red-600"
            >
              📚 운행목록
            </Link>
            <Link
              href={homeHref}
              className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium hover:border-red-400 hover:text-red-600"
            >
              🏠 홈으로
            </Link>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-500">
          현재 소속: <b>{branchName}</b> ({branchCode})
        </p>

        <div className="mt-6 rounded-2xl border border-red-100 bg-white/90 p-4 shadow-sm">
          <h2 className="text-base font-bold">🚗 차량 목록 (이 소속만)</h2>

          {vehicles.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">등록된 차량이 없습니다.</p>
          ) : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {vehicles.map((v) => (
                <li
                  key={v.id}
                  className="rounded-2xl border border-red-100 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="text-sm text-gray-500">{v.model}</div>
                  <div className="text-base font-semibold">{v.plate}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
