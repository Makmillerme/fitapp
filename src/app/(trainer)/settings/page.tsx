import { requireRole } from "@/lib/auth/current-user";
import { SettingsView } from "@/components/settings/settings-view";

export default async function SettingsPage() {
  await requireRole("ADMIN");
  return <SettingsView />;
}
