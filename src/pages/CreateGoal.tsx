import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/db'
import type { Goal } from '../lib/types'

export default function CreateGoal() {
    const navigate = useNavigate()
    const [name, setName] = useState('')
    const [type, setType] = useState<Goal['type']>('habit')
    const [why, setWhy] = useState('')
    const [operationalDef, setOperationalDef] = useState('')
    const [anchorTime, setAnchorTime] = useState('')
    const [anchorPlace, setAnchorPlace] = useState('')
    const [frequencyTarget, setFrequencyTarget] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        const goal: Goal = {
            id: crypto.randomUUID(),
            name,
            type,
            why,
            operational_def: operationalDef,
            anchor_time: anchorTime || undefined,
            anchor_place: anchorPlace || undefined,
            frequency_target: frequencyTarget || undefined,
            status: 'active',
            created_at: Date.now(),
        }
        await db.goals.add(goal)
        navigate('/goals')
    }

    return (
        <>
            <div className="create-goal-header">
                <h2>New goal</h2>
            </div>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name</label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Type</label>
                    <select value={type} onChange={e => setType(e.target.value as Goal['type'])}>
                        <option value="habit">Habit</option>
                        <option value="project">Project</option>
                        <option value="learning">Learning</option>
                        <option value="outcome">Outcome</option>
                        <option value="direction">Direction</option>
                    </select>
                </div>
                <div>
                    <label>Why</label>
                    <textarea
                        value={why}
                        onChange={e => setWhy(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>What does done look like?</label>
                    <textarea
                        value={operationalDef}
                        onChange={e => setOperationalDef(e.target.value)}
                        required
                    />
                </div>
                {(type === 'habit' || type === 'learning') && (
                    <>
                        <div>
                            <label>Anchor time</label>
                            <input
                                value={anchorTime}
                                onChange={e => setAnchorTime(e.target.value)}
                                placeholder="07:00"
                            />
                        </div>
                        <div>
                            <label>Anchor place</label>
                            <input
                                value={anchorPlace}
                                onChange={e => setAnchorPlace(e.target.value)}
                                placeholder="neighborhood loop"
                            />
                        </div>
                    </>
                )}
                {type === 'habit' && (
                    <div>
                        <label>Frequency target</label>
                        <input
                            value={frequencyTarget}
                            onChange={e => setFrequencyTarget(e.target.value)}
                            placeholder="5x/week"
                        />
                    </div>
                )}
                <button type="submit">Add goal</button>
            </form>
        </>
    )
}
