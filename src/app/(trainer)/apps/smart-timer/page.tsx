import { requireRole } from "@/lib/auth/current-user";
import { ModeHub } from "@/components/apps/smart-timer/mode-hub";

export default async function SmartTimerHubPage() {
  await requireRole("ADMIN");
  return <ModeHub />;
}
