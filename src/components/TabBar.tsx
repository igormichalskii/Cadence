import { NavLink } from "react-router-dom"
import { IconSun, IconTarget, IconMessageCircle, IconActivity } from "@tabler/icons-react"

// Bottom nav (UI-GUIDE §3). Four destinations; Ask is the centered "summon
// JARVIS" affordance (circled, raised). Insights is post-alpha — omitted.
function navClass({ isActive }: { isActive: boolean }): string {
    return isActive ? "nav-item active" : "nav-item"
}

function askClass({ isActive }: { isActive: boolean }): string {
    return isActive ? "nav-item nav-ask active" : "nav-item nav-ask"
}

function TabBar() {
    return (
        <nav className="bottom-nav">
            <NavLink to="/" end className={navClass} aria-label="Today">
                <IconSun size={20} stroke={1.5} />
                <span>Today</span>
            </NavLink>
            <NavLink to="/goals" className={navClass} aria-label="Goals">
                <IconTarget size={20} stroke={1.5} />
                <span>Goals</span>
            </NavLink>
            <NavLink to="/ask" className={askClass} aria-label="Ask JARVIS">
                <span className="ask-circle"><IconMessageCircle size={20} stroke={1.5} /></span>
                <span>Ask</span>
            </NavLink>
            <NavLink to="/pulse" className={navClass} aria-label="Pulse">
                <IconActivity size={20} stroke={1.5} />
                <span>Pulse</span>
            </NavLink>
        </nav>
    )
}

export default TabBar
