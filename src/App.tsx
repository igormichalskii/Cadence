import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Goals from './pages/Goals'
import Ask from './pages/Ask'
import Pulse from './pages/Pulse'
import CheckIn from './pages/CheckIn'
import Today from './pages/Today'
import TabBar from './components/TabBar'
import GoalDetail from './pages/GoalDetail'
import CreateGoal from './pages/CreateGoal'

function App() {

  return (
    <BrowserRouter>
      <TabBar />
      <Routes>
        <Route path='/' element={<Today />} />
        <Route path='/goals' element={<Goals />} />
        <Route path='/goals/new' element={<CreateGoal />} />
        <Route path='/goals/:id' element={<GoalDetail />} />
        <Route path='/ask' element={<Ask />} />
        <Route path='/pulse' element={<Pulse />} />
        <Route path='/checkin' element={<CheckIn />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
