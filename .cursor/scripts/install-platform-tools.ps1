#Requires -Version 5.1
# Downloads Google Android platform-tools (adb) into .cursor/tools.
# Not an npm dependency. Not a system-wide install.
$ErrorActionPreference = "Stop"

$cursorDir = Split-Path $PSScriptRoot -Parent
$toolsDir = Join-Path $cursorDir "tools"
$zipPath = Join-Path $toolsDir "platform-tools-latest-windows.zip"
$destDir = Join-Path $toolsDir "platform-tools"
$adbPath = Join-Path $destDir "adb.exe"
$url = "https://dl.google.com/android/repository/platform-tools-latest-windows.zip"

if (Test-Path $adbPath) {
  Write-Host "Already present: $adbPath"
  & $adbPath version
  exit 0
}

New-Item -ItemType Directory -Force -Path $toolsDir | Out-Null
Write-Host "Downloading platform-tools to $zipPath"
Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing

if (Test-Path $destDir) {
  Remove-Item -Recurse -Force $destDir
}

Write-Host "Extracting..."
Expand-Archive -Path $zipPath -DestinationPath $toolsDir -Force
Remove-Item -Force $zipPath

if (-not (Test-Path $adbPath)) {
  Write-Host "Extracted archive but adb.exe is missing."
  exit 1
}

Write-Host "OK: $adbPath"
& $adbPath version
