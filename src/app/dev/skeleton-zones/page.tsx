import { notFound } from "next/navigation";
import { SkeletonZonePainter } from "@/components/clients/skeleton-zone-painter";

export default function SkeletonZonesDevPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <SkeletonZonePainter />;
}
