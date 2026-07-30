"use client";

import { useMemo, useState, useTransition } from "react";
import { MessageSquare, Users } from "lucide-react";
import { toast } from "sonner";
import { TrainerHeader } from "@/components/nav/trainer-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactChatDialog } from "@/components/contacts/contact-chat-dialog";
import {
  createContact,
  type ContactConversationListItem,
  type ContactListItem,
} from "@/lib/actions/contact-messages";
import {
  CONTACT_PHONE_EXISTS_MESSAGE,
  isValidPhone,
  UA_PHONE_MASK_PREFIX,
  uaLocalDigits,
} from "@/lib/phone";

type Props = {
  conversations: ContactConversationListItem[];
  contacts: ContactListItem[];
};

export function ContactsView({ conversations, contacts: initialContacts }: Props) {
  const [contactsOpen, setContactsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [active, setActive] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [contacts, setContacts] = useState(initialContacts);
  const [query, setQuery] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(UA_PHONE_MASK_PREFIX);
  const [pending, startTransition] = useTransition();

  const filteredContacts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter((c) => {
      const name = `${c.firstName} ${c.lastName ?? ""}`.toLowerCase();
      return name.includes(q) || (c.phone?.toLowerCase().includes(q) ?? false);
    });
  }, [contacts, query]);

  const resetAdd = () => {
    setFirstName("");
    setLastName("");
    setPhone(UA_PHONE_MASK_PREFIX);
  };

  const canSubmit =
    firstName.trim().length > 0 && isValidPhone(phone);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TrainerHeader
        title="Контакти"
        actions={
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-gray-100 bg-white shadow-card"
            onClick={() => setContactsOpen(true)}
          >
            <Users className="size-4" />
            Контакти
          </Button>
        }
      />

      <div className="flex-1 space-y-3 overflow-y-auto hide-scrollbar p-5">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageSquare className="size-6" />
            </div>
            <div>
              <p className="text-sm font-bold">Поки немає чатів</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Відкрий «Контакти» справа зверху і напиши людині
              </p>
            </div>
          </div>
        ) : (
          conversations.map((item) => {
            const name =
              `${item.contactFirstName} ${item.contactLastName ?? ""}`.trim();
            const initial = item.contactFirstName.charAt(0).toUpperCase();

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive({ id: item.contactId, name })}
                className="flex w-full items-center gap-4 rounded-2xl bg-white p-4 text-left shadow-card transition-transform active:scale-[0.99]"
              >
                <Avatar className="size-12 shrink-0">
                  {item.contactPhotoUrl ? (
                    <AvatarImage src={item.contactPhotoUrl} alt={name} />
                  ) : null}
                  <AvatarFallback className="bg-muted text-lg font-bold text-muted-foreground">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold">{name}</h3>
                  <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
                    {item.preview ?? "Немає повідомлень"}
                  </p>
                </div>
              </button>
            );
          })
        )}
        <div className="h-8" />
      </div>

      <Dialog open={contactsOpen} onOpenChange={setContactsOpen}>
        <DialogContent className="flex max-h-[min(36rem,85dvh)] flex-col gap-0 overflow-hidden rounded-2xl p-0">
          <DialogHeader className="shrink-0 border-b border-gray-100 px-4 py-3">
            <DialogTitle>Усі контакти</DialogTitle>
          </DialogHeader>
          <div className="shrink-0 space-y-2 border-b border-gray-100 px-4 py-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пошук…"
              className="rounded-xl"
            />
            <Button
              type="button"
              className="w-full rounded-xl font-bold"
              onClick={() => {
                setAddOpen(true);
              }}
            >
              Додати контакт
            </Button>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto hide-scrollbar p-3">
            {filteredContacts.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                Контактів не знайдено
              </p>
            ) : (
              filteredContacts.map((c) => {
                const name = `${c.firstName} ${c.lastName ?? ""}`.trim();
                const initial = c.firstName.charAt(0).toUpperCase();
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setContactsOpen(false);
                      setActive({ id: c.id, name });
                    }}
                    className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-card transition-transform active:scale-[0.99]"
                  >
                    <Avatar className="size-10 shrink-0">
                      {c.photoUrl ? (
                        <AvatarImage src={c.photoUrl} alt={name} />
                      ) : null}
                      <AvatarFallback className="bg-muted font-bold text-muted-foreground">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {c.phone ?? "Без телефону"}
                        {c.isClient ? " · Клієнт" : ""}
                      </p>
                    </div>
                    <MessageSquare className="size-4 shrink-0 text-muted-foreground" />
                  </button>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) resetAdd();
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Новий контакт</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Імʼя *"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="rounded-xl"
              autoComplete="given-name"
            />
            <Input
              placeholder="Прізвище"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="rounded-xl"
              autoComplete="family-name"
            />
            <PhoneInput
              value={phone}
              onChange={setPhone}
              className="rounded-xl"
              aria-invalid={
                uaLocalDigits(phone).length > 1 && !isValidPhone(phone)
              }
            />
            {uaLocalDigits(phone).length > 1 && !isValidPhone(phone) ? (
              <p className="text-xs text-destructive">
                Введіть повний номер у форматі +38 (0XX) XXX-XX-XX
              </p>
            ) : null}
            <Button
              className="w-full rounded-xl font-bold"
              disabled={pending || !canSubmit}
              onClick={() => {
                startTransition(async () => {
                  try {
                    const created = await createContact({
                      firstName: firstName.trim(),
                      lastName: lastName.trim() || undefined,
                      phone: phone.trim(),
                    });
                    setContacts((prev) => [
                      {
                        id: created.id,
                        firstName: created.firstName,
                        lastName: created.lastName,
                        phone: created.phone,
                        photoUrl: created.photoUrl,
                        isClient: created.isClient,
                      },
                      ...prev,
                    ]);
                    toast.success("Контакт додано");
                    resetAdd();
                    setAddOpen(false);
                  } catch (e) {
                    const msg =
                      e instanceof Error ? e.message : "Помилка";
                    if (msg === CONTACT_PHONE_EXISTS_MESSAGE) {
                      toast.warning(msg);
                    } else {
                      toast.error(msg);
                    }
                  }
                });
              }}
            >
              Зберегти
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {active ? (
        <ContactChatDialog
          open
          onOpenChange={(open) => {
            if (!open) setActive(null);
          }}
          contactId={active.id}
          contactName={active.name}
        />
      ) : null}
    </div>
  );
}
