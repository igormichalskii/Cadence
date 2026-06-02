import Anthropic from "@anthropic-ai/sdk"
import { handle } from 'hono/vercel'
import { Hono } from "hono"
import { JARVIS_SYSTEM } from "./_jarvis.js"

export const config = { runtime: 'nodejs' }

const app = new Hono().basePath('/api')

app.post('/chat', async (c) => {
    const { messages } = await c.req.json()

    const client = new Anthropic()

    const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: JARVIS_SYSTEM,
        messages
    })

    const text = response.content[0].type === 'text' ?
        response.content[0].text : ''
    return c.json({ content: text })
})

export default handle(app)