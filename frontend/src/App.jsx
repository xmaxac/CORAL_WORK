/*
 * Main Application Component
 * 
 * This file serves as the central component that organizes all pages and functionality
 * for the application. It handles:
 * - Routing between different pages (Home, Community, Database, etc.)
 * - Managing popup components like Login and Chatbot
 * - Displaying a persistent chat button in the bottom-right corner
 */

import React, {useState, useEffect, useContext} from 'react'
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
import Group from './pages/Group/Group'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {X, MessageSquare, Lock} from 'lucide-react'
import Reference from './pages/Info/Reference'
import { AppContext } from './context/AppContext'
import ChatPage from './pages/Chat/ChatPage'
import GroupReportsPage from './pages/Group/[groupId]'

const DeveloperAccessPopup = ({ onValidAccess }) => {
  const [accessCode, setAccessCode] = useState('');
  const correctCode = 'developer123'; // Change this to your desired access code
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (accessCode === correctCode) {
      // Store in localStorage to maintain access after page refresh
      localStorage.setItem('developerAccess', 'granted');
      onValidAccess();
      toast.success('Developer access granted!');
    } else {
      toast.error('Invalid access code');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center justify-center mb-4 text-blue-500">
          <Lock size={48} />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6">Developer Access Required</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="access-code" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Developer Access Code
            </label>
            <input
              type="password"
              id="access-code"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Access code"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Submit
          </button>
        </form>
        
        <p className="mt-4 text-sm text-gray-500 text-center">
          This website is currently under development and restricted to authorized personnel only.
        </p>
      </div>
    </div>
  );
};


const App = () => {
  const location = useLocation();
  const [showLogin, setShowLogin] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [hasAccess, setHasAccess] = useState(false);
  const {user} = useContext(AppContext)
  
  // // Check for developer access on initial load
  // useEffect(() => {
  //   const accessStatus = localStorage.getItem('developerAccess');
  //   if (accessStatus === 'granted') {
  //     setHasAccess(true);
  //   }
  // }, []);

  // // Function to grant access when correct code is entered
  // const grantAccess = () => {
  //   setHasAccess(true);
  // };

  // // If no access, show only the developer access popup
  // if (!hasAccess) {
  //   return (
  //     <div>
  //       <DeveloperAccessPopup onValidAccess={grantAccess} />
  //       <ToastContainer />
  //     </div>
  //   );
  // }

  // Main Routing and rendering of components
  return (
    <div className=''>
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
        <Route path='/refrences' element={<Reference/>}/>
        <Route path='/chat' element={<ChatPage currentUserId={user?.id}/>}/>
        <Route path='/group' element={<Group />}/>
        <Route path="/group/:groupId" element={<GroupReportsPage />} />
      </Routes>
      <div>
        {location.pathname === '/chat' ? (
          null
        ): <button className='z-[1000] fixed bottom-3 right-[15px] border border-none h-[50px] w-[50px] flex flex-col cursor-pointer rounded-[50%] bg-blue-500 items-center justify-center' onClick={() => setShowChatbot(!showChatbot)}>
          <span className='absolute text-white'>
            {!showChatbot ? <MessageSquare/> : <X/>}
          </span>
        </button>}
      </div>
    </div>
  )
}

export default App