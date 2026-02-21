import BranchLogForm from "@/components/branch-log-form";
import { prisma } from "@/lib/prisma";
import { getBranchOptions, MAIN_BRANCH_CODE } from "@/lib/branches";

export const revalidate = 60;

type VehicleRow = {
  id: string;
  model: string;
  plate: string;
  branchCode: string;
};

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const saved = params?.saved === "1";

  const [branches, allVehicles] = await Promise.all([
    getBranchOptions(),
    prisma.vehicle.findMany({
      orderBy: [{ branchCode: "asc" }, { plate: "asc" }],
      select: { id: true, model: true, plate: true, branchCode: true },
    }),
  ]);

  const vehiclesByBranch: Record<string, { id: string; model: string; plate: string }[]> =
    allVehicles.reduce((acc: Record<string, any[]>, v: VehicleRow) => {
      (acc[v.branchCode] ||= []).push({ id: v.id, model: v.model, plate: v.plate });
      return acc;
    }, {});

  // 메인 소속 이름(branches에서 찾고, 없으면 "인천경기")
  const mainBranchName = branches.find((b) => b.code === MAIN_BRANCH_CODE)?.name || "인천경기";

  return (
    <BranchLogForm
      initialBranchCode={MAIN_BRANCH_CODE}
      initialBranchName={mainBranchName}
      vehiclesByBranch={vehiclesByBranch}
      branches={branches}
      saved={saved}
    />
  );
}
