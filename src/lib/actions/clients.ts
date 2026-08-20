"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import type { UserStatus } from "@/generated/prisma/client";
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
import { ensureClientNoteTemplates } from "@/lib/notes/ensure";

const createClientSchema = z.object({
  firstName: z.string().trim().min(1, "Вкажіть імʼя"),
  lastName: z.string().trim().optional(),
  phone: z
    .string()
    .trim()
    .min(1, "Вкажіть номер телефону")
    .refine(isValidPhone, PHONE_INVALID_MESSAGE),
});

const updateClientGeneralSchema = z.object({
  clientId: z.string().min(1),
  firstName: z.string().trim().min(1, "Вкажіть імʼя").optional(),
  lastName: z.string().trim().nullable().optional(),
  phone: z
    .string()
    .trim()
    .refine((value) => !value || isValidPhone(value), PHONE_INVALID_MESSAGE)
    .nullable()
    .optional(),
  dateOfBirth: z.coerce.date().nullable().optional(),
  heightCm: z.number().positive().max(260).nullable().optional(),
  weightKg: z.number().positive().max(500).nullable().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).nullable().optional(),
  tag: z
    .string()
    .trim()
    .toLowerCase()
    .refine(
      (value) => !value || /^[a-z0-9_]{3,24}$/.test(value),
      "Тег: 3-24 символи (a-z, 0-9, _)",
    )
    .nullable()
    .optional(),
  measuredAt: z.coerce.date().nullable().optional(),
  neckCm: z.number().positive().max(120).nullable().optional(),
  chestCm: z.number().positive().max(220).nullable().optional(),
  waistCm: z.number().positive().max(220).nullable().optional(),
  hipsCm: z.number().positive().max(220).nullable().optional(),
  bicepsCm: z.number().positive().max(90).nullable().optional(),
  shoulderCm: z.number().positive().max(180).nullable().optional(),
  forearmCm: z.number().positive().max(80).nullable().optional(),
  thighCm: z.number().positive().max(150).nullable().optional(),
  calfCm: z.number().positive().max(90).nullable().optional(),
  measurementHeightCm: z.number().positive().max(260).nullable().optional(),
});

