import React, {useState, useRef} from 'react';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Calendar, Globe, Send, User, Mail, FileText, ShieldAlert, Search, Layers } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, ZoomControl, LayersControl} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from 'axios';

const {BaseLayer} = LayersControl;

const customIcon = L.icon({
  iconUrl: "/location-marker.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const LocationMarker = ({ position, setPosition }) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      icon={customIcon}
    />
  );
};

// const SearchControl = ({map, setPosition}) => {
//   const [searchQuery, setSearchQuery] = useState('');

//   const handleSearch = async () => {
//     try {
//       const response = await axios.get(
//         `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`
//       );

//       if (response.data && response.data.length > 0) {
//         const {lat, lng} = response.data[0];
//         newPos = [parseFloat(lat), parseFloat(lng)]
//         setPosition(newPos)
//         map.setView(newPos, 13);
//       }
//     } catch (e) {
//       console.error('Search Failed:', e);
//     }
//   };

//   return (
//     <div className='absolute top-2 left-2 z-[1000] flex gap-2'>
//       <div className='relative'>
//         <Search className='absolute left-2 top-3 h-4 w-4 text-gray-400' />
//         <Input
//           type="text"
//           placeholder="Search location..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//           className="pl-8 pr-4 py-2 w-64 bg-white shadow-lg"
//           onKeyPress={(e) => {
//             if (e.key === 'Enter') {
//               handleSearch();
//             }
//           }}
//         />
//       </div>
//       <Button onClick={handleSearch} variant="secondary" className="shadow-lg">
//         <Search className='h-4 w-4'/> 
//       </Button>
//     </div>
//   );
// };

