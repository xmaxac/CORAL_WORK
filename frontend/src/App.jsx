import React, {useState} from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import DataPage from './pages/DataPage/DataPage'
import NewReport from './pages/NewReport/NewReport'
import Community from './pages/Community/Community'
import Home from './pages/Home/Home'
import Navbar from '../src/components/Home/Navbar/Navbar'
import LoginPopup from './components/Home/LoginPopup/LoginPopup'
import ChatbotPopup from './components/Home/ChatBotPopup/ChatbotPopup'
import Profile from './pages/Profile/Profile'
import Info from './pages/Info/Info'
import PhotoDetection from './pages/PhotoDetection/PhotoDetection'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {X, MessageSquare} from 'lucide-react'


const App = () => {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)

  return (
    <div>
      {showLogin?<LoginPopup setShowLogin={setShowLogin}/>:<></>}
      {showChatbot?<ChatbotPopup setShowChatbot={setShowChatbot}/>:<></>}
      <Navbar setShowLogin={setShowLogin}/>
      <ToastContainer />
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/community' element={<Community/>}/>
        <Route path='/database' element={<DataPage/>}/>
        <Route path='/report' element={<NewReport/>}/>
        <Route path='/info' element={<Info/>}/>
        <Route path='/profile/:username' element={<Profile/>}/>
        <Route path='/detection' element={<PhotoDetection/>}/>
      </Routes>
      <div>
        <button className='z-[1000] fixed bottom-3 right-[15px] border border-none h-[50px] w-[50px] flex flex-col cursor-pointer rounded-[50%] bg-blue-500 items-center justify-center' onClick={() => setShowChatbot(!showChatbot)}>
          <span className='absolute text-white'>
            {!showChatbot ? <MessageSquare/> : <X/>}
          </span>
        </button>
      </div>
    </div>
  )
}

export default App