import { prisma } from "@/lib/prisma";

export const MAIN_BRANCH_CODE = "0230";
export const MAIN_BRANCH_NAME = "인천경기";

type BranchOption = {
  code: string;
  name: string;
};

const STATIC_BRANCH_OPTIONS: BranchOption[] = [
  { code: "0230", name: "인천경기" },
  { code: "0231", name: "인천중부" },
  { code: "0232", name: "인천남부" },
  { code: "0235", name: "인천서부" },
  { code: "0236", name: "인천남동" },
  { code: "0237", name: "인천부평" },
  { code: "0303", name: "의정부" },
  { code: "0307", name: "평택" },
  { code: "0308", name: "동두천연천" },
  { code: "0309", name: "안산" },
  { code: "0312", name: "남양주가평" },
  { code: "0316", name: "하남" },
  { code: "0318", name: "파주" },
  { code: "0319", name: "이천" },
  { code: "0320", name: "김포" },
  { code: "0321", name: "화성" },
  { code: "0322", name: "경기광주" },
  { code: "0324", name: "포천" },
  { code: "0326", name: "양평" },
  { code: "0327", name: "수원서부" },
  { code: "0328", name: "성남북부" },
  { code: "0329", name: "양주" },
  { code: "0331", name: "부천남부" },
  { code: "0332", name: "시흥" },
  { code: "0333", name: "안성" },
  { code: "0335", name: "여주" },
  { code: "0338", name: "고양일산" },
  { code: "0339", name: "고양덕양" },
  { code: "0341", name: "용인동부" },
  { code: "0342", name: "용인서부" },
];

function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());
}

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
  if (!hasDatabaseUrl()) return false;

  try {
    const columns = await getVehicleColumns();
    return (
      columns.includes("branchCode") &&
      columns.includes("branchName") &&
      columns.includes("fuelType")
    );
  } catch {
    return false;
  }
}

export async function getBranchOptions() {
  const branchReady = await hasVehicleBranchColumns();

  if (!branchReady) {
    return STATIC_BRANCH_OPTIONS;
  }

  try {
    const branches = await prisma.vehicle.groupBy({
      by: ["branchCode", "branchName"],
      orderBy: [{ branchCode: "asc" }, { branchName: "asc" }],
    });

    const normalized = normalizeBranchOptions(branches);
    return normalized.length > 0 ? normalized : STATIC_BRANCH_OPTIONS;
  } catch {
    return STATIC_BRANCH_OPTIONS;
  }
}