export async function listClients(opts?: {
  query?: string;
  status?: UserStatus | "ALL";
}) {
  const admin = await requireRole("ADMIN");
  const query = opts?.query?.trim();
  const status = opts?.status && opts.status !== "ALL" ? opts.status : undefined;

  return prisma.contact.findMany({
    where: {
      trainerId: admin.id,
      isClient: true,
      ...excludeSelfContactWhere(admin),
      ...(status ? { status } : {}),
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

export async function getClientCounts() {
  const admin = await requireRole("ADMIN");
  const base = {
    trainerId: admin.id,
    isClient: true as const,
    ...excludeSelfContactWhere(admin),
  };
  const [active, debt, paused] = await Promise.all([
    prisma.contact.count({ where: { ...base, status: "ACTIVE" } }),
    prisma.contact.count({ where: { ...base, status: "DEBT" } }),
    prisma.contact.count({ where: { ...base, status: "PAUSED" } }),
  ]);
  return { active, debt, paused };
}

export async function getClientsPageData() {
  const admin = await requireRole("ADMIN");
  const trainerId = admin.id;
  const notSelf = excludeSelfContactWhere(admin);
  const base = { trainerId, isClient: true as const, ...notSelf };

  const [clients, contacts, active, debt, paused] = await Promise.all([
    prisma.contact.findMany({
      where: { trainerId, isClient: true, ...notSelf },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
    prisma.contact.findMany({
      where: { trainerId, ...notSelf },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    }),
    prisma.contact.count({ where: { ...base, status: "ACTIVE" } }),
    prisma.contact.count({ where: { ...base, status: "DEBT" } }),
    prisma.contact.count({ where: { ...base, status: "PAUSED" } }),
  ]);

  return {
    clients,
    counts: { active, debt, paused },
    contacts,
  };
}

export async function getClientDetail(clientId: string) {
  const admin = await requireRole("ADMIN");

  const client = await prisma.contact.findFirst({
    where: {
      id: clientId,
      trainerId: admin.id,
      isClient: true,
      ...excludeSelfContactWhere(admin),
    },
  });
  if (!client) return null;

  await ensureClientNoteTemplates(clientId);

  const [appointments, logs, latestMeasurement, clientNotes] = await Promise.all([
    prisma.appointment.findMany({
      where: { clientId, trainerId: admin.id },
      include: { program: true },
      orderBy: { startAt: "desc" },
      take: 20,
    }),
    prisma.workoutLog.findMany({
      where: { clientId, trainerId: admin.id },
      include: { exercise: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.contactMeasurement.findFirst({
      where: { contactId: clientId },
      orderBy: [{ measuredAt: "desc" }, { id: "desc" }],
    }),
    prisma.contactNote.findMany({
      where: { contactId: clientId },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    }),
  ]);

  return { client, appointments, logs, latestMeasurement, clientNotes };
}

export async function updateClientBalance(clientId: string, delta: number) {
  const admin = await requireRole("ADMIN");

  const client = await prisma.contact.findFirst({
    where: { id: clientId, trainerId: admin.id, isClient: true },
  });
  if (!client) throw new Error("Клієнта не знайдено");

  const nextBalance = client.sessionBalance + delta;
  const nextStatus =
    nextBalance <= 0
      ? "DEBT"
      : client.status === "DEBT" && nextBalance > 0
        ? "ACTIVE"
        : client.status;

  const updated = await prisma.contact.update({
    where: { id: clientId },
    data: {
      sessionBalance: nextBalance,
      status: nextStatus,
    },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  return updated;
}

export async function createClient(input: z.input<typeof createClientSchema>) {
  const admin = await requireRole("ADMIN");
  const parsed = createClientSchema.safeParse(input);
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
    select: { id: true, phone: true, isClient: true },
  });
  const duplicate = existing.find(
    (c) => c.phone && phoneDigits(c.phone) === phoneKey,
  );
  if (duplicate) {
    throw new Error(CONTACT_PHONE_EXISTS_MESSAGE);
  }

  try {
    const client = await prisma.contact.create({
      data: {
        trainerId: admin.id,
        firstName,
        lastName,
        phone,
        isClient: true,
        sessionBalance: 0,
        status: "DEBT",
      },
    });

    await ensureClientNoteTemplates(client.id);

    revalidatePath("/clients");
    revalidatePath("/contacts");
    return client;
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

export async function promoteContactToClient(contactId: string) {
  const admin = await requireRole("ADMIN");

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, trainerId: admin.id },
  });
  if (!contact) throw new Error("Контакт не знайдено");
  assertNotSelfContact(admin, contact);
  if (contact.isClient) throw new Error("Цей контакт уже є клієнтом");

  const updated = await prisma.contact.update({
    where: { id: contactId },
    data: {
      isClient: true,
      status: "DEBT",
      sessionBalance: 0,
    },
  });

  await ensureClientNoteTemplates(updated.id);

  revalidatePath("/clients");
  revalidatePath("/contacts");
  return updated;
}

export async function upsertClientGeneral(input: z.input<typeof updateClientGeneralSchema>) {
  const admin = await requireRole("ADMIN");
  const parsed = updateClientGeneralSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Невірні дані");
  }

  const {
    clientId,
    firstName,
    lastName,
    phone,
    dateOfBirth,
    heightCm,
    weightKg,
    gender,
    tag,
    measuredAt,
    neckCm,
    chestCm,
    waistCm,
    hipsCm,
    bicepsCm,
    shoulderCm,
    forearmCm,
    thighCm,
    calfCm,
    measurementHeightCm,
  } = parsed.data;

  const client = await prisma.contact.findFirst({
    where: { id: clientId, trainerId: admin.id, isClient: true },
  });
  if (!client) throw new Error("Клієнта не знайдено");

  const normalizedPhone = phone == null ? phone : phone.trim() ? parsePhone(phone) : null;
  const normalizedTag = tag == null ? tag : tag.trim() ? tag.toLowerCase() : null;

  if (normalizedPhone) {
    assertPhoneNotTrainer(admin, normalizedPhone);
    const duplicate = await prisma.contact.findFirst({
      where: {
        trainerId: admin.id,
        id: { not: clientId },
        phone: normalizedPhone,
      },
      select: { id: true },
    });
    if (duplicate) {
      throw new Error(CONTACT_PHONE_EXISTS_MESSAGE);
    }
  }

  if (normalizedTag) {
    const taken = await prisma.contact.findFirst({
      where: { tag: normalizedTag, id: { not: clientId } },
      select: { id: true },
    });
    if (taken) {
      throw new Error("Цей тег уже зайнятий. Спробуйте інший.");
    }
  }

  const updatedClient = await prisma.contact.update({
    where: { id: clientId },
    data: {
      ...(firstName !== undefined ? { firstName: firstName.trim() } : {}),
      ...(lastName !== undefined
        ? { lastName: lastName && lastName.trim() ? lastName.trim() : null }
        : {}),
      ...(normalizedPhone !== undefined ? { phone: normalizedPhone } : {}),
      ...(dateOfBirth !== undefined ? { dateOfBirth } : {}),
      ...(heightCm !== undefined ? { heightCm } : {}),
      ...(weightKg !== undefined ? { weightKg } : {}),
      ...(gender !== undefined ? { gender } : {}),
      ...(normalizedTag !== undefined ? { tag: normalizedTag } : {}),
    },
  });

  const hasAnyMeasurement = [
    neckCm,
    chestCm,
    waistCm,
    hipsCm,
    bicepsCm,
    shoulderCm,
    forearmCm,
    thighCm,
    calfCm,
    measurementHeightCm,
  ].some((value) => value !== undefined);

  let latestMeasurement = null;
  if (hasAnyMeasurement) {
    latestMeasurement = await prisma.contactMeasurement.create({
      data: {
        contactId: clientId,
        measuredAt: measuredAt ?? new Date(),
        neckCm: neckCm ?? null,
        chestCm: chestCm ?? null,
        waistCm: waistCm ?? null,
        hipsCm: hipsCm ?? null,
        bicepsCm: bicepsCm ?? null,
        shoulderCm: shoulderCm ?? null,
        forearmCm: forearmCm ?? null,
        thighCm: thighCm ?? null,
        calfCm: calfCm ?? null,
        heightCm: measurementHeightCm ?? null,
      },
    });
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);

  return { client: updatedClient, latestMeasurement };
}
