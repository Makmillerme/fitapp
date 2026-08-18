"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import {
  isValidPhone,
  parsePhone,
  phoneDigits,
  PHONE_INVALID_MESSAGE,
  CONTACT_PHONE_EXISTS_MESSAGE,
} from "@/lib/phone";
import {
  assertNotSelfContact,
  assertPhoneNotTrainer,
  excludeSelfContactWhere,
} from "@/lib/contacts/self-contact";

export type ContactListItem = {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  photoUrl: string | null;
  isClient: boolean;
};

export type ContactChatMessage = {
  id: string;
  senderRole: "ADMIN" | "CONTACT";
  body: string;
  createdAt: string;
};

export type ContactConversationListItem = {
  id: string;
  contactId: string;
  contactFirstName: string;
  contactLastName: string | null;
  contactPhotoUrl: string | null;
  updatedAt: string;
  preview: string | null;
};

const createContactSchema = z.object({
  firstName: z.string().trim().min(1, "Вкажіть імʼя"),
  lastName: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .min(1, "Вкажіть номер телефону")
    .refine(isValidPhone, PHONE_INVALID_MESSAGE),
});

async function assertOwnedContact(
  contactId: string,
  trainer: { id: string; telegramId: bigint; phone: string | null },
) {
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, trainerId: trainer.id },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      photoUrl: true,
      phone: true,
      telegramId: true,
      isClient: true,
    },
  });
  if (!contact) throw new Error("Контакт не знайдено");
  assertNotSelfContact(trainer, contact);
  return contact;
}

export async function listContacts(opts?: { query?: string }) {
  const admin = await requireRole("ADMIN");
  const query = opts?.query?.trim();

  return prisma.contact.findMany({
    where: {
      trainerId: admin.id,
      ...excludeSelfContactWhere(admin),
      ...(query
        ? {
            OR: [
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
}

export async function createContact(input: z.input<typeof createContactSchema>) {
  const admin = await requireRole("ADMIN");
  const parsed = createContactSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Невірні дані");
  }

  const { firstName } = parsed.data;
  const lastName = parsed.data.lastName?.trim()
    ? parsed.data.lastName.trim()
    : null;
  const phone = parsePhone(parsed.data.phone);
  const phoneKey = phoneDigits(phone);
  assertPhoneNotTrainer(admin, phone);

  const existing = await prisma.contact.findMany({
    where: { trainerId: admin.id, phone: { not: null } },
    select: { id: true, phone: true },
  });
  const duplicate = existing.find(
    (c) => c.phone && phoneDigits(c.phone) === phoneKey,
  );
  if (duplicate) {
    throw new Error(CONTACT_PHONE_EXISTS_MESSAGE);
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        trainerId: admin.id,
        firstName,
        lastName,
        phone,
        isClient: false,
      },
    });

    revalidatePath("/contacts");
    return contact;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new Error(CONTACT_PHONE_EXISTS_MESSAGE);
    }
    throw error;
  }
}

export async function listContactConversations(): Promise<
  ContactConversationListItem[]
> {
  const admin = await requireRole("ADMIN");

  const conversations = await prisma.contactConversation.findMany({
    where: {
      trainerId: admin.id,
      contact: excludeSelfContactWhere(admin),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          photoUrl: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { body: true },
      },
    },
  });

  return conversations.map((c) => ({
    id: c.id,
    contactId: c.contact.id,
    contactFirstName: c.contact.firstName,
    contactLastName: c.contact.lastName,
    contactPhotoUrl: c.contact.photoUrl,
    updatedAt: c.updatedAt.toISOString(),
    preview: c.messages[0]?.body ?? null,
  }));
}

export async function listContactMessages(
  contactId: string,
): Promise<ContactChatMessage[]> {
  const admin = await requireRole("ADMIN");
  await assertOwnedContact(contactId, admin);

  const conversation = await prisma.contactConversation.findUnique({
    where: {
      trainerId_contactId: {
        trainerId: admin.id,
        contactId,
      },
    },
    select: { id: true },
  });
  if (!conversation) return [];

  const messages = await prisma.contactMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((m) => ({
    id: m.id,
    senderRole: m.senderRole,
    body: m.body,
    createdAt: m.createdAt.toISOString(),
  }));
}

const sendSchema = z.object({
  contactId: z.string().min(1),
  body: z.string().trim().min(1, "Введіть повідомлення").max(4000),
});

export async function sendContactMessage(input: z.input<typeof sendSchema>) {
  const admin = await requireRole("ADMIN");
  const parsed = sendSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Невірні дані");
  }

  const { contactId, body } = parsed.data;
  await assertOwnedContact(contactId, admin);

  const conversation = await prisma.contactConversation.upsert({
    where: {
      trainerId_contactId: {
        trainerId: admin.id,
        contactId,
      },
    },
    create: {
      trainerId: admin.id,
      contactId,
    },
    update: {
      updatedAt: new Date(),
    },
  });

  const message = await prisma.contactMessage.create({
    data: {
      conversationId: conversation.id,
      senderRole: "ADMIN",
      body,
    },
  });

  await prisma.contactConversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  });

  revalidatePath("/contacts");
  revalidatePath("/clients");

  return {
    id: message.id,
    senderRole: message.senderRole,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
  } satisfies ContactChatMessage;
}
