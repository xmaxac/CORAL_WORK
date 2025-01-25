import React from 'react'
import {Map, Database, Camera, MessageSquare} from 'lucide-react'
import { useTranslation } from "react-i18next";

const Home = () => {
  const {t} = useTranslation();

  return (
    <div className='min-h-[79vh] bg-white'>
      <div className={`max-w-7xl mt-[${t('global.vh')}] px-2 py-16 justify-between`}>
        <div className='max-w-7xl flex flex-col lg:flex-row justify-between mx-4'>
          <div className='max-w-lg mr-10 mb-8 lg:mb-0'>
            <h1 className='text-5xl font-bold text-gray-900 mb-6'>
              {t("home.landing.title")}
            </h1>
            <p className='text-xl text-gray-600 mb-8'>
                {t("home.landing.subtext")}
            </p>
          </div>
          <div>
            <div className='flex flex-wrap gap-4'>
              <div className='flex-1 p-4 bg-gray-100 rounded-lg min-w-[200px]'>
                <Map className='w-6 h-6 text-blue-500 mb-2'/>
                <h3 className='font-semibold mb-1'>{t("home.landing.feature.global.title")}</h3>
                <p>{t("home.landing.feature.global.subtext")}</p>
              </div>
              <div className='flex-1 p-4 bg-gray-100 rounded-lg min-w-[200px]'>
                <Database className='w-6 h-6 text-blue-500 mb-2'/>
                <h3 className='font-semibold mb-1'>{t("home.landing.feature.data.title")}</h3>
                <p>{t("home.landing.feature.data.subtext")}</p>
              </div>
              <div className='flex-1 p-4 bg-gray-100 rounded-lg min-w-[200px]'>
                <Camera className='w-6 h-6 text-blue-500 mb-2'/>
                <h3 className='font-semibold mb-1'>{t("home.landing.feature.auto.title")}</h3>
                <p>{t("home.landing.feature.auto.subtext")}</p>
              </div>
              <div className='flex-1 p-4 bg-gray-100 rounded-lg min-w-[200px]'>
                <MessageSquare className='w-6 h-6 text-blue-500 mb-2'/>
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