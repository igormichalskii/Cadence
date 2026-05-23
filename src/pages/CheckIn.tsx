function CheckIn() {
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
                <button>Low</button>
                <button>Mid</button>
                <button>High</button>
            </div>
            <div className="mind">
                <button>Focused</button>
                <button>Scattered</button>
                <button>Heavy</button>
                <button>Calm</button>
                <button>Tired</button>
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
                <textarea name="question-area" id="question-area"></textarea>
            </div>
            <button>Set the day</button>
        </>
    )
}

export default CheckIn