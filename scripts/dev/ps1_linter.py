"""
ps1_linter.py

Shim script for linting PowerShell files.  This allows us to block editing of PowerShell
files on non-PowerShell
"""
import distutils.spawn
import os
import subprocess
import sys

def is_windows():
  """
  Returns whether the script is being run on a Windows-based system.
  """
  return os.name == 'nt'

def powershell_exists():
  """
  Returns whether the script is being run in an environment that has PowerShell 5.x installed.
  """
  powershell_exe = distutils.spawn.find_executable('powershell')
  if powershell_exe is None:
    return False
  cmd = subprocess.run(
    ['powershell', 'echo', '$PSVersionTable.PSVersion.Major'],
    capture_output=True,
    encoding='utf-8')
  if cmd.returncode != 0:
    return False
  version = int(cmd.stdout.strip())
  return version == 5

def invoke_scriptanalyzer_exists():
  """
  Returns whether the script is being run in an environment that has the cmdlet
  Invoke-ScriptAnalyzer installed.
  """
  cmd = subprocess.run(
    ['PowerShell', 'Get-Command', '"Invoke-ScriptAnalyzer"', '-errorAction', 'SilentlyContinue'],
    capture_output=True,
    encoding='utf-8')
  return cmd.returncode == 0

def powershell_linting_supported():
  """
  Check if PowerShell linting is supported.  If it is not, this script will exit with
  """
  return is_windows() and powershell_exists() and invoke_scriptanalyzer_exists()

def powershell_lint(path):
  """
  Run linter on given path using subprocess.
  """
  cmd = subprocess.run(
    ['PowerShell', 'Invoke-ScriptAnalyzer', '-EnableExit', path],
    encoding='utf-8')
  return cmd.returncode == 0

def main():
  """
  Check for platform linting support, then run linter on all paths.
  """
  if not powershell_linting_supported():
    print(
      "Editing PowerShell scripts is not supported on this platform.  To ensure code "
      "quality, we limit PowerShell script editing to Windows systems with the necessary "
      "linting tools installed",
      file=sys.stderr)
    sys.exit(1)
  for path in sys.argv[1:]:
    if not powershell_lint(path):
      sys.exit(1)

if __name__ == '__main__':
  main()
