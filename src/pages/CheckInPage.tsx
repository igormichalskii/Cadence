import { useState } from "react"
import { db } from "../lib/db"
import type { CheckIn } from "../lib/types"
import { useNavigate } from "react-router-dom"
import { postState } from "../lib/state"

const ENERGY: CheckIn['energy'][] = ['low', 'mid', 'high']
const MIND: CheckIn['mind'][] = ['focused', 'scattered', 'heavy', 'calm', 'tired']

function cap(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function CheckInPage() {
    const navigate = useNavigate()
    const [energy, setEnergy] = useState<CheckIn['energy']>('high')
    const [mind, setMind] = useState<CheckIn['mind']>('focused')
    const [note, setNote] = useState('')

    async function submit() {
        const prompt = `Morning check-in. Energy: ${energy}, mind: ${mind}${note ? `, note: ${note}` : ''}. Give me a one-line JARVIS response.`;
        const checkin: CheckIn = {
            id: crypto.randomUUID(),
            kind: 'morning',
            timestamp: Date.now(),
            energy,
            mind,
            note: note || undefined
        }
        await db.checkins.add(checkin)
        // Snapshot the check-in to the server so the escalation cron can read today's state.
        await postState({ checkIn: { timestamp: checkin.timestamp, energy, mind } })
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
            })
            const data = await response.json();
            await db.checkins.update(checkin.id, { ai_synthesis: data.content })
        } catch {
            // AI unreachable — the check-in is saved regardless.
        }
        navigate('/')
    }

    return (
        <div className="screen">
            <div className="flow-top">
                <p className="section-label">Morning check-in</p>
                <button className="btn-text" onClick={() => navigate('/')}>Skip for now</button>
            </div>

            <div className="group">
                <h1>Good morning, Igor.</h1>
                <p className="day-reading">How are we starting?</p>
            </div>

            <div className="group">
                <p className="section-label">Energy</p>
                <div className="chip-row">
                    {ENERGY.map(e => (
                        <button
                            key={e}
                            className={energy === e ? 'chip selected' : 'chip'}
                            onClick={() => setEnergy(e)}
                        >
                            {cap(e)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="group">
                <p className="section-label">Mind</p>
                <div className="chip-cloud">
                    {MIND.map(m => (
                        <button
                            key={m}
                            className={mind === m ? 'chip selected' : 'chip'}
                            onClick={() => setMind(m)}
                        >
                            {cap(m)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="group">
                <p className="section-label">Anything I should know?</p>
                <textarea
                    className="field-area"
                    placeholder="A note, an obstacle on the horizon, something on your mind — optional."
                    value={note}
                    onChange={e => setNote(e.target.value)}
                />
            </div>

            <button className="cta-primary" onClick={submit}>Set the day</button>
        </div>
    )
}

export default CheckInPage
