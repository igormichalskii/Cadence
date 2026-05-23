import { NavLink } from "react-router-dom"

function TabBar() {
    return (
        <>
            <NavLink
                to='/' end
            >
                Today
            </NavLink>
            <NavLink
                to='/goals'
            >
                Goals
            </NavLink>
            <NavLink
                to='/ask'
            >
                Ask
            </NavLink>
            <NavLink
                to='/pulse'
            >
                Pulse
            </NavLink>
        </>
    )
}

export default TabBar