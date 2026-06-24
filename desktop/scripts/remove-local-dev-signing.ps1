param(
  [string]$CertificateSubject = "CN=Guitar Training Local Dev Code Signing"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 2.0

if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) {
  throw "Local Windows signing certificates can only be removed from Windows PowerShell on Windows."
}

$stores = @(
  "Cert:\CurrentUser\My",
  "Cert:\CurrentUser\Root",
  "Cert:\CurrentUser\TrustedPublisher"
)

$removed = 0

foreach ($store in $stores) {
  $matches = Get-ChildItem $store |
    Where-Object { $_.Subject -eq $CertificateSubject } |
    Sort-Object Thumbprint -Unique

  foreach ($cert in $matches) {
    Write-Host "Removing $($cert.Thumbprint) from $store"
    Remove-Item (Join-Path $store $cert.Thumbprint) -Force
    $removed += 1
  }
}

Write-Host "Removed $removed local development signing certificate entries."
