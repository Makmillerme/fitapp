"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import { generateText } from "@/lib/ai/openai";

export async function listPrograms() {
  const trainer = await requireRole("ADMIN");
  return prisma.program.findMany({
    where: { trainerId: trainer.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
      _count: { select: { appointments: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProgram(programId: string) {
  const trainer = await requireRole("ADMIN");
  return prisma.program.findFirst({
    where: { id: programId, trainerId: trainer.id },
    include: {
      exercises: {
        include: { exercise: true },
        orderBy: { order: "asc" },
      },
    },
  });
}

export async function createProgram(input: {
  name: string;
  description?: string;
  category?: string;
  durationWeeks?: number;
  tags?: string[];
  exercises?: Array<{ name: string; sets: number; reps: string; muscleGroup?: string }>;
}) {
  const trainer = await requireRole("ADMIN");

  const program = await prisma.$transaction(async (tx) => {
    const created = await tx.program.create({
      data: {
        trainerId: trainer.id,
        name: input.name,
        description: input.description,
        category: input.category,
        durationWeeks: input.durationWeeks,
        tags: input.tags ?? [],
      },
    });

    if (input.exercises?.length) {
      for (let i = 0; i < input.exercises.length; i++) {
        const item = input.exercises[i];
        const exercise = await tx.exercise.create({
          data: {
            trainerId: trainer.id,
            name: item.name,
            muscleGroup: item.muscleGroup,
          },
        });
        await tx.programExercise.create({
          data: {
            programId: created.id,
            exerciseId: exercise.id,
            order: i,
            sets: item.sets,
            reps: item.reps,
          },
        });
      }
    }

    return created;
  });

  revalidatePath("/programs");
  return program;
}

export async function assignProgramToClient(
  programId: string,
  clientId: string,
  startAt: string,
  endAt: string,
) {
  const trainer = await requireRole("ADMIN");

  const [program, client] = await Promise.all([
    prisma.program.findFirst({ where: { id: programId, trainerId: trainer.id } }),
    prisma.contact.findFirst({
      where: { id: clientId, trainerId: trainer.id, isClient: true },
    }),
  ]);

  if (!program || !client) throw new Error("Програму або клієнта не знайдено");

  const appointment = await prisma.appointment.create({
    data: {
      trainerId: trainer.id,
      clientId,
      programId,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      notes: `Призначено програму: ${program.name}`,
    },
  });

  revalidatePath("/schedule");
  revalidatePath("/programs");
  return appointment;
}

export async function generateProgramText(prompt: string) {
  await requireRole("ADMIN");

  if (!process.env.OPENAI_API_KEY) {
    return {
      text: `Чернетка програми (mock, без OPENAI_API_KEY):\n${prompt}\n\n1. Присідання 4×8\n2. Жим лежачи 4×8\n3. Тяга штанги 3×10\n4. Планка 3×45с`,
      mock: true as const,
    };
  }

  const text = await generateText(
    "Ти — досвідчений фітнес-тренер. Відповідай українською. Створюй стислі описи програм і прогресії.",
    prompt,
  );

  return { text, mock: false as const };
}
