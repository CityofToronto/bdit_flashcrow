param (
  [Parameter(Mandatory = $true)][string]$config,
  [Parameter(Mandatory = $true)][string]$oracle,
  [Parameter(Mandatory = $true)][string]$scpTarget,
  [Parameter(Mandatory = $true)][string]$sshKey
)

$ErrorActionPreference = "Stop"

mkdir -Force flashcrow
mkdir -Force flashcrow\fetch
mkdir -Force flashcrow\ora
mkdir -Force flashcrow\pg
mkdir -Force flashcrow\dat

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
SELECT dbms_metadata.get_ddl('TABLE', '$table', 'TRAFFIC') FROM dual;
EXIT;
"@

  $fetchSqlFile = "flashcrow\fetch\$table.sql"
  $fetchSqlData | Out-File -Encoding Ascii -FilePath $fetchSqlFile
  $oraSqlFile = "flashcrow\ora\$table.sql"
  sqlplus.exe -s $oracle @$fetchSqlFile | Out-File -Encoding Ascii -FilePath $oraSqlFile
  $pgSqlFile = "flashcrow\pg\$table.sql"
  Get-Content $oraSqlFile | python ora2pg.py | Out-File -Encoding Ascii -FilePath $pgSqlFile
}

foreach ($i in ($configData.tables.Count - 1)..0) {
  $table = $configData.tables[$i]
  psql -U flashcrow -c "DROP FOREIGN TABLE IF EXISTS TRAFFIC.$table"
}

foreach ($table in $configData.tables) {
  $pgSqlFile = "flashcrow\pg\$table.sql"
  psql -U flashcrow -f $pgSqlFile
}

foreach ($table in $configData.tables) {
  $pgDataFile = "flashcrow\dat\$table.dat"
  psql -U flashcrow -c "\COPY (SELECT * FROM TRAFFIC.$table) TO STDOUT (FORMAT binary)" > $pgDataFile
}

$pgDataArchive = "flashcrow.tar.gz"
tar czvf $pgDataArchive flashcrow
pscp -i $sshKey $pgDataArchive $scpTarget`:
plink -i $sshKey -ssh $scpTarget tar xzvf flashcrow.tar.gz
plink -i $sshKey -ssh $scpTarget find flashcrow -type f
