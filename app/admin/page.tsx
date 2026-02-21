import AdminDashboard from "@/components/admin-dashboard";
import { MAIN_BRANCH_CODE } from "@/lib/branches";

export default async function AdminPage() {
  return <AdminDashboard branchCode={MAIN_BRANCH_CODE} />;
}
