"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  MessageSquare,
  Phone,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { ClientCardDrawer } from "@/components/clients/client-card-drawer";
import { useActionDialog } from "@/hooks/use-action-dialog";
import { TrainerHeader } from "@/components/nav/trainer-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createClient,
  promoteContactToClient,
} from "@/lib/actions/clients";
import {
  CONTACT_PHONE_EXISTS_MESSAGE,
  isValidPhone,
  UA_PHONE_MASK_PREFIX,
  uaLocalDigits,
} from "@/lib/phone";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContactChatDialog } from "@/components/contacts/contact-chat-dialog";

export type ClientListItem = {
  id: string;
  firstName: string;
  lastName: string | null;
  photoUrl: string | null;
  phone: string | null;
  goal: string | null;
  sessionBalance: number;
  status: "ACTIVE" | "DEBT" | "PAUSED";
};

export type EligibleContact = {
  id: string;
  firstName: string;
  lastName: string | null;
  phone: string | null;
  photoUrl: string | null;
};

type Props = {
  clients: ClientListItem[];
  eligibleContacts: EligibleContact[];
  counts: { active: number; debt: number; paused: number };
};

type Filter = "ACTIVE" | "DEBT" | "PAUSED" | "ALL";

export function ClientsView({ clients, eligibleContacts, counts }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("ACTIVE");
  const [createOpen, setCreateOpen] = useActionDialog();
  const [createMode, setCreateMode] = useState<"pick" | "new">("pick");
  const [contactQuery, setContactQuery] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState(UA_PHONE_MASK_PREFIX);
  const [pending, startTransition] = useTransition();
  const [chatClient, setChatClient] = useState<ClientListItem | null>(null);
  const [cardClientId, setCardClientId] = useState<string | null>(null);
  const [clientItems, setClientItems] = useState(clients);
  const [countItems, setCountItems] = useState(counts);
  const [availableContacts, setAvailableContacts] =
    useState(eligibleContacts);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setClientItems(clients);
  }, [clients]);

  useEffect(() => {
    setCountItems(counts);
  }, [counts]);

  useEffect(() => {
    setAvailableContacts(eligibleContacts);
  }, [eligibleContacts]);

  const bumpCounts = (
    prevStatus: ClientListItem["status"] | null,
    nextStatus: ClientListItem["status"],
  ) => {
    setCountItems((prev) => {
      const next = { ...prev };
      if (prevStatus === "ACTIVE") next.active = Math.max(0, next.active - 1);
      if (prevStatus === "DEBT") next.debt = Math.max(0, next.debt - 1);
      if (prevStatus === "PAUSED") next.paused = Math.max(0, next.paused - 1);
      if (nextStatus === "ACTIVE") next.active += 1;
      if (nextStatus === "DEBT") next.debt += 1;
      if (nextStatus === "PAUSED") next.paused += 1;
      return next;
    });
  };

  const upsertClient = (
    item: ClientListItem,
    prevStatus?: ClientListItem["status"] | null,
  ) => {
    setClientItems((prev) => {
      const exists = prev.some((c) => c.id === item.id);
      if (!exists) {
        return [...prev, item].sort((a, b) =>
          `${a.firstName} ${a.lastName ?? ""}`.localeCompare(
            `${b.firstName} ${b.lastName ?? ""}`,
            "uk",
          ),
        );
      }
      return prev.map((c) => (c.id === item.id ? { ...c, ...item } : c));
    });
    if (prevStatus === undefined || prevStatus === null) {
      bumpCounts(null, item.status);
      return;
    }
    if (prevStatus !== item.status) {
      bumpCounts(prevStatus, item.status);
    }
  };

  useEffect(() => {
    const id = searchParams.get("client");
    if (!id) return;
    setCardClientId(id);
    const next = new URLSearchParams(searchParams.toString());
    next.delete("client");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const resetCreateForm = () => {
    setFirstName("");
    setLastName("");
    setPhone(UA_PHONE_MASK_PREFIX);
    setContactQuery("");
    setCreateMode("pick");
  };

  const canSubmit =
    firstName.trim().length > 0 && isValidPhone(phone);

  const filteredEligible = useMemo(() => {
    const q = contactQuery.trim().toLowerCase();
    if (!q) return availableContacts;
    return availableContacts.filter((c) => {
      const name = `${c.firstName} ${c.lastName ?? ""}`.toLowerCase();
      return name.includes(q) || (c.phone?.toLowerCase().includes(q) ?? false);
    });
  }, [availableContacts, contactQuery]);

  const filtered = useMemo(() => {
    return clientItems.filter((c) => {
      if (filter !== "ALL" && c.status !== filter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      const name = `${c.firstName} ${c.lastName ?? ""}`.toLowerCase();
      return name.includes(q) || (c.goal?.toLowerCase().includes(q) ?? false);
    });
  }, [clientItems, filter, query]);

  const chips: Array<{ key: Filter; label: string }> = [
    { key: "ACTIVE", label: `Активні (${countItems.active})` },
    { key: "DEBT", label: `Боржники (${countItems.debt})` },
    { key: "PAUSED", label: `Пауза (${countItems.paused})` },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <TrainerHeader
        title="Клієнти"
        actions={
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full bg-white text-foreground shadow-card"
            aria-label="Фільтри"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        }
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук клієнта..."
            className="rounded-xl border-gray-100 bg-white py-2.5 pl-10 pr-4 text-sm font-medium shadow-sm"
          />
        </div>
      </TrainerHeader>

      <div className="hide-scrollbar flex shrink-0 gap-2 overflow-x-auto border-b border-gray-100 px-5 py-3">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => setFilter(chip.key)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold",
              filter === chip.key
                ? "bg-foreground text-white"
                : "border border-gray-200 bg-white text-muted-foreground",
            )}
          >
            {chip.label}
          </button>
        ))}
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto hide-scrollbar p-5">
        {filtered.map((client) => {
          const name = `${client.firstName} ${client.lastName ?? ""}`.trim();
          const initial = client.firstName.charAt(0).toUpperCase();
          const isDebt = client.status === "DEBT" || client.sessionBalance <= 1;
          const telHref = client.phone
            ? `tel:${client.phone.replace(/\s+/g, "")}`
            : undefined;
          return (
            <div
              key={client.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card",
                isDebt && "border-l-[3px] border-l-primary",
              )}
            >
              <button
                type="button"
                onClick={() => setCardClientId(client.id)}
                className="flex min-w-0 flex-1 items-center gap-4 text-left transition-transform active:scale-[0.99]"
              >
                <Avatar className="size-12 shrink-0">
                  {client.photoUrl ? (
                    <AvatarImage src={client.photoUrl} alt={name} />
                  ) : null}
                  <AvatarFallback className="bg-muted text-lg font-bold text-muted-foreground">
                    {initial}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-bold">{name}</h3>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-muted-foreground">
                    <span>
                      Залишок {client.sessionBalance}{" "}
                      {client.sessionBalance === 1 ? "заняття" : "занять"}
                    </span>
                    {isDebt ? (
                      <span className="inline-flex items-center gap-0.5 font-bold uppercase text-primary">
                        <AlertCircle className="size-3 fill-current" />
                        Оплата
                      </span>
                    ) : null}
                  </p>
                </div>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                {telHref ? (
                  <a
                    href={telHref}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "icon" }),
                      "rounded-xl border-gray-100 bg-white shadow-card",
                    )}
                    aria-label={`Зателефонувати ${name}`}
                  >
                    <Phone className="size-4" />
                  </a>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-xl border-gray-100 bg-white shadow-card"
                    disabled
                    aria-label="Телефон відсутній"
                  >
                    <Phone className="size-4" />
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-gray-100 bg-white shadow-card"
                  onClick={() => setChatClient(client)}
                  aria-label={`Написати ${name}`}
                >
                  <MessageSquare className="size-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Клієнтів не знайдено.</p>
        ) : null}

        <div className="h-8" />
      </div>

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) resetCreateForm();
        }}
      >
        <DialogContent className="flex max-h-[min(36rem,85dvh)] flex-col gap-0 overflow-hidden rounded-2xl p-0">
          <DialogHeader className="shrink-0 border-b border-gray-100 px-4 py-3">
            <DialogTitle>Додати клієнта</DialogTitle>
          </DialogHeader>

          <div className="grid shrink-0 grid-cols-2 gap-1 border-b border-gray-100 p-2">
            <button
              type="button"
              onClick={() => setCreateMode("pick")}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-bold transition-colors",
                createMode === "pick"
                  ? "bg-foreground text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              З контакту
            </button>
            <button
              type="button"
              onClick={() => setCreateMode("new")}
              className={cn(
                "rounded-xl px-3 py-2 text-sm font-bold transition-colors",
                createMode === "new"
                  ? "bg-foreground text-white"
                  : "bg-muted text-muted-foreground",
              )}
            >
              Новий
            </button>
          </div>

          {createMode === "pick" ? (
            <div className="flex min-h-0 flex-1 flex-col">
              <div className="shrink-0 px-4 py-3">
                <Input
                  value={contactQuery}
                  onChange={(e) => setContactQuery(e.target.value)}
                  placeholder="Пошук контакту…"
                  className="rounded-xl"
                />
              </div>
              <div className="min-h-0 flex-1 space-y-2 overflow-y-auto hide-scrollbar px-3 pb-4">
                {filteredEligible.length === 0 ? (
                  <div className="px-2 py-8 text-center">
                    <p className="text-sm text-muted-foreground">
                      Немає контактів без статусу клієнта
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-3 rounded-xl"
                      onClick={() => setCreateMode("new")}
                    >
                      Створити нового
                    </Button>
                  </div>
                ) : (
                  filteredEligible.map((c) => {
                    const name = `${c.firstName} ${c.lastName ?? ""}`.trim();
                    const initial = c.firstName.charAt(0).toUpperCase();
                    return (
                      <button
                        key={c.id}
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          startTransition(async () => {
                            try {
                              const updated = await promoteContactToClient(c.id);
                              setAvailableContacts((prev) =>
                                prev.filter((item) => item.id !== c.id),
                              );
                              upsertClient({
                                id: updated.id,
                                firstName: updated.firstName,
                                lastName: updated.lastName,
                                photoUrl: updated.photoUrl,
                                phone: updated.phone,
                                goal: updated.goal,
                                sessionBalance: updated.sessionBalance,
                                status: updated.status as ClientListItem["status"],
                              });
                              toast.success(`${name} додано як клієнта`);
                              setCreateOpen(false);
                              resetCreateForm();
                              router.refresh();
                            } catch (e) {
                              toast.error(
                                e instanceof Error ? e.message : "Помилка",
                              );
                            }
                          });
                        }}
                        className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-card transition-transform active:scale-[0.99] disabled:opacity-50"
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
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4">
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
                      const created = await createClient({
                        firstName: firstName.trim(),
                        lastName: lastName.trim() || undefined,
                        phone: phone.trim(),
                      });
                      upsertClient({
                        id: created.id,
                        firstName: created.firstName,
                        lastName: created.lastName,
                        photoUrl: created.photoUrl,
                        phone: created.phone,
                        goal: created.goal,
                        sessionBalance: created.sessionBalance,
                        status: created.status as ClientListItem["status"],
                      });
                      toast.success("Клієнта додано");
                      resetCreateForm();
                      setCreateOpen(false);
                      router.refresh();
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
          )}
        </DialogContent>
      </Dialog>

      {chatClient ? (
        <ContactChatDialog
          open
          onOpenChange={(open) => {
            if (!open) setChatClient(null);
          }}
          contactId={chatClient.id}
          contactName={`${chatClient.firstName} ${chatClient.lastName ?? ""}`.trim()}
        />
      ) : null}

      <ClientCardDrawer
        clientId={cardClientId}
        open={cardClientId != null}
        onOpenChange={(open) => {
          if (!open) setCardClientId(null);
        }}
      />
    </div>
  );
}
