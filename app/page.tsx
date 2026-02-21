import BranchLogForm from "@/components/branch-log-form";
import {
  getBranchOptions,
  hasVehicleBranchColumns,
  isMissingBranchColumnError,
  MAIN_BRANCH_CODE,
  MAIN_BRANCH_NAME,
} from "@/lib/branches";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const saved = params?.saved === "1";

  const branchReady = await hasVehicleBranchColumns();

  const vehiclesPromise = (async () => {
    if (!branchReady) {
      return prisma.vehicle.findMany({
        orderBy: { plate: "asc" },
        select: { id: true, model: true, plate: true },
      });
    }

    try {
      return await prisma.vehicle.findMany({
        where: { branchCode: MAIN_BRANCH_CODE },
        orderBy: { plate: "asc" },
        select: { id: true, model: true, plate: true },
      });
    } catch (error) {
      if (isMissingBranchColumnError(error)) {
        return prisma.vehicle.findMany({
          orderBy: { plate: "asc" },
          select: { id: true, model: true, plate: true },
        });
      }

      throw error;
    }
  })();

  const [vehicles, branches] = await Promise.all([vehiclesPromise, getBranchOptions()]);

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
