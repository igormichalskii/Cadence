import Dexie, { type Table } from 'dexie'
import type { CheckIn, Goal } from './types'

class CadenceDB extends Dexie {
    goals!: Table<Goal>
    checkins!: Table<CheckIn>

    constructor() {
        super('cadence')
        this.version(1).stores({
            goals: 'id, type, status, created_at',
        })
        this.version(2).stores({
            goals: 'id, type, status, created_at',
            checkins: 'id, kind, timestamp',
        })
    }
}

export const db = new CadenceDB()
