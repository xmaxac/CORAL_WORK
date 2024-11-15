import React from 'react'
import Navbar from '../../components/Home/Navbar/Navbar'
import {
  Map
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const Home = () => {
  return (
    <div>
      <Navbar/>
      {/* Main Content */}
      <div className='max-w-full mx-auto p-6 grid grid-cols-3 gap-6'>
        {/* Map Content */}
        <div className='col-span-2'>
          <Card className="h-[500px] " >
            <CardHeader>
              <CardTitle className="flex items-center justify-between" >
                <div className='flex items-center space-x-2'>
                  <Map size={20} />
                  <span>Global SCTLD Distribution</span>
                </div>
                <div className='flex items-center space-x-4'>
                  <select className='border rounded p-1 text-sm'>
                    <option>All</option>
                    <option>SCTLD Present</option>
                    <option>SCTLD May be Present</option>
                    <option>SCTLD Absent</option>
                    <option>New Submission - Under Review</option>
                  </select>
                  <select className='border rounded p-1 text-sm'>
                    <option>All Species</option>
                    <option>Susceptible Only</option>
                  </select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='bg-slate-100 h-[400px] rounded-lg flex items-center justify-center'>
                <span className='text-slate-500'>Interactive Map View</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
      </div>
    </div>
  )
}

export default Home;