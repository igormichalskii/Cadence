import Dexie, { type Table } from 'dexie'
import type { Activity, CheckIn, Goal } from './types'

class CadenceDB extends Dexie {
    goals!: Table<Goal>
    checkins!: Table<CheckIn>
    activities!: Table<Activity>

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
    }
}

export const db = new CadenceDB()
