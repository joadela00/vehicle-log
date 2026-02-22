export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; branch?: string }>;
}) {
  const params = await searchParams;
  const saved = params?.saved === "1";

  const branchFromQuery = String(params?.branch ?? "").trim();
  const initialBranchCode = branchFromQuery || ""; // ✅ 기본값 제거

  const [vehicles, branches] = await Promise.all([
    getAllVehicles(),
    getBranchOptions(),
  ]);

  return (
    <BranchLogForm
      initialBranchCode={initialBranchCode}
      vehicles={vehicles}
      branches={branches}
      saved={saved}
    />
  );
}
