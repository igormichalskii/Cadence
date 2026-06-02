import { Hono } from "hono";
import { handle } from "hono/vercel";
import { kv } from "@vercel/kv";
import webpush from "web-push";
import Anthropic from "@anthropic-ai/sdk";
import { JARVIS_SYSTEM } from "./_jarvis.js";

webpush.setVapidDetails(
    process.env.VAPID_MAILTO!,
    process.env.VITE_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export const config = { runtime: 'nodejs' }

const STATE_KEY = 'cadence:state'

type CadenceState = {
    subscription?: webpush.PushSubscription
    lastCheckIn?: { timestamp: number; energy: string; mind: string }
}

const app = new Hono().basePath('/api')

// Hit once a day by Vercel Cron (see vercel.json). Decides whether there's
// real signal worth a push and, if so, fires exactly one. Quiet otherwise —
// no notification spam (CLAUDE.md anti-pattern).
app.get('/escalate', async (c) => {
    // Vercel Cron sends `Authorization: Bearer ${CRON_SECRET}` when CRON_SECRET
    // is set. Reject anything else so the endpoint isn't publicly triggerable.
    const secret = process.env.CRON_SECRET
    if (secret && c.req.header('authorization') !== `Bearer ${secret}`) {
        return c.json({ error: 'unauthorized' }, 401)
    }

    const state = await kv.get<CadenceState>(STATE_KEY)
    if (!state?.subscription) return c.json({ skipped: 'no subscription' })

    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    const last = state.lastCheckIn
    const checkedInToday =
        !!last && new Date(last.timestamp).toISOString().slice(0, 10) === today

    let payload: { title: string; body: string } | null = null

    if (!checkedInToday) {
        // Morning check-in window open and unaddressed.
        payload = { title: 'Cadence', body: "Morning check-in's still open. Shall we set the day?" }
    } else if (last!.energy === 'low' || last!.mind === 'heavy' || last!.mind === 'tired') {
        // State came back low — escalate with a specific, honest line.
        payload = { title: 'JARVIS', body: await jarvisLine(last!) }
    } else if (now.getDay() === 5) {
        // Friday: nudge the weekly pulse.
        payload = { title: 'Cadence', body: "Friday. The weekly pulse is waiting when you are." }
    }

    if (!payload) return c.json({ skipped: 'no signal' })

    try {
        await webpush.sendNotification(state.subscription, JSON.stringify(payload))
    } catch (e) {
        return c.json({ error: 'push failed', detail: String(e) }, 500)
    }
    return c.json({ ok: true, sent: payload })
})

async function jarvisLine(last: { energy: string; mind: string }): Promise<string> {
    const fallback = "A heavy start. Pick the one small thing that still matters today and let the rest wait."
    try {
        const client = new Anthropic()
        const res = await client.messages.create({
            model: 'claude-sonnet-4-6',
            max_tokens: 256,
            system: JARVIS_SYSTEM,
            messages: [{
                role: 'user',
                content: `Igor's morning check-in came back low — energy: ${last.energy}, mind: ${last.mind}. Send one short line for a push notification. No false cheer, no empty comfort. Acknowledge the state honestly and offer a single concrete, low-friction next move. Under 160 characters.`
            }]
        })
        return res.content[0].type === 'text' ? res.content[0].text : fallback
    } catch {
        return fallback
    }
}

export default handle(app)
