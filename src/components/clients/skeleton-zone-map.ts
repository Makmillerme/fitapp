/** Measurement keys that map to interior polygons of `public/skeleton.svg`. */
export type BodyZoneKey =
  | "neckCm"
  | "shoulderCm"
  | "chestCm"
  | "waistCm"
  | "hipsCm"
  | "bicepsCm"
  | "forearmCm"
  | "thighCm"
  | "calfCm";

/**
 * Interior hole indices in `SKELETON_SUBPATHS` (0 = outer silhouette).
 * Painted by trainer in `/dev/skeleton-zones` (2026-08-18).
 * UI fill is always `var(--primary)`; this map only selects polygons.
 */
export const ZONE_HOLES: Record<BodyZoneKey, readonly number[]> = {
  neckCm: [7, 8, 9, 10, 11, 12, 13],
  shoulderCm: [14, 15],
  chestCm: [16, 17, 18, 19],
  waistCm: [26, 27, 28, 29, 30, 31, 36, 37, 38, 39, 42, 43],
  hipsCm: [48, 49, 50, 51, 52],
  bicepsCm: [20, 21, 22, 23, 34, 35],
  forearmCm: [32, 33, 40, 41, 44, 47],
  thighCm: [53, 54, 55, 56, 61, 62, 63, 64],
  calfCm: [73, 74, 75, 76, 77, 78],
};
