"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Filter, Sparkles } from "lucide-react";
import { TrainerHeader } from "@/components/nav/trainer-header";
import { useActionDialog } from "@/hooks/use-action-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createProgram, generateProgramText } from "@/lib/actions/programs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ProgramCard = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  durationWeeks: number | null;
  tags: string[];
};

type Props = {
  programs: ProgramCard[];
};

export function ProgramsView({ programs }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useActionDialog();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationWeeks, setDurationWeeks] = useState("4");
  const [category, setCategory] = useState("");
  const [pending, startTransition] = useTransition();

  const categories = Array.from(
    new Set(programs.map((p) => p.category).filter(Boolean) as string[]),
  );

  const filtered =
    filter === "all"
      ? programs
      : programs.filter((p) => p.category === filter);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TrainerHeader
        title="Програми"
        contentClassName="mb-0"
        actions={
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full bg-white text-foreground shadow-card"
            aria-label="Фільтр"
          >
            <Filter className="size-4" />
          </button>
        }
      />

      <div className="hide-scrollbar flex shrink-0 gap-2 overflow-x-auto border-b border-gray-100 px-5 py-3">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={cn(
            "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold",
            filter === "all"
              ? "bg-foreground text-white"
              : "border border-gray-200 bg-white text-muted-foreground",
          )}
        >
          Всі шаблони
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilter(cat)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold",
              filter === cat
                ? "bg-foreground text-white"
                : "border border-gray-200 bg-white text-muted-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto hide-scrollbar p-5">
        {filtered.map((program) => (
          <div
            key={program.id}
            className="rounded-3xl bg-white p-5 shadow-card transition-transform active:scale-95"
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold leading-tight">{program.name}</h3>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {program.description ?? "Без опису"}
                </p>
              </div>
              {program.durationWeeks ? (
                <div className="rounded bg-muted px-2 py-1 text-[10px] font-bold">
                  {program.durationWeeks} тиж.
                </div>
              ) : null}
            </div>
            <div className="mb-4 flex flex-wrap gap-2">
              {program.category ? (
                <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold text-gray-500">
                  {program.category}
                </span>
              ) : null}
              {program.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-blue-50 px-2 py-1 text-[10px] font-bold text-blue-600"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/programs/${program.id}`}
                className="flex flex-1 items-center justify-center rounded-xl bg-muted py-2.5 text-xs font-bold"
              >
                Деталі
              </Link>
              <Link
                href={`/schedule?action=add`}
                className="flex flex-1 items-center justify-center rounded-xl bg-foreground py-2.5 text-xs font-bold text-white"
              >
                Призначити
              </Link>
            </div>
          </div>
        ))}

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Програм ще немає.</p>
        ) : null}
        <div className="h-8" />
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Нова програма</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Назва"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
            />
            <div className="relative">
              <Textarea
                placeholder="Опис"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-28 rounded-xl pr-12"
              />
              <button
                type="button"
                title="Згенерувати з ШІ"
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary"
                onClick={() => {
                  startTransition(async () => {
                    try {
                      const result = await generateProgramText(
                        name
                          ? `Опиши програму «${name}» українською коротко.`
                          : "Опиши базову програму на масу українською коротко.",
                      );
                      setDescription(result.text);
                      if (result.mock) toast.message("Mock ШІ");
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "Помилка");
                    }
                  });
                }}
              >
                <Sparkles className="size-4 fill-current" />
              </button>
            </div>
            <Input
              placeholder="Категорія (Гіпертрофія, Функціонал…)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl"
            />
            <Input
              type="number"
              placeholder="Тривалість (тижні)"
              value={durationWeeks}
              onChange={(e) => setDurationWeeks(e.target.value)}
              className="rounded-xl"
            />
            <Button
              className="w-full rounded-xl font-bold"
              disabled={pending || !name.trim()}
              onClick={() => {
                startTransition(async () => {
                  try {
                    await createProgram({
                      name: name.trim(),
                      description: description.trim() || undefined,
                      category: category.trim() || undefined,
                      durationWeeks: Number(durationWeeks) || undefined,
                      tags: category ? [category] : [],
                      exercises: [
                        { name: "Присідання", sets: 4, reps: "8-10", muscleGroup: "Ноги" },
                        { name: "Жим лежачи", sets: 4, reps: "8-10", muscleGroup: "Груди" },
                      ],
                    });
                    toast.success("Програму створено");
                    setCreateOpen(false);
                    window.location.reload();
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Помилка");
                  }
                });
              }}
            >
              Зберегти
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
