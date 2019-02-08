param (
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Number of rows to read per chunk"
  )][Int32]$chunkSize,
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Configuration to use (`$config.config.json)"
  )][string]$config,
  [Parameter(
    HelpMessage = "Email address(es) to send notifications to"
  )][string[]]$emailsTo = @(),
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Tolerance factor for row count validation"
  )][Double]$rowCountTolerance,
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
    HelpMessage = "ID of transfer stack (e.g. flashcrow-dev0)"
  )][string]$transferStack,
  [Parameter(
    Mandatory = $true,
    HelpMessage = "Path to SSH private key file for accessing transfer stack"
  )][string]$transferStackKey
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

function Send-Status {
  param (
    [string]$message,
    [switch]$emailDisable = $false
  )
  $now = Get-Date -Format s
  if ((-Not $emailDisable) -And ($emailsTo.Count -gt 0)) {
    Send-MailMessage -From $emailFrom -To $emailsTo -SmtpServer $emailSmtp -Subject $emailSubjectStatus -Body $message
  }
  $message = "$guid $now $message"
  Write-Output $message
}

function Exit-Error {
  param (
    [string]$message,
    [switch]$emailDisable = $false,
    [Int32]$exitCode = 1
  )
  $now = Get-Date -Format s
  if ((-Not $emailDisable) -And ($emailsTo.Count -gt 0)) {
    Send-MailMessage -From $emailFrom -To $emailsTo -SmtpServer $emailSmtp -Subject $emailSubjectError -Body $message
  }
  $message = "$guid $now $message"
  Write-Error -Message $message
  Exit $exitCode
}

function Exit-Success {
  param (
    [string]$message,
    [switch]$emailDisable = $false
  )
  $now = Get-Date -Format s
  if ((-Not $emailDisable) -And ($emailsTo.Count -gt 0)) {
    Send-MailMessage -From $emailFrom -To $emailsTo -SmtpServer $emailSmtp -Subject $emailSubjectSuccess -Body $message
  }
  $message = "$guid $now $message"
  Write-Output $message
  Exit 0
}

function Copy-RemoteItem {
  param (
    [string]$src,
    [switch]$exec = $false
  )
  $sumLocal = (shasum $src).Substring(0, 40)
  scp -i $transferStackKey $src "$transferSsh`:"
  if (-Not $?) {
    Exit-Error -message "scp $src -> $transferSsh failed"
  }
  $sumTransfer = (ssh -i $transferStackKey $transferSsh sha1sum "$src").Substring(0, 40)
  if ($sumLocal -ne $sumTransfer) {
    Exit-Error -message "checksum validation of $src failed"
  }
  if ($exec) {
    ssh -i $transferStackKey $transferSsh chmod u+x $src
  }
}

function Remove-Path {
  [CmdletBinding(supportsShouldProcess)]
  param (
    [string[]]$paths
  )
  foreach ($path in $paths) {
    if (Test-Path $path -PathType Container) {
      Remove-Item -Recurse $path
    } elseif (Test-Path $path -PathType Leaf) {
      Remove-Item $path
    }
    if (-Not $?) {
      Exit-Error -message "Failed to remove path $path!"
    }
  }
}

function New-Directory {
  [CmdletBinding(supportsShouldProcess)]
  param(
    [string[]]$paths
  )
  foreach ($path in $paths) {
    mkdir -Force $path
    if (-Not $?) {
      Exit-Error -message "Failed to create path $path!"
    }
  }
}

Send-Status "Starting Oracle -> PostgreSQL replication..."

# clean directory and archive, if they exist
Remove-Path @($dirRoot, $pgDataArchive)

# recreate directory
New-Directory @($dirRoot, $dirFetch, $dirOraCnt, $dirOra, $dirPg, $dirPgLocal, $dirDat)

# get transfer machine
$instancesUrl = "https://instmgmt.intra.sandbox-toronto.ca/instances?stack=$transferStack"
$transferData = curl.exe $instancesUrl | ConvertFrom-Json
if ($transferData.instances.length -eq 0) {
  Exit-Error "Failed to identify transfer machine!"
}
$transferIp = $transferData.instances[0].PrivateIpAddress
$transferSsh = "ec2-user@$transferIp"
Send-Status "Identified transfer machine: $transferIp..."

