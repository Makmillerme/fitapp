import { addWeeks, startOfWeek } from "date-fns";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { ScheduleView } from "@/components/schedule/schedule-view";
import { excludeSelfContactWhere } from "@/lib/contacts/self-contact";

export default async function SchedulePage() {
  const trainer = await requireRole("ADMIN");

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const from = addWeeks(weekStart, -8);
  const to = addWeeks(weekStart, 12);

  const [appointments, clients] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        trainerId: trainer.id,
        startAt: { gte: from, lte: to },
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
          },
        },
        program: { select: { id: true, name: true } },
      },
      orderBy: { startAt: "asc" },
    }),
    prisma.contact.findMany({
      where: {
        trainerId: trainer.id,
        isClient: true,
        ...excludeSelfContactWhere(trainer),
      },
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    }),
  ]);

  const serialized = appointments.map((a) => ({
    id: a.id,
    startAt: a.startAt.toISOString(),
    endAt: a.endAt.toISOString(),
    location: a.location,
    notes: a.notes,
    status: a.status,
    client: a.client,
    program: a.program,
  }));

  return (
    <ScheduleView
      initialDate={new Date().toISOString()}
      appointments={serialized}
      clients={clients}
    />
  );
}
