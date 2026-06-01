import { Link, useNavigate } from "react-router-dom"
import { useLiveQuery } from 'dexie-react-hooks'
import { IconPlus } from '@tabler/icons-react'
import { db } from '../lib/db';

function Goals() {
    const navigate = useNavigate();
    const goals = useLiveQuery(() => db.goals.toArray());
    if (!goals) return <p className="goals-empty">Loading…</p>;
    return (
        <div className="screen">
            <div className="goals-header">
                <h1>Goals</h1>
                <button className="btn-text" onClick={() => navigate('/goals/new')} aria-label="Add goal">
                    <IconPlus size={16} stroke={1.5} /> Add
                </button>
            </div>
            {goals.length > 0 ? (
                <div className="goals-list">
                    {goals.map(goal => (
                        <Link to={`/goals/${goal.id}`} key={goal.id} className="goal-item">
                            <span className="type-pill">{goal.type}</span>
                            <span className="goal-name">{goal.name}</span>
                            <span className={`status-badge ${goal.status}`}>{goal.status}</span>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="goals-empty">
                    Nothing on the board yet.{' '}
                    <Link to="/goals/new" style={{ color: 'var(--accent)' }}>Want to set up your first goal?</Link>
                </p>
            )}
        </div>
    )
}

export default Goals
