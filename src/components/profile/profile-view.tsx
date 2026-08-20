"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type TouchEvent,
} from "react";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProfilePhotoHero } from "@/components/profile/profile-photo-hero";
import { ProfilePhotoCropDialog } from "@/components/profile/profile-photo-crop-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { TrainerHeader } from "@/components/nav/trainer-header";
import type {
  ProfilePhoto,
  TrainerProfile,
} from "@/components/nav/trainer-menu-context";
import { cn } from "@/lib/utils";
import { updateContactProfile } from "@/lib/actions/profile";
import { uploadContactPhoto } from "@/lib/actions/profile-photos";
import { MAX_CONTACT_PHOTOS } from "@/lib/profile/photo-constants";
import { compressImageForUpload } from "@/lib/profile/compress-image";
import {
  animateProgressTo,
  clamp,
  lerp,
} from "@/lib/profile/expand-progress";
import { isValidPhone, uaLocalDigits } from "@/lib/phone";

type EditableField =
  | "name"
  | "phone"
  | "about"
  | "tag"
  | "dateOfBirth"
  | "gender"
  | "heightCm"
  | "weightKg";

const GENDER_LABEL: Record<"MALE" | "FEMALE" | "OTHER", string> = {
  MALE: "Чоловік",
  FEMALE: "Жінка",
  OTHER: "Інше",
};

const GENDER_EMPTY_VALUE = "__NONE__";
const ABOUT_MAX_LENGTH = 180;

type Props = {
  profile: TrainerProfile;
};

type DraftState = {
  name: string;
  phone: string;
  about: string;
  tag: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE" | "OTHER" | "";
  heightCm: string;
  weightKg: string;
};

function initials(profile: TrainerProfile) {
  const first = profile.firstName.trim().charAt(0).toUpperCase();
  const last = profile.lastName?.trim().charAt(0).toUpperCase() ?? "";
  return `${first}${last}` || "?";
}

function displayName(profile: Pick<TrainerProfile, "firstName" | "lastName">) {
  return [profile.firstName, profile.lastName].filter(Boolean).join(" ");
}

function calculateAge(dateOfBirthIso?: string | null) {
  if (!dateOfBirthIso) return null;
  const date = new Date(dateOfBirthIso);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - date.getFullYear();
  const monthDelta = now.getMonth() - date.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < date.getDate())) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

function formatBirthdayLabel(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const formatted = format(date, "dd MMM yyyy", { locale: uk });
  const age = calculateAge(value);
  return age == null ? formatted : `${formatted} (${age} роки)`;
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function InfoRow({
  title,
  subtitle,
  onClick,
  multiline = false,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
  multiline?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl px-1 py-2 text-left transition-colors hover:bg-muted/60"
    >
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-base font-medium text-foreground",
            multiline ? "whitespace-pre-wrap break-words" : "truncate",
          )}
        >
          {title}
        </p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" />
    </button>
  );
}

