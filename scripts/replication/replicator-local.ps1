param (
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Path to JSON config file"
  )][string]$config,
  [Parameter(
    HelpMessage = "Email address(es) to send notifications to"
  )][string[]]$emailsTo = @("Evan Savage <Evan.Savage@toronto.ca>"),
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Database connection string for Oracle source"
  )][string]$sourceDb,
  [Parameter(
    HelpMessage = "Schema where data is read from in Oracle source"
  )][string]$sourceSchema = "TRAFFIC",
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Database connection string for PostgreSQL target"
  )][string]$targetDb,
  [Parameter(
    HelpMessage = "Schema where data is ultimately written in PostgreSQL target"
  )][string]$targetSchema = "TRAFFIC",
  [Parameter(
    HelpMessage = "Schema where data is initially written and validated in PostgreSQL target"
  )][string]$targetValidationSchema = "TRAFFIC_NEW",
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Path to SSH private key file for accessing transfer machine"
  )][string]$transferSshKey,
  [Parameter(
    Mandatory = $true,
    HelpMessage = "SSH connection string for accessing transfer machine"
  )][string]$transferSsh
)

$ErrorActionPreference = "Stop"

# paths to important folders / files
$dirRoot = "flashcrow"
$dirFetch = Join-Path -path $dirRoot -childPath "fetch"
$dirOra = Join-Path -path $dirRoot -childPath "ora"
$dirPg = Join-Path -path $dirRoot -childPath "pg"
$dirPgLocal = Join-Path -path $dirRoot -childPath "pg_local"
$dirDat = Join-Path -path $dirRoot -childPath "dat"
$pgDataArchive = "flashcrow.tar.gz"
$transferScript = "replicator-transfer.sh"

# email settings
$emailFrom = "Flashcrow Replicator <Flashcrow+Replicator@toronto.ca>"
$emailSmtp = "mail.toronto.ca"
$emailSubjectStatus = "[flashcrow] [replicator] Replication Status"
$emailSubjectError = "[flashcrow] [replicator] Replication Failure"
$emailSubjectSuccess = "[flashcrow] [replicator] Replication Success"

# unique ID for this replication job
$guid = [guid]::NewGuid().Guid

function Notify-Status {
  param (
    [string]$message
  )
  $now = Get-Date -Format o
  Send-MailMessage -From $emailFrom -To $emailsTo -SmtpServer $emailSmtp -Subject $emailSubjectStatus -Body $message
  $message = "$guid $now $message"
  Write-Output $message
}

function Stop-With-Error {
  param (
    [string]$message,
    [Int32]$exitCode = 1
  )
  $now = Get-Date -Format o
  Send-MailMessage -From $emailFrom -To $emailsTo -SmtpServer $emailSmtp -Subject $emailSubjectError -Body $message
  $message = "$guid $now $message"
  Write-Error -Message $message
  Exit $exitCode
}

function Stop-With-Success {
  param (
    [string]$message
  )
  $now = Get-Date -Format o
  Send-MailMessage -From $emailFrom -To $emailsTo -SmtpServer $emailSmtp -Subject $emailSubjectSuccess -Body $message
  $message = "$guid $now $message"
  Write-Output $message
  Exit 0
}

