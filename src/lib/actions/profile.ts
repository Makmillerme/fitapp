"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { PHONE_INVALID_MESSAGE, isValidPhone, parsePhone } from "@/lib/phone";

const tagRegex = /^[a-z0-9_]{3,24}$/;

const updateProfileSchema = z.object({
  contactId: z.string().min(1),
  firstName: z.string().trim().min(1, "Вкажіть імʼя").optional(),
  lastName: z.string().trim().nullable().optional(),
  phone: z
    .string()
    .trim()
    .refine((value) => !value || isValidPhone(value), PHONE_INVALID_MESSAGE)
    .nullable()
    .optional(),
  about: z.string().trim().max(180, "Максимум 180 символів").nullable().optional(),
  tag: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => !value || tagRegex.test(value), "Тег: 3-24 символи (a-z, 0-9, _)")
    .nullable()
    .optional(),
  dateOfBirth: z.coerce.date().nullable().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable().optional(),
  heightCm: z.number().positive().max(260).nullable().optional(),
  weightKg: z.number().positive().max(500).nullable().optional(),
});

export async function getOrCreateMyContactProfile() {
  const trainer = await requireRole("ADMIN");

  let profileContact = await prisma.contact.findFirst({
    where: {
      trainerId: trainer.id,
      OR: [
        { telegramId: trainer.telegramId },
        ...(trainer.phone ? [{ phone: trainer.phone }] : []),
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  if (!profileContact) {
    profileContact = await prisma.contact.create({
      data: {
        trainerId: trainer.id,
        firstName: trainer.firstName,
        lastName: trainer.lastName,
        phone: trainer.phone,
        telegramId: trainer.telegramId,
        photoUrl: trainer.photoUrl,
        isClient: false,
      },
    });
  }

  return profileContact;
}

export async function updateContactProfile(input: z.input<typeof updateProfileSchema>) {
  const trainer = await requireRole("ADMIN");
  const parsed = updateProfileSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Невірні дані");
  }

  const {
    contactId,
    firstName,
    lastName,
    phone,
    about,
    tag,
    dateOfBirth,
    gender,
    heightCm,
    weightKg,
  } = parsed.data;

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, trainerId: trainer.id },
    select: { id: true, isClient: true },
  });
  if (!contact) throw new Error("Контакт не знайдено");

  const normalizedPhone = phone == null ? phone : phone.trim() ? parsePhone(phone) : null;
  const normalizedTag = tag == null ? tag : tag.trim() ? tag.toLowerCase() : null;

  if (!contact.isClient && (heightCm !== undefined || weightKg !== undefined)) {
    throw new Error("Ріст та вага редагуються тільки для контактів зі статусом клієнта");
  }

  if (normalizedTag) {
    const taken = await prisma.contact.findFirst({
      where: { tag: normalizedTag, id: { not: contactId } },
      select: { id: true },
    });
    if (taken) {
      throw new Error("Цей тег уже зайнятий. Спробуйте інший.");
    }
  }

  try {
    const updated = await prisma.contact.update({
      where: { id: contactId },
      data: {
        ...(firstName !== undefined ? { firstName: firstName.trim() } : {}),
        ...(lastName !== undefined
          ? { lastName: lastName && lastName.trim() ? lastName.trim() : null }
          : {}),
        ...(normalizedPhone !== undefined ? { phone: normalizedPhone } : {}),
        ...(about !== undefined
          ? { about: about && about.trim() ? about.trim() : null }
          : {}),
        ...(normalizedTag !== undefined ? { tag: normalizedTag } : {}),
        ...(dateOfBirth !== undefined ? { dateOfBirth } : {}),
        ...(gender !== undefined ? { gender } : {}),
        ...(heightCm !== undefined ? { heightCm } : {}),
        ...(weightKg !== undefined ? { weightKg } : {}),
      },
    });

    revalidatePath("/profile");
    revalidatePath("/clients");
    revalidatePath("/contacts");
    return updated;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      throw new Error("Цей тег уже зайнятий. Спробуйте інший.");
    }
    throw error;
  }
}
