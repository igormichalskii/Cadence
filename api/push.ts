import { Hono } from "hono";
import { handle } from 'hono/vercel';
import webpush from 'web-push';


webpush.setVapidDetails(
    process.env.VAPID_MAILTO!,
    process.env.VITE_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export const config = { runtime: 'nodejs' }

const app = new Hono().basePath('/api')

app.post('/push', async (c) => {
    const { subscription, payload } = await c.req.json()

    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return c.json({ ok: true })
})

export default handle(app)