import AdminDashboard from "@/components/admin-dashboard";

export default async function BranchAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams?: Promise<{ rt?: string; start?: string; end?: string }>;
}) {
  const { code } = await params;
  const sp = await searchParams;
  return <AdminDashboard branchCode={code} rt={sp?.rt ?? "month"} startDate={sp?.start} endDate={sp?.end} />;
}
