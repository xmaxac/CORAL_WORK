import React, { useState, useEffect, useRef, useContext } from 'react'
import axios from "axios";
import {
  Map,
  Clipboard,
  ShieldAlert
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css'
import { Alert, AlertDescription, AlertTitle,  } from "@/components/ui/alert"
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow
} from "@react-google-maps/api";
import { ChartContainer,ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis, YAxis  } from 'recharts';
import { AppContext } from '@/context/AppContext';
import {useNavigate} from 'react-router-dom'
import { data } from 'autoprefixer';

const libraries = ["places"];

const DataPage = () => {
  
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [pos, setPos] = useState({ lat: 0, lng: 0 });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [latestReports, setLatestReports] = useState([]);
  const {token, url} = useContext(AppContext);
  const mapRef = useRef(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const {latitude, longitude} = position.coords;
          setPos({lat: latitude, lng: longitude});
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }

    const fetchCountryData = async () => {
      try {
        const response = await axios.get(`${url}/api/report/country`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data.data;

        setChartData(data);
      } catch (e) {
        console.error('Error fecthing data:', e)
      }
    };

    const fetchLatestReports = async () => {
      try {
        const response = await axios.get(`${url}/api/report/latest-reports`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data.data;

        setLatestReports(data);
      } catch (e) {
        console.error('Error fetching latest reports:', e);
      }
    };

    const fetchReports = async () => {
      try {
        const response = await axios.get(`${url}/api/report/all`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = response.data.reports;

        if (Array.isArray(data)) {
          setLocations(data);
        } else {
          console.error('Expected an array but got:', data);
        }
      } catch (e) {
        console.error('Error fetching locations:', e)
      }
    };

    fetchReports()
    fetchLatestReports();
    fetchCountryData();
  }, [token, url])

  const handleReportClick = () => {
    navigate(`/community`);
  }

  const truncateDescription = (description, maxLength) => {
    if (description.length > maxLength) {
      return description.substring(0, maxLength) + '...'
    }
    return description;
  };

  const ChartConfig = {
    cases : {
      label: "# of Cases ",
      color: "#3b82f6"
    }
  }

  
  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: location.latitude, lng: location.longitude });
    }
  };

  const maxCases = chartData.length > 0 ? Math.max(...chartData.map(data => data.cases)) : 0;

  return (
    <>
    {token ? (
      <div>
        {/* Main Content */}
        <div className='max-w-full mx-auto p-6 grid grid-cols-3 gap-6'>
          {/* Map Content */}
          <div className='col-span-2'>
            <Card className="h-[512px] select-none" >
              <CardHeader>
                <CardTitle className="flex items-center justify-between" >
                  <div className='flex items-center space-x-2'>
                    <Map size={20} />
                    <span>Global SCTLD Distribution</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='bg-slate-100 h-[400px] rounded-lg flex items-center justify-center '>
                  <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY} libraries={libraries}>
                    <GoogleMap
                      mapContainerStyle={{ height: "400px", width: "765px" }}
                      center={pos}
                      zoom={6.5}
                      onLoad={map => (mapRef.current = map)}
                    >
                      {locations.map((location) => (
                        <Marker 
                          key={location.id}
                          position={{ lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) }}
                          onClick={() => handleMarkerClick(location)}
                        />
                      ))}
                      {selectedLocation && (
                        <InfoWindow
                          position={{ lat: parseFloat(selectedLocation.latitude), lng: parseFloat(selectedLocation.longitude) }}
                          onCloseClick={() => setSelectedLocation(null)}
                        >
                          <div>
                            {selectedLocation.photos && selectedLocation.photos[0] != null ? (
                                selectedLocation.photos.length === 1 ? (
                                  <img src={selectedLocation.photos[0]} alt={selectedLocation.title} style={{ width: '100%' }} />
                                ) : (
                                  <Carousel showThumbs={false}>
                                    {selectedLocation.photos.map((photo, index) => (
                                      <div key={index}>
                                        <img src={photo} alt={`${selectedLocation.title} ${index + 1}`} style={{ width: '100%' }} />
                                      </div>
                                    ))}
                                  </Carousel>
                                )
                              ) : (
                                <></>
                              )}
                            <h3>{selectedLocation.title}</h3>
                            <div style={{ maxHeight: '100px', overflowY: 'auto'}}>
                              <p>{selectedLocation.description}</p>
                            </div>
                          </div>
                        </InfoWindow>
                      )}
                    </GoogleMap>
                  </LoadScript>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className='space-y-3'>
            {/* Bar Chart */}
            <Card className="h-[300px] select-none" >
              <CardHeader>
                <CardTitle className="flex items-center justify-between" >
                  <div className='flex items-center space-x-2'>
                    <Clipboard size={20}/>
                    <span># of Reports For SCTLD Per Location</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[210px] rounded-lg flex items-center justify-center">
                  {chartData && chartData.length > 0 ? (
                    <ChartContainer config={ChartConfig} className="min-h-[210px] w-full">
                      <BarChart accessibilityLayer data={chartData}>
                        <XAxis
                          dataKey="country"
                          tickMargin={10}
                          tickLine={false}
                          tickFormatter={(value) => value.slice(0, 3)}
                          axisLine={false}
                        />
                        {chartData && chartData.length > 0 && (
                          <YAxis
                            domain={[0, maxCases]}
                            axisLine={false}
                            tickLine={false}
                            tickMargin={10}
                          />
                        )}
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="cases" fill="var(--color-cases)" radius={4} />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <p className="text-center my-4">No Country Data👻</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports */}
            <Card className="select-none" >
              <CardHeader className="py-3" >
                <CardTitle className="text-lg">Recent Reports</CardTitle>
              </CardHeader>
              <CardContent className="pb-4" >
                {latestReports.length > 0 ? (
                  <div className='space-y-1' >
                    {latestReports.map(report => (
                      <Alert key={report.id} onClick={() => handleReportClick()} className="cursor-pointer">
                        <ShieldAlert className='h-4 w-4'/>
                        <AlertTitle>{report.title}</AlertTitle>
                        <AlertDescription>{truncateDescription(report.description, 40)}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <p className="text-center my-4">No Recent Reports👻</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    ) : (
      <div className="flex items-center justify-center h-screen">
        <p className="text-center text-xl">Sign in/Sign Up to view this page</p>
      </div>
    )}
    </>
  )
}

export default DataPage;