import { prisma } from "@/lib/prisma";

export const MAIN_BRANCH_CODE = "0230";
export const MAIN_BRANCH_NAME = "인천경기";

type BranchOption = {
  code: string;
  name: string;
};

async function getVehicleColumns() {
  const rows = await prisma.$queryRaw<Array<{ column_name: string }>>`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Vehicle'
  `;

  return rows.map((row) => row.column_name);
}

function normalizeBranchOptions(branches: Array<{ branchCode: string; branchName: string }>): BranchOption[] {
  const seen = new Set<string>();
  const normalized: BranchOption[] = [];

  for (const branch of branches) {
    const code = String(branch.branchCode ?? "").trim();
    if (!code || seen.has(code)) continue;

    const name = String(branch.branchName ?? "").trim() || code;
    normalized.push({ code, name });
    seen.add(code);
  }

  if (!seen.has(MAIN_BRANCH_CODE)) {
    normalized.unshift({ code: MAIN_BRANCH_CODE, name: MAIN_BRANCH_NAME });
  }

  return normalized;
}

export function isMissingBranchColumnError(error: unknown) {
  if (!error || typeof error !== "object") return false;

  const maybe = error as { code?: unknown; message?: unknown };
  return (
    maybe.code === "P2022" ||
    (typeof maybe.message === "string" &&
      maybe.message.includes("Vehicle.branchCode") &&
      maybe.message.includes("does not exist"))
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

    const normalized = normalizeBranchOptions(branches);
    return normalized.length > 0
      ? normalized
      : [{ code: MAIN_BRANCH_CODE, name: MAIN_BRANCH_NAME }];
  } catch (error) {
    if (isMissingBranchColumnError(error)) {
      return [{ code: MAIN_BRANCH_CODE, name: MAIN_BRANCH_NAME }];
    }

    throw error;
  }
}
