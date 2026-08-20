import type { ContactChatMessage } from "@/lib/actions/contact-messages";

const byContactId = new Map<string, ContactChatMessage[]>();

export function readContactChatCache(
  contactId: string,
): ContactChatMessage[] | undefined {
  return byContactId.get(contactId);
}

export function writeContactChatCache(
  contactId: string,
  messages: ContactChatMessage[],
) {
  byContactId.set(contactId, messages);
}
