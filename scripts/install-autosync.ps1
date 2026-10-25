$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$node = (Get-Command node -ErrorAction Stop).Source
$taskName = 'CampfireGitAutoPush'
$scriptPath = Join-Path $repoRoot 'scripts\autosync.mjs'
$action = New-ScheduledTaskAction -Execute $node -Argument "`"$scriptPath`"" -WorkingDirectory $repoRoot
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(30) -RepetitionInterval (New-TimeSpan -Minutes 30) -RepetitionDuration (New-TimeSpan -Days 3650)
$principal = New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -ExecutionTimeLimit (New-TimeSpan -Minutes 5)
$task = New-ScheduledTask -Action $action -Trigger $trigger -Principal $principal -Settings $settings

Register-ScheduledTask -TaskName $taskName -InputObject $task -Force | Out-Null
Write-Output "Installed $taskName. It checks origin/main every 30 minutes while this user is signed in."
