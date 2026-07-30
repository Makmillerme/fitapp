"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import {
  formatUaPhoneMask,
  UA_PHONE_MASK_PREFIX,
  uaLocalDigits,
} from "@/lib/phone";
import { cn } from "@/lib/utils";

type Props = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange" | "inputMode"
> & {
  value: string;
  onChange: (value: string) => void;
};

export function PhoneInput({
  value,
  onChange,
  className,
  onKeyDown,
  onFocus,
  ...props
}: Props) {
  const display = formatUaPhoneMask(value || UA_PHONE_MASK_PREFIX);

  return (
    <Input
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete={props.autoComplete ?? "tel"}
      value={display}
      placeholder="+38 (0__) ___-__-__"
      className={cn("font-medium tabular-nums tracking-wide", className)}
      onFocus={(e) => {
        onFocus?.(e);
        const el = e.currentTarget;
        const local = uaLocalDigits(display);
        if (local.length <= 1) {
          onChange(UA_PHONE_MASK_PREFIX);
          requestAnimationFrame(() => {
            if (!el.isConnected) return;
            const pos = el.value.length;
            el.setSelectionRange(pos, pos);
          });
        }
      }}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;

        if (e.key === "Backspace") {
          const local = uaLocalDigits(display);
          // Keep locked "+38 (0"
          if (local.length <= 1) {
            e.preventDefault();
            onChange(UA_PHONE_MASK_PREFIX);
            return;
          }
          e.preventDefault();
          onChange(formatUaPhoneMask(local.slice(0, -1)));
        }
      }}
      onChange={(e) => {
        onChange(formatUaPhoneMask(e.target.value));
      }}
    />
  );
}
