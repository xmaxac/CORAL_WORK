import React from 'react'
import {Map, Database, Camera, MessageSquare} from 'lucide-react'

const Home = () => {
  return (
    <div className='min-h-[79vh] bg-white'>
      <div className='max-w-7xl mt-[10vh] px-4 py-16'>
        <div className='max-w-7xl flex flex-row justify-between mx-4'>
          <div className='max-w-xl'>
            <h1 className='text-5xl font-bold text-gray-900 mb-6'>
              Unified Stony Coral Tissue Loss Disease Monitoring Platform
            </h1>
            <p className='text-xl text-gray-600 mb-8'>
                Join the global community tracking Stony Coral Tissue Loss Disease (SCTLD). 
                Log observations, analyze data, and collaborate with researchers worldwide to 
                protect coral reef ecosystems.
            </p>
          </div>
          <div>
            <div className='grid grid-cols-2 gap-4 mb-8'>
              <div className='p-4 bg-gray-100 rounded-lg'>
                <Map className='w-6 h-6 text-blue-500 mb-2'/>
                <h3 className='font-semibold mb-1'>Global Disease Mapping</h3>
                <p>Track the spread of SCTLD</p>
              </div>
              <div className='p-4 bg-gray-100 rounded-lg'>
                <Database className='w-6 h-6 text-blue-500 mb-2'/>
                <h3 className='font-semibold mb-1'>Data Analytics Tools</h3>
                <p>Unified coral health monitoring</p>
              </div>
              <div className='p-4 bg-gray-100 rounded-lg'>
                <Camera className='w-6 h-6 text-blue-500 mb-2'/>
                <h3 className='font-semibold mb-1'>Automated Detection</h3>
                <p>AI-powered disease analysis</p>
              </div>
              <div className='p-4 bg-gray-100 rounded-lg'>
                <MessageSquare className='w-6 h-6 text-blue-500 mb-2'/>
                <h3 className='font-semibold mb-1'>Research Community</h3>
                <p>Connect with marine scientists</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;