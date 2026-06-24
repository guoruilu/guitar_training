param(
  [string]$CertificateSubject = "CN=Guitar Training Local Dev Code Signing",
  [int]$CertificateYears = 3,
  [switch]$SkipInstall,
  [switch]$SkipWebBuild,
  [switch]$NoTimestamp
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 2.0

if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) {
  throw "Local Windows signing must be run from Windows PowerShell on Windows."
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$webDir = Join-Path $repoRoot "web"
$desktopDir = Join-Path $repoRoot "desktop"
$releaseDir = Join-Path $desktopDir "release"
$unpackedDir = Join-Path $releaseDir "win-unpacked"

function Get-NativeCommandPath {
  param([string[]]$Names)

  foreach ($name in $Names) {
    $command = Get-Command $name -ErrorAction SilentlyContinue
    if ($command) {
      return $command.Source
    }
  }

  throw "Missing required command: $($Names -join ' or '). Install Node.js/npm and try again."
}

function Invoke-NativeCommand {
  param(
    [string]$FilePath,
    [string[]]$Arguments,
    [string]$WorkingDirectory
  )

  Push-Location $WorkingDirectory
  try {
    Write-Host ""
    Write-Host "> $FilePath $($Arguments -join ' ')"
    & $FilePath @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "Command failed with exit code ${LASTEXITCODE}: $FilePath $($Arguments -join ' ')"
    }
  } finally {
    Pop-Location
  }
}

function Get-LocalCodeSigningCertificate {
  param([string]$Subject)

  $now = Get-Date
  Get-ChildItem Cert:\CurrentUser\My -CodeSigningCert |
    Where-Object {
      $_.Subject -eq $Subject -and
      $_.HasPrivateKey -and
      $_.NotAfter -gt $now.AddDays(7)
    } |
    Sort-Object NotAfter -Descending |
    Select-Object -First 1
}

function New-LocalCodeSigningCertificate {
  param(
    [string]$Subject,
    [int]$Years
  )

  Write-Host "Creating local code-signing certificate: $Subject"
  New-SelfSignedCertificate `
    -Type CodeSigningCert `
    -Subject $Subject `
    -CertStoreLocation Cert:\CurrentUser\My `
    -KeyAlgorithm RSA `
    -KeyLength 3072 `
    -HashAlgorithm SHA256 `
    -KeyExportPolicy NonExportable `
    -NotAfter (Get-Date).AddYears($Years)
}

function Trust-LocalCertificate {
  param([System.Security.Cryptography.X509Certificates.X509Certificate2]$Certificate)

  $tempCer = Join-Path ([IO.Path]::GetTempPath()) "guitar-training-local-dev-$($Certificate.Thumbprint).cer"
  Export-Certificate -Cert $Certificate -FilePath $tempCer -Force | Out-Null

  try {
    foreach ($store in @("Cert:\CurrentUser\Root", "Cert:\CurrentUser\TrustedPublisher")) {
      $existing = Get-ChildItem $store | Where-Object { $_.Thumbprint -eq $Certificate.Thumbprint } | Select-Object -First 1
      if (-not $existing) {
        Import-Certificate -FilePath $tempCer -CertStoreLocation $store | Out-Null
      }
    }
  } finally {
    Remove-Item $tempCer -Force -ErrorAction SilentlyContinue
  }
}

function Ensure-LocalSigningCertificate {
  param(
    [string]$Subject,
    [int]$Years
  )

  Write-Warning "This workflow creates or reuses a self-signed code-signing certificate and trusts it for the current Windows user only."
  Write-Warning "It is a local development workaround, not a public release signature. Remove it later with desktop/scripts/remove-local-dev-signing.ps1 if needed."

  $cert = Get-LocalCodeSigningCertificate -Subject $Subject
  if (-not $cert) {
    $cert = New-LocalCodeSigningCertificate -Subject $Subject -Years $Years
  }

  Trust-LocalCertificate -Certificate $cert
  return $cert
}

