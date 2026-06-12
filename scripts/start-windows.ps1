$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$distIndex = Join-Path $repoRoot "dist\index.html"

if (Test-Path $distIndex) {
  Start-Process $distIndex
  exit 0
}

function Quote-BashPath([string] $path) {
  return "'" + ($path -replace "'", "'\''") + "'"
}

$wsl = Get-Command wsl.exe -ErrorAction SilentlyContinue
if ($wsl) {
  $wslRoot = (wsl.exe wslpath -a "$repoRoot").Trim()
  if ($LASTEXITCODE -eq 0 -and $wslRoot) {
    $quotedRoot = Quote-BashPath $wslRoot
    wsl.exe bash -lc "cd $quotedRoot && node scripts/launch-dev.mjs"
    exit $LASTEXITCODE
  }
}

$node = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $node) {
  Write-Host ""
  Write-Host "No ready-to-run app was found."
  Write-Host "For ordinary users, use the packaged release that contains dist\index.html."
  Write-Host "For development from source, install Node.js or run this project from WSL."
  exit 1
}

Push-Location $repoRoot
try {
  node scripts/launch-dev.mjs
} finally {
  Pop-Location
}
