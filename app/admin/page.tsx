import AdminDashboard from "@/components/admin-dashboard";

const ALL_BRANCH_CODE = "__ALL__";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ rt?: string; start?: string; end?: string }>;
}) {
  const sp = await searchParams;
  return <AdminDashboard branchCode={ALL_BRANCH_CODE} rt={sp?.rt ?? "month"} startDate={sp?.start} endDate={sp?.end} />;
}
