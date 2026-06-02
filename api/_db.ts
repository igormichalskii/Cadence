// Neon Postgres + Drizzle (locked stack). Underscore-prefixed so Vercel treats
// it as a shared import, not a route. One generic table holds every synced
// record as a JSON blob keyed by (table, id) with a last-write-wins watermark.
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { pgTable, text, bigint, jsonb, primaryKey } from 'drizzle-orm/pg-core'

export const neonSql = neon(process.env.DATABASE_URL!)
export const db = drizzle(neonSql)

export const syncRecords = pgTable('sync_records', {
    tableName: text('table_name').notNull(),
    id: text('id').notNull(),
    updatedAt: bigint('updated_at', { mode: 'number' }).notNull(),
    data: jsonb('data').notNull(),
}, (t) => ({
    pk: primaryKey({ columns: [t.tableName, t.id] }),
}))
