import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const MAIN_BRANCH_CODE = "0230";
export const MAIN_BRANCH_NAME = "인천경기";

async function getVehicleColumns() {
  const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
  `;

  return rows.map((row) => row.column_name);
}

export function isMissingBranchColumnError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2022"
  );
}

export async function hasVehicleBranchColumns() {
  const columns = await getVehicleColumns();
  return (
    columns.includes("branchCode") &&
    columns.includes("branchName") &&
    columns.includes("fuelType")
  );
}

export async function getBranchOptions() {
  const branchReady = await hasVehicleBranchColumns();

  if (!branchReady) {
    return [{ code: MAIN_BRANCH_CODE, name: MAIN_BRANCH_NAME }];
  }

  try {
    const branches = await prisma.vehicle.groupBy({
      by: ["branchCode", "branchName"],
      orderBy: [{ branchCode: "asc" }, { branchName: "asc" }],
    });

    return branches.map((branch) => ({
      code: branch.branchCode,
      name: branch.branchName,
    }));
  } catch (error) {
    if (isMissingBranchColumnError(error)) {
      return [{ code: MAIN_BRANCH_CODE, name: MAIN_BRANCH_NAME }];
    }

    throw error;
  }
}