# fetch Oracle row counts
jq -r ".tables[].name" "$configFile" | ForEach-Object {
  $table = $_
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
    Exit-Error -message "Failed to write SQL for fetching $sourceSchema.$table row count from Oracle!"
  }
  $oraCntFile = Join-Path -Path $dirOraCnt -ChildPath "$table.cnt"
  sqlplus.exe -s $sourceDb @$fetchSqlFile | ForEach-Object -Process {$_.ToString().Trim() } | Out-File -Encoding Ascii -FilePath $oraCntFile
  dos2unix $oraCntFile
  if (-Not $? -Or (Get-Content $oraCntFile | Select-String "ERROR" -Quiet)) {
    Exit-Error -message "Failed to fetch $sourceSchema.$table row count from Oracle!"
  }
}
Send-Status "Fetched Oracle row counts..."

# fetch Oracle table schemas
jq -r ".tables[].name" "$configFile" | ForEach-Object {
  $table = $_
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
    Exit-Error -message "Failed to write SQL for fetching $sourceSchema.$table schema from Oracle!"
  }
  $oraSqlFile = Join-Path -Path $dirOra -ChildPath "$table.sql"
  sqlplus.exe -s $sourceDb @$fetchSqlFile | Out-File -Encoding Ascii -FilePath $oraSqlFile
  if (-Not $? -Or (Get-Content $oraSqlFile | Select-String "ERROR" -Quiet)) {
    Exit-Error -message "Failed to fetch $sourceSchema.$table schema from Oracle!"
  }
}
Send-Status "Fetched Oracle schemas..."

# convert Oracle table schemas to PostgreSQL
jq -r ".tables[].name" "$configFile" | ForEach-Object {
  $table = $_
  $oraSqlFile = Join-Path -Path $dirOra -ChildPath "$table.sql"
  $pgSqlFile = Join-Path -Path $dirPg -ChildPath "$table.sql"
  Get-Content $oraSqlFile | python ora2pg.py --sourceSchema="$sourceSchema" --targetSchema="$targetValidationSchema" | Out-File -Encoding Ascii -FilePath $pgSqlFile
  if (-Not ($? -And (Get-Content $pgSqlFile | Select-String "CREATE" -Quiet))) {
    Exit-Error -message "Failed to generate PostgreSQL schema (without foreign tables) for $targetValidationSchema.$table!"
  }
  $pgLocalSqlFile = Join-Path -Path $dirPgLocal -ChildPath "$table.sql"
  Get-Content $pgSqlFile | python pg2pglocal.py --sourceSchema="$sourceSchema" --sourceTable="$table" | Out-File -Encoding Ascii -FilePath $pgLocalSqlFile
  if (-Not ($? -And (Get-Content $pgLocalSqlFile | Select-String "CREATE" -Quiet))) {
    Exit-Error -message "Failed to generate local PostgreSQL schema (with foreign tables) for $targetValidationSchema.$table!"
  }
}
Send-Status "Generated PostgreSQL schemas..."

