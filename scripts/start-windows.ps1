$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$distRoot = Join-Path $repoRoot "dist"
$distIndex = Join-Path $repoRoot "dist\index.html"

function Get-ContentType([string] $path) {
  switch ([System.IO.Path]::GetExtension($path).ToLowerInvariant()) {
    ".html" { return "text/html; charset=utf-8" }
    ".js" { return "application/javascript; charset=utf-8" }
    ".css" { return "text/css; charset=utf-8" }
    ".json" { return "application/json; charset=utf-8" }
    ".svg" { return "image/svg+xml" }
    ".png" { return "image/png" }
    ".jpg" { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".ico" { return "image/x-icon" }
    default { return "application/octet-stream" }
  }
}

function Find-FreePort {
  for ($port = 5190; $port -lt 5290; $port++) {
    try {
      $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $port)
      $listener.Start()
      $listener.Stop()
      return $port
    } catch {
      continue
    }
  }

  throw "No available local port found."
}

function Start-StaticApp([string] $root) {
  $port = Find-FreePort
  $prefix = "http://127.0.0.1:$port/"
  $listener = [System.Net.HttpListener]::new()
  $listener.Prefixes.Add($prefix)
  $listener.Start()

  Write-Host "Guitar Learning Assistant is running at $prefix"
  Write-Host "Keep this window open while using the app. Close it to stop."
  Start-Process $prefix

  $rootFullPath = [System.IO.Path]::GetFullPath($root)

  try {
    while ($listener.IsListening) {
      $context = $listener.GetContext()
      $requestPath = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart("/"))
      if ([string]::IsNullOrWhiteSpace($requestPath)) {
        $requestPath = "index.html"
      }

      $candidate = [System.IO.Path]::GetFullPath((Join-Path $rootFullPath $requestPath))
      if (-not $candidate.StartsWith($rootFullPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        $context.Response.StatusCode = 403
        $context.Response.Close()
        continue
      }

      if (-not (Test-Path $candidate -PathType Leaf)) {
        $candidate = Join-Path $rootFullPath "index.html"
      }

      $bytes = [System.IO.File]::ReadAllBytes($candidate)
      $context.Response.ContentType = Get-ContentType $candidate
      $context.Response.ContentLength64 = $bytes.Length
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      $context.Response.Close()
    }
  } finally {
    if ($listener.IsListening) {
      $listener.Stop()
    }
    $listener.Close()
  }
}

if (Test-Path $distIndex) {
  Start-StaticApp $distRoot
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
