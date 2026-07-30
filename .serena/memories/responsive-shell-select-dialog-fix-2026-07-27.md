## Responsive shell + overlay fixes (2026-07-27)

**Removed 430px cap:** `TrainerAppShell` is now `w-full` fluid on all devices. Dev-only side borders (no max-width frame).

**Select in Sheet fix:** `Select` no longer portals into `data-app-shell-portal` (caused floating-ui misalignment). Defaults to `body` with `z-[80]` so dropdown appears above sheet (z-60 portal).

**Dialog width:** Changed from `w-full` to `w-[min(calc(100%-2rem),24rem)]` — compact card, not edge-to-edge.

**Chat settings sheet:** Removed `max-w-[380px]` override; uses default `w-3/4` + `sm:max-w-sm`.