# drop any existing foreign tables in reverse order
jq -r ".tables | reverse | .[].name" "$configFile" | ForEach-Object {
  $table = $_
  psql -U flashcrow -c "DROP FOREIGN TABLE IF EXISTS \`"$targetValidationSchema\`".\`"$table\`""
  $exists = psql -U flashcrow -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$targetValidationSchema' AND table_name = '$table')"
  if ($exists -ne "f") {
    Exit-Error -message "Failed to drop $targetValidationSchema.$table from local PostgreSQL!"
  }
}

# run PostgreSQL schemas to create foreign tables
jq -r ".tables[].name" "$configFile" | ForEach-Object {
  $table = $_
  $pgLocalSqlFile = Join-Path -Path $dirPgLocal -ChildPath "$table.sql"
  psql -U flashcrow -f $pgLocalSqlFile
  $exists = psql -U flashcrow -tAc "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = '$targetValidationSchema' AND table_name = '$table')"
  if ($exists -ne "t") {
    Exit-Error -message "Failed to create $targetValidationSchema.$table in local PostgreSQL!"
  }
}
Send-Status "Created local PostgreSQL tables..."

# copy data from foreign tables to local text files
jq -c ".tables[]" "$configFile" | ForEach-Object {
  $tableObject = $_ | ConvertFrom-Json
  $table = $tableObject.name
  $chunkBy = $tableObject.chunkBy
  $chunkNumeric = $tableObject.chunkNumeric
  $datFile = Join-Path -Path $dirDat -ChildPath "$table.dat"

  # determine chunkBy column index table by parsing SQL
  $pgLocalSqlFile = Join-Path -Path $dirPgLocal -ChildPath "$table.sql"
  $chunkByMatches = Get-Content $pgLocalSqlFile | Select-String -SimpleMatch $chunkBy
  if ($chunkByMatches -eq $null) {
    Exit-Error "Failed to find column $chunkBy in $table DDL!"
  }
  # The first line is the CREATE TABLE statement, which means the second line starts the list of
  # columns.
  $chunkByIndex = $chunkByMatches[0].LineNumber - 2

  # initialize chunk iteration parameters
  $current = ''
  if ($chunkNumeric) {
    $current = 0
  }
  $cmp = ">="
  $numRows = 0

  # Note that chunk rows could be updated after their chunk has been copied.
  #
  # This risk is considered acceptable, as our replication job aims for eventual
  # consistency.
  while ($true) {
    Send-Status -message "[$targetValidationSchema.$table] $numRows..." -emailDisable

    # get chunk rows, write to data file, and count
    $numChunkRows = psql -U flashcrow -c "\COPY (SELECT * FROM \`"$targetValidationSchema\`".\`"$table\`" WHERE \`"$chunkBy\`" $cmp '$current' ORDER BY \`"$chunkBy\`" LIMIT $chunkSize) TO STDOUT (FORMAT text, ENCODING 'UTF8')" |
      Add-Content -Encoding utf8 -Path $datFile -PassThru |
      Measure-Object
    $numChunkRows = $numChunkRows.Count
    if ($numChunkRows -eq 0) {
      break
    }

    # update chunk iteration parameters
    $current = Get-Content $datFile -Tail 1 | ForEach-Object { $_.split("`t")[$chunkByIndex] }
    if ($chunkNumeric) {
      $current = [Int64]$current
    }
    $cmp = ">"
    $numRows += $numChunkRows
  }
  Send-Status -message "[$targetValidationSchema.$table] $numRows." -emailDisable

  # check that row counts match within tolerance
  $oraCntFile = Join-Path -Path $dirOraCnt -ChildPath "$table.cnt"
  $oraCount = [Int64](Get-Content $oraCntFile)
  $numRowsDat = (Get-Content $datFile | Measure-Object).Count
  $rowCountError = [Math]::abs($numRowsDat - $oraCount) / $oraCount
  if ($rowCountError -gt $rowCountTolerance) {
    Exit-Error "Row count mismatch on $targetValidationSchema`.$table`: Oracle ($oraCount rows) -> data file ($numRowsDat rows)!"
  }

  # Out-File starts files with a Byte Order Mark (BOM), which trips up PostgreSQL's
  # COPY ... FROM STDIN.  We strip that here.
  dos2unix $datFile
  if (-Not $?) {
    Exit-Error -message "Failed to copy Oracle data from $targetValidationSchema.$table in local PostgreSQL to $datFile!"
  }
}
Send-Status "Copied data from local PostgreSQL..."

# pack archive
tar czvf $pgDataArchive $dirRoot
if (-Not $?) {
  Exit-Error -message "Failed to create data archive!"
}
Send-Status "Packed data archive to send to transfer machine..."

# copy archive and transfer script to transfer machine
Copy-RemoteItem -src $pgDataArchive
Copy-RemoteItem -src $configFile
Copy-RemoteItem -src $transferScript -exec
Send-Status "Sent data archive and transfer script to transfer machine..."

# run transfer script on transfer machine
ssh -i $transferStackKey $transferSsh ./$transferScript --config "$config" --guid "$guid" --rowCountTolerance "$rowCountTolerance" --targetDb "'$targetDb'" --targetSchema "$targetSchema" --targetValidationSchema "$targetValidationSchema"
if (-Not $?) {
  Exit-Error -message "Failed to run transfer script on transfer machine!"
}

Exit-Success "Completed Oracle -> PostgreSQL replication."
