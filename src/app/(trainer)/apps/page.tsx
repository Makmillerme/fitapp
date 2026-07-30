import { requireRole } from "@/lib/auth/current-user";
import { AppsView } from "@/components/apps/apps-view";

export default async function AppsPage() {
  await requireRole("ADMIN");
  return <AppsView />;
}
