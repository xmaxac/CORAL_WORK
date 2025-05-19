/**
 * Photo Detection Page Component
 *
 * This component allows users to upload images or videos for SCTLD detection.
 * Users can choose to upload a picture, view a YOLO-detected video, and adjust detection parameters.
 */

import React, { useRef, useState, useEffect } from "react";
import {
  Upload,
  XCircle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Loader2,
  EyeIcon as Eye,
  Settings,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const PhotoDetection = () => {
  // Main option states
  const [selectedOption, setSelectedOption] = useState("picture");
  const [showResults, setShowResults] = useState(false);
  const [showParameterPopup, setShowParameterPopup] = useState(false);
  
  // Media states
  const [selectedImages, setSelectedImages] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Results states
  const [imageResults, setImageResults] = useState([]);
  const [yoloResult, setYoloResult] = useState(null);
  
  // Loading states
  const [isFullLoading, setIsFullLoading] = useState(false);
  const [isYoloLoading, setIsYoloLoading] = useState(false);
  
  // Detection parameters
  const [parameters, setParameters] = useState({
    conf_threshold_yolo: 0.7,
    conf_threshold_sctldcnn: 0.75,
    frame_skip: 3,
  });
  
  // References
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  
  // Check if user is on a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      cleanupObjectUrls();
    };
  }, []);
  
  // Function to clean up all object URLs to prevent memory leaks
  const cleanupObjectUrls = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    
    selectedImages.forEach((img) => {
      if (img.objectUrl) URL.revokeObjectURL(img.objectUrl);
    });
    
    imageResults.forEach((result) => {
      if (result.originalImage) URL.revokeObjectURL(result.originalImage);
      if (result.resultImage) URL.revokeObjectURL(result.resultImage);
    });
  };

  // Function to handle image selection from file input
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedImages(files);
      const url = URL.createObjectURL(files[0]);
      setPreviewUrl(url);
      setCurrentImageIndex(0);
    }
  };

  // Function to handle video selection from file input
  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideo(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Navigation functions for image browsing
  const handleNextImage = () => {
    if (currentImageIndex < selectedImages.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selectedImages[currentImageIndex + 1]));
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(selectedImages[currentImageIndex - 1]));
    }
  };

  // Navigation functions for result browsing
  const handleNextResult = () => {
    if (currentImageIndex < imageResults.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  const handlePrevResult = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Function to clear selected media and results
  const handleClear = () => {
    cleanupObjectUrls();
    
    setSelectedImages([]);
    setSelectedVideo(null);
    setPreviewUrl(null);
    setShowResults(false);
    setYoloResult(null);
    setCurrentImageIndex(0);
    setImageResults([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  // Function to handle parameter change for YOLO detection
  const handleParameterChange = (param, value) => {
    setParameters((prev) => ({
      ...prev,
      [param]: value,
    }));
  };

  // Function to upload image for SCTLD detection using the API endpoint
  const handleImageUpload = async () => {
    if (!selectedImages.length) {
      toast.warn("Please select at least one image", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }
    
    try {
      setIsFullLoading(true);
      setIsYoloLoading(true);

      const results = [];

      for (let i = 0; i < selectedImages.length; i++) {
        const formData = new FormData();
        formData.append("file", selectedImages[i]);

        toast.info(`Processing image ${i + 1} of ${selectedImages.length}`, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });

        try {
          const response = await axios.post(
            `https://yolo.coralbase.net/sctldDetection_imgstreaming/${parameters.conf_threshold_yolo}/${parameters.conf_threshold_sctldcnn}`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
              responseType: "blob",
            }
          );

          const blob = new Blob([response.data], { type: "image/jpeg" });

          if (blob.size > 0) {
            const yoloImageUrl = URL.createObjectURL(blob);
            results.push({
              originalImage: URL.createObjectURL(selectedImages[i]),
              resultImage: yoloImageUrl,
              fileName: selectedImages[i].name,
            });
          }
        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          // Add a placeholder for failed image
          results.push({
            originalImage: URL.createObjectURL(selectedImages[i]),
            resultImage: null,
            error: true,
            fileName: selectedImages[i].name,
          });
          
          toast.error(`Failed to process image ${i + 1}`, {
            position: "top-center",
            autoClose: 3000,
          });
        }
      }

      setImageResults(results);
      setShowResults(true);
      setCurrentImageIndex(0);

      toast.success("Images processed successfully", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error("Unexpected error during batch processing:", error);
      toast.error("Something went wrong with image processing", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
      });
    } finally {
      setIsYoloLoading(false);
      setIsFullLoading(false);
    }
  };

  // Function to upload video for YOLO-based SCTLD detection
  const handleYoloUpload = async () => {
    if (!selectedVideo) {
      toast.warn("Please select a video first", {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }
    
    try {
      setIsFullLoading(true);
      const formData = new FormData();
      formData.append("file", selectedVideo);

      // Set a longer timeout for video processing
      const yoloResponse = await axios.post(
        `https://yolo.coralbase.net/sctldDetection_video/${parameters.frame_skip}/${parameters.conf_threshold_yolo}/${parameters.conf_threshold_sctldcnn}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 180000, // 3 minutes timeout for large videos
        }
      );

      if (yoloResponse.data) {
        toast.success("Video processed successfully", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });

        setYoloResult(yoloResponse.data);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error uploading video for SCTLD Detection:", error);
      
      // More specific error messages based on error type
      if (error.code === "ECONNABORTED") {
        toast.error("Video processing timed out. Please try a shorter video.", {
          position: "top-center",
          autoClose: 4000,
        });
      } else if (error.response) {
        toast.error(`Server error: ${error.response.status}`, {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        toast.error("Error processing video", {
          position: "top-center",
          autoClose: 3000,
        });
      }
    } finally {
      setIsFullLoading(false);
    }
  };

  // Function to open the camera for taking photos
  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Function to handle user device compatibility
  const handleUserDevice = () => {
    toast.error("Sorry, your device is not supported for this feature", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: true,
    });
  };

  // Parameter popup component (kept inline as requested)
  const renderParameterPopup = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Detection Parameters</h3>
            <button
              onClick={() => setShowParameterPopup(false)}
              className="p-1"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="conf_threshold_yolo">
                  YOLO Confidence Threshold:{" "}
                  {parameters.conf_threshold_yolo.toFixed(2)}
                </Label>
              </div>
              <Slider
                id="conf_threshold_yolo"
                min={0}
                max={1}
                step={0.05}
                value={[parameters.conf_threshold_yolo]}
                onValueChange={(val) =>
                  handleParameterChange("conf_threshold_yolo", val[0])
                }
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="conf_threshold_sctldcnn">
                  SCTLD CNN Confidence Threshold:{" "}
                  {parameters.conf_threshold_sctldcnn.toFixed(2)}
                </Label>
              </div>
              <Slider
                id="conf_threshold_sctldcnn"
                min={0}
                max={1}
                step={0.05}
                value={[parameters.conf_threshold_sctldcnn]}
                onValueChange={(val) =>
                  handleParameterChange("conf_threshold_sctldcnn", val[0])
                }
              />
            </div>

            {selectedOption === "yolo" && (
              <div className="space-y-2">
                <Label htmlFor="frame_skip">
                  Frame Skip: {parameters.frame_skip}
                </Label>
                <Slider
                  id="frame_skip"
                  min={1}
                  max={5}
                  step={1}
                  value={[parameters.frame_skip]}
                  onValueChange={(val) =>
                    handleParameterChange("frame_skip", val[0])
                  }
                />
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowParameterPopup(false)}
              >
                Cancel
              </Button>
              <Button onClick={() => setShowParameterPopup(false)}>
                Apply
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative max-w-2xl mx-auto mt-5 flex flex-col">
      {/* Loading Overlay */}
      {isFullLoading && (
        <div className="fixed top-[64px] inset-0 flex flex-col items-center justify-center w-full h-full z-50 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <span className="text-black mt-2">
            Processing File...
          </span>
        </div>
      )}

      {/* Parameter Popup */}
      {showParameterPopup && renderParameterPopup()}

      {/* Mode Selection */}
      <div className="flex justify-center mb-5 space-x-4">
        <button
          className={`px-4 py-2 ${
            selectedOption === "picture"
              ? "bg-blue-500 text-white hover:bg-blue-700"
              : "bg-gray-200 hover:bg-gray-400"
          } rounded-lg`}
          onClick={() => {
            setSelectedOption("picture");
            handleClear();
          }}
        >
          Upload Picture
        </button>
        <button
          className={`px-4 py-2 ${
            selectedOption === "yolo"
              ? "bg-blue-500 text-white hover:bg-blue-700"
              : "bg-gray-200 hover:bg-gray-400"
          } rounded-lg`}
          onClick={() => {
            setSelectedOption("yolo");
            handleClear();
          }}
        >
          Upload Video for YOLO
        </button>
      </div>

      {/* Main Card for Upload */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Upload size={20} />
              <span>SCTLD Detection</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
              onClick={() => setShowParameterPopup(true)}
            >
              <Settings size={16} />
              <span className="ml-1">Parameters</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            {/* Upload Area */}
            <div
              className={`w-full h-96 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 transition-colors ${
                !previewUrl
                  ? "border-slate-300 hover:border-slate-400 bg-slate-50"
                  : "border-transparent"
              }`}
            >
              {!previewUrl ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                  <label className="flex flex-col items-center justify-center cursor-pointer">
                    <Upload className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600 text-center">
                      {selectedOption === "picture"
                        ? "Click or drag image here"
                        : "Click or drag video here"}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={
                        selectedOption === "picture" ? "image/*" : "video/*"
                      }
                      multiple={selectedOption === "picture"}
                      className="hidden"
                      onChange={
                        selectedOption === "picture"
                          ? handleImageSelect
                          : handleVideoSelect
                      }
                    />
                  </label>

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleImageSelect}
                  />

                  <input
                    ref={videoRef}
                    type="file"
                    accept="video/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleVideoSelect}
                  />

                  {/* Camera button for mobile devices */}
                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <span className="text-sm text-slate-400">or</span>
                    <Button
                      variant="outline"
                      onClick={
                        isMobile
                          ? selectedOption === "picture"
                            ? openCamera
                            : () => fileInputRef.current.click()
                          : handleUserDevice
                      }
                      className="flex items-center space-x-2"
                    >
                      <Camera size={16} />
                      <span>
                        {selectedOption === "picture"
                          ? "Take Photo"
                          : "Record Video"}
                      </span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {selectedOption === "picture" ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      controls
                      className="w-full h-full object-contain rounded-lg"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Video Upload Button */}
            {previewUrl && selectedOption === "yolo" && (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="flex items-center justify-center space-x-2"
                >
                  <XCircle size={16} />
                  <span>Clear</span>
                </Button>
                <Button
                  onClick={handleYoloUpload}
                  className="flex items-center justify-center space-x-2"
                >
                  <Upload size={16} />
                  <span>Process Video</span>
                </Button>
              </div>
            )}

            {/* Image Navigation */}
            {previewUrl && selectedOption === "picture" && (
              <div className="w-full">
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    className="flex items-center justify-center space-x-2"
                  >
                    <XCircle size={16} />
                    <span>Clear</span>
                  </Button>
                  <Button
                    onClick={handleImageUpload}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Upload size={16} />
                    <span>Detect SCTLD</span>
                  </Button>
                </div>

                {selectedImages.length > 1 && (
                  <div className="flex justify-center items-center mt-4 space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevImage}
                      disabled={currentImageIndex === 0}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <span className="text-sm">
                      {currentImageIndex + 1} / {selectedImages.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextImage}
                      disabled={currentImageIndex >= selectedImages.length - 1}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results Card */}
      {showResults && (
        <Card className="w-full mt-5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye size={20} />
                <span>Detection Results</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {/* Image Results */}
            {selectedOption === "picture" && (
              <>
                {isYoloLoading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-black" />
                ) : (
                  imageResults.length > 0 && (
                    <div className="relative w-full">
                      {imageResults[currentImageIndex]?.error ? (
                        <div className="h-64 flex items-center justify-center bg-gray-100 rounded">
                          <p className="text-red-500">
                            Failed to process{" "}
                            {imageResults[currentImageIndex].fileName || "image"}
                          </p>
                        </div>
                      ) : (
                        <img
                          src={imageResults[currentImageIndex]?.resultImage}
                          alt={`YOLO detection result ${currentImageIndex + 1}`}
                          className="max-w-full h-auto rounded-lg mx-auto"
                        />
                      )}

                      {/* Image Navigation Controls */}
                      {imageResults.length > 1 && (
                        <div className="flex justify-center items-center mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handlePrevResult}
                            disabled={currentImageIndex === 0}
                            className="mr-2"
                          >
                            <ChevronLeft size={16} />
                            <span className="ml-1">Previous</span>
                          </Button>
                          <span className="text-sm mx-2">
                            {currentImageIndex + 1} / {imageResults.length}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleNextResult}
                            disabled={
                              currentImageIndex >= imageResults.length - 1
                            }
                            className="ml-2"
                          >
                            <span className="mr-1">Next</span>
                            <ChevronRight size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                )}
                
                {/* Filename display */}
                {imageResults.length > 0 && (
                  <div className="mt-4 text-center">
                    <p className="font-medium">
                      {imageResults[currentImageIndex]?.fileName || "Unknown file"}
                    </p>
                  </div>
                )}
              </>
            )}
            
            {/* Video Results */}
            {selectedOption === "yolo" && yoloResult && (
              <div className="w-full">
                <video
                  controls
                  width="100%"
                  src={yoloResult.url}
                  className="rounded-lg mt-4"
                >
                  Your browser does not support the video tag.
                </video>
                
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-500">
                    YOLO-processed video with SCTLD detection
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PhotoDetection;