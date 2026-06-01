import { Hono } from "hono";
import { handle } from "hono/vercel";
import { kv } from "@vercel/kv";

export const config = { runtime: 'nodejs' }

// Single-user alpha: one KV key holds everything the escalation cron needs to
// see — the push subscription and a snapshot of the latest morning check-in.
// This is the minimal one-way device->server push; full sync stays post-alpha.
const STATE_KEY = 'cadence:state'

type CadenceState = {
    subscription?: unknown
    lastCheckIn?: { timestamp: number; energy: string; mind: string }
}

const app = new Hono().basePath('/api')

app.post('/state', async (c) => {
    const { subscription, checkIn } = await c.req.json()
    const current = (await kv.get<CadenceState>(STATE_KEY)) ?? {}
    if (subscription) current.subscription = subscription
    if (checkIn) current.lastCheckIn = checkIn
    await kv.set(STATE_KEY, current)
    return c.json({ ok: true })
})

export default handle(app)
