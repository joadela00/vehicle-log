import AdminDashboard from "@/components/admin-dashboard";

export default async function BranchAdminPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <AdminDashboard branchCode={code} />;
}
