import { useLiveQuery } from "dexie-react-hooks"
import { db } from "../lib/db"
import type { Observation, PulseDecision } from "../lib/types";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconX, IconTrendingUp, IconClockExclamation, IconAlertCircle, IconMessageCircle } from "@tabler/icons-react";
import { generateObservations } from "../lib/observations";
import { sync } from "../lib/sync";

function ObsIcon({ kind }: { kind: Observation['kind'] }) {
    if (kind === 'pattern') return <IconTrendingUp className="obs-icon" size={16} stroke={1.5} />
    if (kind === 'nudge') return <IconClockExclamation className="obs-icon" size={16} stroke={1.5} />
    if (kind === 'question') return <IconAlertCircle className="obs-icon" size={16} stroke={1.5} />
    return <IconMessageCircle className="obs-icon" size={16} stroke={1.5} />
}

function Pulse() {
    const navigate = useNavigate();
    const goals = useLiveQuery(() => db.goals.toArray());
    const observations = useLiveQuery(() => db.observations.orderBy('timestamp').reverse().toArray());
    const [synthesis, setSynthesis] = useState('');
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        if (!goals || goals.length === 0) return;
        async function fetchSynthesis() {
            const prompt = `Weekly pulse. My active goals are: ${goals?.map(g => g.name).join(', ')}. Give me a brief weekly synthesis.`;
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
                })
                const data = await response.json()
                setSynthesis(data.content)
            } catch {
                // AI unreachable — leave synthesis blank.
            }
        }
        fetchSynthesis()
    }, [goals])

    async function refreshObservations() {
        setGenerating(true)
        await generateObservations()
        setGenerating(false)
    }

    async function makeDecision(goalId: string, decision: PulseDecision['decision']) {
        const pulseDecision: PulseDecision = {
            id: crypto.randomUUID(),
            pulse_id: 'current',
            goal_id: goalId,
            decision,
            updated_at: Date.now()
        }
        await db.pulse_decisions.add(pulseDecision)
        if (decision === 'pause') await db.goals.update(goalId, { status: 'paused', updated_at: Date.now() });
        if (decision === 'kill') await db.goals.update(goalId, { status: 'killed', updated_at: Date.now() });
        void sync()
    }

    const weekLabel = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }).toUpperCase()

    return (
        <div className="screen">
            <div className="flow-top">
                <p className="section-label">Weekly pulse · {weekLabel}</p>
                <button className="btn-text" onClick={() => navigate('/')} aria-label="Close pulse"><IconX size={16} stroke={1.5} /></button>
            </div>

            <div className="group">
                <h1>Let's take stock.</h1>
                {synthesis && <div className="pulse-synthesis"><p>{synthesis}</p></div>}
            </div>

            <div className="group">
                <div className="pulse-observations-head">
                    <p className="section-label">What I noticed</p>
                    <button className="btn-text" onClick={refreshObservations} disabled={generating}>
                        {generating ? 'Reading…' : 'Refresh'}
                    </button>
                </div>
                {observations && observations.length > 0 ? (
                    <div className="observations">
                        {observations.map(obs => (
                            <div className="obs-card" key={obs.id}>
                                <ObsIcon kind={obs.kind} />
                                <p>{obs.content}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="goals-empty">Nothing to add yet — give it a week of data and we'll see what shows up.</p>
                )}
            </div>

            <div className="group">
                <p className="section-label">Walking through each one</p>
                <div className="pulse-goals">
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
            </div>

            <button className="cta-primary" onClick={() => navigate('/')}>Lock in the week</button>
        </div>
    )
}

export default Pulse
