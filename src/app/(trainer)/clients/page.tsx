import { getClientsPageData } from "@/lib/actions/clients";
import { ClientsView } from "@/components/clients/clients-view";

export default async function ClientsPage() {
  const { clients, counts, contacts } = await getClientsPageData();

  const eligibleContacts = contacts
    .filter((c) => !c.isClient)
    .map((c) => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      phone: c.phone,
      photoUrl: c.photoUrl,
    }));

  return (
    <ClientsView
      clients={clients.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        photoUrl: c.photoUrl,
        phone: c.phone,
        goal: c.goal,
        sessionBalance: c.sessionBalance,
        status: c.status,
      }))}
      eligibleContacts={eligibleContacts}
      counts={counts}
    />
  );
}
