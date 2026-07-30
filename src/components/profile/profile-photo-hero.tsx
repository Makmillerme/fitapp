"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
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
  const measureRef = useRef<HTMLDivElement>(null);
  const activateBtnRef = useRef<HTMLButtonElement>(null);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [index, setIndex] = useState(0);
  const [pending, startTransition] = useTransition();
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
  const fgMix = Math.round((1 - p) * 100);

  const tw = trackWidth > 0 ? trackWidth : localTrackW;
  const fullSize =
    expandedSize > 0 ? expandedSize : tw > 0 ? tw : COLLAPSED_PHOTO;

  const photoSize = lerp(COLLAPSED_PHOTO, fullSize, p);
  const photoRadius = lerp(photoSize / 2, 0, p);
  const photoLeft = tw > 0 ? (tw - photoSize) / 2 : 0;
  const collapsedH = COLLAPSED_PHOTO + PHOTO_GAP + chromeH;
  const containerH = lerp(collapsedH, Math.max(collapsedH, fullSize), p);

  // Chrome rides continuously with progress: under circle → bottom of square.
  // Only `top` lerps (no left/width jump). Styles morph separately.
  const chromePadTop = lerp(0, 16, p);
  const chromePadBottom = lerp(0, 12, p);
  const chromeTopCollapsed = COLLAPSED_PHOTO + PHOTO_GAP;
  const chromeTopExpanded = Math.max(
    chromeTopCollapsed,
    photoSize - chromeH - chromePadTop - chromePadBottom,
  );
  const chromeTop = lerp(chromeTopCollapsed, chromeTopExpanded, p);
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
      if (w > 0) setLocalTrackW(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = measureRef.current;
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
    if (p < 0.5) setIndex(0);
  }, [p]);

  useEffect(() => {
    if (p >= 0.45 || isDragging) {
      activateBtnRef.current?.blur();
    }
  }, [p, isDragging]);

  useEffect(() => {
    if (!carouselActive || !scrollerRef.current) return;
    const el = scrollerRef.current;
    el.scrollTo({ left: index * el.clientWidth, behavior: "auto" });
  }, [photos.length, carouselActive]); // eslint-disable-line react-hooks/exhaustive-deps -- sync on open/count only

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el || el.clientWidth === 0) return;
    const next = Math.round(el.scrollLeft / el.clientWidth);
    setIndex(Math.max(0, Math.min(next, photos.length - 1)));

    // Soft settle after free-scroll (no snap-mandatory hard switch).
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      const node = scrollerRef.current;
      if (!node || node.clientWidth === 0) return;
      const page = Math.round(node.scrollLeft / node.clientWidth);
      const target = page * node.clientWidth;
      if (Math.abs(node.scrollLeft - target) > 1) {
        node.scrollTo({ left: target, behavior: "smooth" });
      }
    }, 90);
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
        setIndex(0);
        requestAnimationFrame(() => {
          scrollerRef.current?.scrollTo({ left: 0, behavior: "smooth" });
        });
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
        const nextIndex = Math.min(index, result.photos.length - 1);
        setIndex(nextIndex);
        requestAnimationFrame(() => {
          const el = scrollerRef.current;
          if (!el) return;
          el.scrollTo({ left: nextIndex * el.clientWidth, behavior: "auto" });
        });
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

  const chromeContent = (forMeasure: boolean): ReactNode => (
    <div className="space-y-3 px-3">
      <div className={cn(!forMeasure && p >= 0.45 && "w-full")}>
        <div
          className={cn(
            "inline-flex items-center gap-2",
            !forMeasure && p >= 0.45 && "w-full",
          )}
        >
          <h2
            className="truncate font-semibold"
            style={{
              fontSize: "clamp(28px, 6.5vw, 42px)",
              color: forMeasure ? undefined : nameColor,
            }}
          >
            {displayName}
          </h2>
          {!forMeasure ? (
            <button
              type="button"
              onClick={onEditName}
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-muted"
              aria-label="Редагувати імʼя"
              style={{
                opacity: Math.max(0, 1 - p * 1.6),
                color: mutedColor,
                pointerEvents: p > 0.35 || !interactive ? "none" : "auto",
              }}
            >
              <Pencil className="size-4" />
            </button>
          ) : (
            <span className="inline-flex size-8 shrink-0" />
          )}
        </div>
        <p
          className="text-base"
          style={{ color: forMeasure ? undefined : mutedColor }}
        >
          у мережі
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={forMeasure || uploading || pending || !interactive}
          onClick={forMeasure ? undefined : onSetPhoto}
          tabIndex={forMeasure ? -1 : undefined}
          className="h-11 min-w-0 flex-col justify-center gap-1 rounded-2xl border px-2 text-xs sm:h-10 sm:text-sm"
          style={
            forMeasure
              ? undefined
              : {
                  backgroundColor: btnBg,
                  color: btnFg,
                  borderColor: btnBorder,
                  boxShadow: p < 0.35 ? "0 1px 2px rgb(0 0 0 / 0.06)" : "none",
                }
          }
        >
          <Camera className="size-4" />
          <span>{uploading ? "Завантаження…" : "Встановити фото"}</span>
        </Button>

        <Link
          href={forMeasure ? "#" : "/settings"}
          tabIndex={forMeasure ? -1 : undefined}
          onClick={forMeasure ? (e) => e.preventDefault() : undefined}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 min-w-0 flex-col justify-center gap-1 rounded-2xl border px-2 text-xs sm:h-10 sm:text-sm",
            (!interactive || forMeasure) && "pointer-events-none",
          )}
          style={
            forMeasure
              ? undefined
              : {
                  backgroundColor: btnBg,
                  color: btnFg,
                  borderColor: btnBorder,
                  boxShadow: p < 0.35 ? "0 1px 2px rgb(0 0 0 / 0.06)" : "none",
                }
          }
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
      {/* Hidden collapsed chrome measurer — always up to date, no locked-effect */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 w-full"
        style={{ visibility: "hidden", zIndex: -1 }}
      >
        <div ref={measureRef}>{chromeContent(true)}</div>
      </div>

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
            onScroll={handleScroll}
            className={cn(
              "flex h-full w-full",
              carouselActive
                ? "overflow-x-auto overflow-y-hidden overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                : "overflow-hidden",
            )}
            style={{
              WebkitOverflowScrolling: carouselActive ? "touch" : undefined,
              scrollBehavior: carouselActive ? "smooth" : undefined,
              pointerEvents: carouselActive ? "auto" : "none",
              touchAction: carouselActive ? "pan-x" : undefined,
            }}
          >
            {(carouselActive ? photos : [primary!]).map((photo) => (
              <div
                key={photo.id}
                className="h-full w-full shrink-0"
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

      {/* Chrome absolute — avoids margin-collapse with absolute photo (in-flow marginTop overlapped name). */}
      <div
        className="absolute inset-x-0 z-30"
        style={{
          top: chromeTop,
          textAlign: p < 0.35 ? "center" : "left",
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
        <div className="relative z-[1]">{chromeContent(false)}</div>
      </div>
    </div>
  );
}

export { COLLAPSED_PHOTO as PROFILE_PHOTO_COLLAPSED_SIZE };
