# script settings
$ErrorActionPreference = "Stop"

# list of packages that are always installed
$packagesToInstall = @(
  "dos2unix",
  "git",
  "jq",
  "nginx@1.13.6",
  "nodejs-lts@10.15.1",
  "shellcheck",
  "tar",
  "vagrant"
)

# list of packages that are only installed on 64-bit platforms
$packagesToInstall64Bit = @(
  "postgresql@9.6.5",
  "openssh"
)

# list of packages that are only installed on 32-bit platforms
$packagesToInstall32Bit = @(
  # for some reason "postgresql@9.6.5" tries to download and install the 64-bit zip file on 32-bit Windows?
  # we also need PostgreSQL 10.5 here, as previous versions are incompatible with oracle_fdw.
  # "https://raw.githubusercontent.com/lukesampson/scoop/ae0f925fd85991806c57776f86a2214688b5cf06/bucket/postgresql.json",
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

# configure git, npm, pip
$corpProxy = "137.15.73.132:8080"
$corpProxyWithScheme = "http://$corpProxy"

git config --global http.proxy $corpProxyWithScheme
git config --global core.autocrlf false

npm config set proxy $corpProxyWithScheme
npm config set https-proxy $corpProxyWithScheme

$dirPip = Join-Path -path $env:APPDATA -childPath "pip"
$pipIni = Join-Path -path $dirPip -childPath "pip.ini"
$pipIniData = @"
[global]

proxy = $corpProxy
"@
$pipIniData | Out-File -Encoding Ascii -FilePath $pipIni
