import { Suspense } from "react";
import { requireRole } from "@/lib/auth/current-user";
import { TrainerAppShell } from "@/components/app-shell/trainer-app-shell";
import { TrainerMenuProvider } from "@/components/nav/trainer-menu-context";
import { TrainerShell } from "@/components/nav/trainer-shell";

export default async function TrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trainer = await requireRole("ADMIN");

  return (
    <TrainerAppShell>
      <TrainerMenuProvider
        profile={{
          firstName: trainer.firstName,
          lastName: trainer.lastName,
          username: trainer.username,
          photoUrl: trainer.photoUrl,
        }}
      >
        <TrainerShell>
          <Suspense fallback={<div className="h-full bg-[#FAFAFA]" aria-hidden />}>
            {children}
          </Suspense>
        </TrainerShell>
      </TrainerMenuProvider>
    </TrainerAppShell>
  );
}
