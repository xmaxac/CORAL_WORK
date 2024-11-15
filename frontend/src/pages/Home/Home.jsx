import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../../components/Home/Navbar/Navbar'
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { ChartContainer,ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Bar, BarChart, XAxis  } from 'recharts';

const Home = () => {

  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const mapRef = useRef(null);

  const chartData = [
    {country: "FL", cases: "37"},
    {country: "MEX", cases: "45"},
    {country: "JAM", cases: "53"},
    {country: "DOM", cases: "23"},
    {country: "BHS", cases: "97"},
    {country: "TCA", cases: "15"}

  ]

  const ChartConfig = {
    cases : {
      label: "# of Cases",
      color: "#3b82f6"
    }
  }

  const customIcon = L.icon({
    iconUrl: "/location-marker.png", // Make sure this path is correct
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30], // Add this to position popups above markers
  });
  
  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    if (mapRef.current) {
      const map = mapRef.current;
      map.flyTo(
        [location.attributes.latitude, location.attributes.longitude],
        14,
      );
    }
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:1337/api/locations?populate=photo");
        
        if (response.data && response.data.data) {
          // Process and validate each location
          console.log(response.data)
          console.log(response.data.data)
          const processedLocations = response.data.data.filter(location => {
            // Check if location and attributes exist
            return location && 
                   typeof location.latitude === 'number' &&
                   typeof location.longitude === 'number' &&
                   !isNaN(location.latitude) &&
                   !isNaN(location.longitude);
          }).map(location => ({
            id: location.id,
            latitude: location.latitude,
            longitude: location.longitude,
            name: location.name,
            description: location.description,

          }));
          setLocations(processedLocations);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const MapEventHandler = () => {
    const map = useMap();
    useEffect(() => {
      mapRef.current = map;
    }, [map]);
    return null;
  };

  return (
    <div>
      <Navbar/>
      {/* Main Content */}
      <div className='max-w-full mx-auto p-6 grid grid-cols-3 gap-6'>
        {/* Map Content */}
        <div className='col-span-2'>
          <Card className="h-[500px] select-none" >
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
              <div className='bg-slate-100 h-[400px] rounded-lg flex items-center justify-center '>
                <MapContainer
                  center={[26, -81]}
                  zoom={6.5}
                  style={{height: "400px", width: "765px"}}
                  ref={mapRef}
                >
                  <MapEventHandler />
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {locations.map((location) => (
                    <Marker
                      key={location.id}
                      position={[
                        location.latitude,
                        location.longitude
                    ]}
                    icon={customIcon}
                    eventHandlers={{
                      click: () => handleMarkerClick(location)
                    }}
                    >
                      <Popup>
                        <div
                          style={{width: "300px", height: "Auto", padding: "10px"}}
                        >
                          <h3>{location.name}</h3>
                          {selectedLocation?.id === location.id && (
                            <div>
                              <p>{location.description}</p>
                              {/* {location.photoUrl && (
                                <img 
                                src={location.photoUrl}
                                alt={location.name}
                                style={{ maxWidth: "100%", height: "auto" }}
                                />
                              )} */}
                            </div>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
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
                  <ChartContainer config={ChartConfig} className="min-h-[210px] w-full">
                    <BarChart accessibilityLayer data={chartData}>
                      <XAxis
                        dataKey="country"
                        tickMargin={10}
                        tickLine={false}
                        tickFormatter={(value) => value.slice(0, 3)}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="cases" fill="var(--color-cases)" radius={4} />
                    </BarChart>
                  </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card className="select-none" >
            <CardHeader>
              <CardTitle className="text-lg">Recent Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-1' >
                <Alert>
                  <ShieldAlert className="h-4 w-4"/>
                  <AlertTitle>Deer Key Florida</AlertTitle>
                  <AlertDescription>
                    Coral Bleaching Reported in Deer Key
                  </AlertDescription>
                </Alert>
                <Alert>
                  <ShieldAlert className="h-4 w-4"/>
                  <AlertTitle>Sombrero Reef Florida</AlertTitle>
                  <AlertDescription>
                    Coral Disease Reported in Sombrero Reef
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Home;