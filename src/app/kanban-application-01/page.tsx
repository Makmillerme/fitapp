import { requireRole } from "@/lib/auth/current-user";
import KanbanApplication from "@/components/shadcn-space/blocks/kanban-application-01";

export default async function page() {
  await requireRole("ADMIN");
  return <KanbanApplication />;
}
