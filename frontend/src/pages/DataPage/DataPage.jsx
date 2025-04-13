/**
 * Data Page Component
 * 
 * This component displays a dashboard with:
 * - An interactive map showing report locations with markers
 * - A bar chart showing report counts by country
 * - A list of recent reports with alerts
 * 
 * The page requires user authentication to access content.
 * If a user is not logged in, they will see a message prompting them to sign in.
 */

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
import { useTranslation } from 'react-i18next';

// Required libraries for Google Maps
const libraries = ["places"];

const DataPage = () => {
  // Navigation function to change page
  const navigate = useNavigate();
  
  // State variables to store data and UI states
  const [locations, setLocations] = useState([]);  // All report locations for map markers
  const [pos, setPos] = useState({ lat: 0, lng: 0 });  // Current map position
  const [selectedLocation, setSelectedLocation] = useState(null);  // Currently selected marker
  const [chartData, setChartData] = useState([]);  // Data for country bar chart
  const [latestReports, setLatestReports] = useState([]);  // Recent reports for sidebar
  
  // Get authentication token and API URL from app context
  const {token, url} = useContext(AppContext);
  
  // Reference to the map object for programmatic control
  const mapRef = useRef(null);

  // Translation function for multi-language support
  const { t } = useTranslation();

  // Effect that runs when component loads or when dependencies change
  useEffect(() => {
    // Get user's current location for map centering
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

    // Fetch country data for bar chart
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

    // Fetch latest reports for sidebar alerts
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

    // Fetch all reports for map markers
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

    // Call all data fetching functions
    fetchReports()
    fetchLatestReports();
    fetchCountryData();
  }, [token, url])  // Re-run this effect if token or URL changes

  // Navigate to community page when clicking a recent report
  const handleReportClick = () => {
    navigate(`/community`);
  }

  // Shorten long descriptions with ellipsis
  const truncateDescription = (description, maxLength) => {
    if (description.length > maxLength) {
      return description.substring(0, maxLength) + '...'
    }
    return description;
  };

  // Configuration for the bar chart appearance
  const ChartConfig = {
    cases : {
      label: "# of Cases ",
      color: "#3b82f6"
    }
  }

  // Handle clicking on a map marker
  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    // Center the map on the selected marker
    if (mapRef.current) {
      mapRef.current.panTo({ lat: location.latitude, lng: location.longitude });
    }
  };

  // Calculate maximum value for chart Y-axis scale
  const maxCases = chartData.length > 0 ? Math.max(...chartData.map(data => data.cases)) : 0;

  return (
    <>
    {/* Only show content if user is logged in (has a token) */}
    {token ? (
      <div>
        {/* Main Content */}
        <div className='max-w-full mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
          {/* Map Section - Takes 2/3 of screen on medium screens and larger */}
          <div className='w-full md:col-span-2'>
            <Card className="h-[300px] md:h-[512px] select-none" >
              <CardHeader>
                <CardTitle className="flex items-center justify-between" >
                  <div className='flex items-center space-x-2'>
                    <Map size={20} />
                    <span>{t('data.map.title')}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent >
                <div className='w-full h-96 mb-6 bg-slate-100 rounded-lg flex items-center justify-center '>
                  {/* Google Maps Component */}
                  <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY} libraries={libraries}>
                    <GoogleMap
                      mapContainerStyle={{ height: "100%", width: "100%" }}
                      center={pos}
                      zoom={6.5}
                      onLoad={map => (mapRef.current = map)}
                    >
                      {/* Create a marker for each report location */}
                      {locations.map((location) => (
                        <Marker 
                          key={location.id}
                          position={{ lat: parseFloat(location.latitude), lng: parseFloat(location.longitude) }}
                          onClick={() => handleMarkerClick(location)}
                        />
                      ))}
                      
                      {/* Show info window when a marker is selected */}
                      {selectedLocation && (
                        <InfoWindow
                          position={{ lat: parseFloat(selectedLocation.latitude), lng: parseFloat(selectedLocation.longitude) }}
                          onCloseClick={() => setSelectedLocation(null)}
                        >
                          <div>
                            {/* Show photos if available */}
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

          {/* Sidebar - Takes 1/3 of screen on medium screens and larger */}
          <div className='grid grid-cols-1 gap-4'>
            {/* Bar Chart Section */}
            <Card className="h-[250px] md:h-[300px] select-none" >
              <CardHeader>
                <CardTitle className="flex items-center justify-between" >
                  <div className='flex items-center space-x-2'>
                    <Clipboard size={20}/>
                    <span>{t('data.country.title')}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[210px] rounded-lg flex items-center justify-center">
                  {/* Show bar chart if data is available */}
                  {chartData && chartData.length > 0 ? (
                    <ChartContainer config={ChartConfig} className="min-h-[210px] w-full">
                      <BarChart accessibilityLayer data={chartData}>
                        <XAxis
                          dataKey="country"
                          tickMargin={10}
                          tickLine={false}
                          tickFormatter={(value) => value.slice(0, 3)}  // Show only first 3 characters of country name
                          axisLine={false}
                        />
                        {chartData && chartData.length > 0 && (
                          <YAxis
                            domain={[0, maxCases]}  // Set Y-axis scale based on maximum value
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
                    <p className="text-center my-4">{t('data.none.country')}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reports Section */}
            <Card className="select-none" >
              <CardHeader className="py-3" >
                <CardTitle className="text-lg">{t('data.recentReports.title')}</CardTitle>
              </CardHeader>
              <CardContent className="pb-4" >
                {/* Show alerts for recent reports if available */}
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
                  <p className="text-center my-4">{t("data.none.reports")}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    ) : (
      // Show sign-in message if user is not logged in
      <div className="flex items-center justify-center h-screen">
        <p className="text-center text-xl">{t('global.signToView')}</p>
      </div>
    )}
    </>
  )
}

export default DataPage;