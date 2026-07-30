import { Bot, InlineKeyboard } from "grammy";

function getBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }
  return token;
}

function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

let botInstance: Bot | null = null;

export function getBot(): Bot {
  if (botInstance) return botInstance;

  const bot = new Bot(getBotToken());

  bot.command("start", async (ctx) => {
    const keyboard = new InlineKeyboard().webApp(
      "Відкрити FitApp",
      getAppUrl(),
    );

    await ctx.reply(
      "Привіт! Я FitApp — CRM для тренерів.\nНатисни кнопку нижче, щоб відкрити додаток.",
      { reply_markup: keyboard },
    );
  });

  botInstance = bot;
  return bot;
}
