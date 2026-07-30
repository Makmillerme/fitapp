"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getCroppedSquareFile } from "@/lib/profile/crop-image";

type Props = {
  open: boolean;
  imageSrc: string | null;
  onOpenChange: (open: boolean) => void;
  onCropped: (file: File) => void;
};

export function ProfilePhotoCropDialog({
  open,
  imageSrc,
  onOpenChange,
  onCropped,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setBusy(true);
    try {
      const file = await getCroppedSquareFile(imageSrc, croppedAreaPixels);
      onCropped(file);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Не вдалося обрізати фото");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!busy) onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-[28rem] overflow-hidden rounded-3xl p-0">
        <DialogHeader className="px-5 pt-5 pb-2">
          <DialogTitle>Обрізати фото</DialogTitle>
          <DialogDescription>
            Відцентруйте обличчя в кружечку. Збережеться квадратне фото для мініатюри.
          </DialogDescription>
        </DialogHeader>

        <div className="relative mx-5 h-72 overflow-hidden rounded-2xl bg-muted">
          {imageSrc ? (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>

        <div className="px-5 pt-3">
          <label className="flex flex-col gap-1.5 text-xs text-muted-foreground">
            Масштаб
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </label>
        </div>

        <DialogFooter className="mt-3 rounded-b-3xl border-t bg-muted/35 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Скасувати
          </Button>
          <Button type="button" disabled={busy || !croppedAreaPixels} onClick={() => void handleConfirm()}>
            {busy ? "Обрізання…" : "Зберегти"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
