import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/current-user";
import { getProgram } from "@/lib/actions/programs";

type Props = {
  params: Promise<{ programId: string }>;
};

export default async function ProgramDetailPage({ params }: Props) {
  await requireRole("ADMIN");
  const { programId } = await params;
  const program = await getProgram(programId);
  if (!program) notFound();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="flex items-center gap-3 px-5 pb-2 pt-6">
        <Link
          href="/programs"
          className="flex size-9 items-center justify-center rounded-full bg-white shadow-card"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{program.name}</h1>
          <p className="text-xs text-muted-foreground">
            {program.durationWeeks ? `${program.durationWeeks} тижнів` : "Без тривалості"}
            {program.category ? ` · ${program.category}` : ""}
          </p>
        </div>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto hide-scrollbar p-5">
        {program.description ? (
          <p className="rounded-2xl bg-white p-4 text-sm shadow-card">
            {program.description}
          </p>
        ) : null}

        <section>
          <h2 className="mb-3 text-sm font-bold">Вправи</h2>
          <div className="space-y-2">
            {program.exercises.length === 0 ? (
              <p className="text-sm text-muted-foreground">Вправ ще немає.</p>
            ) : (
              program.exercises.map((pe) => (
                <div
                  key={pe.id}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"
                >
                  <div>
                    <p className="text-sm font-bold">{pe.exercise.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {pe.exercise.muscleGroup ?? "—"}
                    </p>
                  </div>
                  <span className="rounded-md bg-muted px-2 py-1 text-xs font-bold">
                    {pe.sets}×{pe.reps}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <Link
          href="/schedule?action=add"
          className="flex w-full items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-float"
        >
          Призначити клієнту
        </Link>
        <div className="h-8" />
      </div>
    </div>
  );
}
