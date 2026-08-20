"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

const AppShellPortalContext = createContext<HTMLElement | null>(null);

/** Portal mount node inside the trainer app shell (overlays only). */
export function useAppShellPortal() {
  return useContext(AppShellPortalContext);
}

export function usePortalLayer() {
  const container = useAppShellPortal();

  return {
    container: container ?? undefined,
    /** Scoped to shell via transform on the shell root. */
    position: "fixed" as const,
  };
}

type TrainerAppShellProps = {
  children: ReactNode;
};

export function TrainerAppShell({ children }: TrainerAppShellProps) {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  return (
    <AppShellPortalContext.Provider value={portalContainer}>
      <div
        data-app-shell
        className={cn(
          "relative flex h-[100dvh] w-full min-w-0 flex-col overflow-hidden overscroll-y-none bg-[#FAFAFA] [transform:translateZ(0)]",
          process.env.NODE_ENV === "development" &&
            "border-x border-[#C4C4C8] shadow-[0_0_0_1px_rgba(0,0,0,0.04)]",
        )}
      >
        {children}
        <div
          ref={setPortalContainer}
          data-app-shell-portal
          className="pointer-events-none absolute inset-0 z-[60] overflow-hidden [&>*]:pointer-events-auto"
        />
      </div>
    </AppShellPortalContext.Provider>
  );
}
