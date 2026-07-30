"use server";

import { requireRole } from "@/lib/auth/current-user";
import {
  buildTrainerContext,
  type TrainerChatContext,
} from "@/lib/ai/trainer-chat";

export type { ChatHistoryItem, TrainerChatContext } from "@/lib/ai/trainer-chat";

export async function getTrainerChatBootstrap(): Promise<TrainerChatContext> {
  const trainer = await requireRole("ADMIN");
  return buildTrainerContext(trainer.id);
}
