import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ clientId: string }>;
};

/** Legacy URL: картка клієнта — Bottom Sheet на /clients, не окрема сторінка. */
export default async function ClientDetailPageRedirect({ params }: Props) {
  const { clientId } = await params;
  redirect(`/clients?client=${encodeURIComponent(clientId)}`);
}
