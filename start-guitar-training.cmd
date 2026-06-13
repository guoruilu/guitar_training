@echo off
setlocal

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0desktop\scripts\start-windows-desktop.ps1"
if errorlevel 1 (
  echo.
  echo Failed to start Guitar Learning Assistant.
  pause
)
