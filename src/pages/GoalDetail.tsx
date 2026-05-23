import { Link, useParams, useNavigate } from "react-router-dom"
import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"

export default function GoalDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const goal = useLiveQuery(() => db.goals.get(id!), [id])

    if (!goal) return <p>Loading...</p>

    async function setStatus(status: 'active' | 'paused' | 'killed') {
        await db.goals.update(id!, { status })
        if (status === 'killed') navigate('/goals')
    }

    return (
        <>
            <div className="goal-detail-header">
                <Link to="/goals">← Goals</Link>
                <span className="goal-detail-type">{goal.type}</span>
            </div>
            <div className="goal-detail-name">
                <h2>{goal.name}</h2>
                <span className="goal-detail-status">{goal.status}</span>
            </div>
            {goal.anchor_time && (
                <div className="goal-detail-meta">
                    <p>{goal.anchor_time}{goal.anchor_place ? ` · ${goal.anchor_place}` : ''}{goal.frequency_target ? ` · ${goal.frequency_target}` : ''}</p>
                </div>
            )}
            <div className="goal-detail-why">
                <p>{goal.why}</p>
            </div>
            <div className="goal-detail-actions">
                {goal.status === 'active' && <button onClick={() => setStatus('paused')}>Pause</button>}
                {goal.status === 'paused' && <button onClick={() => setStatus('active')}>Resume</button>}
                {goal.status !== 'killed' && <button onClick={() => setStatus('killed')}>Kill</button>}
            </div>
        </>
    )
}