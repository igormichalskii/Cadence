import { useParams } from "react-router-dom"
import { Link } from "react-router-dom"

export default function GoalDetail() {
    const { id } = useParams();
    return (
        <>
            <div className="goal-detail-header">
                <Link to="/goals">← Goals</Link>
                <span className="goal-detail-type">habit</span>
            </div>
            <div className="goal-detail-name">
                <h2>Morning run</h2>
                <span className="goal-detail-status">active</span>
            </div>
            <div className="goal-detail-meta">
                <p>07:00 · neighborhood loop · 5x/week</p>
            </div>
            <div className="goal-detail-consistency">
                <h3>This month</h3>
                <p>3 of 4 weeks on target. Friday is the recurring slip.</p>
            </div>
            <div className="goal-detail-actions">
                <button>Log activity</button>
                <button>Evolve</button>
                <button>Pause</button>
                <button>Kill</button>
            </div>
        </>
    )
}