# script settings
# testing linter
$ErrorActionPreference = "Stop"

# list of packages that are always installed
$packagesToInstall = @(
  "dos2unix",
  "git",
  "jq",
  "nginx@1.13.6",
  "nodejs-lts@10.15.1",
  "postgresql@9.6.5",
  "python@3.7.2",
  "tar"
)

# list of packages that are only installed on 64-bit platforms
$packagesToInstall64Bit = @(
  "openssh"
)

# list of packages that are only installed on 32-bit platforms
$packagesToInstall32Bit = @(
  "win32-openssh"
)

if ([Environment]::Is64BitOperatingSystem) {
  $packagesToInstall += $packagesToInstall64Bit
} else {
  $packagesToInstall += $packagesToInstall32Bit
}

# double-check that scoop is installed
if (-Not (Get-Command "scoop" -errorAction SilentlyContinue)) {
  Write-Error "scoop not installed - visit https://scoop.sh/ for installation instructions!"
  Exit 1
}

# refresh package list
scoop update

# build dict of installed packages
$packagesInstalled = @{}
$packageName = ""
scoop list 6>&1 | ForEach-Object {
  if ($_ -match "Installed apps:") {
    return
  } elseif ($_ -match "^  ([a-z0-9\-]+)") {
    $packageName = $Matches[1]
  } elseif ($_ -match "^[a-z0-9\.\-]+") {
    $packagesInstalled[$packageName] = $_
  }
}

# install packages
foreach ($packageIdentifier in $packagesToInstall) {
  $packageName = $packageIdentifier
  $packageVersion = $null
  if ($packageIdentifier -match "^([a-z0-9\-]+)@([a-z0-9\.\-]+)") {
    $packageName = $Matches[1]
    $packageVersion = $Matches[2]
  }
  $packageVersionInstalled = $packagesInstalled[$packageName]
  if (-Not $packagesInstalled.ContainsKey($packageName)) {
    # not installed yet: install fresh
    scoop install $packageIdentifier
  } elseif (-Not $packageVersion) {
    # installed but no version provided: update to latest
    # note this is a NOOP if latest version already installed
    scoop update $packageName
  } elseif ($packageVersion -ne $packageVersionInstalled) {
    # installed but need to upgrade / downgrade: uninstall, then re-install
    scoop uninstall $packageName
    scoop install $packageIdentifier
  }
}

# install PSScriptAnalyzer for static linting of PowerShell scripts
if (-Not (Get-Command "Invoke-ScriptAnalyzer" -errorAction SilentlyContinue)) {
  Install-Module -Name PSScriptAnalyzer -Scope CurrentUser
}
