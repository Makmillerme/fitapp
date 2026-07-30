import { requireRole } from "@/lib/auth/current-user";
import { TabataView } from "@/components/apps/smart-timer/tabata-view";

export default async function TabataPage() {
  await requireRole("ADMIN");
  return <TabataView />;
}
