"use client";

import { useState, useTransition } from "react";
import { addHours, format } from "date-fns";
import { createAppointment } from "@/lib/actions/appointments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { ScheduleAppointment } from "@/components/schedule/schedule-appointment";

type ClientOption = { id: string; firstName: string; lastName: string | null };

function clientLabel(client: ClientOption) {
  return `${client.firstName} ${client.lastName ?? ""}`.trim();
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientOption[];
  defaultDate: Date;
  onCreated?: (appointment: ScheduleAppointment) => void;
};

export function CreateAppointmentDialog({
  open,
  onOpenChange,
  clients,
  defaultDate,
  onCreated,
}: Props) {
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [time, setTime] = useState("18:00");
  const [location, setLocation] = useState('Зал "Олімп"');
  const [pending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (!clientId) {
      toast.error("Оберіть клієнта");
      return;
    }
    const [h, m] = time.split(":").map(Number);
    const startAt = new Date(defaultDate);
    startAt.setHours(h, m, 0, 0);
    const endAt = addHours(startAt, 1.5);

    startTransition(async () => {
      try {
        const created = await createAppointment({
          clientId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          location,
        });
        toast.success("Запис створено");
        onOpenChange(false);
        onCreated?.(created);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Помилка");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новий запис</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">Клієнт</label>
            <Select
              value={clientId || null}
              onValueChange={(v) => setClientId(v ?? "")}
              items={clients.map((c) => ({
                value: c.id,
                label: clientLabel(c),
              }))}
            >
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Оберіть клієнта">
                  {(value: string | null) => {
                    const selected = clients.find((c) => c.id === value);
                    return selected ? clientLabel(selected) : "Оберіть клієнта";
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => {
                  const name = clientLabel(c);
                  return (
                    <SelectItem key={c.id} value={c.id} label={name}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">
              Час ({format(defaultDate, "dd.MM")})
            </label>
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground">Локація</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <Button
            className="w-full rounded-xl font-bold"
            onClick={handleSubmit}
            disabled={pending}
          >
            {pending ? "Збереження…" : "Створити"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
