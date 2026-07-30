import { NextRequest, NextResponse } from "next/server";
import { getBot } from "@/lib/telegram/bot";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const secret = request.headers.get("x-telegram-bot-api-secret-token");
    if (
      process.env.TELEGRAM_WEBHOOK_SECRET &&
      secret !== process.env.TELEGRAM_WEBHOOK_SECRET
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const update = await request.json();
    const bot = getBot();
    await bot.handleUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[telegram/webhook]", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const bot = getBot();
    const info = await bot.api.getWebhookInfo();
    return NextResponse.json(info);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
