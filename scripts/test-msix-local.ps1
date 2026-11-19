# Sideload-test the Store MSIX on this PC before uploading it to Partner Center.
#
# The CI artifact is unsigned (Microsoft signs it after certification), so
# Windows refuses to install it as-is. This script signs a COPY with a local
# self-signed test certificate whose subject matches the Store Publisher,
# trusts that certificate, and installs the copy. Upload the ORIGINAL file.
#
# The certificate is created once in your user certificate store and reused;
# there is no .pfx file and no password.
#
# Run from an elevated PowerShell (trusting the certificate needs admin):
#   powershell -ExecutionPolicy Bypass -File scripts\test-msix-local.ps1 -Msix "C:\path\AirToolkit_0.1.1.0_x64.msix"
#
# Remove afterwards:
#   Get-AppxPackage AyoubEdahlouli.AirToolkit | Remove-AppxPackage

param(
    [Parameter(Mandatory)] [string] $Msix
)
$ErrorActionPreference = "Stop"

# Must equal Package/Identity/Publisher in Package.appxmanifest
$publisher = "CN=3F23C282-C55B-4E6D-B00E-682426399DDE"

$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $admin) { throw "Run this from an elevated (Administrator) PowerShell." }
if (-not (Test-Path $Msix)) { throw "MSIX not found: $Msix" }

# Newest Windows SDK that ships signtool
$sdk = Get-ChildItem "C:\Program Files (x86)\Windows Kits\10\bin\10.*" -Directory |
       Where-Object { Test-Path "$($_.FullName)\x64\signtool.exe" } |
       Sort-Object { [version]$_.Name } -Descending | Select-Object -First 1
if (-not $sdk) { throw "signtool.exe not found; install the Windows SDK." }
$signtool = "$($sdk.FullName)\x64\signtool.exe"

# 1. Find or create the local test certificate (code signing, 2 years)
$cert = Get-ChildItem Cert:\CurrentUser\My |
        Where-Object { $_.Subject -eq $publisher -and $_.HasPrivateKey -and $_.NotAfter -gt (Get-Date) } |
        Sort-Object NotAfter -Descending | Select-Object -First 1
if (-not $cert) {
    $cert = New-SelfSignedCertificate -Type Custom -Subject $publisher `
        -KeyUsage DigitalSignature -FriendlyName "AirToolkit local MSIX test" `
        -CertStoreLocation Cert:\CurrentUser\My -NotAfter (Get-Date).AddYears(2) `
        -TextExtension @("2.5.29.37={text}1.3.6.1.5.5.7.3.3", "2.5.29.19={text}")
    Write-Host "Created test certificate $($cert.Thumbprint)"
}

# 2. Trust it so Windows accepts the signature (public part only)
if (-not (Get-ChildItem Cert:\LocalMachine\TrustedPeople | Where-Object Thumbprint -eq $cert.Thumbprint)) {
    $cer = Join-Path $env:TEMP "airtoolkit-test.cer"
    Export-Certificate -Cert $cert -FilePath $cer | Out-Null
    Import-Certificate -FilePath $cer -CertStoreLocation Cert:\LocalMachine\TrustedPeople | Out-Null
    Remove-Item $cer
    Write-Host "Trusted test certificate in LocalMachine\TrustedPeople"
}

# 3. Sign a copy, leaving the Store upload untouched
$signed = Join-Path (Split-Path $Msix) ("{0}-LOCALTEST.msix" -f [IO.Path]::GetFileNameWithoutExtension($Msix))
Copy-Item $Msix $signed -Force
& $signtool sign /fd SHA256 /sha1 $cert.Thumbprint /s My $signed
if ($LASTEXITCODE -ne 0) { throw "signtool failed" }

# 4. Install (replacing any earlier test install) and launch
Get-AppxPackage AyoubEdahlouli.AirToolkit | Remove-AppxPackage
Add-AppxPackage $signed
Write-Host "Installed. Launching AirToolkit..."
Start-Process "shell:AppsFolder\$((Get-AppxPackage AyoubEdahlouli.AirToolkit).PackageFamilyName)!AirToolkit"
