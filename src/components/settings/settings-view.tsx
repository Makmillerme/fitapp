"use client";

import { useTransition } from "react";
import { Bell, Globe, LogOut } from "lucide-react";
import { TrainerHeader } from "@/components/nav/trainer-header";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/sign-out";

export function SettingsView() {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex h-full flex-col bg-[#FAFAFA]">
      <TrainerHeader title="Налаштування" />
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-5 pb-8">
        <section className="overflow-hidden rounded-2xl bg-white shadow-card">
          <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3.5">
            <Globe className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Мова</div>
              <div className="text-xs text-muted-foreground">Українська</div>
            </div>
            <span className="text-xs text-muted-foreground">Незабаром</span>
          </div>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Bell className="size-5 text-muted-foreground" />
            <div className="flex-1">
              <div className="text-sm font-medium">Сповіщення</div>
              <div className="text-xs text-muted-foreground">Push та нагадування</div>
            </div>
            <span className="text-xs text-muted-foreground">Незабаром</span>
          </div>
        </section>

        <Button
          type="button"
          variant="outline"
          disabled={pending}
          className="w-full rounded-xl"
          onClick={() => {
            startTransition(async () => {
              await signOut();
            });
          }}
        >
          <LogOut className="size-4" />
          Вийти
        </Button>
      </div>
    </div>
  );
}
