import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate } from 'react-router-dom'
import { IconClock, IconPlus, IconCheck, IconMessageCircle, IconBell, IconRefresh } from '@tabler/icons-react'
import { db } from '../lib/db'
import type { Activity } from '../lib/types'
import { subscribeToPush } from '../lib/push'
import { sync, hasSyncPassphrase, setSyncPassphrase } from '../lib/sync'

function cap(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function Today() {
    const navigate = useNavigate()
    const [greeting, setGreeting] = useState('')
    const [done, setDone] = useState<Set<string>>(new Set())

    const goals = useLiveQuery(() => db.goals.where('status').equals('active').toArray())
    const focus = goals
        ?.slice()
        .sort((a, b) => (a.anchor_time ?? '').localeCompare(b.anchor_time ?? ''))

    const now = new Date()
    const dateLabel =
        now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
            .replace(',', '').toUpperCase() +
        ' · ' +
        now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    const part = now.getHours() < 12 ? 'morning' : now.getHours() < 18 ? 'afternoon' : 'evening'

    useEffect(() => {
        async function fetchGreeting() {
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: [{ role: 'user', content: `Good ${part}. Today is ${now.toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. Give me a brief day reading — one sentence, your read on the day.` }] })
                })
                const data = await response.json()
                setGreeting(data.content)
            } catch {
                // AI unreachable — leave the reading blank.
            }
        }
        fetchGreeting()
    }, [])

    async function handleSync() {
        if (!hasSyncPassphrase()) {
            const p = window.prompt('Enter your sync passphrase (same on every device)')
            if (!p) return
            setSyncPassphrase(p.trim())
        }
        const result = await sync()
        if (!result.ok && result.reason === 'http-401') {
            localStorage.removeItem('syncSecret')
            window.alert('Sync passphrase rejected — try again.')
        }
    }

    async function markDone(goalId: string) {
        const activity: Activity = {
            id: crypto.randomUUID(),
            goal_id: goalId,
            timestamp: Date.now(),
            status: 'done',
            updated_at: Date.now()
        }
        await db.activities.add(activity)
        void sync()
        setDone(prev => new Set(prev).add(goalId))
    }

    return (
        <div className="screen">
            <div className="group">
                <p className="today-date">{dateLabel}</p>
                <h1>Good {part}, Igor.</h1>
                {greeting && <p className="day-reading">{greeting}</p>}
            </div>

            <div className="obs-card">
                <IconMessageCircle className="obs-icon" size={16} stroke={1.5} />
                <p>Three of four runs this week. Friday's the usual slip — shall we settle it now?</p>
            </div>

            <div className="group">
                <p className="section-label">Today's focus</p>
                {focus && focus.length > 0 ? (
                    <div className="focus-list">
                        {focus.map(goal => (
                            <div className="goal-card" key={goal.id}>
                                <span className="goal-card-title">{goal.name}</span>
                                {goal.anchor_time && (
                                    <span className="goal-card-anchor">
                                        <IconClock size={12} stroke={1.5} />
                                        {goal.anchor_time}{goal.anchor_place ? ` · ${goal.anchor_place}` : ''}
                                    </span>
                                )}
                                <span className="goal-card-context">
                                    {cap(goal.type)}{goal.frequency_target ? ` · ${goal.frequency_target}` : ''}
                                </span>
                                <button
                                    className={done.has(goal.id) ? 'check-circle done' : 'check-circle'}
                                    onClick={() => markDone(goal.id)}
                                    aria-label={`Mark ${goal.name} done`}
                                >
                                    <IconCheck size={14} stroke={2} />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="goals-empty">
                        Nothing on the board yet.{' '}
                        <Link to="/goals/new" style={{ color: 'var(--accent)' }}>Want to set up your first goal?</Link>
                    </p>
                )}
            </div>

            <button className="quick-capture" onClick={() => navigate('/ask')}>
                <IconPlus size={14} stroke={1.5} />
                Anything worth logging?
            </button>

            <div className="group">
                <p className="section-label">This week</p>
                <div className="metric-grid">
                    <div className="metric-tile">
                        <span className="metric-label">Adherence</span>
                        <span className="metric-value">78%</span>
                        <div className="metric-bar"><span style={{ width: '78%' }} /></div>
                    </div>
                    <div className="metric-tile">
                        <span className="metric-label">Focus hours</span>
                        <span className="metric-value">12.5</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn-secondary" onClick={subscribeToPush} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                    <IconBell size={14} stroke={1.5} />
                    Notifications
                </button>
                <button className="btn-secondary" onClick={handleSync} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                    <IconRefresh size={14} stroke={1.5} />
                    Sync
                </button>
            </div>
        </div>
    )
}

export default Today
