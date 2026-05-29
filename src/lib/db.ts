import Dexie, { type Table } from 'dexie'
import type { Activity, CheckIn, Goal, Pulse, PulseDecision } from './types'

class CadenceDB extends Dexie {
    goals!: Table<Goal>
    checkins!: Table<CheckIn>
    activities!: Table<Activity>
    pulses!: Table<Pulse>
    pulse_decisions!: Table<PulseDecision>

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
    }
}

export const db = new CadenceDB()
