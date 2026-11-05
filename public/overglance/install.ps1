# Installs or updates Overglance from PowerShell:
#
#     irm https://www.hazeliscoding.dev/overglance/install.ps1 | iex
#
# It downloads the latest Setup from the public releases repo, runs it only if it carries Hazel Granados's code
# signature, and removes the download afterwards. Nothing else is read or written. With OVERGLANCE_VERIFY_ONLY set,
# it stops after the signature check, which is how the script itself is tested.
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

$setup = Join-Path ([IO.Path]::GetTempPath()) 'overglance-setup-win-x64.exe'
Write-Host 'Downloading the latest Overglance Setup...'
Invoke-WebRequest -UseBasicParsing -Uri 'https://github.com/hazeliscoding/overglance-releases/releases/latest/download/overglance-setup-win-x64.exe' -OutFile $setup

$signature = Get-AuthenticodeSignature -FilePath $setup
if ($signature.Status -ne 'Valid' -or $signature.SignerCertificate.Subject -notmatch '(^|, )CN=Hazel Granados(,|$)') {
    Remove-Item $setup -Force -ErrorAction SilentlyContinue
    throw "The download isn't signed by Hazel Granados (signature: $($signature.Status)), so it wasn't run."
}

if ($env:OVERGLANCE_VERIFY_ONLY) {
    Remove-Item $setup -Force -ErrorAction SilentlyContinue
    Write-Host 'Signed by Hazel Granados. Verify-only run: nothing installed.'
    return
}

Write-Host 'Signed by Hazel Granados. Installing...'
Start-Process -FilePath $setup -Wait
Remove-Item $setup -Force -ErrorAction SilentlyContinue
Write-Host 'Done. The pill is at the top of your screen.'
