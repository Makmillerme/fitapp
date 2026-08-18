"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateClientBalance } from "@/lib/actions/clients";
import { cn } from "@/lib/utils";

const FLUSH_MS = 400;

type BalancePatch = {
  id: string;
  sessionBalance: number;
  status: string;
};

type Props = {
  clientId: string;
  sessionBalance: number;
  status: string;
  onOptimistic?: (patch: BalancePatch) => void;
  onPatched?: (patch: BalancePatch) => void;
};

function sessionWord(count: number): string {
  const n = Math.abs(count);
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "заняття";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "заняття";
  return "занять";
}

function statusForBalance(balance: number, status: string): string {
  if (balance <= 0) return "DEBT";
  if (status === "DEBT" && balance > 0) return "ACTIVE";
  return status;
}

export function SessionBalanceCard({
  clientId,
  sessionBalance,
  status,
  onOptimistic,
  onPatched,
}: Props) {
  const [balance, setBalance] = useState(sessionBalance);

  const balanceRef = useRef(sessionBalance);
  const statusRef = useRef(status);
  const confirmedRef = useRef({ balance: sessionBalance, status });
  const queuedDeltaRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushingRef = useRef(false);
  const clientIdRef = useRef(clientId);
  const onOptimisticRef = useRef(onOptimistic);
  const onPatchedRef = useRef(onPatched);

  clientIdRef.current = clientId;
  onOptimisticRef.current = onOptimistic;
  onPatchedRef.current = onPatched;

  useEffect(() => {
    if (queuedDeltaRef.current !== 0 || flushingRef.current) return;
    balanceRef.current = sessionBalance;
    statusRef.current = status;
    confirmedRef.current = { balance: sessionBalance, status };
    setBalance(sessionBalance);
  }, [clientId, sessionBalance, status]);

  const flush = async () => {
    if (flushingRef.current) return;
    const delta = queuedDeltaRef.current;
    if (delta === 0) return;
    queuedDeltaRef.current = 0;
    flushingRef.current = true;
    try {
      const updated = await updateClientBalance(clientIdRef.current, delta);
      confirmedRef.current = {
        balance: updated.sessionBalance,
        status: updated.status,
      };
      onPatchedRef.current?.({
        id: clientIdRef.current,
        sessionBalance: updated.sessionBalance,
        status: updated.status,
      });
      if (queuedDeltaRef.current === 0) {
        balanceRef.current = updated.sessionBalance;
        statusRef.current = updated.status;
        setBalance(updated.sessionBalance);
      }
    } catch (error) {
      queuedDeltaRef.current = 0;
      const confirmed = confirmedRef.current;
      balanceRef.current = confirmed.balance;
      statusRef.current = confirmed.status;
      setBalance(confirmed.balance);
      onOptimisticRef.current?.({
        id: clientIdRef.current,
        sessionBalance: confirmed.balance,
        status: confirmed.status,
      });
      toast.error(
        error instanceof Error ? error.message : "Не вдалося змінити баланс",
      );
    } finally {
      flushingRef.current = false;
      if (queuedDeltaRef.current !== 0) {
        void flush();
      }
    }
  };

  const scheduleFlush = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void flush();
    }, FLUSH_MS);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const delta = queuedDeltaRef.current;
      queuedDeltaRef.current = 0;
      if (delta !== 0) {
        void updateClientBalance(clientIdRef.current, delta);
      }
    };
  }, []);

  const adjust = (delta: number) => {
    if (delta === 0) return;
    const current = balanceRef.current;
    const applied = delta;
    const nextBalance = current + applied;
    const nextStatus = statusForBalance(nextBalance, statusRef.current);
    balanceRef.current = nextBalance;
    statusRef.current = nextStatus;
    queuedDeltaRef.current += applied;
    setBalance(nextBalance);
    onOptimisticRef.current?.({
      id: clientIdRef.current,
      sessionBalance: nextBalance,
      status: nextStatus,
    });
    scheduleFlush();
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <p className="text-sm font-bold text-foreground">Баланс занять</p>

      <div className="mt-4 flex items-center gap-3 rounded-2xl bg-muted/70 px-3 py-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-xl border-border bg-background touch-manipulation"
          onClick={() => adjust(-1)}
          aria-label="Відняти заняття"
        >
          <Minus />
        </Button>

        <div className="min-w-0 flex-1 text-center">
          <p
            aria-live="polite"
            className={cn(
              "text-4xl font-bold tabular-nums tracking-tight text-foreground",
              balance <= 0 && "text-destructive",
            )}
          >
            {balance}
          </p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            {sessionWord(balance)}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="rounded-xl border-border bg-background touch-manipulation"
          onClick={() => adjust(1)}
          aria-label="Додати заняття"
        >
          <Plus />
        </Button>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="mt-3 w-full rounded-xl touch-manipulation"
        onClick={() => adjust(10)}
      >
        Додати 10 занять
      </Button>
    </div>
  );
}
