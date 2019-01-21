param (
  [Parameter(Mandatory = $true)][string]$config,
  [Parameter(Mandatory = $true)][string]$oracle
)

$ErrorActionPreference = "Stop"

$configData = Get-Content -Raw -Path $config | ConvertFrom-Json
foreach ($table in $configData.tables) {
  $sqlData = @"
SET LONG 2000000
SET PAGESIZE 0
SET LINESIZE 32767
SET ECHO OFF
SET FEEDBACK OFF
EXECUTE dbms_metadata.set_transform_param(DBMS_METADATA.SESSION_TRANSFORM, 'STORAGE', false);
EXECUTE dbms_metadata.set_transform_param(DBMS_METADATA.SESSION_TRANSFORM, 'SQLTERMINATOR', true);
EXECUTE dbms_metadata.set_transform_param(DBMS_METADATA.SESSION_TRANSFORM, 'SEGMENT_ATTRIBUTES', false);
SELECT dbms_metadata.get_ddl('TABLE', '$table', 'TRAFFIC') FROM dual;
EXIT;
"@

  $sqlFile = "build\$table.fetch-ddl.sql"
  $sqlData | Out-File -Encoding Ascii -FilePath $sqlFile
  $ddlFile = "build\$table.ddl.sql"
  sqlplus.exe -s $oracle @$sqlFile | Out-File -FilePath $ddlFile
}
