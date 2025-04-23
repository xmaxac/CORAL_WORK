/**
 * Photo Detection Page Component
 * 
 * This component allows users to upload images or videos for SCTLD detection.
 * Users can choose to upload a picture, video, or view a YOLO-detected video.
 * 
 * The page displays the uploaded media and the results of the detection process.
 * Users can clear the uploaded media, view the results, and download the YOLO video.
 * 
 */

import React, { useRef, useState, useEffect, useContext } from "react";
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
import { AppContext } from "@/context/AppContext";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

const PhotoDetection = () => {
  const [selectedOption, setSelectedOption] = useState("picture");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isFullLoading, setIsFullLoading] = useState(false);
  const [isNormalLoading, setIsNormalLoading] = useState(false);
  const [isYoloLoading, setIsYoloLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [detectedFrames, setDetectedFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [yoloResult, setYoloResult] = useState(null);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [showResults, setShowResults] = useState(false);
  const { url } = useContext(AppContext);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [showParameterPopup, setShowParameterPopup] = useState(false);

  //Parameter for YOLO detection
  const [parameters, setParameters] = useState({
    conf_threshold_yolo: 0.7,
    conf_threshold_sctldcnn: 0.75,
    frame_skip: 3,
  });

  // Check if user is on a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Function to handle image selection from file input
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
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

  // Function to start recording video from camera
  // const startRecording = async () => {
  //   const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  //   videoRef.current.srcObject = stream;
  //   mediaRecorderRef.current = new MediaRecorder(stream);
  //   mediaRecorderRef.current.ondataavailable = (e) => {
  //     chunksRef.current.push(e.data);
  //   };
  //   mediaRecorderRef.current.onStop = () => {
  //     const blob = new Blob(chunksRef.current, { type: "video/mp4" });
  //     const url = URL.createObjectURL(blob);
  //     setPreviewUrl(url);
  //     chunksRef.current = [];
  //     setSelectedVideo(blob);
  //   };
  //   mediaRecorderRef.current.start();
  //   setIsRecording(true);
  // };

  // // Function to stop recording video from camera
  // const stopRecording = () => {
  //   mediaRecorderRef.current.stop();
  //   videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
  //   setIsRecording(false);
  // };

  // Function to clear selected media and results
  const handleClear = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setPreviewUrl(null);
    setResults(null);
    setShowResults(false);
    setDetectedFrames([]);
    setYoloResult(null);
    setCurrentFrameIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  // Function to handle parameter change for YOLO detection
  const handleParameterChange = (param, value) => {
    setParameters(prev => ({
      ...prev,
      [param]: value,
    }));
  };


  // Function to upload image for SCTLD detection using the API endpoint
  const handleImageUpload = async () => {
    try {
      setIsFullLoading(true);
      // setIsNormalLoading(true);
      setIsYoloLoading(true);

      const formData = new FormData();
      formData.append("file", selectedImage);

      const yoloResponse = axios.post(
        `https://yolo.coralbase.net/sctldDetection_imgstreaming/${parameters.conf_threshold_yolo}/${parameters.conf_threshold_sctldcnn}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob",
        }
      );

      // const normalResponse = axios.post(
      //   `${url}/api/detection/upload`,
      //   formData,
      //   {
      //     headers: {
      //       "Content-Type": "multipart/form-data",
      //     },
      //   }
      // );

      // normalResponse.then((normalResponse) => {
      //   if (normalResponse.data) {
      //     toast.success("Image uploaded successfully", {
      //       position: "top-center",
      //       autoClose: 2000,
      //       hideProgressBar: true,
      //     });

      //     let predictedClass = normalResponse.data.predictedClass;
      //     if (predictedClass === "Healthy Coral") {
      //       predictedClass = "SCTLD Not Detected";
      //     }

      //     setResults({
      //       confidence: normalResponse.data.confidence,
      //       predictedClass,
      //     });

      //     setShowResults(true);
      //     setIsNormalLoading(false);
      //   }
      // })
      //   .catch((e) => {
      //     console.error("Error uploading image:", e);
      //     toast.error("Error uploading image", { autoClose: 2000 });
      //     setIsNormalLoading(false);
      //   })
      //   .finally(() => {
      //     if (!isYoloLoading) setIsFullLoading(false);
      //   });

      yoloResponse.then((yoloResponse) => {
        toast.success("Image uploaded successfully", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });
        const blob = new Blob([yoloResponse.data], { type: "image/jpeg" });

        if (blob.size > 0) {
          const yoloImageUrl = URL.createObjectURL(blob);
          setYoloResult(yoloImageUrl);
        }

        setIsYoloLoading(false);
        setShowResults(true);

        console.log(yoloResponse)
      })
        .catch((e) => {
          console.error("Error uploading to YOLO:", e);
          toast.error("Error processing YOLO image", { autoClose: 2000 })
          setIsYoloLoading(false);
        })
        .finally(() => {
          if (!isNormalLoading) setIsFullLoading(false);
        })

    } catch (e) {
      console.error("Unexpected error:", e);
      toast.error("Something went wrong", { autoClose: 2000 });
      setIsFullLoading(false);
    };
  };

  // Function to upload video for SCTLD detection using the API endpoint
  // const handleVideoUpload = async () => {
  //   try {
  //     setIsFullLoading(true);
  //     const formData = new FormData();
  //     formData.append("file", selectedVideo);

  //     // const normalResponse = await axios.post(
  //     //   `https://video-predict.coralbase.net/predict_video`,
  //     //   formData,
  //     //   {
  //     //     headers: {
  //     //       "Content-Type": "multipart/form-data",
  //     //     },
  //     //   }
  //     // );

  //     setIsFullLoading(false);

  //     if (normalResponse.data) {
  //       toast.success("Video uploaded successfully", {
  //         position: "top-center",
  //         autoClose: 2000,
  //         hideProgressBar: true,
  //       });

  //       const processedFrame = normalResponse.data.detected_frames.map(
  //         (frame) => ({
  //           base64Image: frame.frame,
  //           confidence: frame.confidence,
  //         })
  //       );

  //       setDetectedFrames(processedFrame);

  //       setShowResults(true);
  //       setCurrentFrameIndex(0);
  //     }
  //   } catch (e) {
  //     console.error("Error uploading video for SCTLD Detection:", e);
  //     toast.error("Error uploading video for SCTLD Detection", {
  //       position: "top-center",
  //       autoClose: 2000,
  //       hideProgressBar: true,
  //     });
  //     setIsFullLoading(false);
  //   }
  // };

  // Function to upload video for SCTLD detection using the YOLO API endpoint
  const handleYoloUpload = async () => {
    try {
      setIsFullLoading(true);
      const formData = new FormData();
      formData.append("file", selectedVideo);

      const yoloResponse = await axios.post(
        `https://yolo.coralbase.net/sctldDetection_video/${parameters.frame_skip}/${parameters.conf_threshold_yolo}/${parameters.conf_threshold_sctldcnn}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          timeout: 120000,
        }
      );

      setIsFullLoading(false);

      if (yoloResponse.data) {
        toast.success("Video uploaded successfully", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });

        const yoloVideoUrl = yoloResponse.data;
        setYoloResult(yoloVideoUrl);

        setShowResults(true);
        setCurrentFrameIndex(0);
      }
    } catch (e) {
      console.error("Error uploading video for SCTLD Detection:", e);
      toast.error("Error uploading video for SCTLD Detection", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
      setIsFullLoading(false);
    }
  };

  // Function to download the YOLO-detected video
  const handleViewYolo = () => {
    if (selectedOption === "yolo" && yoloResult) {
      const link = document.createElement("a");
      link.href = yoloResult.url;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Function to navigate to the next frame in the detected frames list
  const handleNextFrame = () => {
    setCurrentFrameIndex((prev) =>
      prev < detectedFrames.length - 1 ? prev + 1 : prev
    );
  };

  // Function to navigate to the previous frame in the detected frames list
  const handlePrevFrame = () => {
    setCurrentFrameIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  // Function to open the camera for taking photos
  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Function to handle user device compatibility
  const handleUserDevice = (e) => {
    toast.error("Sorry, your device is not supported for this feature", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: true,
    });
  };

  const ParameterPopup = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Detection Parameters</h3>
            <button onClick={() => setShowParameterPopup(false)} className="p-1">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="conf_threshold_yolo">YOLO Confidence Threshold: {parameters.conf_threshold_yolo.toFixed(2)}</Label>
              </div>
              <Slider 
                id="conf_threshold_yolo"
                min={0}
                max={1}
                step={0.05}
                value={[parameters.conf_threshold_yolo]} // Use array notation
                onValueChange={(val) => handleParameterChange("conf_threshold_yolo", val[0])} 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="conf_threshold_sctldcnn">SCTLD CNN Confidence Threshold: {parameters.conf_threshold_sctldcnn.toFixed(2)}</Label>
              </div>
              <Slider 
                id="conf_threshold_sctldcnn"
                min={0}
                max={1}
                step={0.05}
                value={[parameters.conf_threshold_sctldcnn]}
                onValueChange={(val) => handleParameterChange("conf_threshold_sctldcnn", val[0])}
              />
            </div>

            {selectedOption === "yolo" ? (
              <div className="space-y-2">
                <Label htmlFor="frame_skip">Frame Skip: {parameters.frame_skip}</Label>
                <Slider 
                  id="frame_skip"
                  min={1}
                  max={5}
                  step={1}
                  value={[parameters.frame_skip]}
                  onValueChange={(val) => handleParameterChange("frame_skip", val[0])}
                />
              </div>
            ) : null}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowParameterPopup(false)}>
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
    <div className="relative max-w-2xl mx-auto mt-5 flex flex-col space-x-4">
      {isFullLoading && (
        <div className="fixed top-[64px] inset-0 flex flex-col items-center justify-center w-full h-full z-50 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <span className="text-black">Processing File...</span>
        </div>
      )}

      {showParameterPopup && <ParameterPopup />}

      <div className="flex justify-center mb-5 space-x-4">
        <button
          className={`px-4 py-2 ${selectedOption === "picture"
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
        {/* <button
          className={`px-4 py-2 ${selectedOption === "video"
            ? "bg-blue-500 text-white hover:bg-blue-700"
            : "bg-gray-200 hover:bg-gray-400"
            } rounded-lg`}
          onClick={() => {
            setSelectedOption("video");
            handleClear();
          }}
        >
          Upload Video
        </button> */}
        <button
          className={`px-4 py-2 ${selectedOption === "yolo"
            ? "bg-blue-500 text-white hover:bg-blue-700"
            : "bg-gray-200 hover:bg-gray-400"
            } rounded-lg`}
          onClick={() => {
            setSelectedOption("yolo");
            handleClear();
          }}
        >
          Click to view yolo
        </button>
      </div>
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
            <div
              className={`w-full h-96 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 transition-colors ${!previewUrl
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
                    capture="enviroment"
                    className="hidden"
                    onChange={handleImageSelect}
                  />

                  <input
                    ref={videoRef}
                    type="file"
                    accept="video/*"
                    capture="enviroment"
                    className="hidden"
                    onChange={handleVideoSelect}
                  />

                  {selectedOption === "picture" ||
                    selectedOption === "yolo" ? (
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <span className="text-sm text-slate-400">or</span>
                      <Button
                        variant="outline"
                        onClick={
                          isMobile
                            ? selectedOption === "picture"
                              ? openCamera
                              : startRecording
                            : () => handleUserDevice()
                        }
                        className="flex items-center space-x-2"
                      >
                        <Camera size={16} />
                        <span>
                          {selectedOption === "picture"
                            ? "Take Photo"
                            : selectedOption === "yolo"
                              ? "Upload Video for yolo" : null
                            }
                        </span>
                      </Button>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="relative w-full h-full">
                  {selectedOption === "picture" ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : selectedOption === "yolo" ? (
                    <video
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : null}
                </div>
              )}
            </div>

            {previewUrl && (
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
                  onClick={
                    selectedOption === "picture"
                      ? handleImageUpload
                      : selectedOption === "video"
                        ? handleVideoUpload
                        : handleYoloUpload
                  }
                  className="flex items-center justify-center space-x-2"
                >
                  <Upload size={16} />
                  <span>Upload</span>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showResults && (
        <Card className="w-full mt-5">
          {selectedOption === "picture" ? (
            <CardContent className="flex flex-col items-center">
              {isNormalLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-black" />
              ) : (
                // <>
                //   <div className="w-full bg-gray-200 rounded-full h-4 mt-2 relative overflow-hidden">
                //     <div
                //       style={{ width: `${results.confidence * 100}%` }}
                //       className="h-4 rounded-full bg-blue-500"
                //     />
                //   </div>
                //   <p className="mt-2 text-gray-600">
                //     Confidence: {(results.confidence * 100).toFixed(2)}%
                //   </p>
                //   <h2 className="text-2xl font-bold mt-4">
                //     {results.predictedClass}
                //   </h2>
                // </>
                null
              )}
              {yoloResult && selectedOption == "picture" && (
                <div className="mt-4">
                  {isYoloLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-black" />
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold mb-2">
                        YOLO Detection Result:
                      </h3>
                      <img
                        src={yoloResult}
                        alt="YOLO detection"
                        className="max-w-full h-auto rounded-lg"
                      />
                    </>
                  )}
                </div>
              )}
            </CardContent>
          ) : selectedOption === "yolo" && yoloResult ? (
            <CardContent className="felx flex-col items-center">
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">
                  YOLO Detection Result
                </h3>
              </div>
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={handleViewYolo}
                  className="flex items-center justify-center space-x-2"
                >
                  <Eye size={16} />
                  <span>Download YOLO Video</span>
                </Button>
              </div>
            </CardContent>
          ) : null}
        </Card>
      )}
    </div>
  );
};

export default PhotoDetection;
