import Link from "next/link";
import BranchLogForm from "@/components/branch-log-form";
import { prisma } from "@/lib/prisma";
import {
  getBranchOptions,
  hasVehicleBranchColumns,
  isMissingBranchColumnError,
  MAIN_BRANCH_CODE,
  MAIN_BRANCH_NAME,
} from "@/lib/branches";

export const revalidate = 60;

export default async function BranchPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ saved?: string }>;
}) {
  const [{ code }, query] = await Promise.all([params, searchParams]);

  const [branchReady, branches] = await Promise.all([
    hasVehicleBranchColumns(),
    getBranchOptions(),
  ]);

  if (!branchReady) {
    if (code !== MAIN_BRANCH_CODE) {
      return (
        <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
          <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
            <h1 className="text-2xl font-extrabold">지사 데이터 준비 중</h1>
            <p className="mt-2 text-sm text-gray-600">
              현재 DB에 지사 컬럼이 없어 인천경기 지사만 입력할 수 있습니다.
            </p>
            <Link
              href={`/branches/${MAIN_BRANCH_CODE}`}
              className="mt-4 inline-block rounded-xl border border-red-200 px-3 py-2 font-medium hover:border-red-400 hover:text-red-600"
            >
              인천경기 페이지로 이동
            </Link>
          </section>
        </main>
      );
    }

    const vehicles = await prisma.vehicle.findMany({
      orderBy: { plate: "asc" },
      select: { id: true, model: true, plate: true },
    });

    return (
      <BranchLogForm
        branchCode={MAIN_BRANCH_CODE}
        branchName={MAIN_BRANCH_NAME}
        vehicles={vehicles}
        branches={branches}
        saved={query?.saved === "1"}
      />
    );
  }

  const branchMeta = branches.find((branch) => branch.code === code);

  try {
    const [branch, vehicles] = await Promise.all([
      prisma.vehicle.findFirst({
        where: { branchCode: code },
        select: { branchName: true },
      }),
      prisma.vehicle.findMany({
        where: { branchCode: code },
        orderBy: { plate: "asc" },
        select: { id: true, model: true, plate: true },
      }),
    ]);

    if (vehicles.length === 0) {
      return (
        <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
          <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
            <h1 className="text-2xl font-extrabold">차량이 없습니다</h1>
            <p className="mt-2 text-sm text-gray-600">선택한 지사에 등록된 차량이 없습니다.</p>
            <Link
              href="/branches"
              className="mt-4 inline-block rounded-xl border border-red-200 px-3 py-2 font-medium hover:border-red-400 hover:text-red-600"
            >
              지사 선택으로 이동
            </Link>
          </section>
        </main>
      );
    }

    return (
      <BranchLogForm
        branchCode={code}
        branchName={branch?.branchName ?? branchMeta?.name ?? MAIN_BRANCH_NAME}
        vehicles={vehicles}
        branches={branches}
        saved={query?.saved === "1"}
      />
    );
  } catch (error) {
    if (isMissingBranchColumnError(error)) {
      return (
        <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
          <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
            <h1 className="text-2xl font-extrabold">지사 데이터 준비 중</h1>
            <p className="mt-2 text-sm text-gray-600">DB 마이그레이션 후 다시 시도해 주세요.</p>
            <Link
              href={`/branches/${MAIN_BRANCH_CODE}`}
              className="mt-4 inline-block rounded-xl border border-red-200 px-3 py-2 font-medium hover:border-red-400 hover:text-red-600"
            >
              인천경기 페이지로 이동
            </Link>
          </section>
        </main>
      );
    }

    throw error;
  }
}
