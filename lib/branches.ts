import { prisma } from "@/lib/prisma";

export const MAIN_BRANCH_CODE = "0230";

export async function getBranchOptions() {
  const branches = await prisma.vehicle.groupBy({
    by: ["branchCode", "branchName"],
    orderBy: [{ branchCode: "asc" }, { branchName: "asc" }],
  });

  return branches.map((branch) => ({
    code: branch.branchCode,
    name: branch.branchName,
  }));
}
