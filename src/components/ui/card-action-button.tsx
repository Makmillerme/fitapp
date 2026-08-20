"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Button> & {
  tone?: "default" | "destructive";
};

export function CardActionButton({
  className,
  tone = "default",
  ...props
}: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "rounded-xl border-gray-100 bg-white shadow-card",
        tone === "destructive" && "text-destructive hover:bg-destructive/10",
        className,
      )}
      {...props}
    />
  );
}
