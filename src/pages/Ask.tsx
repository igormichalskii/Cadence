function Ask() {
    return (
        <>
            <div className="ask-header">
                <h2>Ask JARVIS</h2>
            </div>
            <div className="ask-messages">
                <div className="message jarvis">
                    Anything I should know before we start?
                </div>
            </div>
            <div className="ask-input">
                <textarea placeholder="Ask something..." />
                <button>Send</button>
            </div>
        </>
    )
}

export default Ask
