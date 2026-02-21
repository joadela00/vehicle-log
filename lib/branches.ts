import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const MAIN_BRANCH_CODE = "0230";
export const MAIN_BRANCH_NAME = "인천경기";

const getVehicleColumns = unstable_cache(
  async () => {
    const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'Vehicle'
    `;

    return new Set(rows.map((row) => row.column_name));
  },
  ["vehicle-columns"],
  { revalidate: 60 },
);

export async function hasVehicleBranchColumns() {
  const columns = await getVehicleColumns();
  return (
    columns.has("branchCode") &&
    columns.has("branchName") &&
    columns.has("fuelType")
  );
}

export async function getBranchOptions() {
  const branchReady = await hasVehicleBranchColumns();

  if (!branchReady) {
    return [{ code: MAIN_BRANCH_CODE, name: MAIN_BRANCH_NAME }];
  }

  const branches = await prisma.vehicle.groupBy({
    by: ["branchCode", "branchName"],
    orderBy: [{ branchCode: "asc" }, { branchName: "asc" }],
  });

  return branches.map((branch) => ({
    code: branch.branchCode,
    name: branch.branchName,
  }));
}
