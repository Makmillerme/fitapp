"use server";

import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import sharp from "sharp";
import { requireRole } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import {
  MAX_CONTACT_PHOTOS,
  type ContactPhotoDto,
} from "@/lib/profile/photo-constants";

const MAX_RAW_BYTES = 10 * 1024 * 1024;
const MAX_EDGE = 1280;
const WEBP_QUALITY = 80;

function uploadsDir(contactId: string) {
  return path.join(process.cwd(), "public", "uploads", "contacts", contactId);
}

function publicUrl(contactId: string, fileName: string) {
  return `/uploads/contacts/${contactId}/${fileName}`;
}

function diskPathFromPublicUrl(url: string) {
  if (!url.startsWith("/uploads/contacts/")) return null;
  const relative = url.replace(/^\//, "");
  const absolute = path.join(process.cwd(), "public", relative);
  const uploadsRoot = path.join(process.cwd(), "public", "uploads", "contacts");
  if (!absolute.startsWith(uploadsRoot)) return null;
  return absolute;
}

async function assertOwnedContact(contactId: string) {
  const trainer = await requireRole("ADMIN");
  const contact = await prisma.contact.findFirst({
    where: { id: contactId, trainerId: trainer.id },
    select: { id: true, photoUrl: true },
  });
  if (!contact) throw new Error("Контакт не знайдено");
  return contact;
}

async function listPhotos(contactId: string): Promise<ContactPhotoDto[]> {
  const rows = await prisma.contactPhoto.findMany({
    where: { contactId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, url: true, sortOrder: true },
  });
  return rows;
}

async function syncPrimaryPhotoUrl(contactId: string) {
  const primary = await prisma.contactPhoto.findFirst({
    where: { contactId, sortOrder: 0 },
    select: { url: true },
  });
  await prisma.contact.update({
    where: { id: contactId },
    data: { photoUrl: primary?.url ?? null },
  });
  return primary?.url ?? null;
}

async function reindexPhotos(contactId: string) {
  const photos = await prisma.contactPhoto.findMany({
    where: { contactId },
    orderBy: { sortOrder: "asc" },
    select: { id: true },
  });

  // Avoid unique(contactId, sortOrder) collisions while shifting.
  await prisma.$transaction(
    photos.map((photo, index) =>
      prisma.contactPhoto.update({
        where: { id: photo.id },
        data: { sortOrder: index + 1000 },
      }),
    ),
  );

  await prisma.$transaction(
    photos.map((photo, index) =>
      prisma.contactPhoto.update({
        where: { id: photo.id },
        data: { sortOrder: index },
      }),
    ),
  );

  return syncPrimaryPhotoUrl(contactId);
}

export async function ensureContactPhotosMigrated(contactId: string) {
  await assertOwnedContact(contactId);
  const existing = await prisma.contactPhoto.count({ where: { contactId } });
  if (existing > 0) return listPhotos(contactId);

  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { photoUrl: true },
  });
  if (!contact?.photoUrl) return [];

  await prisma.contactPhoto.create({
    data: {
      contactId,
      url: contact.photoUrl,
      sortOrder: 0,
    },
  });

  return listPhotos(contactId);
}

export async function uploadContactPhoto(contactId: string, formData: FormData) {
  await assertOwnedContact(contactId);

  const count = await prisma.contactPhoto.count({ where: { contactId } });
  if (count >= MAX_CONTACT_PHOTOS) {
    throw new Error(`Максимум ${MAX_CONTACT_PHOTOS} фото`);
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("Файл не знайдено");
  }
  if (file.size <= 0) throw new Error("Порожній файл");
  if (file.size > MAX_RAW_BYTES) {
    throw new Error("Файл завеликий (макс. 10 МБ)");
  }

  const mime = (file.type || "").toLowerCase();
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];
  if (mime && !allowed.includes(mime) && !mime.startsWith("image/")) {
    throw new Error("Підтримуються лише зображення");
  }

  const input = Buffer.from(await file.arrayBuffer());
  let compressed: Buffer;
  try {
    compressed = await sharp(input, { failOn: "none" })
      .rotate()
      .resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
  } catch {
    throw new Error("Не вдалося обробити зображення");
  }

  const photoId = randomUUID();
  const fileName = `${photoId}.webp`;
  const dir = uploadsDir(contactId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), compressed);

  const url = publicUrl(contactId, fileName);
  const sortOrder = count;

  const created = await prisma.contactPhoto.create({
    data: {
      id: photoId,
      contactId,
      url,
      sortOrder,
    },
    select: { id: true, url: true, sortOrder: true },
  });

  if (sortOrder === 0) {
    await prisma.contact.update({
      where: { id: contactId },
      data: { photoUrl: url },
    });
  }

  revalidatePath("/profile");
  revalidatePath("/clients");
  revalidatePath("/contacts");

  return {
    photo: created,
    photos: await listPhotos(contactId),
    photoUrl: sortOrder === 0 ? url : (await syncPrimaryPhotoUrl(contactId)),
  };
}

export async function setPrimaryContactPhoto(contactId: string, photoId: string) {
  await assertOwnedContact(contactId);

  const photos = await prisma.contactPhoto.findMany({
    where: { contactId },
    orderBy: { sortOrder: "asc" },
    select: { id: true, url: true, sortOrder: true },
  });

  const target = photos.find((p) => p.id === photoId);
  if (!target) throw new Error("Фото не знайдено");
  if (target.sortOrder === 0) {
    return { photos, photoUrl: target.url };
  }

  const reordered = [target, ...photos.filter((p) => p.id !== photoId)];

  await prisma.$transaction(
    reordered.map((photo, index) =>
      prisma.contactPhoto.update({
        where: { id: photo.id },
        data: { sortOrder: index + 1000 },
      }),
    ),
  );

  await prisma.$transaction(
    reordered.map((photo, index) =>
      prisma.contactPhoto.update({
        where: { id: photo.id },
        data: { sortOrder: index },
      }),
    ),
  );

  const photoUrl = await syncPrimaryPhotoUrl(contactId);
  revalidatePath("/profile");
  revalidatePath("/clients");
  revalidatePath("/contacts");

  return {
    photos: await listPhotos(contactId),
    photoUrl,
  };
}

export async function deleteContactPhoto(contactId: string, photoId: string) {
  await assertOwnedContact(contactId);

  const photo = await prisma.contactPhoto.findFirst({
    where: { id: photoId, contactId },
    select: { id: true, url: true },
  });
  if (!photo) throw new Error("Фото не знайдено");

  await prisma.contactPhoto.delete({ where: { id: photo.id } });

  const diskPath = diskPathFromPublicUrl(photo.url);
  if (diskPath) {
    try {
      await unlink(diskPath);
    } catch {
      // File may already be missing (legacy external URL).
    }
  }

  await reindexPhotos(contactId);
  const photos = await listPhotos(contactId);
  const photoUrl = photos[0]?.url ?? null;

  revalidatePath("/profile");
  revalidatePath("/clients");
  revalidatePath("/contacts");

  return { photos, photoUrl };
}
