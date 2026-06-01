import { Link, useParams, useNavigate } from "react-router-dom"
import { useLiveQuery } from "dexie-react-hooks"
import { IconArrowLeft, IconClock } from "@tabler/icons-react"
import { db } from "../lib/db"
import type { Activity } from "../lib/types"

const STATUS_LABEL: Record<Activity['status'], string> = {
    done: 'Done',
    missed_drift: 'Missed · drift',
    missed_life: 'Missed · life'
}

export default function GoalDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const goal = useLiveQuery(() => db.goals.get(id!), [id])
    const activities = useLiveQuery(() => db.activities.where('goal_id').equals(id!).reverse().toArray(), [id])

    if (!goal) return <p className="goals-empty">Loading…</p>

    async function setStatus(status: 'active' | 'paused' | 'killed') {
        await db.goals.update(id!, { status })
        if (status === 'killed') navigate('/goals')
    }

    async function logActivity(status: Activity['status']) {
        const activity: Activity = {
            id: crypto.randomUUID(),
            goal_id: id!,
            timestamp: Date.now(),
            status
        }
        await db.activities.add(activity)
    }

    return (
        <div className="screen">
            <div className="flow-top">
                <Link to="/goals" className="back"><IconArrowLeft size={16} stroke={1.5} /> Goals</Link>
                <span className="type-pill">{goal.type}</span>
            </div>

            <div className="goal-detail-name">
                <h1>{goal.name}</h1>
                <span className={`status-badge ${goal.status}`}>{goal.status}</span>
            </div>

            {goal.anchor_time && (
                <p className="goal-detail-meta">
                    <IconClock size={13} stroke={1.5} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                    {goal.anchor_time}{goal.anchor_place ? ` · ${goal.anchor_place}` : ''}{goal.frequency_target ? ` · ${goal.frequency_target}` : ''}
                </p>
            )}

            <div className="group goal-detail-why">
                <p className="section-label">Why</p>
                <p>{goal.why}</p>
            </div>

            <div className="goal-detail-actions">
                {goal.status === 'active' && <button className="btn-secondary" onClick={() => setStatus('paused')}>Pause</button>}
                {goal.status === 'paused' && <button className="btn-secondary" onClick={() => setStatus('active')}>Resume</button>}
                {goal.status !== 'killed' && <button className="btn-secondary" onClick={() => setStatus('killed')}>Kill</button>}
            </div>

            {goal.status === 'active' && (
                <div className="group">
                    <p className="section-label">Log</p>
                    <div className="goal-detail-log">
                        <button className="chip" onClick={() => logActivity('done')}>Done</button>
                        <button className="chip" onClick={() => logActivity('missed_drift')}>Missed · drift</button>
                        <button className="chip" onClick={() => logActivity('missed_life')}>Missed · life</button>
                    </div>
                </div>
            )}

            <div className="group">
                <p className="section-label">Recent</p>
                {activities && activities.length > 0 ? (
                    <div className="activities">
                        {activities.map(activity => (
                            <div className="activity" key={activity.id}>
                                <p>{STATUS_LABEL[activity.status]}</p>
                                <span>{new Date(activity.timestamp).toLocaleDateString('en-GB')}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="goals-empty">No history yet. Log your first one above.</p>
                )}
            </div>
        </div>
    )
}
