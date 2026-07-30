"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle?: string;
  backHref?: string;
  onBack?: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  ctaLabel?: string;
  ctaSubLabel?: string;
  onStart?: () => void;
  className?: string;
};

export function ConfigShell({
  title,
  subtitle,
  backHref = "/apps/smart-timer",
  onBack,
  children,
  footer,
  ctaLabel = "Запуск таймера",
  ctaSubLabel,
  onStart,
  className,
}: Props) {
  return (
    <div className={cn("flex h-full flex-col bg-[#FAFAFA]", className)}>
      <header className="flex items-center justify-between px-4 pb-2 pt-5">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex size-10 items-center justify-center rounded-full bg-white shadow-card transition-transform active:scale-95"
            aria-label="Назад"
          >
            <ArrowLeft className="size-4" />
          </button>
        ) : (
          <Link
            href={backHref}
            className="flex size-10 items-center justify-center rounded-full bg-white shadow-card transition-transform active:scale-95"
            aria-label="Назад"
          >
            <ArrowLeft className="size-4" />
          </Link>
        )}
        <div className="size-10" aria-hidden />
      </header>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 pb-6">
        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        {children}
      </div>

      <div className="shrink-0 space-y-3 px-5 pb-8 pt-2">
        {footer}
        {onStart ? (
          <Button
            type="button"
            size="lg"
            onClick={onStart}
            className="h-14 w-full rounded-full text-base font-bold shadow-float"
          >
            <span className="flex flex-col items-center leading-tight">
              <span>{ctaLabel}</span>
              {ctaSubLabel ? (
                <span className="text-[11px] font-medium tracking-normal opacity-90">
                  {ctaSubLabel}
                </span>
              ) : null}
            </span>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
