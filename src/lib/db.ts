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
    }
}

export const db = new CadenceDB()
