/**
 * Home Page Component
 * 
 * This component displays the main landing page of the application with:
 * - A headline and introduction text
 * - Four feature cards highlighting key capabilities of the platform
 * 
 * The layout is responsive, changing from a single column on mobile devices
 * to a two-column layout on larger screens.
 */

import React from 'react'
import {Map, Database, Camera, MessageSquare} from 'lucide-react'
import { useTranslation } from "react-i18next";

const Home = () => {
  // Translation function for multi-language support
  const {t} = useTranslation();

  return (
    <div className='min-h-[79vh] bg-white'>
      {/* Main container with responsive padding */}
      <div className={`max-w-7xl mt-[${t('global.vh')}] px-2 py-16 justify-between`}>
        <div className='max-w-7xl flex flex-col lg:flex-row justify-between mx-4'>
          {/* Left column with headline and introduction text */}
          <div className='max-w-lg mr-10 mb-8 lg:mb-0'>
            <h1 className='text-5xl font-bold text-gray-900 mb-6'>
              {t("home.landing.title")}  {/* Main headline from translation */}
            </h1>
            <p className='text-xl text-gray-600 mb-8'>
                {t("home.landing.subtext")}  {/* Introduction paragraph from translation */}
            </p>
          </div>
          
          {/* Right column with feature cards */}
          <div>
            <div className='flex flex-wrap gap-4'>
              {/* Feature 1: Global Coverage */}
              <div className='flex-1 p-4 bg-gray-100 rounded-lg min-w-[200px]'>
                <Map className='w-6 h-6 text-blue-500 mb-2'/>  {/* Map icon */}
                <h3 className='font-semibold mb-1'>{t("home.landing.feature.global.title")}</h3>
                <p>{t("home.landing.feature.global.subtext")}</p>
              </div>
              
              {/* Feature 2: Data Analysis */}
              <div className='flex-1 p-4 bg-gray-100 rounded-lg min-w-[200px]'>
                <Database className='w-6 h-6 text-blue-500 mb-2'/>  {/* Database icon */}
                <h3 className='font-semibold mb-1'>{t("home.landing.feature.data.title")}</h3>
                <p>{t("home.landing.feature.data.subtext")}</p>
              </div>
              
              {/* Feature 3: Automatic Detection */}
              <div className='flex-1 p-4 bg-gray-100 rounded-lg min-w-[200px]'>
                <Camera className='w-6 h-6 text-blue-500 mb-2'/>  {/* Camera icon */}
                <h3 className='font-semibold mb-1'>{t("home.landing.feature.auto.title")}</h3>
                <p>{t("home.landing.feature.auto.subtext")}</p>
              </div>
              
              {/* Feature 4: Research & Chat */}
              <div className='flex-1 p-4 bg-gray-100 rounded-lg min-w-[200px]'>
                <MessageSquare className='w-6 h-6 text-blue-500 mb-2'/>  {/* Message icon */}
                <h3 className='font-semibold mb-1'>{t("home.landing.feature.research.title")}</h3>
                <p>{t("home.landing.feature.research.subtext")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;