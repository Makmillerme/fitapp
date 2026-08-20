"use server";

import { revalidatePath } from "next/cache";
import { endOfDay, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import type { AppointmentStatus } from "@/generated/prisma/client";
import type { ScheduleAppointment } from "@/components/schedule/schedule-appointment";

export async function listAppointmentsByDate(dateIso: string) {
  const trainer = await requireRole("ADMIN");
  const day = new Date(dateIso);

  return prisma.appointment.findMany({
    where: {
      trainerId: trainer.id,
      startAt: {
        gte: startOfDay(day),
        lte: endOfDay(day),
      },
    },
    include: {
      client: true,
      program: true,
    },
    orderBy: { startAt: "asc" },
  });
}

export async function createAppointment(input: {
  clientId: string;
  startAt: string;
  endAt: string;
  programId?: string;
  location?: string;
  notes?: string;
}): Promise<ScheduleAppointment> {
  const trainer = await requireRole("ADMIN");

  const client = await prisma.contact.findFirst({
    where: {
      id: input.clientId,
      isClient: true,
      trainerId: trainer.id,
    },
  });
  if (!client) {
    throw new Error("Клієнта не знайдено");
  }

  const appointment = await prisma.appointment.create({
    data: {
      trainerId: trainer.id,
      clientId: input.clientId,
      programId: input.programId || null,
      startAt: new Date(input.startAt),
      endAt: new Date(input.endAt),
      location: input.location,
      notes: input.notes,
      status: "SCHEDULED",
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
  });

  return {
    id: appointment.id,
    startAt: appointment.startAt.toISOString(),
    endAt: appointment.endAt.toISOString(),
    location: appointment.location,
    notes: appointment.notes,
    status: appointment.status,
    client: appointment.client,
    program: appointment.program,
  };
}

export async function moveAppointmentToDay(
  appointmentId: string,
  dayIso: string,
) {
  const trainer = await requireRole("ADMIN");

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, trainerId: trainer.id },
  });
  if (!appointment) {
    throw new Error("Запис не знайдено");
  }

  const parts = dayIso.slice(0, 10).split("-").map(Number);
  const year = parts[0];
  const month = parts[1];
  const day = parts[2];
  if (!year || !month || !day) {
    throw new Error("Некоректна дата");
  }

  const durationMs =
    appointment.endAt.getTime() - appointment.startAt.getTime();
  const nextStart = new Date(appointment.startAt);
  nextStart.setFullYear(year, month - 1, day);
  const nextEnd = new Date(nextStart.getTime() + durationMs);

  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { startAt: nextStart, endAt: nextEnd },
  });

  revalidatePath("/schedule");
}

export async function updateAppointmentStatus(
  appointmentId: string,
  status: AppointmentStatus,
) {
  const trainer = await requireRole("ADMIN");

  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, trainerId: trainer.id },
  });
  if (!appointment) {
    throw new Error("Запис не знайдено");
  }

  await prisma.$transaction(async (tx) => {
    await tx.appointment.update({
      where: { id: appointmentId },
      data: { status },
    });

    // Deduct session on no-show or completed if previously scheduled
    if (
      (status === "NO_SHOW" || status === "COMPLETED") &&
      appointment.status === "SCHEDULED"
    ) {
      await tx.contact.update({
        where: { id: appointment.clientId },
        data: {
          sessionBalance: { decrement: 1 },
        },
      });

      const client = await tx.contact.findUnique({
        where: { id: appointment.clientId },
      });
      if (client && client.sessionBalance <= 0) {
        await tx.contact.update({
          where: { id: client.id },
          data: { status: "DEBT" },
        });
      }
    }
  });

  revalidatePath("/schedule");
  revalidatePath("/clients");
}
