import BranchLogForm from "@/components/branch-log-form";
import { prisma } from "@/lib/prisma";
import {
  getBranchOptions,
  hasVehicleBranchColumns,
  MAIN_BRANCH_CODE,
  MAIN_BRANCH_NAME,
} from "@/lib/branches";

export const revalidate = 60;

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const saved = params?.saved === "1";

  const branchReady = await hasVehicleBranchColumns();

  const [vehicles, branches] = await Promise.all([
    prisma.vehicle.findMany({
      ...(branchReady ? { where: { branchCode: MAIN_BRANCH_CODE } } : {}),
      orderBy: { plate: "asc" },
      select: { id: true, model: true, plate: true },
    }),
    getBranchOptions(),
  ]);

  return (
    <BranchLogForm
      branchCode={MAIN_BRANCH_CODE}
      branchName={MAIN_BRANCH_NAME}
      vehicles={vehicles}
      branches={branches}
      saved={saved}
    />
  );
}
