# PC startup auto-open

Opens Cadence automatically when you log in to Windows, so the morning
check-in is the first thing waiting for you.

`open-cadence.ps1` launches the app — in Edge's standalone "app" window if Edge
is installed, otherwise your default browser. The only thing the OS can't do
for you is *register* the script to run at logon; do that once with Task
Scheduler.

## Register it (one-time)

Run this in an **Administrator PowerShell** from the repo root:

```powershell
$action  = New-ScheduledTaskAction -Execute 'powershell.exe' `
  -Argument '-WindowStyle Hidden -ExecutionPolicy Bypass -File "D:\GitHub\Cadence\scripts\open-cadence.ps1"'
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName 'Open Cadence' -Action $action -Trigger $trigger -Description 'Launch Cadence at logon'
```

Test it without rebooting:

```powershell
Start-ScheduledTask -TaskName 'Open Cadence'
```

Remove it later:

```powershell
Unregister-ScheduledTask -TaskName 'Open Cadence' -Confirm:$false
```

## Simpler alternative (no admin)

Press `Win+R`, type `shell:startup`, Enter. Drop a shortcut in that folder
pointing at:

```
powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -File "D:\GitHub\Cadence\scripts\open-cadence.ps1"
```
