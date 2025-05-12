/**
 * NewReport Page Component
 * 
 * This component allows users to submit a new stony coral tissue loss disease report.
 * Users can provide details about the location, reef, and report, and upload photos.
 * The form includes guidelines for submitting a report.
 * 
 * The page requires user authentication to access content.
 */

import React, { useState, useRef, useContext, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  MapPin,
  Calendar,
  Globe,
  Send,
  FileText,
  ShieldAlert,
  Image as ImageIcon,
  X,
  Pencil,
  Loader2,
  Waves,
  File,
  Video,
  FileVideo,
} from "lucide-react";
import {
  GoogleMap,
  LoadScript,
  Autocomplete,
  Marker,
} from "@react-google-maps/api";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "@/context/AppContext.jsx";
import { useTranslation } from "react-i18next";

const libraries = ["places"];

const DetectionPopup = ({ detection, isOpen, onClose}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">AI Detection Results</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {detection ? (
          <div className="space-y-4">
            {detection.error ? (
              <Alert variant="destructive">
                <AlertTitle>Detecton Failed</AlertTitle>
                <AlertDescription>unable to analyze this image. Please try again later.</AlertDescription>
              </Alert>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <h4 className="font-medium mb-2">Detection Summary</h4>
                    <img
                      src={detection}
                      alt="YOLO detection"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2">Loading detection results...</span>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  )
}

const NewReport = () => {

  // Access application-wide data like authentication token
  const { token } = useContext(AppContext);

  // State to store form data
  const [data, setData] = useState({
    title: "",
    latitude: "",
    longitude: "",
    countryCode: "",
    description: "",
    reportDate: "",
    reefName: "",
    reefType: "",
    averageDepth: "",
    waterTemp: "",
  });

  // State to store selected images and image previews
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedVids, setSelectedVids] = useState([]);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);

  //State to store AI detection of images
  const [ImageDetections, setImageDetections] = useState([]);
  const [showDetectionPopup, setShowDetectionPopup] = useState(false);
  const [currentDetectionIndex, setCurrentDetectionIndex] = useState(null);

  // State to store map position and status message
  const [position, setPosition] = useState({});
  const mapRef = useRef(null);
  const autoCompleteRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // Access application-wide data like API URL
  const { url } = useContext(AppContext);

  // Hook for handling multi-language text translation
  const { t } = useTranslation();


  useEffect(() => {
    // Get current location of the user in order to center map if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPosition({ lat: latitude, lng: longitude });
          setData((prev) => ({
            ...prev,
            latitude: latitude.toFixed(8),
            longitude: longitude.toFixed(8),
          }));
          fetchCountryCode(latitude, longitude);
        },
        (error) => {
          console.error("Error getting current location:", error);
        }
      );
    }
  }, []);

  const handleMapClick = (event) => {
    // Get the latitude and longitude of the clicked location on the map
    const newPosition = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    setPosition(newPosition);
    setData((prev) => ({
      ...prev,
      latitude: newPosition.lat.toFixed(8),
      longitude: newPosition.lng.toFixed(8),
    }));
    fetchCountryCode(newPosition.lat, newPosition.lng);
  };

  const detectImage = async (file, index) => {
    try {
      const formData = new FormData();
      formData.append("file", file);


      const response = await axios.post(`https://yolo.coralbase.net/sctldDetection_imgstreaming/0.7/0.75`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "image/jpeg" });

      if (blob.size > 0) {
        const url = URL.createObjectURL(blob);
        setImageDetections(prev => {
          const newDetections = [...prev];
          newDetections[index] = url;
          return newDetections;
        });
      }

      return response.data;
    } catch (e) {
      console.error("AI Dectection Error:", e);
      toast.error("AI detection failed. Please try again.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const handleImageUpload = (e) => {
    // Handle image upload and preview
    const files = Array.from(e.target.files);
    const newImages = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file", {
          position: "top-center", autoClose: 2000, hideProgressBar: true,});
      }

      if (file.size > 5 * 1025 * 1024) {
        toast.error("Image size should not exceed 5MB", {
          position: "top-center", autoClose: 2000, hideProgressBar: true,});
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          url: reader.result,
          name: file.name,
        });

        if (newPreviews.length === files.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);

      newImages.push(file);

      const currentIndex = selectedImages.length + newImages.length - 1;
      toast.info(`Analyzing image: ${file.name}...`, {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });

      detectImage(file, currentIndex).then(result => {
        if (!result.error) {
          toast.success(`AI analysis complete for: ${file.name}`, {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
          });
        }
      });
    });

    setSelectedImages((prev) => [...prev, ...newImages]);
  };

  const getFileIcon = (type) => {
    if (type.includes("pdf")) return <FileText className="text-red-500" />;
    if (type.includes("document")) return <FileText className="text-blue-500" />;
    if (type.includes("excel") || type.includes("sheet")) return <FileText className="text-green-500" />;
    if (type.includes("presentation")) return <FileText className="text-orange-500" />;
    return <FileText className="text-gray-500" />;
  }

  const truncateFileName = (fileName, maxLength) => {
    if (fileName.length > maxLength) {
      return fileName.substring(0, maxLength) + '...'
    }
    return fileName;
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    const docPreviews = files.map(file => ({
      file,
      name: file.name,
      type: file.type,
    }));
  
    setSelectedDocs(prev => [...prev, ...docPreviews]);
  }

  const showDetectionResults = (index) => {
    setCurrentDetectionIndex(index);
    setShowDetectionPopup(true);
  }

  const removeImage = (index) => {
    // Remove image from selected images and previews
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    const videoPreviews = files.map(file => ({
      file,
      name: file.name,
      type: file.type
    }));

    setSelectedVids(prev => [...prev, ...videoPreviews]);
  }

  const handleChange = (event) => {
    // Handle form input changes
    const { name, value } = event.target;
    setData((data) => ({ ...data, [name]: value }));
  };

  const handlePositionChange = () => {
    // Handle changes in the selected location on the map
    const place = autoCompleteRef.current.getPlace();
    if (place.geometry) {
      const newPosition = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
      setPosition(newPosition);
      setData((prev) => ({
        ...prev,
        latitude: newPosition.lat.toFixed(8),
        longitude: newPosition.lng.toFixed(8),
      }));
      fetchCountryCode(newPosition.lat, newPosition.lng);
    }
  };

  const fetchCountryCode = async (lat, lng) => {
    // Fetch the country code based on the latitude and longitude
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      if (response.data && response.data.address) {
        setData((prev) => ({
          ...prev,
          countryCode: response.data.address.country_code.toUpperCase(),
        }));
      }
    } catch (error) {
      console.error("Failed to fetch country code:", error);
    }
  };

  const onSubmit = async (event) => {
    // Handle form submission
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        formData.append(key, data[key]);
      });

      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      selectedDocs.forEach((doc) => {
        formData.append("documents", doc.file);
      });

      selectedVids.forEach((vid) => {
        formData.append("videos", vid.file);
        console.log(vid)
      })

      const moderateResponse = await axios.post(`${url}/api/report/moderate`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (moderateResponse.data.allowed) {
        const response = await axios.post(`${url}/api/report/create`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data.success) {
          setIsLoading(false);
          toast.success(
            "Thank You! Your report has been successfully submitted.",
            {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: true,
            }
          );
          setData({
            title: "",
            latitude: "",
            longitude: "",
            countryCode: "",
            description: "",
            reportDate: "",
            reefName: "",
            reefType: "",
            averageDepth: "",
            waterTemp: "",
          });
          setPosition(null);
          setSelectedImages([]);
          setImagePreviews([]);
          setSelectedDocs([]);
          setSelectedVids([]);
          if (imageInputRef.current) {
            imageInputRef.current.value = "";
          }
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          if (videoInputRef.current) {
            videoInputRef.current.value = "";
          }
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          throw new Error("Failed to submit report");
        }
      } else {
        setIsLoading(false);
          toast.error(
            moderateResponse.data.reason,
            {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: true,
            }
          );
          return;
      }

    } catch (e) {
      setIsLoading(false);
      console.error("Error submitting report:", e);
      toast.error("Oops! Something went wrong. Please try again.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500"/>
            <p className="text-lg font-medium">Submitting your report...</p>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-3 gap-6">
            {/*Main Form */}
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText size={24} className="text-blue-500" />
                    <span>{t("newReport.form.title")}</span>
                  </CardTitle>
                  <CardDescription>
                    {t("newReport.form.description")}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={onSubmit} className="space-y-6">
                    {/*Location Details */}
                    <Card className="border border-blue-100">
                      <CardHeader className="py-4">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <MapPin size={24} className="text-blue-500" />
                          <span>{t("newReport.form.locationDetails.title")}</span>
                        </CardTitle>
                      </CardHeader>
                      {/*Interactive Map */}
                      <CardContent className="space-y-4">
                        <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-200 relative">
                          <LoadScript
                            googleMapsApiKey={
                              import.meta.env.VITE_GOOGLE_MAP_API_KEY
                            }
                            libraries={libraries}
                          >
                            <GoogleMap
                              mapContainerStyle={{
                                height: "100%",
                                width: "100%",
                              }}
                              center={position}
                              zoom={7.5}
                              onLoad={(map) => (mapRef.current = map)}
                              onClick={handleMapClick}
                            >
                              <Marker position={position} />
                              <Autocomplete
                                onLoad={(ref) => (autoCompleteRef.current = ref)}
                                onPlaceChanged={handlePositionChange}
                              >
                                <Input
                                  type="text"
                                  placeholder="Search location..."
                                  className="absolute top-2 left-2 z-[0] pl-8 pr-4 py-2 w-64 bg-white shadow-lg"
                                />
                              </Autocomplete>
                            </GoogleMap>
                          </LoadScript>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="latitude">
                              {t("newReport.form.locationDetails.latitude")}
                            </Label>
                            <Input
                              id="latitide"
                              name="latitude"
                              value={parseFloat(data.latitude).toFixed(8)}
                              onChange={handleChange}
                              placeholder={t(
                                "newReport.form.locationDetails.placeholder"
                              )}
                              readOnly
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="longitude">
                              {t("newReport.form.locationDetails.longitude")}
                            </Label>
                            <Input
                              id="longitude"
                              name="longitude"
                              value={parseFloat(data.longitude).toFixed(8)}
                              onChange={handleChange}
                              placeholder={t(
                                "newReport.form.locationDetails.placeholder"
                              )}
                              readOnly
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="countryCode">
                              {t("newReport.form.locationDetails.countryCode")}
                            </Label>
                            <div className="relative">
                              <Globe className="absolute left-2 top-[7px] h04 w-4 text-gray-400" />
                              <Input
                                id="countryCode"
                                name="countryCode"
                                value={data.countryCode}
                                className="pl-8"
                                placeholder={t(
                                  "newReport.form.locationDetails.placeholder"
                                )}
                                maxLength="2"
                                readOnly
                                required
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/*Reef Details */}
                    <Card className="border border-blue-100">
                      <CardHeader className="py-4">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <Waves size={18} className="text-blue-500" />
                          <span>Reef Info</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reefName">Reef Name</Label>
                          <div className="text-sm text-gray-500">
                            Enter the name of the reef where the coral was found
                          </div>
                          <div className="relative">
                            <Pencil className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="reefName"
                              name="reefName"
                              value={data.reefName}
                              onChange={handleChange}
                              placeholder=""
                              className="pl-8"
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reefType">Reef Type</Label>
                          <div className="text-sm text-gray-500">
                            If known, on what reef type did you perform your survey?
                          </div>
                          <div className="relative">
                            <select
                              id="reefType"
                              name="reefType"
                              value={data.reefType}
                              onChange={handleChange}
                              className="w-full p-2 border border-gray-200 rounded-lg mb-3"
                            >
                              <option value="">Select Reef Type</option>
                              <option value="Reef Crest">Reef Crest</option>
                              <option value="Patch Reef">Patch Reef</option>
                              <option value="Fore Reef">Fore Reef</option>
                            </select>
                            <div className="relative">
                              <Pencil className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="reefType"
                                name="reefType"
                                value={data.reefType}
                                onChange={handleChange}
                                placeholder="If not listed, please specify"
                                className="pl-8"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="averageDepth">Average Depth (m)</Label>
                          <div className="text-sm text-gray-500">
                            If known, the approximate average depth of the observations?
                          </div>
                          <div className="relative">
                            <Pencil className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="averageDepth"
                              name="averageDepth"
                              value={data.averageDepth}
                              onChange={handleChange}
                              placeholder=""
                              className="pl-8"
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="waterTemp">Water Temperature (c)</Label>
                          <div className="text-sm text-gray-500">
                            If known, the approximate water temperature during the
                            observation?
                          </div>
                          <div className="relative">
                            <Pencil className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="waterTemp"
                              name="waterTemp"
                              value={data.waterTemp}
                              onChange={handleChange}
                              placeholder=""
                              className="pl-8"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/*Report Details */}
                    <Card className="border border-blue-100">
                      <CardHeader className="py-4">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <FileText size={18} className="text-blue-500" />
                          <span>{t("newReport.form.reportDetails.title")}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">
                            {t("newReport.form.reportDetails.reportTitle")}
                          </Label>
                          <div className="relative">
                            <Pencil className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="title"
                              name="title"
                              value={data.title}
                              onChange={handleChange}
                              placeholder={t(
                                "newReport.form.reportDetails.reportTitlePlaceholder"
                              )}
                              className="pl-8"
                              required
                            />
                          </div>
                        </div>
                      </CardContent>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="reportDate">
                            {t("newReport.form.reportDetails.dateOfDiscovery")}
                          </Label>
                          <div className="relative">
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
                        <div className="space-y-2">
                          <Label htmlFor="photo">
                            {t("newReport.form.reportDetails.photoUpload.title")}
                          </Label>
                          <div className="space-y-2">
                            <Input
                              id="photo"
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleImageUpload}
                              ref={imageInputRef}
                              className="hidden"
                            />
                            <Input
                              id="documents"
                              type="file"
                              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.html,.odt"
                              multiple
                              onChange={handleDocumentUpload}
                              ref={fileInputRef}
                              className="hidden"
                            />
                            <Input 
                              id="videos"
                              type="file"
                              accept=".mp4,.mov,.avi"
                              multiple
                              onChange={handleVideoUpload}
                              ref={videoInputRef}
                              className="hidden"
                            />
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => imageInputRef.current?.click()}
                                className="flex items-center gap-2"
                              >
                                <ImageIcon size={16} />
                                {t(
                                  "newReport.form.reportDetails.photoUpload.addPhotos"
                                )}
                              </Button>
                              <span className="text-sm text-gray-500">
                                {selectedImages?.length}{" "}
                                {`${selectedImages?.length === 1} `
                                  ? `${t(
                                      "newReport.form.reportDetails.photoUpload.selectedPhotos"
                                    )}`
                                  : `${t(
                                      "newReport.form.reportDetails.photoUpload.multipleSelectedPhotos"
                                    )}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2"
                              >
                                <File size={16} />
                                Add Documents
                              </Button>
                              <span className="text-sm text-gray-500">
                                {selectedDocs?.length}{" "}
                                {`${selectedDocs?.length === 1} `
                                  ? `document selected`
                                  : `documents selected`}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => videoInputRef.current?.click()}
                                className="flex items-center gap-2"
                              >
                                <Video size={16} />
                                Add Video
                              </Button>
                              <span className="text-sm text-gray-500">
                                {selectedVids?.length}{" "}
                                {`${selectedVids?.length === 1} `
                                  ? `video selected`
                                  : `videos selected`}
                              </span>
                            </div>
                            {imagePreviews.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                {imagePreviews.map((preview, index) => (
                                  <div key={index} className="relative group">
                                    <div className="w-full h-32 overflow-hidden rounded-lg">
                                      <img
                                        src={preview.url}
                                        alt={preview.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => removeImage(index)}
                                    >
                                      <X size={16} />
                                    </Button>
                                    <p className="text-xs text-gray-500 mt-1 truncate">
                                      {preview.name}
                                    </p>
                                    <button
                                      type="button"
                                      className="text-xs text-blue-500 hover:underline mt-1 text-left"
                                      onClick={() => showDetectionResults(index)}
                                    >
                                      {ImageDetections ? 'View AI Detection Results' : 'AI Detection in progress...'}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {selectedDocs.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                {selectedDocs.map((doc, index) => (
                                  <div key={index} className="flex group items-center gap-2 border p-2 rounded-lg bg-white shadow-sm max-w-[200px]">
                                    <div className="text-2xl">{getFileIcon(doc.type)}</div>
                                    <div className="flex-1 overflow-hidden">
                                      <p className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">{truncateFileName(doc.name, 30)}</p>
                                    </div>
                                    <Button
                                      size="icon"
                                      type="button"
                                      variant="destructive"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => setSelectedDocs((prev) => prev.filter((_, i) => i !== index))}
                                    >
                                      <X size={14} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                            {selectedVids.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                {selectedVids.map((vid, index) => (
                                  <div key={index} className="flex group items-center gap-2 border p-2 rounded-lg bg-white shadow-sm max-w-[200px]">
                                    <div className="text-2xl"><FileVideo className="text-blue-500"/></div>
                                    <div className="flex-1 overflow-hidden">
                                      <p className="text-sm whitespace-nowrap overflow-hidden text-ellipsis">{truncateFileName(vid.name, 30)}</p>
                                    </div>
                                    <Button
                                      size="icon"
                                      type="button"
                                      variant="destructive"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => setSelectedVids((prev) => prev.filter((_, i) => i !== index))}
                                    >
                                      <X size={14} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="description">
                            {t("newReport.form.reportDetails.description")}
                          </Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={data.description}
                            onChange={handleChange}
                            placeholder={t(
                              "newReport.form.reportDetails.descriptionPlaceholder"
                            )}
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
                        title: "",
                        latitude: "",
                        longitude: "",
                        countryCode: "",
                        description: "",
                        reportDate: "",
                        reefName: "",
                        reefType: "",
                        averageDepth: "",
                        waterTemp: "",
                      });
                      setPosition(null);
                      setSelectedImages([]);
                      setImagePreviews([]);
                      setSelectedDocs([]);
                      setSelectedVids([]);
                    }}
                  >
                    {t("newReport.form.buttons.clearForm")}
                  </Button>
                  <Button onClick={onSubmit} className="px-4">
                    <Send className="mr-2 h-4 w-4" />
                    {t("newReport.form.buttons.submitForm")}
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/*Side Bar*/}
            <div className="space-y-6">
              {/*GuideLine Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShieldAlert size={20} />
                    <span>{t("newReport.guidelines.title")}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <AlertTitle className="font-medium">
                        {t("newReport.guidelines.selectLocation.title")}
                      </AlertTitle>
                      <AlertDescription>
                        {t("newReport.guidelines.selectLocation.description")}
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <AlertTitle className="font-medium">
                        {t("newReport.guidelines.detailedDescription.title")}
                      </AlertTitle>
                      <AlertDescription>
                        {t(
                          "newReport.guidelines.detailedDescription.description"
                        )}
                      </AlertDescription>
                    </Alert>
                    <Alert>
                      <AlertTitle className="font-medium">
                        {t("newReport.guidelines.recentDiscovery.title")}
                      </AlertTitle>
                      <AlertDescription>
                        {t("newReport.guidelines.recentDiscovery.description")}
                      </AlertDescription>
                    </Alert>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        <DetectionPopup
          detection={ImageDetections?.[currentDetectionIndex]}
          isOpen={showDetectionPopup}
          onClose={() => setShowDetectionPopup(false)}
        />
      </div>
    </>
  );
};
export default NewReport;
