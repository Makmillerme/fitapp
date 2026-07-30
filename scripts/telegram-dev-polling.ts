import "dotenv/config";
import { getBot } from "../src/lib/telegram/bot";

async function main() {
  const bot = getBot();
  console.log("Starting Telegram bot in long-polling mode...");
  await bot.start({
    onStart: (info) => {
      console.log(`Bot @${info.username} is running (polling)`);
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
