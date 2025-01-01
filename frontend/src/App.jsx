import React, {useState} from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import NewReport from './pages/NewReport/NewReport'
import Community from './pages/Community/Community'
import Database from './pages/Database/Database'
import Navbar from '../src/components/Home/Navbar/Navbar'
import LoginPopup from './components/Home/LoginPopup/LoginPopup'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {

  const [showLogin, setShowLogin] = useState(false)

  return (
    <div>
      {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      <Navbar setShowLogin={setShowLogin}/>
      <ToastContainer />
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