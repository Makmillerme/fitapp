import type { Prisma } from "@/generated/prisma/client";
import { phoneDigits } from "@/lib/phone";

/** Fields needed to identify the trainer's own profile Contact. */
export type TrainerIdentity = {
  telegramId: bigint;
  phone: string | null;
};

export type ContactIdentity = {
  telegramId: bigint | null;
  phone: string | null;
};

/** Prisma OR that matches the trainer's self Contact (same as profile lookup). */
export function selfContactMatchWhere(
  trainer: TrainerIdentity,
): Prisma.ContactWhereInput {
  return {
    OR: [
      { telegramId: trainer.telegramId },
      ...(trainer.phone ? [{ phone: trainer.phone }] : []),
    ],
  };
}

/**
 * Exclude the trainer's own profile Contact from CRM lists.
 * Do NOT use `NOT: { OR: [telegramId=X, phone=Y] }` — in SQL, rows with
 * `telegramId IS NULL` make the OR UNKNOWN and get filtered out (looks like
 * "all contacts vanished").
 */
export function excludeSelfContactWhere(
  trainer: TrainerIdentity,
): Prisma.ContactWhereInput {
  const parts: Prisma.ContactWhereInput[] = [
    {
      OR: [
        { telegramId: null },
        { telegramId: { not: trainer.telegramId } },
      ],
    },
  ];
  if (trainer.phone) {
    parts.push({
      OR: [{ phone: null }, { phone: { not: trainer.phone } }],
    });
  }
  return { AND: parts };
}

export function isSelfContact(
  trainer: TrainerIdentity,
  contact: ContactIdentity,
): boolean {
  if (
    contact.telegramId != null &&
    contact.telegramId === trainer.telegramId
  ) {
    return true;
  }
  if (trainer.phone && contact.phone) {
    if (contact.phone === trainer.phone) return true;
    return phoneDigits(contact.phone) === phoneDigits(trainer.phone);
  }
  return false;
}

export function assertNotSelfContact(
  trainer: TrainerIdentity,
  contact: ContactIdentity,
  message = "Не можна використати власний профіль як контакт чи клієнта",
): void {
  if (isSelfContact(trainer, contact)) {
    throw new Error(message);
  }
}

/** Block creating a CRM contact/client with the trainer's own phone. */
export function assertPhoneNotTrainer(
  trainer: TrainerIdentity,
  phone: string,
  message = "Не можна додати самого себе",
): void {
  if (!trainer.phone) return;
  if (
    phone === trainer.phone ||
    phoneDigits(phone) === phoneDigits(trainer.phone)
  ) {
    throw new Error(message);
  }
}
