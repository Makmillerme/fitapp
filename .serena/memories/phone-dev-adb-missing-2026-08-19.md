# Phone-dev script run (2026-08-19)

`.cursor/scripts/phone-dev.ps1` first failed: PowerShell 5.1 parse error on UTF-8 Ukrainian strings (missing terminator). Messages rewritten to ASCII.

Second run: **adb not found** in PATH or typical SDK folders (`%LOCALAPPDATA%\Android\Sdk\platform-tools`, ANDROID_HOME, ANDROID_SDK_ROOT). `npm run dev` is already running in a terminal.

Need Android Platform Tools installed and USB device authorized before reverse can succeed.
