"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth/current-user";
import { generateText } from "@/lib/ai/openai";

export type BriefingResult = {
  status: string;
  summary: string;
  recommendations: string[];
  mock: boolean;
};

export async function generateClientBriefing(
  clientId: string,
): Promise<BriefingResult> {
  const trainer = await requireRole("ADMIN");

  const client = await prisma.contact.findFirst({
    where: { id: clientId, trainerId: trainer.id, isClient: true },
  });
  if (!client) throw new Error("Клієнта не знайдено");

  const logs = await prisma.workoutLog.findMany({
    where: { clientId, trainerId: trainer.id },
    include: { exercise: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const history =
    logs.length === 0
      ? "Немає записаних тренувань."
      : logs
          .map((l, i) => {
            const ex = l.exercise?.name ?? "вправа";
            const w = l.weight != null ? `${l.weight} кг` : "—";
            const sr =
              l.sets != null && l.reps != null
                ? `${l.sets}×${l.reps}`
                : "—";
            return `${i + 1}. ${ex}: ${w}, ${sr}. Нотатки: ${l.notes ?? "—"}`;
          })
          .join("\n");

  const prompt = `Клієнт: ${client.firstName} ${client.lastName ?? ""}
Ціль: ${client.goal ?? "не вказано"}
Нотатки тренера: ${client.notes ?? "немає"}
Баланс занять: ${client.sessionBalance}

Останні тренування:
${history}

Згенеруй короткий брифінг перед сьогоднішнім тренуванням у форматі JSON:
{"status":"Потребує уваги|Норма|Відмінно","summary":"1-2 речення про минулі сесії","recommendations":["рекомендація 1","рекомендація 2"]}
Лише JSON, без markdown.`;

  if (!process.env.OPENAI_API_KEY) {
    return {
      status: logs.length ? "Потребує уваги" : "Норма",
      summary:
        client.notes ||
        (logs[0]?.notes ??
          "Немає достатньо історії. Проведіть базову розминку і оцініть самопочуття."),
      recommendations: [
        "Перевірте самопочуття клієнта перед комплексом",
        "Зменште робочі ваги на 10%, якщо є дискомфорт",
      ],
      mock: true,
    };
  }

  const raw = await generateText(
    "Ти — асистент фітнес-тренера. Відповідай лише валідним JSON українською.",
    prompt,
  );

  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as {
      status?: string;
      summary?: string;
      recommendations?: string[];
    };
    return {
      status: parsed.status ?? "Норма",
      summary: parsed.summary ?? raw,
      recommendations: parsed.recommendations ?? [],
      mock: false,
    };
  } catch {
    return {
      status: "Норма",
      summary: raw,
      recommendations: [],
      mock: false,
    };
  }
}
