<#
  setup-runner.ps1

  Download and configure a GitHub Actions self-hosted runner on Windows.
  The script will prompt for the registration token. Do NOT hard-code the token into the script.

  Usage (PowerShell as Administrator):
    .\setup-runner.ps1

  You can pass parameters:
    -RepoUrl  (example: https://github.com/QuarphixCorp/squadex-status)
    -Version  (runner version, default: 2.329.0)
    -SkipChecksumValidation (switch to skip SHA256 check)
>
param(
    [string]$RepoUrl = "https://github.com/QuarphixCorp/squadex-status",
    [string]$Version = "2.329.0",
    [switch]$SkipChecksumValidation
)

function Prompt-ForToken {
    Write-Host "Enter the runner registration token (will not be stored):"
    $token = Read-Host -AsSecureString
    $bstr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($token)
    $plain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
    [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) | Out-Null
    return $plain
}

try {
    $outDir = Get-Location
    $versionTag = "v$Version"
    $zipName = "actions-runner-win-x64-$Version.zip"
    $downloadUrl = "https://github.com/actions/runner/releases/download/$versionTag/$zipName"

    Write-Host "Downloading runner $Version from $downloadUrl ..."
    Invoke-WebRequest -Uri $downloadUrl -OutFile $zipName -UseBasicParsing

    # Optional: built-in example checksum for v2.329.0. If you change $Version, remove or update the checksum.
    $knownChecksums = @{
        "2.329.0" = "f60be5ddf373c52fd735388c3478536afd12bfd36d1d0777c6b855b758e70f25"
    }

    if (-not $SkipChecksumValidation) {
        if ($knownChecksums.ContainsKey($Version)) {
            Write-Host "Validating SHA256 checksum..."
            $hash = (Get-FileHash -Path $zipName -Algorithm SHA256).Hash.ToLower()
            if ($hash -ne $knownChecksums[$Version].ToLower()) {
                throw "Checksum mismatch: computed $hash != expected $($knownChecksums[$Version])"
            }
            Write-Host "Checksum OK"
        } else {
            Write-Host "No known checksum for version $Version; skipping validation. Use -SkipChecksumValidation to bypass this message."
        }
    }

    Write-Host "Extracting $zipName ..."
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory((Join-Path $outDir $zipName), (Join-Path $outDir "."))

    # Prompt for token
    $tokenPlain = Prompt-ForToken

    Write-Host "Configuring runner for repo $RepoUrl ..."
    # Use interactive/attended configuration so the user can set service or run interactively
    $configCmd = Join-Path $outDir "config.cmd"

    if (-not (Test-Path $configCmd)) {
        throw "config.cmd not found in $outDir. Ensure extraction succeeded."
    }

    & $configCmd --url $RepoUrl --token $tokenPlain --labels "self-hosted,windows,x64" --unattended

    Write-Host "Runner configured. To run the runner interactively:"
    Write-Host "  .\run.cmd"
    Write-Host "To install the runner as a service (recommended for long-term use):"
    Write-Host "  .\svc.cmd install"
    Write-Host "  .\svc.cmd start"

} catch {
    Write-Error "Error: $_"
    exit 1
}
