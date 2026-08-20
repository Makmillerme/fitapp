"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import {
  NOTE_TEMPLATE_CONTRA,
  NOTE_TEMPLATE_GOAL,
} from "@/lib/notes/templates";

const upsertNoteSchema = z.object({
  clientId: z.string().min(1),
  id: z.string().min(1).optional(),
  kind: z.enum(["PROGRESS", "GENERAL"]).optional(),
  title: z.string().trim().max(80).optional(),
  body: z.string().trim().max(4000),
});

export async function upsertClientNote(input: z.input<typeof upsertNoteSchema>) {
  const admin = await requireRole("ADMIN");
  const parsed = upsertNoteSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Невірні дані");
  }

  const { clientId, id, kind, title, body } = parsed.data;

  const client = await prisma.contact.findFirst({
    where: { id: clientId, trainerId: admin.id, isClient: true },
    select: { id: true },
  });
  if (!client) throw new Error("Клієнта не знайдено");

  let note;
  if (id) {
    const current = await prisma.contactNote.findFirst({
      where: { id, contactId: clientId },
    });
    if (!current) throw new Error("Нотатку не знайдено");

    const nextTitle = current.templateKey
      ? current.title
      : (title?.trim() || current.title);
    if (!current.templateKey && !nextTitle) {
      throw new Error("Вкажіть назву");
    }

    note = await prisma.contactNote.update({
      where: { id: current.id },
      data: {
        title: nextTitle,
        body,
      },
    });
  } else {
    const nextKind = kind ?? "GENERAL";
    const nextTitle = title?.trim() ?? "";
    if (!nextTitle) throw new Error("Вкажіть назву");

    note = await prisma.contactNote.create({
      data: {
        contactId: clientId,
        kind: nextKind,
        title: nextTitle,
        body,
      },
    });
  }

  if (note.templateKey === NOTE_TEMPLATE_GOAL) {
    await prisma.contact.update({
      where: { id: clientId },
      data: { goal: body || null },
    });
  } else if (note.templateKey === NOTE_TEMPLATE_CONTRA) {
    await prisma.contact.update({
      where: { id: clientId },
      data: { notes: body || null },
    });
  }

  revalidatePath("/schedule");
  return note;
}

export async function deleteClientNote(clientId: string, noteId: string) {
  const admin = await requireRole("ADMIN");

  const client = await prisma.contact.findFirst({
    where: { id: clientId, trainerId: admin.id, isClient: true },
    select: { id: true },
  });
  if (!client) throw new Error("Клієнта не знайдено");

  const current = await prisma.contactNote.findFirst({
    where: { id: noteId, contactId: clientId },
  });
  if (!current) throw new Error("Нотатку не знайдено");
  if (current.templateKey) {
    throw new Error("Шаблонну нотатку не можна видалити");
  }

  await prisma.contactNote.delete({ where: { id: current.id } });

  revalidatePath("/schedule");
  return { id: current.id };
}
