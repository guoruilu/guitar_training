$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..")
$portableExe = Join-Path $repoRoot "desktop\release\Guitar-Training-0.1.0-windows-portable.exe"

if (Test-Path $portableExe -PathType Leaf) {
  Start-Process $portableExe
  exit 0
}

$npm = Get-Command npm.cmd -ErrorAction SilentlyContinue
if (-not $npm) {
  Write-Host ""
  Write-Host "No packaged desktop app was found."
  Write-Host "For ordinary users, use the release package that contains Guitar-Training-0.1.0-windows-portable.exe."
  Write-Host "For source development, install Node.js and run npm commands from this repository."
  exit 1
}

if (-not (Test-Path (Join-Path $repoRoot "web\node_modules") -PathType Container)) {
  Write-Host "Installing web dependencies..."
  npm.cmd --prefix (Join-Path $repoRoot "web") install
}

if (-not (Test-Path (Join-Path $repoRoot "desktop\node_modules") -PathType Container)) {
  Write-Host "Installing desktop dependencies..."
  npm.cmd --prefix (Join-Path $repoRoot "desktop") install
}

Push-Location (Join-Path $repoRoot "desktop")
try {
  npm.cmd run dev
} finally {
  Pop-Location
}