const NewReport = () => {

  const [data, setData] = useState({
    name: "", 
    email: "",
    latitude: "",
    longitude: "",
    countryCode: "",
    description: "",
    reportDate: ""
  });

  const [position, setPosition] = useState(null);
  const [status, setStatus] = useState({type: '', message: ''});
  const mapRef = useRef(null);

  const handleChange = (event) => {
    const { name, value } = event.target;  
    setData(data=>({...data, [name]:value}))
  };

  const handlePositionChange = (newPosition) => {
    setPosition(newPosition);
    setData(prev => ({
      ...prev,
      latitude: newPosition[0].toFixed(8),
      longitude: newPosition[1].toFixed(8)
    }));

    const fetchCountryCode = async () => {
      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newPosition[0]}&lon=${newPosition[1]}`
        );
        if (response.data && response.data.address) {
          setData(prev => ({
            ...prev,
            countryCode: response.data.address.country_code.toUpperCase()
          }));
        }
      } catch (error) {
        console.error('Failed to fetch country code:', error);
      }
    };

    fetchCountryCode();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setStatus(({type: 'loading', message: 'Submitting your report...'}));

    try {
      const response = await axios.post("http://localhost:4000/api/report/create", data);
      if (response.data.success) {
        setStatus({ type: 'success', message: 'Thank You! Your report has been successfully submitted.' });
        setData({
          name: '',
          email: '',
          latitude: '',
          longitude: '',
          countryCode: '',
          description: '',
          reportDate: ''
        });
        setPosition(null);
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (e) {
      setStatus({type: 'error', message: 'Oops! Something went wrong. Please try again.'});
    }

    setTimeout(() => setStatus({type: '', message: ''}), 2000);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-6xl mx-auto p-6'>
        <div className='grid grid-cols-3 gap-6'>
          {/*Main Form */}
          <div className='col-span-2'>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText size={24} className='text-blue-500' />
                  <span>Submit New Report </span>
                </CardTitle>
                <CardDescription>
                  Help us track and monitor coral health by submitting your observations
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={onSubmit} className='space-y-6'>
                  {/*Personal Info*/}
                  <Card className="border border-blue-100">
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <User size={18} className='text-blue-500'/>
                        <span>Personal Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                      <div className='space-y-2'>
                        <Label htmlFor="name">Full Name</Label>
                        <div className='relative'>
                          <User className='absolute left-2 top-3 h-4 w-4 text-gray-400' />
                          <Input
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={handleChange}
                            className="pl-8"
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor="email">Email Address</Label>
                        <div className='relative'>    
                          <Mail className='absolute left-2 top-3 h-4 w-4 text-gray-400' />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={handleChange}
                            className="pl-8"
                            placeholder="john@example.com" 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/*Location Details */}
                  <Card className="border border-blue-100">
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg flex items-center space-x-2" >
                        <MapPin size={18} className='text-blue-500' />
                        <span>Location Details</span>
                      </CardTitle>
                    </CardHeader>
                    {/*Interactive Map */}
                    <CardContent className="space-y-4">
                      <div className='w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 relative'>
                        <MapContainer
                        center={[26, -81]}
                        zoom={6.5}
                        style={{height: "100%", width: "100%"}}
                        ref={mapRef}
                        zoomControl={false}
                        >
                          <ZoomControl position='bottomright' />
                          <LayersControl position='bottomright'>
                            <BaseLayer checked name='Street Map'>
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                              />
                            </BaseLayer>
                            <BaseLayer name='Satellite'>
                              <TileLayer
                                  attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                                  url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
                                />
                            </BaseLayer>
                          </LayersControl>
                          <LocationMarker position={position} setPosition={handlePositionChange} />
                          {/* {mapRef.current && <SearchControl map={mapRef.current} setPosition={handlePositionChange}/>} */}
                        </MapContainer>
                      </div>

                      <div className='grid grid-cols-3 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor="latitude">Latitude*</Label>
                          <Input
                            id="latitide"
                            name="latitude"
                            value={data.latitude}
                            onChange={handleChange}
                            placeholder="Click on map"
                            readOnly
                            required
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor="longitude">Longitude*</Label>
                          <Input
                            id="longitude"
                            name="longitude"
                            value={data.longitude}
                            onChange={handleChange}
                            placeholder="Click on map"
                            readOnly
                            required
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor="countryCode">Country Code*</Label>
                          <div className='relative'>
                            <Globe className="absolute left-2 top-[7px] h04 w-4 text-gray-400" />
                            <Input
                              id="countryCode"
                              name="countryCode"
                              value={data.countryCode}
                              onChange={handleChange}
                              className="pl-8"
                              placeholder="Click on map"
                              maxLength="2"
                              readOnly
                              required 
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/*Report Details */}
                  <Card className="border border-blue-100">
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg flex items-center space-x-2">
                        <FileText size={18} className='text-blue-500'/>
                        <span>Report Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className='space-y-2'>
                        <Label htmlFor="reportDate">Date of Discovery*</Label>
                        <div className='relative'>
                          <Calendar className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="reportDate"
                            name="reportDate"
                            type="date"
                            value={data.reportDate}
                            onChange={handleChange}
                            className="pl-8"
                            required 
                          />
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={data.description}
                          onChange={handleChange}
                          placeholder="Please provide a detailed description of your discovery..."
                          className="h-32 resize-none"
                          required
                        />
                      </div>
                      {/*Status Card*/}
                      {
                      status.message && (
                        <Alert variant={status.type === 'error' ? 'destructive' : 'default'}>
                          <AlertTitle>{status.type === 'error' ? 'Error':'Success'}</AlertTitle>
                          <AlertDescription>{status.message}</AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                </form>
              </CardContent>

              <CardFooter className="flex justify-end space-x-4">
                <Button
                variant="outline"
                onClick={() => {
                  setData({
                    name: '',
                    email: '',
                    latitude: '',
                    longitude: '',
                    countryCode: '',
                    description: '',
                    reportDate: ''
                  });
                  setPosition(null);
                }}
                >
                  Clear Form
                </Button>
                <Button
                onClick={onSubmit}
                className="px-4"
                >
                  <Send className='mr-2 h-4 w-4' />
                  Submit Form
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/*Side Bar*/}
          <div className='space-y-6'>
            {/*GuideLine Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShieldAlert size={20} />
                  <span>Reporting Guidelines</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <Alert>
                    <AlertTitle className="font-medium">Select Location</AlertTitle>
                    <AlertDescription>
                      Click on the map to place a marker at the approximate location of your discovery
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTitle className="font-medium">Detailed Description</AlertTitle>
                    <AlertDescription>
                      Include observation about coral condition, water quality, and surrounding enviroment
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTitle className="font-medium">Recent Discovery</AlertTitle>
                    <AlertDescription>
                      Report findings within 48 hours for most effective monitoring 
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewReport;