"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/nav/bottom-nav";
import { TrainerMenuDrawer } from "@/components/nav/trainer-menu-drawer";
import { isWorkspaceRoute } from "@/lib/nav/trainer-routes";

type Props = {
  children: React.ReactNode;
};

export function TrainerShell({ children }: Props) {
  const pathname = usePathname();
  const showBottomNav = isWorkspaceRoute(pathname);

  return (
    <>
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
      {showBottomNav ? <BottomNav /> : null}
      <TrainerMenuDrawer />
    </>
  );
}
