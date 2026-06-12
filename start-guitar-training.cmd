@echo off
setlocal

if exist "%~dp0dist\index.html" (
  start "" "%~dp0dist\index.html"
  exit /b 0
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-windows.ps1"
if errorlevel 1 (
  echo.
  echo Failed to start Guitar Learning Assistant.
  pause
)
