import Dexie, { type Table } from 'dexie'
import type { Activity, CheckIn, Goal, Observation, Pulse, PulseDecision } from './types'

class CadenceDB extends Dexie {
    goals!: Table<Goal>
    checkins!: Table<CheckIn>
    activities!: Table<Activity>
    pulses!: Table<Pulse>
    pulse_decisions!: Table<PulseDecision>
    observations!: Table<Observation>

    constructor() {
        super('cadence')
        this.version(1).stores({
            goals: 'id, type, status, created_at',
        })
        this.version(2).stores({
            goals: 'id, type, status, created_at',
            checkins: 'id, kind, timestamp',
        })
        this.version(3).stores({
            goals: 'id, type, status, created_at',
            checkins: 'id, kind, timestamp',
            activities: 'id, goal_id, timestamp'
        })
        this.version(4).stores({
            goals: 'id, type, status, created_at',
            checkins: 'id, kind, timestamp',
            activities: 'id, goal_id, timestamp',
            pulses: 'id, week_start',
            pulse_decisions: 'id, pulse_id, goal_id'
        })
        this.version(5).stores({
            goals: 'id, type, status, created_at',
            checkins: 'id, kind, timestamp',
            activities: 'id, goal_id, timestamp',
            pulses: 'id, week_start',
            pulse_decisions: 'id, pulse_id, goal_id',
            observations: 'id, goal_id, timestamp, kind'
        })
        // v6: add the updated_at watermark (indexed) for cross-device sync, and
        // backfill it on existing rows from their creation timestamp.
        this.version(6).stores({
            goals: 'id, type, status, created_at, updated_at',
            checkins: 'id, kind, timestamp, updated_at',
            activities: 'id, goal_id, timestamp, updated_at',
            pulses: 'id, week_start, updated_at',
            pulse_decisions: 'id, pulse_id, goal_id, updated_at',
            observations: 'id, goal_id, timestamp, kind'
        }).upgrade(async tx => {
            const now = Date.now()
            await tx.table('goals').toCollection().modify(g => { g.updated_at = g.created_at ?? now })
            await tx.table('checkins').toCollection().modify(c => { c.updated_at = c.timestamp ?? now })
            await tx.table('activities').toCollection().modify(a => { a.updated_at = a.timestamp ?? now })
            await tx.table('pulses').toCollection().modify(p => { p.updated_at = p.week_start ?? now })
            await tx.table('pulse_decisions').toCollection().modify(d => { d.updated_at = now })
        })
    }
}

export const db = new CadenceDB()
