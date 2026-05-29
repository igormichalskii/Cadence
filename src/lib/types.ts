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