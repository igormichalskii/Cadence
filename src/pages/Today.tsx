import { useState, useEffect } from 'react'
import { subscribeToPush } from '../lib/push'

function Today() {
    const [greeting, setGreeting] = useState('')
    useEffect(() => {
        async function fetchGreeting() {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: [{ role: 'user', content: `Good morning. Today is ${new Date().toLocaleString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}. Give me a brief morning greeting.` }] })
            })
            const data = await response.json()
            setGreeting(data.content)
        }
        fetchGreeting()
    }, [])
    return (
        <>
            <div className="head">
                {greeting}
                <div className="tip">
                    <p>Three of four runs this week.
                        Friday's the usual slip - shall we settle it now?
                    </p>
                </div>
            </div>
            <div className="tasks">
                <p>today - by time</p>
                <div>Morning run</div>
                <div>Side project</div>
                <div>Spanish</div>
                <div>Anything worth logging?</div>
            </div>
            <div className="this-week">
                <div>Adherence</div>
                <div>Focus hours</div>
            </div>
            <button
                onClick={subscribeToPush}
            >
                Enable notifications
            </button>
        </>
    )
}

export default Today