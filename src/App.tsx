import './App.css'
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { sync } from './lib/sync'
import Goals from './pages/Goals'
import Ask from './pages/Ask'
import Pulse from './pages/Pulse'
import CheckInPage from './pages/CheckInPage'
import Today from './pages/Today'
import TabBar from './components/TabBar'
import GoalDetail from './pages/GoalDetail'
import CreateGoal from './pages/CreateGoal'

// Focused flows (check-in, pulse, goal detail/create) hide the bottom nav and
// use back / close navigation instead. See UI-GUIDE §3, §7.
function isFocusedFlow(path: string): boolean {
  return path === '/checkin' || path === '/pulse' || path.startsWith('/goals/')
}

function Layout() {
  const { pathname } = useLocation()
  const focused = isFocusedFlow(pathname)

  // Pull on launch and whenever the app regains focus (e.g. switching back to
  // the PWA on the phone). No-op until a sync passphrase is set.
  useEffect(() => {
    void sync()
    function onVisible() { if (document.visibilityState === 'visible') void sync() }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])
  return (
    <>
      <main className={focused ? 'app-content' : 'app-content with-nav'}>
        <Routes>
          <Route path='/' element={<Today />} />
          <Route path='/goals' element={<Goals />} />
          <Route path='/goals/new' element={<CreateGoal />} />
          <Route path='/goals/:id' element={<GoalDetail />} />
          <Route path='/ask' element={<Ask />} />
          <Route path='/pulse' element={<Pulse />} />
          <Route path='/checkin' element={<CheckInPage />} />
        </Routes>
      </main>
      {!focused && <TabBar />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
