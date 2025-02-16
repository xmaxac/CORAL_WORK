import React, { useRef, useState, useEffect, useContext } from "react";
import {
  Upload,
  XCircle,
  Camera,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { AppContext } from "@/context/AppContext";

const PhotoDetection = () => {
  const [selectedOption, setSelectedOption] = useState("picture");
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [detectedFrames, setDetectedFrames] = useState([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [showResults, setShowResults] = useState(false);
  const { url } = useContext(AppContext);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedVideo(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    mediaRecorderRef.current = new MediaRecorder(stream);
    mediaRecorderRef.current.ondataavailable = (e) => {
      chunksRef.current.push(e.data);
    };
    mediaRecorderRef.current.onStop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      chunksRef.current = [];
      setSelectedVideo(blob);
    };
    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    setIsRecording(false);
  };

  const handleClear = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setPreviewUrl(null);
    setResults(null);
    setShowResults(false);
    setDetectedFrames([]);
    setCurrentFrameIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const handleImageUpload = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", selectedImage);

      const response = await axios.post(
        `${url}/api/detection/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setIsLoading(false);
      if (response.data) {
        toast.success("Image uploaded successfully", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });

        let predictedClass = response.data.predictedClass;
        if (predictedClass === "Healthy Coral") {
          predictedClass = "SCTLD Not Detected";
        }
        setResults({
          confidence: response.data.confidence,
          predictedClass: predictedClass,
        });
        setShowResults(true);
      }
    } catch (e) {
      console.error("Error uploading image for SCTLD Detection:", e);
      toast.error("Error uploading image for SCTLD Detection", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  };

  const handleVideoUpload = async () => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("file", selectedVideo);

      const response = await axios.post(
        `http://18.217.144.182:8080/predict_video`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setIsLoading(false);
      if (response.data) {
        toast.success("Video uploaded successfully", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });

        const processedFrame = response.data.detected_frames.map((frame) => ({
          base64Image: frame.frame,
          confidence: frame.confidence,
        }));

        setDetectedFrames(processedFrame);
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
      setIsLoading(false);
    }
  };

  const handleNextFrame = () => {
    setCurrentFrameIndex((prev) =>
      prev < detectedFrames.length - 1 ? prev + 1 : prev
    );
  };

  const handlePrevFrame = () => {
    setCurrentFrameIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const openCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleUserDevice = (e) => {
    toast.error("Sorry, your device is not supported for this feature", {
      position: "top-center",
      autoClose: 2000,
      hideProgressBar: true,
    });
  };

  return (
    <div className="relative max-w-2xl mx-auto mt-5 flex flex-col space-x-4">
      {isLoading && (
        <div className="fixed top-[64px] inset-0 flex flex-col items-center justify-center w-full h-full z-50 bg-white">
          <Loader2 className="h-8 w-8 animate-spin text-black" />
          <span className="text-black">Processing File...</span>
        </div>
      )}
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
            selectedOption === "video"
              ? "bg-blue-500 text-white hover:bg-blue-700"
              : "bg-gray-200 hover:bg-gray-400"
          } rounded-lg`}
          onClick={() => {
            setSelectedOption("video");
            handleClear();
          }}
        >
          Upload Video
        </button>
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload size={20} />
            <span>SCTLD Detection</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
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

                  {selectedOption === "picture" ? (
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <span className="text-sm text-slate-400">or</span>
                      <Button
                        variant="outline"
                        onClick={
                          isMobile ? openCamera : () => handleUserDevice()
                        }
                        className="flex items-center space-x-2"
                      >
                        <Camera size={16} />
                        <span>Take Photo</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <span className="text-sm text-slate-400">or</span>
                      <Button
                        variant="outline"
                        onClick={
                          isMobile ? startRecording : () => handleUserDevice()
                        }
                        className="flex items-center space-x-2"
                      >
                        <Camera size={16} />
                        <span>Take Video</span>
                      </Button>
                    </div>
                  )}
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
                      alt="Preview"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  )}
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
                      : handleVideoUpload
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
          {selectedOption === "picture" && results ? (
            <CardContent className="flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-full h-4 mt-2 relative overflow-hidden">
                <div
                  style={{ width: `${results.confidence * 100}%` }}
                  className="h-4 rounded-full bg-blue-500"
                />
              </div>
              <p className="mt-2 text-gray-600">
                Confidence: {(results.confidence * 100).toFixed(2)}%
              </p>
              <h2 className="text-2xl font-bold mt-4">
                {results.predictedClass}
              </h2>
            </CardContent>
          ) : detectedFrames.length > 0 ? (
            <CardContent className="flex flex-col items-center">
              <div className="flex items-center space-x-4 w-full">
                <Button
                  variant="outline"
                  onClick={handlePrevFrame}
                  disabled={currentFrameIndex === 0}
                >
                  <ChevronLeft size={16} />
                </Button>

                <div className="flex-1 flex flex-col items-center pt-5 ">
                  <img
                    src={`data:image/jpeg;base64,${detectedFrames[currentFrameIndex].base64Image}`}
                    alt={`Frame ${currentFrameIndex + 1}`}
                    className="max-h-[400px] object-contain"
                  />

                  <div className="mt-4 text-center">
                    <div className="w-full bg-gray-200 rounded-full h-4 mt-2 relative overflow-hidden">
                      <div
                        style={{
                          width: `${
                            detectedFrames[currentFrameIndex].confidence * 100
                          }%`,
                        }}
                        className="h-4 rounded-full bg-blue-500"
                      />
                    </div>
                    <p className="text-gray-600">
                      Confidence:{" "}
                      {(
                        detectedFrames[currentFrameIndex].confidence * 100
                      ).toFixed(2)}
                      %
                    </p>
                    <h2 className="text-2xl font-bold">
                      {detectedFrames[currentFrameIndex].predictedClass}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Frame {currentFrameIndex + 1} of {detectedFrames.length}
                    </p>
                  </div>
                </div>

                <Button
                  variant="outline"
                  onClick={handleNextFrame}
                  disabled={currentFrameIndex === detectedFrames.length - 1}
                >
                  <ChevronRight size={16} />
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
