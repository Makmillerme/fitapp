import { NextRequest } from "next/server";
import { getSessionFromCookies } from "@/lib/auth/session";
import { streamChat } from "@/lib/ai/openai";
import {
  buildChatTurns,
  buildMockReply,
  buildTrainerContext,
  type ChatHistoryItem,
} from "@/lib/ai/trainer-chat";
import { resolveChatModel, titleFromMessage } from "@/lib/ai/models";
import { prisma } from "@/lib/prisma";

const encoder = new TextEncoder();

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function* streamMockText(text: string) {
  const tokens = text.match(/\S+|\s+/g) ?? [text];
  for (const token of tokens) {
    yield token;
    await sleep(token.trim() ? 28 : 8);
  }
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "ADMIN") {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { threadId?: string; message?: string; model?: string };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const message = body.message?.trim();
  if (!message) {
    return new Response("Message required", { status: 400 });
  }

  let thread =
    body.threadId
      ? await prisma.chatThread.findFirst({
          where: { id: body.threadId, trainerId: session.userId },
        })
      : null;

  if (!thread) {
    thread = await prisma.chatThread.create({
      data: {
        trainerId: session.userId,
        model: resolveChatModel(body.model),
      },
    });
  } else if (body.model) {
    const resolved = resolveChatModel(body.model);
    if (thread.model !== resolved) {
      thread = await prisma.chatThread.update({
        where: { id: thread.id },
        data: { model: resolved },
      });
    }
  }

  await prisma.chatMessage.create({
    data: {
      threadId: thread.id,
      role: "USER",
      content: message,
    },
  });

  if (!thread.title) {
    await prisma.chatThread.update({
      where: { id: thread.id },
      data: { title: titleFromMessage(message) },
    });
  }

  const dbMessages = await prisma.chatMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
    take: 40,
  });

  const history: ChatHistoryItem[] = dbMessages
    .slice(0, -1)
    .slice(-16)
    .map((m) => ({
      role: m.role === "USER" ? "user" : "assistant",
      content: m.content,
    }));

  const ctx = await buildTrainerContext(session.userId);
  const isMock = !process.env.OPENAI_API_KEY;
  const model = resolveChatModel(thread.model);
  const threadId = thread.id;

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let assistantText = "";
      try {
        const source = isMock
          ? streamMockText(buildMockReply(message, ctx))
          : streamChat(buildChatTurns(ctx, history, message), model);

        for await (const chunk of source) {
          assistantText += chunk;
          controller.enqueue(encoder.encode(chunk));
        }

        if (assistantText.trim()) {
          await prisma.chatMessage.create({
            data: {
              threadId,
              role: "ASSISTANT",
              content: assistantText,
            },
          });
        }

        await prisma.chatThread.update({
          where: { id: threadId },
          data: { updatedAt: new Date() },
        });

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Chat-Mock": isMock ? "1" : "0",
      "X-Thread-Id": threadId,
    },
  });
}
