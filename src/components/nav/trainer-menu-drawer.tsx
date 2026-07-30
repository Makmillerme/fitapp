"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  MessagesSquare,
  LayoutGrid,
  BriefcaseBusiness,
  UserRound,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth/sign-out";
import { useTrainerMenu } from "@/components/nav/trainer-menu-context";
import {
  isWorkspaceRoute,
  SIDEBAR_ROUTES,
} from "@/lib/nav/trainer-routes";

const mainLinks = [
  { href: SIDEBAR_ROUTES.contacts, label: "Контакти", icon: MessagesSquare },
  { href: SIDEBAR_ROUTES.apps, label: "Додатки", icon: LayoutGrid },
  {
    href: SIDEBAR_ROUTES.crm,
    label: "CRM",
    icon: BriefcaseBusiness,
    isActive: isWorkspaceRoute,
  },
  { href: SIDEBAR_ROUTES.profile, label: "Профіль", icon: UserRound },
] as const;

export function TrainerMenuDrawer() {
  const { open, setOpen } = useTrainerMenu();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="left"
        showCloseButton
        className="flex h-full w-[min(100%,18rem)] flex-col gap-0 p-0 sm:max-w-xs"
      >
        <SheetHeader className="border-b border-gray-100 px-4 py-4 text-left">
          <SheetTitle className="text-lg font-bold">Меню</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {mainLinks.map(({ href, label, icon: Icon, ...rest }) => {
            const active =
              "isActive" in rest && rest.isActive
                ? rest.isActive(pathname)
                : pathname === href || pathname.startsWith(`${href}/`);

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors active:bg-muted",
                  active ? "bg-primary/10 text-primary" : "text-foreground",
                )}
              >
                <Icon className="size-5 shrink-0" strokeWidth={active ? 2.5 : 2} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-3">
          <Link
            href={SIDEBAR_ROUTES.settings}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors active:bg-muted",
              pathname === SIDEBAR_ROUTES.settings
                ? "bg-primary/10 text-primary"
                : "text-foreground",
            )}
          >
            <Settings className="size-5 shrink-0 text-muted-foreground" />
            Налаштування
          </Link>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            className="mt-2 w-full rounded-xl"
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
      </SheetContent>
    </Sheet>
  );
}
