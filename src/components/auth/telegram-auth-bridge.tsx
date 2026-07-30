"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  nextPath?: string;
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        ready?: () => void;
        expand?: () => void;
      };
    };
  }
}

export function TelegramAuthBridge({ nextPath = "/contacts" }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "auth" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const initData = window.Telegram?.WebApp?.initData;
      window.Telegram?.WebApp?.ready?.();
      window.Telegram?.WebApp?.expand?.();

      if (!initData) {
        setStatus("idle");
        return;
      }

      setStatus("auth");
      try {
        const res = await fetch("/api/auth/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ initData }),
        });
        if (!res.ok) {
          throw new Error("Auth failed");
        }
        const data = (await res.json()) as { user?: { role?: string } };
        if (data.user?.role === "ADMIN") {
          router.replace(nextPath);
        } else {
          router.replace("/connect?error=forbidden");
        }
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Auth error");
      }
    };

    void run();
  }, [nextPath, router]);

  if (status === "auth") {
    return (
      <p className="text-sm text-muted-foreground">Авторизація через Telegram…</p>
    );
  }

  if (status === "error") {
    return (
      <p className="text-sm text-destructive">{error ?? "Помилка авторизації"}</p>
    );
  }

  return null;
}
