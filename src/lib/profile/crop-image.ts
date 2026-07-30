export type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Не вдалося прочитати зображення"));
    img.crossOrigin = "anonymous";
    img.src = src;
  });
}

/** Crop to square JPEG from react-easy-crop pixel area. */
export async function getCroppedSquareFile(
  imageSrc: string,
  pixelCrop: Area,
  fileName = "photo.jpg",
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const size = Math.max(1, Math.round(Math.min(pixelCrop.width, pixelCrop.height)));
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas недоступний");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  );

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );
  if (!blob) throw new Error("Не вдалося обрізати фото");

  return new File([blob], fileName.replace(/\.[^.]+$/, "") + ".jpg", {
    type: "image/jpeg",
  });
}
