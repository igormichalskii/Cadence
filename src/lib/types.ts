// `updated_at` (ms) is the last-write-wins watermark used by cross-device sync.
// Stamp it on every create and update. Observation is excluded from sync
// (AI-derived; each device regenerates it) and so has no updated_at.

export interface Goal {
    id: string;
    name: string;
    type: 'habit' | 'project' | 'learning' | 'outcome' | 'direction';
    why: string;
    operational_def: string;
    anchor_time?: string;
    anchor_place?: string;
    frequency_target?: string;
    status: 'active' | 'paused' | 'killed';
    linked_outcome_id?: string;
    created_at: number;
    updated_at: number;
}

export interface CheckIn {
    id: string;
    kind: ('morning' | 'evening');
    timestamp: number;
    energy: ('low' | 'mid' | 'high');
    mind: ('focused' | 'scattered' | 'heavy' | 'calm' | 'tired');
    note?: string;
    ai_synthesis?: string;
    updated_at: number;
}

export interface Activity {
    id: string;
    goal_id: string;
    timestamp: number;
    status: ('done' | 'missed_drift' | 'missed_life');
    duration_min?: number;
    note?: string;
    updated_at: number;
}

export interface Observation {
    id: string;
    goal_id?: string;
    timestamp: number;
    content: string;
    kind: ('pattern' | 'nudge' | 'question');
}

export interface Pulse {
    id: string;
    week_start: number;
    opening_synthesis: string;
    next_week_focus?: string;
    updated_at: number;
}

export interface PulseDecision {
    id: string;
    pulse_id: string;
    goal_id: string;
    decision: ('keep' | 'evolve' | 'pause' | 'kill');
    note?: string;
    updated_at: number;
}
