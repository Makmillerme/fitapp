import { requireRole } from "@/lib/auth/current-user";
import { AmrapView } from "@/components/apps/smart-timer/amrap-view";

export default async function AmrapPage() {
  await requireRole("ADMIN");
  return <AmrapView />;
}