export function ProfileView({ profile }: Props) {
  const [localProfile, setLocalProfile] = useState(profile);
  const [photos, setPhotos] = useState<ProfilePhoto[]>(profile.photos ?? []);
  const [expandProgress, setExpandProgress] = useState(0);
  const [isDraggingExpand, setIsDraggingExpand] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const heroTrackRef = useRef<HTMLDivElement>(null);
  /** Collapsed TrainerHeader: pt-6(24) + row(36) + mb-4(16) + pb-2(8) = 84. Fixed — no measure FOUC. */
  const collapsedHeaderH = 84;
  const [trackWidth, setTrackWidth] = useState(0);
  const expandProgressRef = useRef(0);
  const settleCancelRef = useRef<(() => void) | null>(null);
  const gestureRef = useRef<{
    x0: number;
    y0: number;
    t0: number;
    p0: number;
    lastY: number;
    lastT: number;
  } | null>(null);
  const axisLock = useRef<"h" | "v" | null>(null);
  const [draft, setDraft] = useState<DraftState>({
    name: displayName(profile),
    phone: profile.phone ?? "",
    about: profile.about ?? "",
    tag: profile.tag ?? "",
    dateOfBirth: toDateInputValue(profile.dateOfBirth),
    gender: profile.gender ?? "",
    heightCm: profile.heightCm != null ? String(profile.heightCm) : "",
    weightKg: profile.weightKg != null ? String(profile.weightKg) : "",
  });

  const name = displayName(localProfile);
  const isClient = Boolean(localProfile.isClient);
  const phoneHasInput = uaLocalDigits(draft.phone).length > 1;
  const phoneInvalid = phoneHasInput && !isValidPhone(draft.phone);
  const aboutLength = draft.about.trim().length;
  const aboutInvalid = aboutLength > ABOUT_MAX_LENGTH;

  useLayoutEffect(() => {
    const track = heroTrackRef.current;
    if (!track) return;
    const measure = () => {
      const w = track.clientWidth;
      if (w > 0) setTrackWidth((prev) => (prev === w ? prev : w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [localProfile.contactId]);

  const setProgress = (value: number) => {
    const next = clamp(value, 0, 1);
    expandProgressRef.current = next;
    setExpandProgress(next);
  };

  const settleTo = (target: 0 | 1) => {
    settleCancelRef.current?.();
    setIsDraggingExpand(false);
    if (scrollRef.current) scrollRef.current.style.overflowY = "";
    const from = expandProgressRef.current;
    if (Math.abs(from - target) < 0.002) {
      setProgress(target);
      return;
    }
    settleCancelRef.current = animateProgressTo(from, target, 280, setProgress, () => {
      settleCancelRef.current = null;
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  const applyPhotos = (nextPhotos: ProfilePhoto[], photoUrl: string | null) => {
    setPhotos(nextPhotos);
    setLocalProfile((prev) => ({ ...prev, photoUrl, photos: nextPhotos }));
    if (nextPhotos.length === 0) settleTo(0);
  };

  const openPhotoPicker = () => {
    if (!localProfile.contactId) {
      toast.error("Контакт не знайдено");
      return;
    }
    if (photos.length >= MAX_CONTACT_PHOTOS) {
      toast.error(`Максимум ${MAX_CONTACT_PHOTOS} фото`);
      return;
    }
    fileInputRef.current?.click();
  };

  const onPhotoSelected = (file: File | undefined) => {
    if (!file) return;
    if (cropSrc) URL.revokeObjectURL(cropSrc);
    const src = URL.createObjectURL(file);
    setCropSrc(src);
    setCropOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadCroppedPhoto = async (file: File) => {
    if (!localProfile.contactId) return;
    setUploading(true);
    try {
      const compressed = await compressImageForUpload(file);
      const formData = new FormData();
      formData.append("file", compressed);
      const result = await uploadContactPhoto(localProfile.contactId, formData);
      applyPhotos(result.photos, result.photoUrl);
      toast.success("Фото додано");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Помилка завантаження");
    } finally {
      setUploading(false);
    }
  };

  const onProfileTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    const now = performance.now();
    gestureRef.current = {
      x0: t.clientX,
      y0: t.clientY,
      t0: now,
      p0: expandProgressRef.current,
      lastY: t.clientY,
      lastT: now,
    };
    axisLock.current = null;
  };

  const onProfileTouchMove = (e: TouchEvent) => {
    const g = gestureRef.current;
    if (!g) return;
    const t = e.touches[0];
    const dx = t.clientX - g.x0;
    const dy = t.clientY - g.y0;

    if (!axisLock.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      const vertical = Math.abs(dy) > Math.abs(dx);
      if (vertical) {
        const scrollTop = scrollRef.current?.scrollTop ?? 0;
        const canMorph =
          expandProgressRef.current > 0.01 ||
          (photos.length > 0 && scrollTop <= 8);
        axisLock.current = canMorph ? "v" : "h";
        if (canMorph) {
          settleCancelRef.current?.();
          settleCancelRef.current = null;
          g.p0 = expandProgressRef.current;
          setIsDraggingExpand(true);
          if (scrollRef.current) scrollRef.current.style.overflowY = "hidden";
        }
      } else {
        axisLock.current = "h";
      }
    }

    if (axisLock.current !== "v") return;

    const width = scrollRef.current?.clientWidth ?? 320;
    const dragRange = Math.min(280, width * 0.75);
    const delta = dy / dragRange;
    setProgress(g.p0 + delta);
    g.lastY = t.clientY;
    g.lastT = performance.now();
  };

  const onProfileTouchEnd = (e: TouchEvent) => {
    const g = gestureRef.current;
    const axis = axisLock.current;
    gestureRef.current = null;
    axisLock.current = null;

    if (!g || axis !== "v") {
      setIsDraggingExpand(false);
      if (scrollRef.current) scrollRef.current.style.overflowY = "";
      // Recover if a mid-morph touch was interrupted (lost target / cancel).
      const mid = expandProgressRef.current;
      if (mid > 0.02 && mid < 0.98) {
        settleTo(mid >= 0.35 ? 1 : 0);
      }
      return;
    }

    const t = e.changedTouches[0];
    const now = performance.now();
    const dtSample = Math.max(1, now - g.lastT);
    const vyInstant = (t.clientY - g.lastY) / dtSample;
    const dtAll = Math.max(1, now - g.t0);
    const vyAll = (t.clientY - g.y0) / dtAll;
    const vy = Math.abs(vyInstant) > Math.abs(vyAll) ? vyInstant : vyAll;
    const progress = expandProgressRef.current;

    let target: 0 | 1;
    if (vy > 0.6) target = 1;
    else if (vy < -0.6) target = 0;
    else target = progress >= 0.35 ? 1 : 0;

    settleTo(target);
  };

  const onProfileTouchMoveRef = useRef(onProfileTouchMove);
  onProfileTouchMoveRef.current = onProfileTouchMove;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onMove = (event: globalThis.TouchEvent) => {
      onProfileTouchMoveRef.current(
        event as unknown as TouchEvent,
      );
      if (axisLock.current === "v") {
        event.preventDefault();
      }
    };
    el.addEventListener("touchmove", onMove, { passive: false });
    return () => el.removeEventListener("touchmove", onMove);
  }, []);

  const p = expandProgress;
  // Full-bleed square = track width (no desktop cap).
  const expandedSize = trackWidth > 0 ? trackWidth : 0;
  const fgMix = Math.round((1 - p) * 100);
  // Collapsed: clear absolute header. Expanded: 0 so photo sits under header.
  // Constant pad avoids measure FOUC (content jumping a few px on reload).
  const scrollPadTop = lerp(collapsedHeaderH + 12, 0, p);
  const titleGone = p > 0.4;
  const headerChromeHidden = p > 0.55;

  const editingTitle = useMemo(() => {
    if (!editingField) return "";
    const map: Record<EditableField, string> = {
      name: "Імʼя та прізвище",
      phone: "Мобільний",
      about: "Про себе",
      tag: "Імʼя користувача",
      dateOfBirth: "День народження",
      gender: "Гендер",
      heightCm: "Ріст",
      weightKg: "Вага",
    };
    return map[editingField];
  }, [editingField]);

  const openField = (field: EditableField) => {
    if (!isClient && (field === "heightCm" || field === "weightKg")) {
      return;
    }

    setDraft({
      name,
      phone: localProfile.phone ?? "",
      about: localProfile.about ?? "",
      tag: localProfile.tag ?? "",
      dateOfBirth: toDateInputValue(localProfile.dateOfBirth),
      gender: localProfile.gender ?? "",
      heightCm: localProfile.heightCm != null ? String(localProfile.heightCm) : "",
      weightKg: localProfile.weightKg != null ? String(localProfile.weightKg) : "",
    });
    setEditingField(field);
  };

  const saveField = () => {
    if (!editingField || !localProfile.contactId) return;
    const contactId = localProfile.contactId;

    startTransition(async () => {
      try {
        const payload: {
          contactId: string;
          firstName?: string;
          lastName?: string | null;
          phone?: string | null;
          about?: string | null;
          tag?: string | null;
          dateOfBirth?: string | null;
          gender?: "MALE" | "FEMALE" | "OTHER" | null;
          heightCm?: number | null;
          weightKg?: number | null;
        } = { contactId };

        if (editingField === "name") {
          const [firstName, ...rest] = draft.name.trim().split(/\s+/);
          if (!firstName) {
            throw new Error("Вкажіть імʼя");
          }
          payload.firstName = firstName;
          payload.lastName = rest.length > 0 ? rest.join(" ") : null;
        }

        if (editingField === "phone") payload.phone = draft.phone.trim() || null;
        if (editingField === "about") {
          if (aboutInvalid) {
            throw new Error(`Поле «Про себе» має бути до ${ABOUT_MAX_LENGTH} символів`);
          }
          payload.about = draft.about.trim() || null;
        }
        if (editingField === "tag") payload.tag = draft.tag.trim().toLowerCase() || null;
        if (editingField === "dateOfBirth") payload.dateOfBirth = draft.dateOfBirth || null;
        if (editingField === "gender") payload.gender = draft.gender || null;
        if (isClient && editingField === "heightCm")
          payload.heightCm = draft.heightCm ? Number(draft.heightCm) : null;
        if (isClient && editingField === "weightKg")
          payload.weightKg = draft.weightKg ? Number(draft.weightKg) : null;

        const updated = await updateContactProfile(payload);

        setLocalProfile((prev) => ({
          ...prev,
          firstName: updated.firstName,
          lastName: updated.lastName,
          phone: updated.phone,
          about: updated.about,
          tag: updated.tag,
          dateOfBirth: updated.dateOfBirth ? updated.dateOfBirth.toISOString() : null,
          heightCm: updated.heightCm,
          weightKg: updated.weightKg,
          gender: updated.gender,
        }));

        toast.success("Профіль оновлено");
        setEditingField(null);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Помилка оновлення");
      }
    });
  };

  return (
    <div className="relative flex h-full flex-col bg-[#FAFAFA]">
      <div
        className="absolute inset-x-0 top-0 z-40"
        style={{
          // Collapsed: solid bar. Expanded: fully transparent — photo is underneath.
          backgroundColor: `rgb(250 250 250 / ${Math.max(0, 1 - p)})`,
          pointerEvents: headerChromeHidden ? "none" : undefined,
        }}
      >
        <TrainerHeader
          className="bg-transparent"
          contentClassName={cn(headerChromeHidden && "mb-0")}
          style={{
            // Tighten header padding as photo expands under it.
            paddingTop: lerp(24, 12, p),
            paddingBottom: lerp(8, 4, p),
          }}
          menuButtonClassName={cn(
            p > 0.45
              ? "bg-black/25 text-white shadow-none hover:bg-black/35"
              : undefined,
            headerChromeHidden && "pointer-events-auto",
          )}
          title={
            titleGone ? (
              <span className="sr-only">Профіль</span>
            ) : (
              <h1
                className="truncate text-2xl font-bold leading-9 tracking-tight"
                style={{
                  opacity: Math.max(0, 1 - p * 2.2),
                  pointerEvents: "none",
                  color: `color-mix(in srgb, var(--foreground) ${fgMix}%, white)`,
                }}
              >
                Профіль
              </h1>
            )
          }
        />
      </div>

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-y-none px-3 pb-8 sm:gap-4 sm:px-5"
        style={{ paddingTop: scrollPadTop }}
        onTouchStart={onProfileTouchStart}
        onTouchEnd={onProfileTouchEnd}
        onTouchCancel={onProfileTouchEnd}
      >
        {localProfile.contactId ? (
          <div
            ref={heroTrackRef}
            className="-mx-3 w-[calc(100%+1.5rem)] sm:-mx-5 sm:w-[calc(100%+2.5rem)]"
          >
            <ProfilePhotoHero
              contactId={localProfile.contactId}
              photos={photos}
              displayName={name}
              initials={initials(localProfile)}
              progress={expandProgress}
              isDragging={isDraggingExpand}
              trackWidth={trackWidth}
              expandedSize={expandedSize}
              uploading={uploading}
              onExpandRequest={() => settleTo(1)}
              onCollapseRequest={() => settleTo(0)}
              onPhotosChange={applyPhotos}
              onEmptyActivate={openPhotoPicker}
              onEditName={() => openField("name")}
              onSetPhoto={openPhotoPicker}
            />
          </div>
        ) : null}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/*"
          className="sr-only"
          onChange={(e) => void onPhotoSelected(e.target.files?.[0])}
        />

        <div className="rounded-3xl bg-card p-4 shadow-card">
          <InfoRow
            title={localProfile.phone ?? "—"}
            subtitle="Мобільний"
            onClick={() => openField("phone")}
          />
          <InfoRow
            title={localProfile.about?.trim() || "—"}
            subtitle="Про себе"
            onClick={() => openField("about")}
            multiline
          />
          <InfoRow
            title={localProfile.tag ? `@${localProfile.tag}` : "—"}
            subtitle="Імʼя користувача"
            onClick={() => openField("tag")}
          />
          <InfoRow
            title={formatBirthdayLabel(localProfile.dateOfBirth)}
            subtitle="День народження"
            onClick={() => openField("dateOfBirth")}
          />
          <InfoRow
            title={localProfile.gender ? GENDER_LABEL[localProfile.gender] : "—"}
            subtitle="Гендер"
            onClick={() => openField("gender")}
          />
          {isClient ? (
            <>
              <InfoRow
                title={localProfile.heightCm != null ? `${localProfile.heightCm} см` : "—"}
                subtitle="Ріст"
                onClick={() => openField("heightCm")}
              />
              <InfoRow
                title={localProfile.weightKg != null ? `${localProfile.weightKg} кг` : "—"}
                subtitle="Вага"
                onClick={() => openField("weightKg")}
              />
            </>
          ) : null}
        </div>
      </div>

      <Dialog open={editingField != null} onOpenChange={(open) => !open && setEditingField(null)}>
        <DialogContent className="max-w-[28rem] rounded-3xl p-0">
          <DialogHeader className="px-5 pt-5 pb-3">
            <DialogTitle>{editingTitle}</DialogTitle>
            <DialogDescription>Натисніть зберегти, щоб застосувати зміни.</DialogDescription>
          </DialogHeader>

          <div className="px-5 pb-5">
          {editingField === "name" ? (
            <Input
              value={draft.name}
              onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Імʼя Прізвище"
              className="rounded-xl"
            />
          ) : null}

          {editingField === "phone" ? (
            <div className="space-y-2">
              <PhoneInput
                value={draft.phone}
                onChange={(value) => setDraft((prev) => ({ ...prev, phone: value }))}
                className="rounded-xl"
                aria-invalid={phoneInvalid}
              />
              {phoneInvalid ? (
                <p className="text-xs text-destructive">
                  Введіть повний номер у форматі +38 (0XX) XXX-XX-XX
                </p>
              ) : null}
            </div>
          ) : null}

          {editingField === "about" ? (
            <div className="space-y-2">
              <Textarea
                value={draft.about}
                onChange={(e) => setDraft((prev) => ({ ...prev, about: e.target.value }))}
                placeholder="Коротко про себе"
                maxLength={ABOUT_MAX_LENGTH}
                className="min-h-24 rounded-xl"
                aria-invalid={aboutInvalid}
              />
              <div className="flex items-center justify-between text-xs">
                <span className={aboutInvalid ? "text-destructive" : "text-muted-foreground"}>
                  До {ABOUT_MAX_LENGTH} символів
                </span>
                <span className={aboutInvalid ? "font-medium text-destructive" : "text-muted-foreground"}>
                  {aboutLength}/{ABOUT_MAX_LENGTH}
                </span>
              </div>
            </div>
          ) : null}

          {editingField === "tag" ? (
            <Input
              value={draft.tag}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  tag: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
                }))
              }
              placeholder="your_tag"
              className="rounded-xl"
            />
          ) : null}

          {editingField === "dateOfBirth" ? (
            <Input
              type="date"
              value={draft.dateOfBirth}
              onChange={(e) => setDraft((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
              className="rounded-xl"
            />
          ) : null}

          {editingField === "gender" ? (
            <Select
              value={draft.gender || GENDER_EMPTY_VALUE}
              onValueChange={(value) =>
                setDraft((prev) => ({
                  ...prev,
                  gender:
                    value === GENDER_EMPTY_VALUE
                      ? ""
                      : (value as DraftState["gender"]),
                }))
              }
            >
              <SelectTrigger className="h-10 w-full rounded-xl">
                <span className="text-sm font-medium text-foreground">
                  {draft.gender ? GENDER_LABEL[draft.gender] : "Оберіть гендер"}
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={GENDER_EMPTY_VALUE}>Не вказано</SelectItem>
                <SelectItem value="MALE">Чоловік</SelectItem>
                <SelectItem value="FEMALE">Жінка</SelectItem>
                <SelectItem value="OTHER">Інше</SelectItem>
              </SelectContent>
            </Select>
          ) : null}

          {editingField === "heightCm" ? (
            <Input
              type="number"
              step="0.1"
              value={draft.heightCm}
              onChange={(e) => setDraft((prev) => ({ ...prev, heightCm: e.target.value }))}
              placeholder="см"
            />
          ) : null}

          {editingField === "weightKg" ? (
            <Input
              type="number"
              step="0.1"
              value={draft.weightKg}
              onChange={(e) => setDraft((prev) => ({ ...prev, weightKg: e.target.value }))}
              placeholder="кг"
              className="rounded-xl"
            />
          ) : null}
          </div>

          <DialogFooter className="-mx-0 -mb-0 rounded-b-3xl border-t bg-muted/35 px-5 py-4">
            <Button variant="outline" onClick={() => setEditingField(null)} disabled={pending}>
              Скасувати
            </Button>
            <Button
              onClick={saveField}
              disabled={
                pending ||
                !localProfile.contactId ||
                (editingField === "phone" && phoneInvalid) ||
                (editingField === "about" && aboutInvalid)
              }
            >
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProfilePhotoCropDialog
        open={cropOpen}
        imageSrc={cropSrc}
        onOpenChange={(open) => {
          setCropOpen(open);
          if (!open && cropSrc) {
            URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }
        }}
        onCropped={(file) => {
          void uploadCroppedPhoto(file);
        }}
      />

    </div>
  );
}
