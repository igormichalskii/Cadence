function Pulse() {
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
                <div className="pulse-goal-item">
                    <span>Morning run</span>
                    <div className="pulse-actions">
                        <button>Keep</button>
                        <button>Evolve</button>
                        <button>Pause</button>
                        <button>Kill</button>
                    </div>
                </div>
                <div className="pulse-goal-item">
                    <span>Ship side-project MVP</span>
                    <div className="pulse-actions">
                        <button>Keep</button>
                        <button>Evolve</button>
                        <button>Pause</button>
                        <button>Kill</button>
                    </div>
                </div>
                <div className="pulse-goal-item">
                    <span>Spanish</span>
                    <div className="pulse-actions">
                        <button>Keep</button>
                        <button>Evolve</button>
                        <button>Pause</button>
                        <button>Kill</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Pulse