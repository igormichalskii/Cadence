import { db } from "./db"
import type { Observation } from "./types"

// Background observation generation (Phase 5). Pulls the last ~14 days of
// activity + check-in data out of IndexedDB, hands JARVIS a compact summary,
// and asks for 1–3 specific observations. Local-first: the raw data never
// leaves the device beyond what's needed for this single synthesis call.

const WINDOW_MS = 14 * 24 * 60 * 60 * 1000

// JARVIS returns prose around the JSON sometimes; grab the first array literal.
function extractJsonArray(text: string): unknown {
    const start = text.indexOf('[')
    const end = text.lastIndexOf(']')
    if (start === -1 || end === -1 || end < start) return null
    try {
        return JSON.parse(text.slice(start, end + 1))
    } catch {
        return null
    }
}

const VALID_KINDS = ['pattern', 'nudge', 'question'] as const

export async function generateObservations(): Promise<void> {
    const since = Date.now() - WINDOW_MS
    const [activities, checkins, goals] = await Promise.all([
        db.activities.where('timestamp').above(since).toArray(),
        db.checkins.where('timestamp').above(since).toArray(),
        db.goals.toArray()
    ])

    if (activities.length === 0 && checkins.length === 0) return

    const goalName = (id: string) => goals.find(g => g.id === id)?.name ?? id

    // A compact, human-readable summary keeps the prompt small and specific.
    const activityLines = activities.map(a =>
        `- ${goalName(a.goal_id)}: ${a.status} on ${new Date(a.timestamp).toLocaleDateString('en-GB')}`
    ).join('\n')
    const checkinLines = checkins.map(ci =>
        `- ${new Date(ci.timestamp).toLocaleDateString('en-GB')}: energy ${ci.energy}, mind ${ci.mind}`
    ).join('\n')
    const goalList = goals
        .filter(g => g.status === 'active')
        .map(g => `${g.name} (id: ${g.id})`)
        .join(', ')

    const prompt = `Here is Igor's data from the last two weeks.

Active goals: ${goalList || 'none'}

Activity log:
${activityLines || '(none)'}

Check-ins:
${checkinLines || '(none)'}

Produce 1 to 3 observations grounded in this data. Each must be specific and cite the real pattern — never generic. Reply with ONLY a JSON array, no prose, in this exact shape:
[{"kind": "pattern" | "nudge" | "question", "content": "the observation in your voice", "goal_id": "the goal id this is about, or null if portfolio-wide"}]`

    let content: string
    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
        })
        const data = await res.json()
        content = data.content
    } catch {
        return // AI unreachable (e.g. no credits) — leave existing observations untouched.
    }

    const parsed = extractJsonArray(content)
    if (!Array.isArray(parsed)) return

    const observations: Observation[] = []
    for (const item of parsed) {
        if (!item || typeof item.content !== 'string') continue
        if (!VALID_KINDS.includes(item.kind)) continue
        observations.push({
            id: crypto.randomUUID(),
            goal_id: typeof item.goal_id === 'string' ? item.goal_id : undefined,
            timestamp: Date.now(),
            content: item.content,
            kind: item.kind
        })
    }

    if (observations.length === 0) return

    // Single-user alpha: replace the prior batch with the fresh read.
    await db.observations.clear()
    await db.observations.bulkAdd(observations)
}
