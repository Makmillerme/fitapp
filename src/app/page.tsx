import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth/session";
import { DEFAULT_APP_ROUTE } from "@/lib/nav/trainer-routes";

export default async function Home() {
  const session = await getSessionFromCookies();

  if (!session) {
    redirect("/connect");
  }

  if (session.role === "ADMIN") {
    redirect(DEFAULT_APP_ROUTE);
  }

  redirect("/connect");
}
