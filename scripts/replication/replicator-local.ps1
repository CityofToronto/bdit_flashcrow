param (
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Configuration to use (`$config.config.json)"
  )][string]$config,
  [Parameter(
    HelpMessage = "Email address(es) to send notifications to"
  )][string[]]$emailsTo = @("Evan Savage <Evan.Savage@toronto.ca>"),
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Database connection string for Oracle source"
  )][string]$sourceDb,
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Schema where data is read from in Oracle source"
  )][string]$sourceSchema,
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Database connection string for PostgreSQL target"
  )][string]$targetDb,
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Schema where data is ultimately written in PostgreSQL target"
  )][string]$targetSchema,
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Schema where data is initially written and validated in PostgreSQL target"
  )][string]$targetValidationSchema,
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Path to SSH private key file for accessing transfer machine"
  )][string]$transferSshKey,
  [Parameter(
    Mandatory = $true,
    HelpMessage = "SSH connection string for accessing transfer machine"
  )][string]$transferSsh
)

# script settings
$ErrorActionPreference = "Stop"

# paths to important folders / files
$dirRoot = "flashcrow-$config"
$dirFetch = Join-Path -path $dirRoot -childPath "fetch"
$dirOraCnt = Join-Path -path $dirRoot -childPath "ora_cnt"
$dirOra = Join-Path -path $dirRoot -childPath "ora"
$dirPg = Join-Path -path $dirRoot -childPath "pg"
$dirPgLocal = Join-Path -path $dirRoot -childPath "pg_local"
$dirDat = Join-Path -path $dirRoot -childPath "dat"
$configFile = "$config.config.json"
$pgDataArchive = "flashcrow-$config.tar.gz"
$transferScript = "replicator-transfer.sh"

# email settings
$emailFrom = "Flashcrow Replicator <Flashcrow+Replicator@toronto.ca>"
$emailSmtp = "mail.toronto.ca"
$emailSubjectStatus = "[flashcrow] [replicator] Replication Status: $config"
$emailSubjectError = "[flashcrow] [replicator] Replication Failure: $config"
$emailSubjectSuccess = "[flashcrow] [replicator] Replication Success: $config"

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
    [switch]$exec = $false
  )
  $srcSum = (shasum $src).Substring(0, 40)
  pscp -i $transferSshKey $src "$transferSsh`:"
  if (-Not $?) {
    Stop-With-Error -message "scp $src -> $transferSsh failed"
  }
  $sumDst = (plink -i $transferSshKey -ssh $transferSsh shasum "$src").Substring(0, 40)
  if ($sumLocal -ne $sumTransfer) {
    Stop-With-Error -message "checksum validation of $src failed"
  }
  if ($exec) {
    plink -i $transferSshKey -ssh $transferSsh chmod u+x $src
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
Safe-Mkdir @($dirRoot, $dirFetch, $dirOraCnt, $dirOra, $dirPg, $dirPgLocal, $dirDat)

# get config data
$configData = Get-Content -Raw -Path $configFile | ConvertFrom-Json

# fetch Oracle row counts
foreach ($table in $configData.tables) {
  $fetchSqlData = @"
SET LONG 2000000
SET PAGESIZE 0
SET LINESIZE 32767
SET LONGCHUNKSIZE 200000
SET ECHO OFF
SET FEEDBACK OFF
SELECT COUNT(*) FROM "$sourceSchema"."$table";
EXIT;
"@

  $fetchSqlFile = Join-Path -Path $dirFetch -ChildPath "$table.sql"
  $fetchSqlData | Out-File -Encoding Ascii -FilePath $fetchSqlFile
  if (-Not $?) {
    Stop-With-Error -message "Failed to write SQL for fetching $sourceSchema.$table row count from Oracle!"
  }
  $oraCntFile = Join-Path -Path $dirOraCnt -ChildPath "$table.cnt"
  sqlplus.exe -s $sourceDb @$fetchSqlFile | ForEach-Object -Process {$_.ToString().Trim() } | Out-File -Encoding Ascii -FilePath $oraCntFile
  dos2unix $oraCntFile
  if (-Not $? -Or (Get-Content $oraCntFile | Select-String "ERROR" -Quiet)) {
    Stop-With-Error -message "Failed to fetch $sourceSchema.$table row count from Oracle!"
  }
}
Notify-Status "Fetched Oracle row counts..."

# fetch Oracle table schemas
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

# copy data from foreign tables to local text files
foreach ($table in $configData.tables) {
  $datFile = Join-Path -Path $dirDat -ChildPath "$table.dat"
  psql -U flashcrow -c "\COPY (SELECT * FROM \`"$targetValidationSchema\`".\`"$table\`") TO STDOUT (FORMAT text, ENCODING 'UTF8')" | Out-File -Encoding UTF8 -FilePath $datFile
  # Out-File starts files with a Byte Order Mark (BOM), which trips up PostgreSQL's
  # COPY ... FROM STDIN.  We strip that here.
  dos2unix $datFile
  if (-Not $?) {
    Stop-With-Error -message "Failed to copy Oracle data from $targetValidationSchema.$table in local PostgreSQL to $datFile!"
  }
}
Notify-Status "Copied data from local PostgreSQL..."

# pack archive
tar czvf $pgDataArchive $dirRoot
if (-Not $?) {
  Stop-With-Error -message "Failed to create data archive!"
}
Notify-Status "Packed data archive to send to transfer machine..."

# copy archive and transfer script to transfer machine
Safe-Scp -src $pgDataArchive
Safe-Scp -src $configFile
Safe-Scp -src $transferScript -exec
Notify-Status "Sent data archive and transfer script to transfer machine..."

# run transfer script on transfer machine
plink -i $transferSshKey -ssh $transferSsh ./$transferScript --config "$config" --guid "$guid" --targetDb "'$targetDb'" --targetSchema "$targetSchema" --targetValidationSchema "$targetValidationSchema"
if (-Not $?) {
  Stop-With-Error -message "Failed to run transfer script on transfer machine!"
}

Stop-With-Success "Completed Oracle -> PostgreSQL replication."
