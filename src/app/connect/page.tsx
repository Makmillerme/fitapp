import Link from "next/link";
import { TelegramAuthBridge } from "@/components/auth/telegram-auth-bridge";
import { createDevTrainerSession } from "@/lib/auth/dev-login";
import { Button } from "@/components/ui/button";

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function ConnectPage({ searchParams }: Props) {
  const params = await searchParams;
  const nextPath = params.next ?? "/contacts";
  const isForbidden = params.error === "forbidden";
  const isDev = process.env.NODE_ENV === "development";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight">FitApp</h1>
        <p className="text-sm text-muted-foreground">
          CRM для тренерів. Відкрий додаток через Telegram-бота або увійди в
          режимі розробки.
        </p>
        {isForbidden ? (
          <p className="text-sm text-destructive">
            Доступ лише для адміністраторів. Звернись до власника.
          </p>
        ) : null}
      </div>

      <TelegramAuthBridge nextPath={nextPath} />

      {isDev ? (
        <form action={createDevTrainerSession}>
          <Button type="submit" className="rounded-xl px-6">
            Увійти як Demo Admin (dev)
          </Button>
        </form>
      ) : (
        <p className="text-xs text-muted-foreground">
          Відкрий бота в Telegram і натисни «Відкрити FitApp».
        </p>
      )}

      <Link href="/" className="text-xs text-muted-foreground underline">
        На головну
      </Link>
    </main>
  );
}
