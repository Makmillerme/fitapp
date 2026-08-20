import { prisma } from "@/lib/prisma";
import {
  NOTE_TEMPLATE_CONTRA,
  NOTE_TEMPLATE_GOAL,
  NOTE_TEMPLATES,
} from "@/lib/notes/templates";

export async function ensureClientNoteTemplates(contactId: string) {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { id: true, goal: true, notes: true },
  });
  if (!contact) return;

  const existing = await prisma.contactNote.findMany({
    where: {
      contactId,
      templateKey: { in: [...NOTE_TEMPLATES.map((item) => item.key)] },
    },
    select: { templateKey: true },
  });
  const have = new Set(existing.map((row) => row.templateKey));
  const missing = NOTE_TEMPLATES.filter((item) => !have.has(item.key));
  if (missing.length === 0) return;

  await prisma.contactNote.createMany({
    data: missing.map((item) => ({
      contactId,
      kind: "GENERAL" as const,
      templateKey: item.key,
      title: item.title,
      body:
        item.key === NOTE_TEMPLATE_GOAL
          ? (contact.goal ?? "")
          : item.key === NOTE_TEMPLATE_CONTRA
            ? (contact.notes ?? "")
            : "",
    })),
  });
}
