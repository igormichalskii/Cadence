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
}

export interface CheckIn {
    id: string;
    kind: ('morning' | 'evening');
    timestamp: number;
    energy: ('low' | 'mid' | 'high');
    mind: ('focused' | 'scattered' | 'heavy' | 'calm' | 'tired');
    note?: string;
    ai_synthesis?: string;
}

export interface Activity {
    id: string;
    goal_id: string;
    timestamp: number;
    status: ('done' | 'missed_drift' | 'missed_life');
    duration_min?: number;
    note?: string;
}

export interface Pulse {
    id: string;
    week_start: number;
    opening_synthesis: string;
    next_week_focus?: string;
}

export interface PulseDecision {
    id: string;
    pulse_id: string;
    goal_id: string;
    decision: ('keep' | 'evolve' | 'pause' | 'kill');
    note?: string;
}