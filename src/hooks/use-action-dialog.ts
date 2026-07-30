"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Opens a dialog when `?action=add` (or custom action) is present, then clears the param. */
export function useActionDialog(action = "add") {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(() => searchParams.get("action") === action);

  useEffect(() => {
    if (searchParams.get("action") !== action) return;

    setOpen(true);

    const next = new URLSearchParams(searchParams.toString());
    next.delete("action");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [action, pathname, router, searchParams]);

  return [open, setOpen] as const;
}
