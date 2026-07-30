import { requireRole } from "@/lib/auth/current-user";
import { EmomView } from "@/components/apps/smart-timer/emom-view";

export default async function EmomPage() {
  await requireRole("ADMIN");
  return <EmomView />;
}
