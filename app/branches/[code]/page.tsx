import { notFound } from "next/navigation";
import BranchLogForm from "@/components/branch-log-form";
import { prisma } from "@/lib/prisma";
import {
  getBranchOptions,
  hasVehicleBranchColumns,
  MAIN_BRANCH_CODE,
} from "@/lib/branches";

export const revalidate = 60;

export default async function BranchPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ saved?: string }>;
}) {
  const [{ code }, query] = await Promise.all([params, searchParams]);

  if (code === MAIN_BRANCH_CODE) notFound();

  const branchReady = await hasVehicleBranchColumns();
  if (!branchReady) notFound();

  const [branch, vehicles, branches] = await Promise.all([
    prisma.vehicle.findFirst({
      where: { branchCode: code },
      select: { branchName: true },
    }),
    prisma.vehicle.findMany({
      where: { branchCode: code },
      orderBy: { plate: "asc" },
      select: { id: true, model: true, plate: true },
    }),
    getBranchOptions(),
  ]);

  if (!branch || vehicles.length === 0) notFound();

  return (
    <BranchLogForm
      branchCode={code}
      branchName={branch.branchName}
      vehicles={vehicles}
      branches={branches}
      saved={query?.saved === "1"}
    />
  );
}