function Safe-Scp {
  param (
    [string]$src,
    [string]$key,
    [string]$dst,
    [switch]$exec = $false
  )
  $srcSum = (shasum $src).Substring(0, 40)
  pscp -i $key $src $dst`:
  if (-Not $?) {
    Stop-With-Error -message "scp $src -> $dst failed"
  }
  $sumDst = (plink -i $key -ssh $dst shasum $src).Substring(0, 40)
  if ($sumLocal -ne $sumTransfer) {
    Stop-With-Error -message "checksum validation of $src failed"
  }
  if ($exec) {
    plink -i $key -ssh $dst chmod u+x $src
  }
}

function Safe-Rm {
  param (
    [string[]]$paths
  )
  foreach ($path in $paths) {
    if (Test-Path $path -PathType Container) {
      rm -Recurse $path
    } elseif (Test-Path $path -PathType Leaf) {
      rm $path
    }
    if (-Not $?) {
      Stop-With-Error -message "Failed to remove path $path!"
    }
  }
}

function Safe-Mkdir {
  param(
    [string[]]$paths
  )
  foreach ($path in $paths) {
    mkdir -Force $path
    if (-Not $?) {
      Stop-With-Error -message "Failed to create path $path!"
    }
  }
}
Notify-Status "Starting Oracle -> PostgreSQL replication..."

# clean directory and archive, if they exist
Safe-Rm @($dirRoot, $pgDataArchive)

# recreate directory
Safe-Mkdir @($dirRoot, $dirFetch, $dirOra, $dirPg, $dirPgLocal, $dirDat)

# fetch Oracle table schemas
$configData = Get-Content -Raw -Path $config | ConvertFrom-Json
foreach ($table in $configData.tables) {
  $fetchSqlData = @"
SET LONG 2000000
SET PAGESIZE 0
SET LINESIZE 32767
SET LONGCHUNKSIZE 200000
SET ECHO OFF
SET FEEDBACK OFF
EXECUTE dbms_metadata.set_transform_param(DBMS_METADATA.SESSION_TRANSFORM, 'STORAGE', false);
EXECUTE dbms_metadata.set_transform_param(DBMS_METADATA.SESSION_TRANSFORM, 'SQLTERMINATOR', true);
EXECUTE dbms_metadata.set_transform_param(DBMS_METADATA.SESSION_TRANSFORM, 'SEGMENT_ATTRIBUTES', false);
SELECT dbms_metadata.get_ddl('TABLE', '$table', '$sourceSchema') FROM dual;
EXIT;
"@

  $fetchSqlFile = Join-Path -Path $dirFetch -ChildPath "$table.sql"
  $fetchSqlData | Out-File -Encoding Ascii -FilePath $fetchSqlFile
  if (-Not $?) {
    Stop-With-Error -message "Failed to write SQL for fetching $sourceSchema.$table schema from Oracle!"
  }
  $oraSqlFile = Join-Path -Path $dirOra -ChildPath "$table.sql"
  sqlplus.exe -s $sourceDb @$fetchSqlFile | Out-File -Encoding Ascii -FilePath $oraSqlFile
  if (-Not $? -Or (Get-Content $oraSqlFile | Select-String "ERROR" -Quiet)) {
    Stop-With-Error -message "Failed to fetch $sourceSchema.$table schema from Oracle!"
  }
}
Notify-Status "Fetched Oracle schemas..."

# convert Oracle table schemas to PostgreSQL
foreach ($table in $configData.tables) {
  $oraSqlFile = Join-Path -Path $dirOra -ChildPath "$table.sql"
  $pgSqlFile = Join-Path -Path $dirPg -ChildPath "$table.sql"
  Get-Content $oraSqlFile | python ora2pg.py --sourceSchema="$sourceSchema" --targetSchema="$targetValidationSchema" | Out-File -Encoding Ascii -FilePath $pgSqlFile
  if (-Not ($? -And (Get-Content $pgSqlFile | Select-String "CREATE" -Quiet))) {
    Stop-With-Error -message "Failed to generate PostgreSQL schema (without foreign tables) for $targetValidationSchema.$table!"
  }
  $pgLocalSqlFile = Join-Path -Path $dirPgLocal -ChildPath "$table.sql"
  Get-Content $pgSqlFile | python pg2pglocal.py --sourceSchema="$sourceSchema" --sourceTable="$table" | Out-File -Encoding Ascii -FilePath $pgLocalSqlFile
  if (-Not ($? -And (Get-Content $pgLocalSqlFile | Select-String "CREATE" -Quiet))) {
    Stop-With-Error -message "Failed to generate local PostgreSQL schema (with foreign tables) for $targetValidationSchema.$table!"
  }
}
Notify-Status "Generated PostgreSQL schemas..."

# drop any existing foreign tables in reverse order
foreach ($i in ($configData.tables.Count - 1)..0) {
  $table = $configData.tables[$i]
  psql -U flashcrow -c "DROP FOREIGN TABLE IF EXISTS \`"$targetValidationSchema\`".\`"$table\`""
  $exists = psql -U flashcrow -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$targetValidationSchema' AND table_name = '$table')"
  if ($exists -ne "f") {
    Stop-With-Error -message "Failed to drop $targetValidationSchema.$table from local PostgreSQL!"
  }
}

# run PostgreSQL schemas to create foreign tables
foreach ($table in $configData.tables) {
  $pgLocalSqlFile = Join-Path -Path $dirPgLocal -ChildPath "$table.sql"
  psql -U flashcrow -f $pgLocalSqlFile
  $exists = psql -U flashcrow -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$targetValidationSchema' AND table_name = '$table')"
  if ($exists -ne "t") {
    Stop-With-Error -message "Failed to create $targetValidationSchema.$table in local PostgreSQL!"
  }
}
Notify-Status "Created local PostgreSQL tables..."

# copy data from foreign tables to local binary files
foreach ($table in $configData.tables) {
  $datFile = Join-Path -Path $dirDat -ChildPath "$table.dat"
  psql -U flashcrow -c "\COPY (SELECT * FROM \`"$targetValidationSchema\`".\`"$table\`") TO STDOUT (FORMAT binary)" > $datFile
  if (-Not $?) {
    Stop-With-Error -message "Failed to copy Oracle data from $targetValidationSchema.$table in local PostgreSQL to $datFile!"
  }
}
Notify-Status "Copied data from local PostgreSQL..."

# tar / gzip the local binary files
tar czvf $pgDataArchive flashcrow
if (-Not $?) {
  Stop-With-Error -message "tar / gzip archiving failed"
}
Notify-Status "Created data archive to send to transfer machine..."

# TODO: clean up archive, other files on transfer machine

# copy archive and remote script to transfer machine
Safe-Scp -src $pgDataArchive -key $transferSshKey -dst $transferSsh
Safe-Scp -src $transferScript -key $transferSshKey -dst $transferSsh -exec
Notify-Status "Sent data archive to transfer machine..."

# run remote script on transfer machine
plink -i $transferSshKey -ssh $transferSsh ./$transferScript

Stop-With-Success "Completed Oracle -> PostgreSQL replication."
