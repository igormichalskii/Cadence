// Pushes the minimal slice of device state the escalation cron needs to see:
// the push subscription (set once) and the latest morning check-in snapshot.
// Failures are swallowed — if the server's unreachable, escalation simply
// won't fire; nothing local breaks.
export async function postState(body: {
    subscription?: unknown
    checkIn?: { timestamp: number; energy: string; mind: string }
}): Promise<void> {
    try {
        await fetch('/api/state', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })
    } catch {
        // offline or server down — non-fatal.
    }
}
