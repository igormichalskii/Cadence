import { db } from './db'

// Cross-device sync. Local-first stays the source of truth; this pushes local
// changes to the server and pulls remote ones, merged last-write-wins by
// updated_at. Observations are excluded (AI-derived, regenerated per device).
const SYNCED = ['goals', 'checkins', 'activities', 'pulses', 'pulse_decisions'] as const

// Two watermarks because client and server clocks differ:
// - lastPush (client clock): only re-send local rows changed since this.
// - lastPull (server clock): only ask for server rows changed since this.
function num(key: string): number {
    return Number(localStorage.getItem(key) ?? 0)
}

export function hasSyncPassphrase(): boolean {
    return !!localStorage.getItem('syncSecret')
}

export function setSyncPassphrase(p: string): void {
    localStorage.setItem('syncSecret', p)
}

type SyncResult = { ok: boolean; reason?: string }

let inFlight: Promise<SyncResult> | null = null

export function sync(): Promise<SyncResult> {
    // Coalesce concurrent calls (e.g. mount + a write firing at once).
    if (inFlight) return inFlight
    inFlight = run().finally(() => { inFlight = null })
    return inFlight
}

async function run(): Promise<SyncResult> {
    const token = localStorage.getItem('syncSecret')
    if (!token) return { ok: false, reason: 'no-passphrase' }

    const syncStart = Date.now()
    const lastPush = num('lastPush')
    const lastPull = num('lastPull')

    // Gather local changes since the last successful push.
    const changes: Record<string, unknown[]> = {}
    for (const name of SYNCED) {
        const recs = await db.table(name).where('updated_at').above(lastPush).toArray()
        if (recs.length) changes[name] = recs
    }

    let res: Response
    try {
        res = await fetch('/api/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ since: lastPull, changes })
        })
    } catch {
        return { ok: false, reason: 'offline' }
    }
    if (!res.ok) return { ok: false, reason: `http-${res.status}` }

    const data = await res.json() as {
        now: number
        changes: Record<string, Array<{ id: string; updated_at: number }>>
    }

    // Apply server rows, skipping any the local copy already has at >= version.
    for (const name of SYNCED) {
        const incoming = data.changes[name]
        if (!incoming?.length) continue
        for (const rec of incoming) {
            const local = await db.table(name).get(rec.id) as { updated_at?: number } | undefined
            if (!local || (local.updated_at ?? 0) < rec.updated_at) {
                await db.table(name).put(rec)
            }
        }
    }

    localStorage.setItem('lastPush', String(syncStart))
    localStorage.setItem('lastPull', String(data.now))
    return { ok: true }
}
