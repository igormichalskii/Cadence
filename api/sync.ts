import { Hono } from "hono";
import { handle } from "hono/vercel";
import { sql, gt } from "drizzle-orm";
import { db, neonSql, syncRecords } from "./_db";

export const config = { runtime: 'nodejs' }

// Created on first request — keeps provisioning to just a Neon DB + env vars.
let initialized = false
async function ensureTable() {
    if (initialized) return
    await neonSql`CREATE TABLE IF NOT EXISTS sync_records (
        table_name text NOT NULL,
        id text NOT NULL,
        updated_at bigint NOT NULL,
        data jsonb NOT NULL,
        PRIMARY KEY (table_name, id)
    )`
    await neonSql`CREATE INDEX IF NOT EXISTS sync_records_updated_at_idx ON sync_records (updated_at)`
    initialized = true
}

type IncomingRecord = { id: string; updated_at: number }

const app = new Hono().basePath('/api')

app.post('/sync', async (c) => {
    // Minimal auth: shared passphrase, checked against SYNC_SECRET.
    const secret = process.env.SYNC_SECRET
    if (secret && c.req.header('authorization') !== `Bearer ${secret}`) {
        return c.json({ error: 'unauthorized' }, 401)
    }

    await ensureTable()

    const { since, changes } = await c.req.json() as {
        since?: number
        changes?: Record<string, IncomingRecord[]>
    }

    // Upsert incoming changes — last-write-wins by updated_at.
    const rows: { tableName: string; id: string; updatedAt: number; data: IncomingRecord }[] = []
    for (const [tableName, recs] of Object.entries(changes ?? {})) {
        for (const rec of recs ?? []) {
            if (!rec?.id || typeof rec.updated_at !== 'number') continue
            rows.push({ tableName, id: rec.id, updatedAt: rec.updated_at, data: rec })
        }
    }
    if (rows.length > 0) {
        await db.insert(syncRecords).values(rows).onConflictDoUpdate({
            target: [syncRecords.tableName, syncRecords.id],
            set: { data: sql`excluded.data`, updatedAt: sql`excluded.updated_at` },
            setWhere: sql`${syncRecords.updatedAt} < excluded.updated_at`,
        })
    }

    // Return everything that changed on the server since the client last pulled.
    const serverRows = await db.select().from(syncRecords).where(gt(syncRecords.updatedAt, since ?? 0))
    const out: Record<string, unknown[]> = {}
    for (const row of serverRows) {
        (out[row.tableName] ??= []).push(row.data)
    }

    return c.json({ now: Date.now(), changes: out })
})

export default handle(app)
