#Requires -Version 5.1
# Forwards the local Next.js port to Android via ADB reverse (USB).
# Uses portable adb under .cursor/tools. Does not change app code.
param(
  [int] $Port = 3000
)

$ErrorActionPreference = "Stop"

$cursorDir = Split-Path $PSScriptRoot -Parent
$portableAdb = Join-Path $cursorDir "tools\platform-tools\adb.exe"

function Get-AdbPath {
  if (Test-Path $portableAdb) { return $portableAdb }
  $cmd = Get-Command adb -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $candidates = @(
    "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
    "$env:ANDROID_HOME\platform-tools\adb.exe",
    "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe"
  )
  foreach ($p in $candidates) {
    if ($p -and (Test-Path $p)) { return $p }
  }
  return $null
}

Write-Host "FitApp phone-dev (ADB reverse) - port $Port"
Write-Host ""

$adb = Get-AdbPath
if (-not $adb) {
  Write-Host "adb not found. Run: powershell -NoProfile -File .cursor/scripts/install-platform-tools.ps1"
  exit 1
}

Write-Host "adb: $adb"
& $adb start-server | Out-Null
$devices = & $adb devices
Write-Host $devices

$ready = @($devices | Select-Object -Skip 1 | Where-Object { $_ -match "\tdevice$" })
if ($ready.Count -eq 0) {
  Write-Host "No authorized device (status device)."
  Write-Host "Check cable, USB debugging, and the Allow USB debugging prompt on the phone."
  exit 1
}

& $adb reverse "tcp:$Port" "tcp:$Port"
if ($LASTEXITCODE -ne 0) {
  Write-Host "adb reverse failed (exit $LASTEXITCODE)."
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "OK: tcp:$Port -> tcp:$Port"
Write-Host "On the phone Chrome: http://localhost:$Port"
Write-Host "Sign in as Demo Admin (dev) on /connect."
Write-Host "If npm run dev is not running, start it on the PC (this script does not)."
