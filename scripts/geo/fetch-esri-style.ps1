param (
  [Parameter(
    Mandatory = $true,
    HelpMessage = "URL of style to fetch"
  )][string]$styleUrl
)

# run in context of script directory
Set-Location $PSScriptRoot

# script settings
$ErrorActionPreference = "Stop"

# paths to important folders / files
$dirRoot = git rev-parse --show-toplevel
$dirSrc = Join-Path -path $dirRoot -childPath "src"
$dirLib = Join-Path -path $dirSrc -childPath "lib"
$dirLibGeo = Join-Path -path $dirLib -childPath "geo"
$styleFile = Join-Path -path $dirLibGeo -childPath "root.json"
$metadataFile = Join-Path -path $dirLibGeo -childPath "metadata.json"

$metadataUrl = curl.exe -s $styleUrl | jq -r ".sources.esri.url"
curl.exe -s $styleUrl | Out-File -Encoding utf8 -FilePath $styleFile
curl.exe -s $metadataUrl | Out-File -Encoding utf8 -FilePath $metadataFile
