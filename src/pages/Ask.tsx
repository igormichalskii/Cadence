import { useState } from "react"

function Ask() {
    const [messages, setMessages] = useState([{ role: 'assistant', content: 'Anything I should know before we start?' }])
    const [input, setInput] = useState('')
    async function send() {
        const updatedMessages = [...messages, { role: 'user', content: input }]
        setMessages(updatedMessages)
        setInput('')
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: updatedMessages.slice(1) })
        })
        const data = await response.json()
        setMessages([...updatedMessages, { role: 'assistant', content: data.content }])
    }
    return (
        <div className="ask-screen">
            <h1>Ask JARVIS</h1>
            <div className="ask-messages">
                {messages.map((message, index) => (
                    <div className={"message " + message.role} key={index}>
                        {message.content}
                    </div>
                ))}
            </div>
            <div className="ask-input">
                <textarea
                    placeholder="Ask something…"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <button className="cta-primary" onClick={send}>Send</button>
            </div>
        </div>
    )
}

export default Ask
