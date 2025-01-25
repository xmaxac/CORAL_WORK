import React, {useState, useRef, useContext, useEffect} from 'react';
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MapPin, Calendar, Globe, Send, FileText, ShieldAlert, Image as ImageIcon, X, Pencil } from 'lucide-react';
import {GoogleMap, LoadScript, Autocomplete, Marker} from '@react-google-maps/api'
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '@/context/AppContext';
import { useTranslation } from 'react-i18next';


const libraries = ['places']

const NewReport = () => {
  const {token} = useContext(AppContext);
  const [data, setData] = useState({
    title: "",
    latitude: "",
    longitude: "",
    countryCode: "",
    description: "",
    reportDate: ""
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const [position, setPosition] = useState({});
  const [status, setStatus] = useState({type: '', message: ''});
  const mapRef = useRef(null);
  const autoCompleteRef = useRef(null);
  const {t} = useTranslation();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const {latitude, longitude} = position.coords;
          setPosition({lat: latitude, lng: longitude});
          setData(prev => ({
            ...prev,
            latitude: latitude.toFixed(8),
            longitude: longitude.toFixed(8)
          }));
          fetchCountryCode(latitude, longitude);
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    }
  }, [])

  const handleMapClick = (event) => {
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setPosition(newPosition);
    setData(prev => ({
      ...prev,
      latitude: newPosition.lat.toFixed(8),
      longitude: newPosition.lng.toFixed(8)
    }));
    fetchCountryCode(newPosition.lat, newPosition.lng);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];


    files.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setStatus({type: 'error', message: 'Please select an image file'});
        return;
      }

      if (file.size > 5 * 1025 * 1024) {
        setStatus({type: 'error', message: 'Image size should not exceed 5MB'});
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          url: reader.result,
          name: file.name
        });

        if (newPreviews.length === files.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);

      newImages.push(file);
    });

    setSelectedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;  
    setData(data=>({...data, [name]:value}))
  };

  const handlePositionChange = () => {
    const place = autoCompleteRef.current.getPlace();
    if (place.geometry) {
      const newPosition = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      }
      setPosition(newPosition);
      setData(prev => ({
        ...prev,
        latitude: newPosition.lat.toFixed(8),
        longitude: newPosition.lng.toFixed(8)
      }));
      fetchCountryCode(newPosition.lat, newPosition.lng)
    }

  };

  const fetchCountryCode = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
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

  const onSubmit = async (event) => {
    event.preventDefault();
    toast.info('Submitting your report...', {
      position: 'top-center',
      autoClose: 2000,
      hideProgressBar: true,
    });

    try {
      const formData = new FormData();

      Object.keys(data).forEach(key => {
        formData.append(key, data[key]);
      });

      selectedImages.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await axios.post("http://localhost:4000/api/report/create", formData, 
    {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    );
      if (response.data.success) {
        toast.success('Thank You! Your report has been successfully submitted.', {
          position: 'top-center',
          autoClose: 2000,
          hideProgressBar: true,
        });
        setData({
          title: '',
          latitude: '',
          longitude: '',
          countryCode: '',
          description: '',
          reportDate: ''
        });
        setPosition(null);
        setSelectedImages([]);
        setImagePreviews([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        throw new Error('Failed to submit report');
      }
    } catch (e) {
      console.error('Error submitting report:', e)
      toast.error('Oops! Something went wrong. Please try again.', {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
      });
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
                  <span>{t('newReport.form.title')}</span>
                </CardTitle>
                <CardDescription>
                {t('newReport.form.description')}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={onSubmit} className='space-y-6'>

                  {/*Location Details */}
                  <Card className="border border-blue-100">
                    <CardHeader className="py-4">
                      <CardTitle className="text-lg flex items-center space-x-2" >
                        <MapPin size={24} className='text-blue-500' />
                        <span>{t('newReport.form.locationDetails.title')}</span>
                      </CardTitle>
                    </CardHeader>
                    {/*Interactive Map */}
                    <CardContent className="space-y-4">
                      <div className='w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 relative'>
                        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY} libraries={libraries}>
                          <GoogleMap
                            mapContainerStyle={{height: "100%", width: "100%"}}
                            center={position}
                            zoom={7.5}
                            onLoad={map => (mapRef.current = map)}
                            onClick={handleMapClick}
                          >
                            {/* {window.google && window.google.maps && window.google.maps.marker && (
                              <window.google.maps.marker.AdvancedMarkerElement position={position} />
                            )} */}
                            <Marker 
                              position={position}/>
                            <Autocomplete onLoad={ref => (autoCompleteRef.current = ref)} onPlaceChanged={handlePositionChange}>
                              <Input 
                                type="text"
                                placeholder="Search location..."
                                className="absolute top-2 left-2 z-[0] pl-8 pr-4 py-2 w-64 bg-white shadow-lg"
                              />
                            </Autocomplete>
                          </GoogleMap>
                        </LoadScript>
                      </div>
                      <div className='grid grid-cols-3 gap-4'>
                        <div className='space-y-2'>
                          <Label htmlFor="latitude">{t('newReport.form.locationDetails.latitude')}</Label>
                          <Input
                            id="latitide"
                            name="latitude"
                            value={parseFloat(data.latitude).toFixed(8)}
                            onChange={handleChange}
                            placeholder={t('newReport.form.locationDetails.placeholder')}
                            readOnly
                            required
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor="longitude">{t('newReport.form.locationDetails.longitude')}</Label>
                          <Input
                            id="longitude"
                            name="longitude"
                            value={parseFloat(data.longitude).toFixed(8)}
                            onChange={handleChange}
                            placeholder={t('newReport.form.locationDetails.placeholder')}
                            readOnly
                            required
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label htmlFor="countryCode">{t('newReport.form.locationDetails.countryCode')}</Label>
                          <div className='relative'>
                            <Globe className="absolute left-2 top-[7px] h04 w-4 text-gray-400" />
                            <Input
                              id="countryCode"
                              name="countryCode"
                              value={data.countryCode}
                              className="pl-8"
                              placeholder={t('newReport.form.locationDetails.placeholder')}
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
                        <span>{t('newReport.form.reportDetails.title')}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className='space-y-2'>
                        <Label htmlFor="title">{t('newReport.form.reportDetails.reportTitle')}</Label>
                        <div className='relative'>
                          <Pencil className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="title"
                            name="title"
                            value={data.title}
                            onChange={handleChange}
                            placeholder={t('newReport.form.reportDetails.reportTitlePlaceholder')}
                            className="pl-8"
                            required
                          />

                        </div>
                      </div>
                    </CardContent>
                    <CardContent className="space-y-4">
                      <div className='space-y-2'>
                        <Label htmlFor="reportDate">{t('newReport.form.reportDetails.dateOfDiscovery')}</Label>
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
                        <Label htmlFor="photo">{t('newReport.form.reportDetails.photoUpload.title')}</Label>
                        <div className='space-y-2'>
                          <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            ref={fileInputRef}
                            className="hidden"
                          />
                          <div className='flex items-center gap-4'>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2"
                            >
                              <ImageIcon size={16} />
                              {t('newReport.form.reportDetails.photoUpload.addPhotos')}
                            </Button>
                            <span className='text-sm text-gray-500'>
                              {selectedImages?.length} {`${selectedImages?.length === 1} ` ? `${t('newReport.form.reportDetails.photoUpload.selectedPhotos')}` : `${t('newReport.form.reportDetails.photoUpload.multipleSelectedPhotos')}`}
                            </span>
                          </div>
                          {imagePreviews.length > 0 && (
                            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4'>
                              {imagePreviews.map((preview, index) => (
                                <div key={index} className='relative group'>
                                  <div className='w-full h-32 overflow-hidden rounded-lg'>
                                    <img
                                      src={preview.url}
                                      alt={preview.name}
                                      className='w-full h-full object-cover'
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X size={16}/>
                                  </Button>
                                  <p className='text-xs text-gray-500 mt-1 truncate'>
                                    {preview.name}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                          <p className='text-sm text-gary-500 mt-1'>
                            {t('newReport.form.reportDetails.photoUpload.resizeNote')}
                          </p>
                        </div>
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor="description">{t('newReport.form.reportDetails.description')}</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={data.description}
                          onChange={handleChange}
                          placeholder={t('newReport.form.reportDetails.descriptionPlaceholder')}
                          className="h-32 resize-none"
                          required
                        />
                      </div>
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
                  {t('newReport.form.buttons.clearForm')}
                </Button>
                <Button
                onClick={onSubmit}
                className="px-4"
                >
                  <Send className='mr-2 h-4 w-4' />
                  {t('newReport.form.buttons.submitForm')}
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
                  <span>{t('newReport.guidelines.title')}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  <Alert>
                    <AlertTitle className="font-medium">{t('newReport.guidelines.selectLocation.title')}</AlertTitle>
                    <AlertDescription>
                    {t('newReport.guidelines.selectLocation.description')}
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTitle className="font-medium">{t('newReport.guidelines.detailedDescription.title')}</AlertTitle>
                    <AlertDescription>
                    {t('newReport.guidelines.detailedDescription.description')}
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertTitle className="font-medium">{t('newReport.guidelines.recentDiscovery.title')}</AlertTitle>
                    <AlertDescription>
                    {t('newReport.guidelines.recentDiscovery.description')}
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