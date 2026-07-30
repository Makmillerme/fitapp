import { requireRole } from "@/lib/auth/current-user";
import { listPrograms } from "@/lib/actions/programs";
import { ProgramsView } from "@/components/programs/programs-view";

export default async function ProgramsPage() {
  await requireRole("ADMIN");
  const programs = await listPrograms();

  return (
    <ProgramsView
      programs={programs.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        durationWeeks: p.durationWeeks,
        tags: p.tags,
      }))}
    />
  );
}
