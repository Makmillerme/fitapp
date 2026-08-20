import { cache } from "react";
import { redirect } from "next/navigation";
import type { User, UserRole } from "@/generated/prisma/client";
import { withPgRetry } from "@/lib/prisma";
import { getSessionFromCookies } from "@/lib/auth/session";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSessionFromCookies();
  if (!session) return null;

  return withPgRetry(
    (prisma) =>
      prisma.user.findUnique({
        where: { id: session.userId },
      }),
    "getCurrentUser.findUnique",
  );
});

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/connect");
  }
  return user;
}

export async function requireRole(role: UserRole): Promise<User> {
  const user = await requireUser();
  if (user.role !== role) {
    redirect("/connect");
  }
  return user;
}
