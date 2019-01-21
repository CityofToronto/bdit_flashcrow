param (
  [Parameter(Mandatory = $true)][string]$config,
  [Parameter(Mandatory = $true)][string]$oracle
)

$ErrorActionPreference = "Stop"

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

  $fetchSqlFile = "build\$table.fetch.sql"
  $fetchSqlData | Out-File -Encoding Ascii -FilePath $fetchSqlFile
  $oraSqlFile = "build\$table.ora.sql"
  sqlplus.exe -s $oracle @$fetchSqlFile | Out-File -FilePath $oraSqlFile
  $pgSqlFile = "build\$table.pg.sql"
  Get-Content $oraSqlFile | python ora2pg.py | Out-File -FilePath $pgSqlFile
}
