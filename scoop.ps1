# script settings
$ErrorActionPreference = "Stop"

# list of packages
$packagesToInstall = @(
  "dos2unix",
  "git",
  "jq",
  "nginx@1.13.6",
  "nodejs-lts@10.15.1",
  "openssh",
  "postgresql@9.6.5",
  "python@3.7.2",
  "tar"
)

# install scoop if needed
if (-Not (Get-Command "scoop" -errorAction SilentlyContinue)) {
  Set-ExecutionPolicy RemoteSigned -scope CurrentUser
  iex (new-object net.webclient).downloadstring("https://get.scoop.sh")
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
  if (-Not $packagesInstalled.ContainsKey($packageName)) {
    # not installed yet: install fresh
    scoop install $packageIdentifier
  } elseif (-Not $packageVersion) {
    # installed but no version provided: update to latest
    scoop update $packageName
  } else {
    # installed but need to upgrade / downgrade: uninstall, then re-install
    scoop uninstall $packageName
    scoop install $packageIdentifier
  }
}
