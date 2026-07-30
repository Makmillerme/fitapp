import { parse, validate } from "@tma.js/init-data-node";

export type TelegramInitUser = {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
};

export function validateAndParseInitData(initDataRaw: string): TelegramInitUser {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  // Throws if signature invalid or expired
  validate(initDataRaw, token, { expiresIn: 3600 });

  const data = parse(initDataRaw);
  if (!data.user?.id || !data.user.first_name) {
    throw new Error("Init data does not contain a valid user");
  }

  return {
    id: data.user.id,
    firstName: data.user.first_name,
    lastName: data.user.last_name,
    username: data.user.username,
    photoUrl: data.user.photo_url,
  };
}
