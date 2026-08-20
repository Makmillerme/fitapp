"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { Camera, MoreVertical, Pencil, Settings } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProfilePhoto } from "@/components/nav/trainer-menu-context";
import {
  deleteContactPhoto,
  setPrimaryContactPhoto,
} from "@/lib/actions/profile-photos";
import { clamp, lerp } from "@/lib/profile/expand-progress";
import { cn } from "@/lib/utils";

const COLLAPSED_PHOTO = 96;
const PHOTO_GAP = 12;

type Props = {
  contactId: string;
  photos: ProfilePhoto[];
  displayName: string;
  initials: string;
  /** 0 = circle, 1 = full square */
  progress: number;
  isDragging: boolean;
  trackWidth: number;
  expandedSize: number;
  uploading?: boolean;
  onExpandRequest: () => void;
  onCollapseRequest: () => void;
  onPhotosChange: (photos: ProfilePhoto[], photoUrl: string | null) => void;
  onEmptyActivate: () => void;
  onEditName: () => void;
  onSetPhoto: () => void;
};

export function ProfilePhotoHero({
  contactId,
  photos,
  displayName,
  initials,
  progress,
  isDragging,
  trackWidth,
  expandedSize,
  uploading = false,
  onExpandRequest,
  onCollapseRequest,
  onPhotosChange,
  onEmptyActivate,
  onEditName,
  onSetPhoto,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const chromeInnerRef = useRef<HTMLDivElement>(null);
  const activateBtnRef = useRef<HTMLButtonElement>(null);
  const indexRef = useRef(0);
  const swipeRef = useRef<{
    pointerId: number;
    x0: number;
    t0: number;
    lastX: number;
    lastT: number;
    startIndex: number;
  } | null>(null);
  const [index, setIndex] = useState(0);
  /** Finger follow offset while swiping (one page max). */
  const [dragPx, setDragPx] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const [pending, startTransition] = useTransition();
  /** Natural chrome height (no pads) — keeps collapsed spacing tight under the circle. */
  const [chromeH, setChromeH] = useState(122);
  /** Local measure so first paint isn't stuck with trackWidth=0 from parent. */
  const [localTrackW, setLocalTrackW] = useState(() =>
    typeof trackWidth === "number" && trackWidth > 0 ? trackWidth : 0,
  );

  const p = clamp(progress, 0, 1);
  const primary = photos[0];
  const current =
    photos[Math.min(index, Math.max(0, photos.length - 1))] ?? primary;
  const carouselActive = p > 0.98 && !isDragging && photos.length > 1;
  const interactive = !isDragging;
  // Continuous with photo progress (no Math.round stepping / no CSS transition lag).
  const fgMix = (1 - p) * 100;
  const alignSpacer = 1 - p;

  const tw = trackWidth > 0 ? trackWidth : localTrackW;
  const fullSize =
    expandedSize > 0 ? expandedSize : tw > 0 ? tw : COLLAPSED_PHOTO;

  const photoSize = lerp(COLLAPSED_PHOTO, fullSize, p);
  const photoRadius = lerp(photoSize / 2, 0, p);
  const photoLeft = tw > 0 ? (tw - photoSize) / 2 : 0;
  // Collapsed: compact (circle + gap + chrome). Expanded: fullSize square.
  // Chrome always bottom-pinned — grows with container, not with photoSize.
  const collapsedH = COLLAPSED_PHOTO + PHOTO_GAP + chromeH;
  const containerH = lerp(collapsedH, Math.max(collapsedH, fullSize), p);

  const chromePadTop = lerp(0, 16, p);
  const chromePadBottom = lerp(0, 12, p);
  const scrimOpacity = Math.min(1, p * 1.2);
  const scrimBlur = lerp(0, 18, p);

  useLayoutEffect(() => {
    if (trackWidth > 0) setLocalTrackW(trackWidth);
  }, [trackWidth]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      const w = root.clientWidth;
      if (w > 0) setLocalTrackW((prev) => (prev === w ? prev : w));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = chromeInnerRef.current;
    if (!el) return;
    const measure = () => {
      const h = el.offsetHeight;
      if (h > 0) setChromeH((prev) => (prev === h ? prev : h));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [displayName, uploading]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    if (p < 0.5) {
      setIndex(0);
      setDragPx(0);
      setSwiping(false);
      swipeRef.current = null;
    }
  }, [p]);

  useEffect(() => {
    if (p >= 0.45 || isDragging) {
      activateBtnRef.current?.blur();
    }
  }, [p, isDragging]);

  useEffect(() => {
    if (!carouselActive) {
      setDragPx(0);
      setSwiping(false);
      swipeRef.current = null;
    }
  }, [carouselActive]);

  const slideW = () => scrollerRef.current?.clientWidth ?? tw;

  const goToPage = (page: number) => {
    const next = Math.max(0, Math.min(page, photos.length - 1));
    indexRef.current = next;
    setIndex(next);
    setDragPx(0);
    setSwiping(false);
  };

  const onCarouselPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!carouselActive || photos.length < 2) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    swipeRef.current = {
      pointerId: e.pointerId,
      x0: e.clientX,
      t0: e.timeStamp,
      lastX: e.clientX,
      lastT: e.timeStamp,
      startIndex: indexRef.current,
    };
    setSwiping(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onCarouselPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = swipeRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const w = slideW();
    if (w <= 0) return;
    const raw = e.clientX - s.x0;
    // One swipe can travel at most one page; lock edges at ends.
    const min = s.startIndex <= 0 ? 0 : -w;
    const max = s.startIndex >= photos.length - 1 ? 0 : w;
    const clamped = Math.max(min, Math.min(max, raw));
    s.lastX = e.clientX;
    s.lastT = e.timeStamp;
    setDragPx(clamped);
  };

  const onCarouselPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const s = swipeRef.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const w = slideW();
    const dx = e.clientX - s.x0;
    const dt = Math.max(1, e.timeStamp - s.t0);
    const vAvg = dx / dt;
    const threshold = Math.max(48, w * 0.18);
    let next = s.startIndex;
    if (dx <= -threshold || vAvg < -0.5) next = s.startIndex + 1;
    else if (dx >= threshold || vAvg > 0.5) next = s.startIndex - 1;
    swipeRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    goToPage(next);
  };

  const onActivate = () => {
    if (photos.length === 0) {
      onEmptyActivate();
      return;
    }
    if (p < 0.5) onExpandRequest();
  };

  const makePrimary = () => {
    if (!current || current.sortOrder === 0) return;
    startTransition(async () => {
      try {
        const result = await setPrimaryContactPhoto(contactId, current.id);
        onPhotosChange(result.photos, result.photoUrl);
        goToPage(0);
        toast.success("Основне фото оновлено");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Помилка");
      }
    });
  };

  const removePhoto = () => {
    if (!current) return;
    startTransition(async () => {
      try {
        const result = await deleteContactPhoto(contactId, current.id);
        onPhotosChange(result.photos, result.photoUrl);
        if (result.photos.length === 0) {
          onCollapseRequest();
          toast.success("Фото видалено");
          return;
        }
        goToPage(Math.min(index, result.photos.length - 1));
        toast.success("Фото видалено");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Помилка");
      }
    });
  };

  const nameColor = `color-mix(in srgb, var(--foreground) ${fgMix}%, white)`;
  const mutedColor = `color-mix(in srgb, var(--muted-foreground) ${fgMix}%, rgb(255 255 255 / 0.85))`;
  const btnBg = `color-mix(in srgb, var(--card) ${fgMix}%, rgb(0 0 0 / 0.4))`;
  const btnFg = `color-mix(in srgb, var(--foreground) ${fgMix}%, white)`;
  const btnBorder = `color-mix(in srgb, var(--border) ${fgMix}%, transparent)`;

  const btnShadow = `0 1px 2px rgb(0 0 0 / ${0.06 * (1 - p)})`;
  const btnSurfaceClass =
    "h-11 min-w-0 flex-col justify-center gap-1 rounded-2xl border px-2 text-xs transition-none sm:h-10 sm:text-sm";

  const chromeContent = (
    <div className="space-y-3 px-3">
      {/* Spacers lerp center → left in sync with photo progress (no p≥0.45 snap). */}
      <div className="w-full">
        <div className="flex w-full items-center">
          <div
            aria-hidden
            className="min-w-0 shrink"
            style={{ flexGrow: alignSpacer, flexBasis: 0 }}
          />
          <div className="inline-flex min-w-0 max-w-full items-center gap-2">
            <h2
              className="truncate font-semibold leading-none"
              style={{
                fontSize: "clamp(28px, 6.5vw, 42px)",
                color: nameColor,
              }}
            >
              {displayName}
            </h2>
            <button
              type="button"
              onClick={onEditName}
              className="inline-flex size-8 shrink-0 -translate-y-px items-center justify-center self-center rounded-full transition-none hover:bg-white/10"
              aria-label="Редагувати імʼя"
              style={{
                color: mutedColor,
                pointerEvents: interactive ? "auto" : "none",
              }}
            >
              <Pencil className="size-4" />
            </button>
          </div>
          <div
            aria-hidden
            className="min-w-0 shrink"
            style={{ flexGrow: alignSpacer, flexBasis: 0 }}
          />
        </div>
        <div className="flex w-full">
          <div
            aria-hidden
            className="min-w-0 shrink"
            style={{ flexGrow: alignSpacer, flexBasis: 0 }}
          />
          <p
            className="min-w-0 text-base"
            style={{ color: mutedColor }}
          >
            у мережі
          </p>
          <div
            aria-hidden
            className="min-w-0 shrink"
            style={{ flexGrow: alignSpacer, flexBasis: 0 }}
          />
        </div>
      </div>

      <div className="grid w-full grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={uploading || pending}
          onClick={onSetPhoto}
          className={cn(btnSurfaceClass, !interactive && "pointer-events-none")}
          style={{
            backgroundColor: btnBg,
            color: btnFg,
            borderColor: btnBorder,
            boxShadow: btnShadow,
          }}
        >
          <Camera className="size-4" />
          <span>{uploading ? "Завантаження…" : "Встановити фото"}</span>
        </Button>

        <Link
          href="/settings"
          className={cn(
            buttonVariants({ variant: "outline" }),
            btnSurfaceClass,
            !interactive && "pointer-events-none",
          )}
          style={{
            backgroundColor: btnBg,
            color: btnFg,
            borderColor: btnBorder,
            boxShadow: btnShadow,
          }}
        >
          <Settings className="size-4" />
          <span>Налаштування</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div
      ref={rootRef}
      className="relative w-full"
      style={{
        height: containerH,
        // During expand drag, block browser pan so parent gesture owns the touch.
        touchAction: isDragging ? "none" : "pan-y",
      }}
    >
      {/* Photo layer — grows from circle to square behind chrome */}
      <div
        className="absolute top-0 overflow-hidden bg-muted"
        style={{
          width: photoSize,
          height: photoSize,
          // Until width known: CSS-center (never left:0 FOUC).
          ...(tw > 0
            ? { left: photoLeft }
            : { left: 0, right: 0, marginLeft: "auto", marginRight: "auto" }),
          borderRadius: photoRadius,
          zIndex: 0,
        }}
      >
        {photos.length > 0 ? (
          <div
            ref={scrollerRef}
            className="h-full w-full overflow-hidden"
            style={{
              pointerEvents: carouselActive ? "auto" : "none",
              touchAction: carouselActive ? "pan-x" : undefined,
            }}
            onPointerDown={onCarouselPointerDown}
            onPointerMove={onCarouselPointerMove}
            onPointerUp={onCarouselPointerUp}
            onPointerCancel={onCarouselPointerUp}
          >
            <div
              className="flex h-full will-change-transform"
              style={{
                width: carouselActive
                  ? `${photos.length * 100}%`
                  : "100%",
                transform: carouselActive
                  ? `translate3d(calc(${(-index * 100) / photos.length}% + ${dragPx}px), 0, 0)`
                  : undefined,
                transition: swiping
                  ? "none"
                  : "transform 280ms cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              {(carouselActive ? photos : [primary!]).map((photo) => (
                <div
                  key={photo.id}
                  className="h-full shrink-0"
                  style={{
                    width: carouselActive
                      ? `${100 / photos.length}%`
                      : "100%",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt="Фото профілю"
                    className="h-full w-full object-cover select-none"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <span className="flex size-full items-center justify-center bg-primary/10 text-2xl font-bold text-primary">
            {initials}
          </span>
        )}

        {/* Always mounted — unmounting mid-drag drops the touch target and freezes progress.
            No aria-hidden (avoids focus + aria-hidden conflict); use tabIndex/pointer-events. */}
        <button
          ref={activateBtnRef}
          type="button"
          className="absolute inset-0 z-20 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          onClick={onActivate}
          aria-label={
            photos.length > 0 ? "Розгорнути фото" : "Встановити фото"
          }
          tabIndex={p >= 0.45 || isDragging ? -1 : 0}
          style={{
            pointerEvents: p < 0.45 && !isDragging ? "auto" : "none",
          }}
        />

        {/* Kebab — only on photo, fades in with expand */}
        <div
          className="absolute inset-x-0 top-0 z-10 flex items-center justify-end px-3 pt-3"
          style={{
            opacity: p,
            pointerEvents: interactive && p > 0.55 ? "auto" : "none",
          }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full bg-black/20 text-white hover:bg-black/35 hover:text-white"
                  aria-label="Дії з фото"
                  disabled={pending || !interactive || p <= 0.55}
                />
              }
            >
              <MoreVertical className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[100] min-w-44">
              <DropdownMenuItem
                disabled={pending || current?.sortOrder === 0}
                onClick={makePrimary}
              >
                Зробити основним
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                disabled={pending}
                onClick={removePhoto}
              >
                Видалити
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chrome bottom-pinned: under circle when collapsed, overlay when square. */}
      <div
        className="absolute inset-x-0 bottom-0 z-30"
        style={{
          pointerEvents:
            interactive && (p < 0.08 || p > 0.92) ? "auto" : "none",
          paddingTop: chromePadTop,
          paddingBottom: chromePadBottom,
        }}
      >
        {/* Frosted scrim — taller band + mask so blur fades softly (no hard cut). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0"
          style={{
            height: "170%",
            opacity: scrimOpacity,
            background:
              "linear-gradient(to top, rgb(0 0 0 / 0.42) 0%, rgb(0 0 0 / 0.22) 28%, rgb(0 0 0 / 0.08) 58%, transparent 100%)",
            backdropFilter: `blur(${scrimBlur}px) saturate(1.2)`,
            WebkitBackdropFilter: `blur(${scrimBlur}px) saturate(1.2)`,
            maskImage:
              "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, black 0%, black 35%, transparent 100%)",
          }}
        />
        <div ref={chromeInnerRef} className="relative z-[1]">
          {chromeContent}
        </div>
      </div>
    </div>
  );
}

export { COLLAPSED_PHOTO as PROFILE_PHOTO_COLLAPSED_SIZE };
