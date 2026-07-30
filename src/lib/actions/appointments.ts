"use server";

import { revalidatePath } from "next/cache";
import { endOfDay, startOfDay } from "date-fns";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import type { AppointmentStatus } from "@/generated/prisma/client";

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
}) {
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
  });

  revalidatePath("/schedule");
  return appointment;
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
      if (client && client.sessionBalance <= 1) {
        await tx.contact.update({
          where: { id: client.id },
          data: {
            status: client.sessionBalance - 1 <= 0 ? "DEBT" : client.status,
          },
        });
      }
    }
  });

  revalidatePath("/schedule");
  revalidatePath("/clients");
}
