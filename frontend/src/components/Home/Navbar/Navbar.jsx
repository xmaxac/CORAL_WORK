import React from 'react'
import '../../../fonts/Gotham/GothamFont.css';
import { 
  HomeIcon,
  UserGroupIcon,
  DatabaseIcon,
  PlusIcon
} from '@heroicons/react/solid';

const Navbar = () => {
  return (
    <div className='relative flex items-center h-[70px] p-6'>
      <h1 className='absolute left-[3%] text-4xl ' style={{fontFamily: 'gothamBold'}}>CoralBase</h1>
      <ul className='absolute right-[6%] flex space-x-6 items-center' style={{fontFamily: 'gothamMedium'}}>
        <li className='px-[58px] flex items-center justify-center transition-transform duration-300 ease-in-out hover:translate-y-[-0.5rem] hover:cursor-pointer'>
          <HomeIcon className='w-[15px] mr-1'/>
          Home
        </li>
        <li className='px-[58px] flex items-center justify-center transition-transform duration-300 ease-in-out hover:translate-y-[-0.5rem] hover:cursor-pointer'>
          <UserGroupIcon className='w-[15px] mr-1'/>
          Community
        </li>
        <li className='px-[58px] flex items-center justify-center transition-transform duration-300 ease-in-out hover:translate-y-[-0.5rem] hover:cursor-pointer'>
          <DatabaseIcon className='w-[15px] mr-1'/>
          Database
        </li>
        <li className='px-[58px] flex items-center justify-center transition-transform duration-300 ease-in-out hover:translate-y-[-0.5rem] hover:cursor-pointer'>
          <PlusIcon className='w-[15px] mr-1'/>
          New Report
        </li>
      </ul>
    </div>
  )
}

export default Navbar