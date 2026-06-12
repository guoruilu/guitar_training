$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$distRoot = Join-Path $repoRoot "dist"
$distIndex = Join-Path $repoRoot "dist\index.html"
$heartbeatPath = "/__guitar_training_heartbeat"
$pageClosedPath = "/__guitar_training_page_closed"
$pageCloseDelay = [TimeSpan]::FromSeconds(15)
$heartbeatTimeout = [TimeSpan]::FromSeconds(120)

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

function Start-StaticApp([string] $root) {
  $listener = $null
  $prefix = $null
  $lastStartError = $null

  for ($port = 5190; $port -lt 5290; $port++) {
    $candidatePrefix = "http://127.0.0.1:$port/"
    $candidateListener = [System.Net.HttpListener]::new()
    $candidateListener.Prefixes.Add($candidatePrefix)

    try {
      $candidateListener.Start()
      $listener = $candidateListener
      $prefix = $candidatePrefix
      break
    } catch [System.Net.HttpListenerException] {
      $lastStartError = $_.Exception.Message
      $candidateListener.Close()
      continue
    } catch {
      $candidateListener.Close()
      throw
    }
  }

  if (-not $listener) {
    throw "No available local HTTP port found between 5190 and 5289. Close other Guitar Learning Assistant windows and try again. Last error: $lastStartError"
  }

  Write-Host "Guitar Learning Assistant is running at $prefix"
  Write-Host "This window will close automatically shortly after the browser page is closed."
  Start-Process $prefix

  $rootFullPath = [System.IO.Path]::GetFullPath($root)
  $hasHeartbeat = $false
  $lastHeartbeat = [DateTime]::UtcNow
  $closeAfter = $null

  try {
    while ($listener.IsListening) {
      $contextTask = $listener.GetContextAsync()
      while (-not $contextTask.Wait(1000)) {
        $now = [DateTime]::UtcNow
        if ($closeAfter -ne $null -and $now -ge $closeAfter) {
          Write-Host "Browser page closed; stopping Guitar Learning Assistant."
          $listener.Stop()
          break
        }

        if ($hasHeartbeat -and ($now - $lastHeartbeat) -gt $heartbeatTimeout) {
          Write-Host "Browser page closed; stopping Guitar Learning Assistant."
          $listener.Stop()
          break
        }
      }

      if (-not $listener.IsListening) {
        break
      }

      $context = $contextTask.GetAwaiter().GetResult()
      $absolutePath = $context.Request.Url.AbsolutePath
      if ($absolutePath -eq $heartbeatPath) {
        $hasHeartbeat = $true
        $lastHeartbeat = [DateTime]::UtcNow
        $closeAfter = $null
        $context.Response.StatusCode = 204
        $context.Response.Close()
        continue
      }

      if ($absolutePath -eq $pageClosedPath) {
        $closeAfter = [DateTime]::UtcNow + $pageCloseDelay
        $context.Response.StatusCode = 204
        $context.Response.Close()
        continue
      }

      $requestPath = [Uri]::UnescapeDataString($absolutePath.TrimStart("/"))
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
