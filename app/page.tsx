import { unstable_cache } from "next/cache";
import BranchLogForm from "@/components/branch-log-form";
import { prisma } from "@/lib/prisma";
import { getBranchOptions, MAIN_BRANCH_CODE } from "@/lib/branches";

export const revalidate = 60;

const getAllVehicles = unstable_cache(
  () =>
    prisma.vehicle.findMany({
      orderBy: [{ branchCode: "asc" }, { plate: "asc" }],
      select: { id: true, model: true, plate: true, branchCode: true },
    }),
  ["home-vehicles-all"],
  { revalidate: 60 }
);

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const params = await searchParams;
  const saved = params?.saved === "1";

  const [vehicles, branches] = await Promise.all([
    getAllVehicles(),
    getBranchOptions(),
  ]);

  return (
    <BranchLogForm
      initialBranchCode={MAIN_BRANCH_CODE}
      vehicles={vehicles}
      branches={branches}
      saved={saved}
    />
  );
}
