# Opens Cadence at PC logon. Prefers the installed PWA in standalone app mode
# (Edge --app), falls back to the default browser. Wire it up via Task
# Scheduler — see startup-README.md in this folder.

$url = 'https://cadence-puce-five.vercel.app/'

$edge = "$env:ProgramFiles (x86)\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) {
    $edge = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
}

if (Test-Path $edge) {
    # App mode = standalone window, no browser chrome, like the installed PWA.
    & $edge "--app=$url"
} else {
    Start-Process $url
}
