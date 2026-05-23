import { Link } from "react-router-dom"

function Goals() {
    return (
        <>
            <div className="goals-header">
                <h2>Goals</h2>
                <button>+ Add</button>
            </div>
            <div className="goals-list">
                <Link to='/goals/morning-run'>
                    <div className="goal-item">
                        <span className="goal-type">habit</span>
                        <span className="goal-name">Morning run</span>
                        <span className="goal-status">active</span>
                    </div>
                </Link>
                <Link to='/goals/ship-side-project-mvp'>
                    <div className="goal-item">
                        <span className="goal-type">project</span>
                        <span className="goal-name">Ship side-project MVP</span>
                        <span className="goal-status">active</span>
                    </div>
                </Link>
                <Link to='/goals/spanish'>
                    <div className="goal-item">
                        <span className="goal-type">learning</span>
                        <span className="goal-name">Spanish</span>
                        <span className="goal-status">active</span>
                    </div>
                </Link>
                <Link to='/goals/read-serious-nonfiction'>
                    <div className="goal-item">
                        <span className="goal-type">direction</span>
                        <span className="goal-name">Read serious nonfiction</span>
                        <span className="goal-status">active</span>
                    </div>
                </Link>
            </div>
        </>
    )
}

export default Goals
