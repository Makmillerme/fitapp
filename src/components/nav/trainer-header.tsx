"use client";

import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTrainerMenu } from "@/components/nav/trainer-menu-context";

type Props = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  menuButtonClassName?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export function TrainerHeader({
  title,
  subtitle,
  actions,
  className,
  contentClassName,
  menuButtonClassName,
  style,
  children,
}: Props) {
  const { openMenu } = useTrainerMenu();

  return (
    <header
      className={cn("shrink-0 bg-[#FAFAFA] px-5 pb-2 pt-6", className)}
      style={style}
    >
      <div
        className={cn(
          "mb-4 flex h-9 items-center justify-between gap-3",
          contentClassName,
        )}
      >
        <div className="flex h-9 min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={openMenu}
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-foreground shadow-card transition-transform active:scale-95",
              menuButtonClassName,
            )}
            aria-label="Меню"
          >
            <Menu className="size-4" />
          </button>
          <div className="flex h-9 min-w-0 items-center">
            {typeof title === "string" ? (
              <h1 className="truncate text-2xl font-bold leading-9 tracking-tight">
                {title}
              </h1>
            ) : (
              title
            )}
          </div>
        </div>
        {actions ? (
          <div className="flex h-9 shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {subtitle ? (
        <div className="mb-3 pl-12 text-xs font-medium text-muted-foreground">
          {subtitle}
        </div>
      ) : null}
      {children}
    </header>
  );
}
