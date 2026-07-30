"use client";

import Link from "next/link";
import { TrainerHeader } from "@/components/nav/trainer-header";
import { Badge } from "@/components/ui/badge";
import { WIDGET_APPS } from "@/lib/apps/widgets";
import { cn } from "@/lib/utils";

export function AppsView() {
  return (
    <div className="flex h-full flex-col bg-[#FAFAFA]">
      <TrainerHeader title="Додатки" />
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 pb-8">
        <p className="text-sm text-muted-foreground">
          Корисні віджети для тренувань: таймери, інтервали та інші інструменти — окремо від
          робочої CRM-зони.
        </p>
        <div className="grid gap-3">
          {WIDGET_APPS.map(({ id, href, label, description, icon: Icon, available }) => {
            const card = (
              <div
                className={cn(
                  "flex items-center gap-4 rounded-2xl bg-white p-4 shadow-card transition-transform",
                  available ? "active:scale-[0.98]" : "opacity-60",
                )}
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{label}</span>
                    {!available ? (
                      <Badge variant="secondary" className="text-[10px]">
                        Незабаром
                      </Badge>
                    ) : null}
                  </div>
                  <div className="text-sm text-muted-foreground">{description}</div>
                </div>
              </div>
            );

            if (!available) {
              return <div key={id}>{card}</div>;
            }

            return (
              <Link key={id} href={href} className="block">
                {card}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
