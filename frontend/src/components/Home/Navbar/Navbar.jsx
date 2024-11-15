import React from 'react'
import { useNavigate } from 'react-router-dom';
import '../../../fonts/Gotham/GothamFont.css';
import { 
  HomeIcon,
  UserGroupIcon,
  DatabaseIcon,
  PlusIcon
} from '@heroicons/react/solid';

const Navbar = () => {

  const navigate = useNavigate();

  return (
    <div className='select-none'>
      {/* Navbar */}
      <nav className='relative flex items-center h-[70px] p-6 bg-white border-b border-slate-200'>
        <h1 className='absolute left-[2%] text-3xl text-blue-500 hover:cursor-pointer' onClick={()=>navigate("/")} style={{fontFamily: 'gothamBold'}}>CoralBase</h1>
        <ul className='absolute left-[17%] flex space-x-6 items-center text-gray-600' style={{fontFamily: 'gothamLight'}}>
          <li className='flex items-center justify-center transition-transform duration-300 ease-in-out hover:translate-y-[-0.3rem] hover:cursor-pointer text-blue-500'>
            <HomeIcon className='w-[15px] mr-1'/>
            Home
          </li>
          <li className='flex items-center justify-center transition-transform duration-300 ease-in-out hover:translate-y-[-0.3rem] hover:cursor-pointer'>
            <UserGroupIcon className='w-[15px] mr-1'/>
            Community
          </li>
          <li className='flex items-center justify-center transition-transform duration-300 ease-in-out hover:translate-y-[-0.3rem] hover:cursor-pointer'>
            <DatabaseIcon className='w-[15px] mr-1'/>
            Database
          </li>
        </ul>
        <div className='absolute w-[130px] right-[5%] p-2 rounded-md bg-blue-500 text-white items-center justify-center hover:cursor-pointer hover:bg-blue-800'>
          <span className='flex items-center justify-center'>
            <PlusIcon className='w-[18px] mr-1'/>
            New Report
          </span>
        </div>
      </nav>
    </div>
  )
}

export default Navbar