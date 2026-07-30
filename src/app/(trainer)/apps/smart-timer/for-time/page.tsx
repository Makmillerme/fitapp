import { requireRole } from "@/lib/auth/current-user";
import { ForTimeView } from "@/components/apps/smart-timer/for-time-view";

export default async function ForTimePage() {
  await requireRole("ADMIN");
  return <ForTimeView />;
}
