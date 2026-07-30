import { prisma } from "@/lib/prisma";
import type { ChatTurn } from "@/lib/ai/openai";

export type ChatHistoryItem = {
  role: "user" | "assistant";
  content: string;
};

export type TrainerChatContext = {
  clientCount: number;
  activeCount: number;
  debtCount: number;
  clientNames: string[];
};

export async function buildTrainerContext(
  trainerId: string,
): Promise<TrainerChatContext> {
  const clients = await prisma.contact.findMany({
    where: { trainerId, isClient: true },
    select: { firstName: true, lastName: true, status: true },
    orderBy: { firstName: "asc" },
    take: 20,
  });

  return {
    clientCount: clients.length,
    activeCount: clients.filter((c) => c.status === "ACTIVE").length,
    debtCount: clients.filter((c) => c.status === "DEBT").length,
    clientNames: clients.map((c) => `${c.firstName} ${c.lastName ?? ""}`.trim()),
  };
}

export function buildSystemPrompt(ctx: TrainerChatContext): string {
  const names =
    ctx.clientNames.length > 0
      ? ctx.clientNames.slice(0, 8).join(", ")
      : "клієнтів ще немає";

  return [
    "Ти — AI-асистент для персонального тренера у CRM FitApp.",
    "Відповідай українською, стисло й по суті. Допомагай з програмами, мотивацією, комунікацією з клієнтами, плануванням навантажень.",
    "Не вигадуй дані про клієнтів поза наданим контекстом.",
    "",
    `Контекст тренера: клієнтів ${ctx.clientCount}, активних ${ctx.activeCount}, боржників ${ctx.debtCount}.`,
    `Імена клієнтів: ${names}.`,
  ].join("\n");
}

export function buildMockReply(message: string, ctx: TrainerChatContext): string {
  return [
    "Це демо-відповідь (додай OPENAI_API_KEY у .env для реального чату).",
    "",
    `Твоє питання: «${message}»`,
    "",
    `У тебе зараз ${ctx.clientCount} клієнт(ів), ${ctx.debtCount} з боргом. Можу допомогти скласти текст нагадування про оплату, план тренування або ідеї для утримання клієнтів.`,
  ].join("\n");
}

export function buildChatTurns(
  ctx: TrainerChatContext,
  history: ChatHistoryItem[],
  message: string,
): ChatTurn[] {
  const recent = history.slice(-16);
  return [
    { role: "system", content: buildSystemPrompt(ctx) },
    ...recent.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: message },
  ];
}
