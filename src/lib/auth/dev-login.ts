import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth/session";
import { DEFAULT_APP_ROUTE } from "@/lib/nav/trainer-routes";

/** Dev-only: create/login as a demo admin without Telegram. */
export async function createDevTrainerSession() {
  "use server";

  if (process.env.NODE_ENV === "production") {
    throw new Error("Dev login is disabled in production");
  }

  const telegramId = BigInt(999000001);

  const user = await prisma.user.upsert({
    where: { telegramId },
    create: {
      telegramId,
      firstName: "Demo",
      lastName: "Admin",
      username: "demo_admin",
      role: "ADMIN",
    },
    update: {
      role: "ADMIN",
      firstName: "Demo",
      lastName: "Admin",
    },
  });

  const contactCount = await prisma.contact.count({
    where: { trainerId: user.id },
  });

  if (contactCount === 0) {
    await prisma.contact.createMany({
      data: [
        {
          trainerId: user.id,
          firstName: "Максим",
          lastName: "В.",
          phone: "+380501111111",
          isClient: true,
          status: "ACTIVE",
          sessionBalance: 8,
          goal: "Набір маси",
        },
        {
          trainerId: user.id,
          firstName: "Олена",
          lastName: "К.",
          phone: "+380502222222",
          isClient: true,
          status: "DEBT",
          sessionBalance: 1,
          goal: "Схуднення",
        },
        {
          trainerId: user.id,
          firstName: "Дмитро",
          lastName: "С.",
          phone: "+380503333333",
          isClient: true,
          status: "ACTIVE",
          sessionBalance: 12,
          goal: "Кросфіт",
        },
        {
          trainerId: user.id,
          firstName: "Ігор",
          lastName: "П.",
          phone: "+380504444444",
          isClient: false,
        },
      ],
    });

    const seeded = await prisma.contact.findMany({
      where: { trainerId: user.id, isClient: true },
      orderBy: { firstName: "asc" },
    });

    const maksim = seeded.find((c) => c.firstName === "Максим");
    const olena = seeded.find((c) => c.firstName === "Олена");

    const program = await prisma.program.create({
      data: {
        trainerId: user.id,
        name: "Базова Гіпертрофія",
        description: "Класичний спліт на всі групи м'язів",
        category: "Гіпертрофія",
        durationWeeks: 4,
        tags: ["3 дні / тиж", "Лінійна прогресія"],
      },
    });

    const now = new Date();
    const start1 = new Date(now);
    start1.setHours(18, 0, 0, 0);
    const end1 = new Date(start1);
    end1.setMinutes(end1.getMinutes() + 90);

    const start2 = new Date(now);
    start2.setHours(19, 30, 0, 0);
    const end2 = new Date(start2);
    end2.setMinutes(end2.getMinutes() + 60);

    if (maksim) {
      await prisma.appointment.create({
        data: {
          trainerId: user.id,
          clientId: maksim.id,
          programId: program.id,
          startAt: start1,
          endAt: end1,
          location: 'Зал "Олімп"',
          notes: "Спина / Біцепс",
        },
      });
      await prisma.workoutLog.create({
        data: {
          trainerId: user.id,
          clientId: maksim.id,
          notes: "Дискомфорт у лівому коліні під час жиму ногами, 160 кг",
        },
      });
    }

    if (olena) {
      await prisma.appointment.create({
        data: {
          trainerId: user.id,
          clientId: olena.id,
          startAt: start2,
          endAt: end2,
          notes: "Кросфіт WOD",
        },
      });
    }
  }

  await setSessionCookie({
    userId: user.id,
    telegramId: user.telegramId.toString(),
    role: user.role,
  });

  redirect(DEFAULT_APP_ROUTE);
}
