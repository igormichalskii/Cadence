import { useState } from "react"
import { db } from "../lib/db"
import type { CheckIn } from "../lib/types"
import { useNavigate } from "react-router-dom"

function CheckIn() {
    const navigate = useNavigate()
    const [energy, setEnergy] = useState<CheckIn['energy']>('low')
    const [mind, setMind] = useState<CheckIn['mind']>('calm')
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
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
        })
        const data = await response.json();
        await db.checkins.update(checkin.id, { ai_synthesis: data.content })
        navigate('/')
    }
    return (
        <>
            <div className="head">
                <p>morning check-in</p>
                <button>Skip for now</button>
            </div>
            <div className="header">
                <h2>Good morning, Igor.</h2>
                <p>How are we starting?</p>
            </div>
            <div className="energy">
                <p>energy</p>
                <button
                    onClick={() => setEnergy('low')}
                >
                    Low
                </button>
                <button
                    onClick={() => setEnergy('mid')}
                >
                    Mid
                </button>
                <button
                    onClick={() => setEnergy('high')}
                >
                    High
                </button>
            </div>
            <div className="mind">
                <button
                    onClick={() => setMind('focused')}
                >
                    Focused
                </button>
                <button
                    onClick={() => setMind('scattered')}
                >
                    Scattered
                </button>
                <button
                    onClick={() => setMind('heavy')}
                >
                    Heavy
                </button>
                <button
                    onClick={() => setMind('calm')}
                >
                    Calm
                </button>
                <button
                    onClick={() => setMind('tired')}
                >
                    Tired
                </button>
            </div>
            <div className="tasks">
                <div className="tasks-head">
                    <p>today - drafted</p>
                    <button>edit</button>
                </div>
                <div>Morning run</div>
                <div>Side project</div>
                <div>Spanish</div>
            </div>
            <div className="question">
                <p>anything I should know?</p>
                <textarea
                    name="question-area"
                    id="question-area"
                    value={note}
                    onChange={e => setNote(e.target.value)}
                ></textarea>
            </div>
            <button
                onClick={submit}
            >
                Set the day
            </button>
        </>
    )
}

export default CheckIn