function Set-LocalSignature {
  param(
    [string]$FilePath,
    [System.Security.Cryptography.X509Certificates.X509Certificate2]$Certificate
  )

  if (-not (Test-Path $FilePath -PathType Leaf)) {
    throw "Cannot sign missing file: $FilePath"
  }

  Write-Host "Signing: $FilePath"
  $signature = $null

  if (-not $NoTimestamp) {
    try {
      $signature = Set-AuthenticodeSignature `
        -FilePath $FilePath `
        -Certificate $Certificate `
        -HashAlgorithm SHA256 `
        -TimestampServer "http://timestamp.digicert.com"
      if ($signature.Status -ne "Valid") {
        Write-Warning "Timestamped signing returned $($signature.Status), retrying without timestamp. $($signature.StatusMessage)"
        $signature = $null
      }
    } catch {
      Write-Warning "Timestamped signing failed, retrying without timestamp. $($_.Exception.Message)"
    }
  }

  if (-not $signature) {
    $signature = Set-AuthenticodeSignature `
      -FilePath $FilePath `
      -Certificate $Certificate `
      -HashAlgorithm SHA256
  }

  $verified = Get-AuthenticodeSignature -FilePath $FilePath
  if ($verified.Status -ne "Valid") {
    throw "Signature verification failed for $FilePath. Status: $($verified.Status). $($verified.StatusMessage)"
  }
}

function Get-PortableExe {
  $portable = Get-ChildItem $releaseDir -Filter "Guitar-Training-*-windows-portable.exe" -File |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

  if (-not $portable) {
    throw "Portable exe was not created in $releaseDir"
  }

  return $portable.FullName
}

$npm = Get-NativeCommandPath -Names @("npm.cmd", "npm")
$node = Get-NativeCommandPath -Names @("node.exe", "node")

if (-not $SkipInstall) {
  Write-Host "Installing Windows-compatible dependencies with npm ci..."
  Invoke-NativeCommand -FilePath $npm -Arguments @("--prefix", $webDir, "ci") -WorkingDirectory $repoRoot
  Invoke-NativeCommand -FilePath $npm -Arguments @("--prefix", $desktopDir, "ci") -WorkingDirectory $repoRoot
}

$electronBuilderCli = Join-Path $desktopDir "node_modules\electron-builder\out\cli\cli.js"
if (-not (Test-Path $electronBuilderCli -PathType Leaf)) {
  throw "Missing electron-builder at $electronBuilderCli. Run npm --prefix desktop ci first."
}

if (-not $SkipWebBuild) {
  Invoke-NativeCommand -FilePath $npm -Arguments @("--prefix", $webDir, "run", "build") -WorkingDirectory $repoRoot
}

Invoke-NativeCommand -FilePath $node -Arguments @($electronBuilderCli, "--win", "dir", "--publish", "never") -WorkingDirectory $desktopDir

if (-not (Test-Path $unpackedDir -PathType Container)) {
  throw "Unpacked Windows app was not created at $unpackedDir"
}

$cert = Ensure-LocalSigningCertificate -Subject $CertificateSubject -Years $CertificateYears

$unpackedExecutables = @(Get-ChildItem $unpackedDir -Filter "*.exe" -Recurse -File | Sort-Object FullName)
if ($unpackedExecutables.Count -eq 0) {
  throw "No exe files found under $unpackedDir"
}

foreach ($exe in $unpackedExecutables) {
  Set-LocalSignature -FilePath $exe.FullName -Certificate $cert
}

Invoke-NativeCommand -FilePath $node -Arguments @($electronBuilderCli, "--win", "portable", "--prepackaged", $unpackedDir, "--publish", "never") -WorkingDirectory $desktopDir

$portableExe = Get-PortableExe
Set-LocalSignature -FilePath $portableExe -Certificate $cert

Write-Host ""
Write-Host "Local signed portable exe:"
Write-Host $portableExe
Write-Host ""
Get-AuthenticodeSignature -FilePath $portableExe | Format-List Status, StatusMessage, SignerCertificate, Path
