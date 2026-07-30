"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ProfilePhoto = {
  id: string;
  url: string;
  sortOrder: number;
};

export type TrainerProfile = {
  contactId?: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  isClient?: boolean;
  phone?: string | null;
  about?: string | null;
  tag?: string | null;
  dateOfBirth?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  photos?: ProfilePhoto[];
};

type TrainerMenuContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  openMenu: () => void;
  profile: TrainerProfile;
};

const TrainerMenuContext = createContext<TrainerMenuContextValue | null>(null);

export function useTrainerMenu() {
  const ctx = useContext(TrainerMenuContext);
  if (!ctx) {
    throw new Error("useTrainerMenu must be used within TrainerMenuProvider");
  }
  return ctx;
}

type Props = {
  children: ReactNode;
  profile: TrainerProfile;
};

export function TrainerMenuProvider({ children, profile }: Props) {
  const [open, setOpen] = useState(false);

  const openMenu = useCallback(() => setOpen(true), []);

  const value = useMemo(
    () => ({ open, setOpen, openMenu, profile }),
    [open, openMenu, profile],
  );

  return (
    <TrainerMenuContext.Provider value={value}>
      {children}
    </TrainerMenuContext.Provider>
  );
}
