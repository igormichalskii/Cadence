import { Link, useNavigate } from "react-router-dom"
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db';

function Goals() {
    const navigate = useNavigate();
    const goals = useLiveQuery(() => db.goals.toArray());
    if (!goals) return <p>Loading...</p>;
    return (
        <>
            <div className="goals-header">
                <h2>Goals</h2>
                <button onClick={() => navigate('/goals/new')}>+ Add</button>
            </div>
            <div className="goals-list">
                {goals.map(goal => (
                    <Link to={`/goals/${goal.id}`} key={goal.id}>
                        <div className="goal-item">
                            <span className="goal-type">{goal.type}</span>
                            <span className="goal-name">{goal.name}</span>
                            <span className="goal-status">{goal.status}</span>
                        </div>
                    </Link>
                ))}

            </div>
        </>
    )
}

export default Goals
