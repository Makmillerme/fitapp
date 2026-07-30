import { requireRole } from "@/lib/auth/current-user";
import {
  listContactConversations,
  listContacts,
} from "@/lib/actions/contact-messages";
import { ContactsView } from "@/components/contacts/contacts-view";

export default async function ContactsPage() {
  await requireRole("ADMIN");
  const [conversations, contacts] = await Promise.all([
    listContactConversations(),
    listContacts(),
  ]);

  return (
    <ContactsView
      conversations={conversations}
      contacts={contacts.map((c) => ({
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        phone: c.phone,
        photoUrl: c.photoUrl,
        isClient: c.isClient,
      }))}
    />
  );
}
