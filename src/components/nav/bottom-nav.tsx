"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calendar,
  Users,
  NotebookText,
  MessageCircle,
  MessageSquarePlus,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/schedule", label: "Розклад", icon: Calendar },
  { href: "/clients", label: "Клієнти", icon: Users },
  { href: "/programs", label: "Програми", icon: NotebookText },
  { href: "/ai", label: "AI", icon: MessageCircle },
] as const;

const pressEase = "duration-150 ease-[cubic-bezier(0.32,0.72,0,1)]";

function getCenterAction(pathname: string): {
  href: string;
  label: string;
  icon: LucideIcon;
} | null {
  if (pathname.startsWith("/schedule")) {
    return { href: "/schedule?action=add", label: "Додати запис", icon: Plus };
  }
  if (pathname.startsWith("/clients")) {
    return { href: "/clients?action=add", label: "Додати клієнта", icon: Plus };
  }
  if (pathname.startsWith("/programs")) {
    return { href: "/programs?action=add", label: "Додати програму", icon: Plus };
  }
  if (pathname.startsWith("/ai")) {
    return { href: "/ai?action=new", label: "Новий чат", icon: MessageSquarePlus };
  }
  return null;
}

function NavSlot({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 justify-center">{children}</div>;
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex w-16 shrink-0 touch-manipulation select-none flex-col items-center"
    >
      <span
        className={cn(
          "mb-1 flex size-8 items-center justify-center rounded-xl transition-colors",
          pressEase,
          active ? "bg-primary/10 group-active:bg-primary/15" : "group-active:bg-muted",
        )}
      >
        <Icon
          className={cn(
            "size-5 transition-transform will-change-transform",
            pressEase,
            "group-active:scale-[0.94]",
            active ? "text-primary" : "text-muted-foreground",
          )}
          strokeWidth={active ? 2.5 : 2}
        />
      </span>
      <span
        className={cn(
          "h-[14px] w-full text-center text-[10px] font-medium leading-none",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </Link>
  );
}

function CenterFab({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <div className="relative -top-5 flex h-14 w-14 shrink-0 items-center justify-center">
      <Link
        href={href}
        aria-label={label}
        className={cn(
          "flex size-14 touch-manipulation items-center justify-center rounded-full bg-primary text-white shadow-float transition-transform",
          pressEase,
          "active:scale-[0.96]",
        )}
      >
        <Icon className="size-7" strokeWidth={2.5} />
      </Link>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const center = getCenterAction(pathname);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="relative z-30 flex h-20 shrink-0 items-center bg-white px-1 pb-safe pt-2 shadow-nav">
      {items.slice(0, 2).map(({ href, label, icon }) => (
        <NavSlot key={href}>
          <NavItem
            href={href}
            label={label}
            icon={icon}
            active={isActive(href)}
          />
        </NavSlot>
      ))}

      <NavSlot>
        {center ? (
          <CenterFab href={center.href} label={center.label} icon={center.icon} />
        ) : (
          <div className="h-14 w-14" aria-hidden />
        )}
      </NavSlot>

      {items.slice(2).map(({ href, label, icon }) => (
        <NavSlot key={href}>
          <NavItem
            href={href}
            label={label}
            icon={icon}
            active={isActive(href)}
          />
        </NavSlot>
      ))}
    </nav>
  );
}
