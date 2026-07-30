"use client";

import { useEffect, useState, useTransition } from "react";
import { format } from "date-fns";
import { generateClientBriefing, type BriefingResult } from "@/lib/actions/briefing";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Pencil, Sparkles } from "lucide-react";

type Props = {
  clientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AiBriefingDrawer({ clientId, open, onOpenChange }: Props) {
  const [data, setData] = useState<BriefingResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !clientId) return;
    setData(null);
    setError(null);
    startTransition(async () => {
      try {
        const result = await generateClientBriefing(clientId);
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Помилка генерації");
      }
    });
  }, [open, clientId]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85%]">
        <DrawerHeader className="border-b border-gray-100 text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-5 fill-current" />
            </div>
            <div>
              <DrawerTitle>ШІ-Брифінг</DrawerTitle>
              <DrawerDescription>Аналіз на основі історії</DrawerDescription>
            </div>
          </div>
        </DrawerHeader>

        <div className="space-y-6 overflow-y-auto p-6">
          {pending ? (
            <p className="text-sm text-muted-foreground">Генеруємо брифінг…</p>
          ) : null}
          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {data ? (
            <>
              <div className="relative rounded-2xl bg-muted p-5">
                <div className="absolute -left-2 -top-3 flex size-6 items-center justify-center rounded-full border-2 border-white bg-primary shadow-sm">
                  <AlertCircle className="size-2.5 text-white" fill="currentColor" />
                </div>
                <h4 className="mb-2 text-sm font-bold">
                  Статус:{" "}
                  <span className="text-primary">{data.status}</span>
                  {data.mock ? (
                    <span className="ml-2 text-[10px] font-medium text-muted-foreground">
                      (mock)
                    </span>
                  ) : null}
                </h4>
                <p className="mb-4 text-[13px] leading-relaxed text-gray-600">
                  {data.summary}
                </p>
                {data.recommendations.length > 0 ? (
                  <>
                    <h4 className="mb-2 text-sm font-bold">Рекомендація на сьогодні:</h4>
                    <ul className="space-y-2.5 text-[13px] text-gray-600">
                      {data.recommendations.map((rec) => (
                        <li key={rec} className="flex items-start gap-2">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-green-500" strokeWidth={3} />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>

              <Button className="w-full rounded-xl py-3.5 font-bold shadow-float">
                <Pencil className="size-4" />
                Адаптувати програму
              </Button>
              <p className="text-center text-[10px] text-muted-foreground">
                {format(new Date(), "HH:mm")}
              </p>
            </>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
