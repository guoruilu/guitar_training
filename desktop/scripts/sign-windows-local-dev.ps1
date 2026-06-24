param(
  [Parameter(Mandatory = $true)]
  [string[]]$FilePath,
  [string]$CertificateSubject = "CN=Guitar Training Local Dev Code Signing",
  [int]$CertificateYears = 3,
  [switch]$ConfirmedLocalDevSigning,
  [switch]$NoTimestamp
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version 2.0

if ([Environment]::OSVersion.Platform -ne [PlatformID]::Win32NT) {
  throw "Local Windows signing must be run by Windows PowerShell."
}

$confirmationPhrase = "SMART APP CONTROL BLOCKED"

function Confirm-LocalDevSigning {
  if ($ConfirmedLocalDevSigning) {
    return
  }

  Write-Host ""
  Write-Host "Local Windows development signing fallback"
  Write-Host ""
  Write-Host "Use this workflow only when the normal unsigned portable exe is blocked by Windows Smart App Control on this computer."
  Write-Host "This workflow will:"
  Write-Host "- create or reuse a self-signed code-signing certificate in Cert:\CurrentUser\My;"
  Write-Host "- trust that certificate for the current Windows user in Cert:\CurrentUser\Root and Cert:\CurrentUser\TrustedPublisher;"
  Write-Host "- sign the requested exe files;"
  Write-Host "- affect only the current Windows user on this computer, not other computers."
  Write-Host ""
  Write-Host "Remove this local trust later with: npm run desktop:remove-local-dev-signing"
  Write-Host ""

  $answer = Read-Host "Type `"$confirmationPhrase`" to continue"
  if ($answer.Trim() -ne $confirmationPhrase) {
    throw "Local signing was not confirmed. Nothing was changed."
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
    [string]$TargetFile,
    [System.Security.Cryptography.X509Certificates.X509Certificate2]$Certificate
  )

  if (-not (Test-Path $TargetFile -PathType Leaf)) {
    throw "Cannot sign missing file: $TargetFile"
  }

  Write-Host "Signing: $TargetFile"
  $signature = $null

  if (-not $NoTimestamp) {
    try {
      $signature = Set-AuthenticodeSignature `
        -FilePath $TargetFile `
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
      -FilePath $TargetFile `
      -Certificate $Certificate `
      -HashAlgorithm SHA256
  }

  $verified = Get-AuthenticodeSignature -FilePath $TargetFile
  if ($verified.Status -ne "Valid") {
    throw "Signature verification failed for $TargetFile. Status: $($verified.Status). $($verified.StatusMessage)"
  }
}

Confirm-LocalDevSigning

$cert = Ensure-LocalSigningCertificate -Subject $CertificateSubject -Years $CertificateYears

foreach ($target in $FilePath) {
  Set-LocalSignature -TargetFile $target -Certificate $cert
}

Write-Host ""
Write-Host "Signed files:"
foreach ($target in $FilePath) {
  Get-AuthenticodeSignature -FilePath $target | Format-List Status, StatusMessage, SignerCertificate, Path
}
