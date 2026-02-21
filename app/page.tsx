import { unstable_cache } from "next/cache";
import BranchLogForm from "@/components/branch-log-form";
import { prisma } from "@/lib/prisma";
import { getBranchOptions, MAIN_BRANCH_CODE } from "@/lib/branches";

export const revalidate = 60;

const getMainBranchVehicles = unstable_cache(
  () =>
    prisma.vehicle.findMany({
      where: { branchCode: MAIN_BRANCH_CODE },
      orderBy: { plate: "asc" },
      select: { id: true, model: true, plate: true },
    }),
  ["home-vehicles-main-branch"],
  { revalidate: 60 },
);

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const saved = params?.saved === "1";

  const [vehicles, branches] = await Promise.all([
    getMainBranchVehicles(),
    getBranchOptions(),
  ]);

  return (
    <BranchLogForm
      branchCode={MAIN_BRANCH_CODE}
      branchName="인천경기"
      vehicles={vehicles}
      branches={branches}
      saved={saved}
    />
  );
}
