# Portable ADB in .cursor (2026-08-19)

Android platform-tools are **not** in npm/`package.json`. Portable install:
- Download script: `.cursor/scripts/install-platform-tools.ps1`
- Binaries: `.cursor/tools/platform-tools/` (gitignored via `.cursor/tools/.gitignore`)
- adb 1.0.41 / 37.0.1-15733141 from Google zip

`phone-dev.ps1` prefers `.cursor/tools/platform-tools/adb.exe` first.
