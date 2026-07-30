import OpenAI from "openai";
import { DEFAULT_CHAT_MODEL } from "@/lib/ai/models";

let client: OpenAI | null = null;

export type ChatTurn = {
  role: "system" | "user" | "assistant";
  content: string;
};

export function getOpenAI(): OpenAI {
  if (client) return client;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  client = new OpenAI({ apiKey });
  return client;
}

export async function generateText(
  system: string,
  user: string,
  model: string = DEFAULT_CHAT_MODEL,
): Promise<string> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

export async function generateChat(
  messages: ChatTurn[],
  model: string = DEFAULT_CHAT_MODEL,
): Promise<string> {
  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content?.trim() ?? "";
}

export async function* streamChat(
  messages: ChatTurn[],
  model: string = DEFAULT_CHAT_MODEL,
): AsyncGenerator<string, void, unknown> {
  const openai = getOpenAI();
  const stream = await openai.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
    stream: true,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
