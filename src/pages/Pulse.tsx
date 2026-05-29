import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"
import type { PulseDecision } from "../lib/types";

function Pulse() {
    const goals = useLiveQuery(() => db.goals.toArray());
    async function makeDecision(goalId: string, decision: PulseDecision['decision']) {
        const pulseDecision: PulseDecision = {
            id: crypto.randomUUID(),
            pulse_id: 'current',
            goal_id: goalId,
            decision
        }
        await db.pulse_decisions.add(pulseDecision)
        if (decision === 'pause') await db.goals.update(goalId, { status: 'paused' });
        if (decision === 'kill') await db.goals.update(goalId, { status: 'killed' });
    }
    return (
        <>
            <div className="pulse-header">
                <h2>Weekly Pulse</h2>
                <span className="pulse-date">Week of 19 May</span>
            </div>
            <div className="pulse-synthesis">
                <p>A solid week on the body, a slower one on the head.</p>
            </div>
            <div className="pulse-goals">
                <h3>Goal decisions</h3>
                {goals?.map(goal => (
                    <div className="pulse-goal-item" key={goal.id}>
                        <span>{goal.name}</span>
                        <div className="pulse-actions">
                            <button onClick={() => makeDecision(goal.id, 'keep')}>Keep</button>
                            <button onClick={() => makeDecision(goal.id, 'evolve')}>Evolve</button>
                            <button onClick={() => makeDecision(goal.id, 'pause')}>Pause</button>
                            <button onClick={() => makeDecision(goal.id, 'kill')}>Kill</button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default Pulse