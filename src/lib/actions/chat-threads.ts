"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { resolveChatModel, titleFromMessage } from "@/lib/ai/models";

export type ChatThreadListItem = {
  id: string;
  title: string | null;
  model: string;
  updatedAt: string;
  preview: string | null;
};

export type ChatThreadMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export async function listChatThreads(): Promise<ChatThreadListItem[]> {
  const trainer = await requireRole("ADMIN");

  const threads = await prisma.chatThread.findMany({
    where: { trainerId: trainer.id },
    orderBy: { updatedAt: "desc" },
    take: 30,
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true },
      },
    },
  });

  return threads.map((thread) => ({
    id: thread.id,
    title: thread.title,
    model: thread.model,
    updatedAt: thread.updatedAt.toISOString(),
    preview: thread.messages[0]?.content ?? null,
  }));
}

export async function getThreadMessages(
  threadId: string,
): Promise<ChatThreadMessage[]> {
  const trainer = await requireRole("ADMIN");

  const thread = await prisma.chatThread.findFirst({
    where: { id: threadId, trainerId: trainer.id },
    select: { id: true },
  });
  if (!thread) throw new Error("Чат не знайдено");

  const messages = await prisma.chatMessage.findMany({
    where: { threadId },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((m) => ({
    id: m.id,
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
    createdAt: m.createdAt.toISOString(),
  }));
}

export async function createChatThread(model?: string) {
  const trainer = await requireRole("ADMIN");
  const resolved = resolveChatModel(model);

  const thread = await prisma.chatThread.create({
    data: {
      trainerId: trainer.id,
      model: resolved,
    },
  });

  revalidatePath("/ai");
  return {
    id: thread.id,
    title: thread.title,
    model: thread.model,
    updatedAt: thread.updatedAt.toISOString(),
    preview: null as string | null,
  } satisfies ChatThreadListItem;
}

export async function updateThreadModel(threadId: string, model: string) {
  const trainer = await requireRole("ADMIN");
  const resolved = resolveChatModel(model);

  const existing = await prisma.chatThread.findFirst({
    where: { id: threadId, trainerId: trainer.id },
  });
  if (!existing) throw new Error("Чат не знайдено");

  await prisma.chatThread.update({
    where: { id: threadId },
    data: { model: resolved },
  });

  revalidatePath("/ai");
  return resolved;
}

export async function deleteChatThread(threadId: string) {
  const trainer = await requireRole("ADMIN");

  const existing = await prisma.chatThread.findFirst({
    where: { id: threadId, trainerId: trainer.id },
  });
  if (!existing) throw new Error("Чат не знайдено");

  await prisma.chatThread.delete({ where: { id: threadId } });
  revalidatePath("/ai");
}


