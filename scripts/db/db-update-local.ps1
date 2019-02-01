param (
  [Parameter(
    HelpMessage = "Version to upgrade / downgrade to"
  )][int32]$targetVersion = -1
)

# script settings
$ErrorActionPreference = "Stop"

$gitRoot = git rev-parse --show-toplevel
$dirScripts = Join-Path -path $gitRoot -childPath "scripts"
$dirDb = Join-Path -path $dirScripts -childPath "db"

# install schema if necessary
$exists = psql -U flashcrow -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'APP_META' AND table_name = 'DB_UPDATE')"
if ($exists -ne "t") {
  Write-Output "Installing db-update metadata tables..."
  $dbUpdateSqlFile = Join-Path -Path $dirDb -ChildPath "db-update-install.sql"
  psql -U flashcrow -f $dbUpdateSqlFile
  $exists = psql -U flashcrow -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'APP_META' AND table_name = 'DB_UPDATE')"
  if ($exists -ne "t") {
    Write-Error "Failed to install db-update metadata tables!"
    Exit 1
  }
}

# get current database version
$currentVersion = [int](psql -U flashcrow -tAc 'SELECT \"currentVersion\" from \"APP_META\".\"DB_UPDATE\"')

# figure out latest version
$latestVersion = 0
do {
  $latestVersion++
  $upSqlFile = Join-Path -Path $dirDb -ChildPath "schema-$latestVersion.up.sql"
} while (Test-Path $upSqlFile -PathType Leaf)
$latestVersion--
if ($targetVersion -lt 0 -Or $targetVersion -gt $latestVersion) {
  $targetVersion = $latestVersion
}

# run necessary migrations
if ($targetVersion -gt $currentVersion) {
  # upgrade database to target by applying "up" migrations
  ($currentVersion + 1)..$targetVersion | ForEach-Object {
    $upSqlFile = Join-Path -Path $dirDb -ChildPath "schema-$_.up.sql"
    Write-Output "Applying upgrade migration: $upSqlFile..."
    psql -U flashcrow -f $upSqlFile
  }
  Write-Output "Upgraded database to version $targetVersion."
} elseif ($targetVersion -lt $currentVersion) {
  # downgrade database to target by applying "down" migrations
  $currentVersion..($targetVersion + 1) | ForEach-Object {
    $downSqlFile = Join-Path -Path $dirDb -ChildPath "schema-$_.down.sql"
    Write-Output "Applying downgrade migration: $downSqlFile..."
    psql -U flashcrow -f $downSqlFile
  }
  Write-Output "Downgraded database to version $targetVersion."
} else {
  # no action
  Write-Output "Already at target version: $targetVersion."
}
