import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"
import type { PulseDecision } from "../lib/types";
import { useEffect, useState } from "react";
import { generateObservations } from "../lib/observations";

function Pulse() {
    const goals = useLiveQuery(() => db.goals.toArray());
    const observations = useLiveQuery(() => db.observations.orderBy('timestamp').reverse().toArray());
    const [synthesis, setSynthesis] = useState('');
    const [generating, setGenerating] = useState(false);

    async function refreshObservations() {
        setGenerating(true)
        await generateObservations()
        setGenerating(false)
    }
    useEffect(() => {
        if (!goals || goals.length === 0) return;
        async function fetchSynthesis() {
            const prompt = `Weekly pulse. My active goals are: ${goals?.map(g => g.name).join(', ')}. Give me a brief weekly synthesis.`;
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
            })
            const data = await response.json()
            setSynthesis(data.content)
        }
        fetchSynthesis()
    }, [goals])
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
                <p>{synthesis}</p>
            </div>
            <div className="pulse-observations">
                <div className="pulse-observations-head">
                    <h3>Observations</h3>
                    <button onClick={refreshObservations} disabled={generating}>
                        {generating ? 'Reading…' : 'Refresh'}
                    </button>
                </div>
                {observations?.map(obs => (
                    <div className="observation" key={obs.id}>
                        <span className="observation-kind">{obs.kind}</span>
                        <p>{obs.content}</p>
                    </div>
                ))}
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