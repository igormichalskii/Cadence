import Dexie, { type Table } from 'dexie'
import type { Goal } from './types'

class CadenceDB extends Dexie {
    goals!: Table<Goal>

    constructor() {
        super('cadence')
        this.version(1).stores({
            goals: 'id, type, status, created_at',
        })
    }
}

export const db = new CadenceDB()
