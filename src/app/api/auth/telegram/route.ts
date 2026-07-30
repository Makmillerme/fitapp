import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateAndParseInitData } from "@/lib/auth/validate-init-data";
import { setSessionCookie } from "@/lib/auth/session";
import type { UserRole } from "@/generated/prisma/client";

function resolveRole(telegramId: number): UserRole {
  const adminIds = (process.env.TELEGRAM_TRAINER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (adminIds.includes(String(telegramId))) {
    return "ADMIN";
  }
  return "USER";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { initData?: string };
    if (!body.initData) {
      return NextResponse.json({ error: "initData required" }, { status: 400 });
    }

    const tgUser = validateAndParseInitData(body.initData);
    const telegramId = BigInt(tgUser.id);

    const existingCount = await prisma.user.count();
    let role = resolveRole(tgUser.id);

    // First user in the system becomes ADMIN automatically
    if (existingCount === 0) {
      role = "ADMIN";
    }

    const user = await prisma.user.upsert({
      where: { telegramId },
      create: {
        telegramId,
        firstName: tgUser.firstName,
        lastName: tgUser.lastName,
        username: tgUser.username,
        photoUrl: tgUser.photoUrl,
        role,
      },
      update: {
        firstName: tgUser.firstName,
        lastName: tgUser.lastName,
        username: tgUser.username,
        photoUrl: tgUser.photoUrl,
      },
    });

    await setSessionCookie({
      userId: user.id,
      telegramId: user.telegramId.toString(),
      role: user.role,
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("[auth/telegram]", error);
    return NextResponse.json(
      { error: "Invalid Telegram authentication" },
      { status: 401 },
    );
  }
}
