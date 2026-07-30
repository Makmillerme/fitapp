"use client";

import { useEffect, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ClientDetailView } from "@/components/clients/client-detail-view";
import { getClientDetail } from "@/lib/actions/clients";

type DetailPayload = {
  client: {
    id: string;
    firstName: string;
    lastName: string | null;
    phone: string | null;
    photoUrl: string | null;
    goal: string | null;
    notes: string | null;
    dateOfBirth: string | null;
    heightCm: number | null;
    weightKg: number | null;
    gender: "MALE" | "FEMALE" | "OTHER" | null;
    sessionBalance: number;
    status: string;
  };
  latestMeasurement: {
    measuredAt: string | null;
    neckCm: number | null;
    chestCm: number | null;
    waistCm: number | null;
    hipsCm: number | null;
    bicepsCm: number | null;
    thighCm: number | null;
    calfCm: number | null;
    heightCm: number | null;
  } | null;
  appointments: Array<{
    id: string;
    startAt: string;
    status: string;
    notes: string | null;
    program: { name: string } | null;
  }>;
  logs: Array<{
    id: string;
    createdAt: string;
    notes: string | null;
    weight: number | null;
    exercise: { name: string } | null;
  }>;
};

type Props = {
  clientId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ClientCardDrawer({ clientId, open, onOpenChange }: Props) {
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !clientId) {
      if (!open) {
        setDetail(null);
        setError(null);
      }
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void getClientDetail(clientId)
      .then((result) => {
        if (cancelled) return;
        if (!result) {
          setDetail(null);
          setError("Клієнта не знайдено");
          return;
        }
        setDetail({
          client: {
            id: result.client.id,
            firstName: result.client.firstName,
            lastName: result.client.lastName,
            phone: result.client.phone,
            photoUrl: result.client.photoUrl,
            goal: result.client.goal,
            notes: result.client.notes,
            dateOfBirth: result.client.dateOfBirth
              ? new Date(result.client.dateOfBirth).toISOString()
              : null,
            heightCm: result.client.heightCm,
            weightKg: result.client.weightKg,
            gender: result.client.gender,
            sessionBalance: result.client.sessionBalance,
            status: result.client.status,
          },
          appointments: result.appointments.map((a) => ({
            id: a.id,
            startAt: new Date(a.startAt).toISOString(),
            status: a.status,
            notes: a.notes,
            program: a.program ? { name: a.program.name } : null,
          })),
          logs: result.logs.map((l) => ({
            id: l.id,
            createdAt: new Date(l.createdAt).toISOString(),
            notes: l.notes,
            weight: l.weight,
            exercise: l.exercise ? { name: l.exercise.name } : null,
          })),
          latestMeasurement: result.latestMeasurement
            ? {
                measuredAt: result.latestMeasurement.measuredAt
                  ? new Date(result.latestMeasurement.measuredAt).toISOString()
                  : null,
                neckCm: result.latestMeasurement.neckCm,
                chestCm: result.latestMeasurement.chestCm,
                waistCm: result.latestMeasurement.waistCm,
                hipsCm: result.latestMeasurement.hipsCm,
                bicepsCm: result.latestMeasurement.bicepsCm,
                thighCm: result.latestMeasurement.thighCm,
                calfCm: result.latestMeasurement.calfCm,
                heightCm: result.latestMeasurement.heightCm,
              }
            : null,
        });
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Помилка завантаження");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, clientId]);

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      showSwipeHandle
      swipeDirection="down"
    >
      <DrawerContent className="h-[74dvh] max-h-[74dvh] rounded-t-3xl border-t border-border bg-popover pb-safe">
        <DrawerTitle className="sr-only">Картка клієнта</DrawerTitle>
        <DrawerDescription className="sr-only">
          Огляд, прогрес, історія та нотатки клієнта
        </DrawerDescription>

        {loading ? (
          <div className="space-y-3 px-5 py-6" aria-busy="true">
            <div className="h-14 w-14 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-40 animate-pulse rounded bg-muted" />
            <div className="h-11 w-full animate-pulse rounded-2xl bg-muted" />
            <div className="h-28 w-full animate-pulse rounded-2xl bg-muted" />
          </div>
        ) : null}

        {error ? (
          <p className="px-5 py-8 text-sm text-destructive">{error}</p>
        ) : null}

        {!loading && !error && detail ? (
          <ClientDetailView
            client={detail.client}
            appointments={detail.appointments}
            logs={detail.logs}
            latestMeasurement={detail.latestMeasurement}
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
