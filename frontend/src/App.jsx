import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import NewReport from './pages/NewReport/NewReport'
import Community from './pages/Community/Community'
import Database from './pages/Database/Database'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/community' element={<Community/>}/>
        <Route path='/database' element={<Database/>}/>
        <Route path='/report' element={<NewReport/>}/>
      </Routes>
    </div>
  )
}

export default App