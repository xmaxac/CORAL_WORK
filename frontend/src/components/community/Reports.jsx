import React, { useState, useContext, useEffect } from "react";
import Comment from "./Comment";
import {
  MessageSquare,
  Heart,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Map,
  SearchCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import ReportVerification from "./ReportVerification";
import { AppContext } from "@/context/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { formatDistanceToNow, parseISO } from "date-fns";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import axios from "axios";
import { toast } from "react-toastify";

countries.registerLocale(enLocale);

const Reports = ({ report, currentUserId, onDelete, group }) => {
  const {
    country_code,
    description,
    latitude,
    longitude,
    likes,
    photos = [],
    documents = [],
    videos = [],
    title,
    created_at,
    report_date,
    reef_name,
    reef_type,
    average_depth,
    water_temp,
    group_id,
    status,
    verification_note,
  } = report;
  const { username, profile_image, name } = report.user;
  const reportOwnerId = report.user_id;
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(Number(likes));
  const isMyPost = reportOwnerId === currentUserId;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDetectionModal, setShowDetectionModal] = useState(false);
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [comments, setComments] = useState(report.comments || []);
  const { url, token, user } = useContext(AppContext);

  const [reportStatus, setReportStatus] = useState(status);
  const [reportVerificationNote, setReportVerificationNote] = useState(verification_note || '');

  const hasValidPhotos = photos && photos.length > 0 && !photos.includes(null);
  const hasValidDocuments =
    documents && documents.length > 0 && !documents.includes(null);
  const hasValidVideos = videos && videos.length > 0 && !videos.includes(null);

  const handleDeleteReport = async () => {
    try {
      await axios.delete(`${url}/api/report/${report.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Report deleted successfully", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
      onDelete(report.id);
    } catch (e) {
      toast.error("Error deleting report", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
      console.error("Error deleting report", e);
    }
  };

  const handleCommentAdded = (newComment) => {
    setComments((prevComments) => [...prevComments, newComment]);
  };

  const handleCommentClick = () => {
    setIsCommentDialogOpen(true);
  };

  const handleLikeReport = async () => {
    try {
      const response = await axios.get(`${url}/api/report/like/${report.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success) {
        setIsLiked(response.data.liked);
        setLikesCount((prevCount) =>
          response.data.liked ? prevCount + 1 : prevCount - 1
        );
        toast.success(response.data.message, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: true,
        });
      }
    } catch (e) {
      console.error("Failed to like/unlike report", e);
    }
  };

  const handleStatusUpdate = (newStatus, newNote) => {
    setReportStatus(newStatus);
    setReportVerificationNote(newNote);
    // If you need to update the parent component
    if (typeof onStatusUpdate === 'function') {
      onStatusUpdate(report.id, newStatus, newNote);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const selectImage = (index) => {
    setCurrentImageIndex(index);
  };

  const truncateFileName = (fileName, maxLength) => {
    if (fileName.length > maxLength) {
      return fileName.substring(0, maxLength) + "...";
    }
    return fileName;
  };

  const countryName = countries.getName(country_code.trim(), "en", {
    select: "official",
  });

  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await axios.get(
          `${url}/api/report/like-status/${report.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setIsLiked(response.data.isLiked);
      } catch (e) {
        console.error("Error fetching like status", e);
      }
    };

    fetchLikeStatus();
  }, [report.id, url, token]);

  return (
    <Card className="w-full max-w-3xl m-5">
      <CardHeader className="flex flex-row items-center space-x-4 pb-4">
        <Link to={`/profile/${username}`}>
          <Avatar>
            <AvatarImage src={profile_image} alt={username} />
            <AvatarFallback>{username[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex flex-col flex-1">
          <div className="flex flex-row items-center justify-between">
            <h3 className="font-semibold text-lg">{title}</h3>
            <p className="text-sm text-gray-500">
              {`Posted: ${formatDistanceToNow(parseISO(created_at), {
                addSuffix: true,
              })}`}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${username}`}
                className="text-sm text-gray-500 hover:underline"
              >
                {`Posted by ${name} - @${username}`}
              </Link>
              {group.id === group_id && (
                <>
                  <span className="text-gray-400">•</span>
                  <Link
                    to={`/group/${group.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    c/{group.name}
                  </Link>
                </>
              )}
            </div>
            {isMyPost && (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete Report"
                onClick={handleDeleteReport}
                className="text-gray-500 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex flex-row items-center gap-2">
            <Clock className="w-4 h-4" />
            <p className="text-sm text-gray-500">
              {`Time of Report: ${formatDistanceToNow(parseISO(report_date), {
                addSuffix: true,
              })}`}
            </p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <Map className="w-4 h-4" />
            <p className="text-sm text-gray-500">{`Location: ${latitude}, ${longitude} - ${countryName}`}</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                status === "approved"
                  ? "bg-green-500"
                  : status === "under review"
                  ? "bg-yellow-500"
                  : status === "rejected"
                  ? "bg-red-500"
                  : "bg-gray-500"
              }`}
            ></div>
            <p className="text-sm text-gray-500">
              {`Status: ${status?.toUpperCase()}`}
            </p>
          </div>
        </div>
        <div>
          <div className="flex flex-row items-center gap-2">
            <p className="text-sm text-gray-500">{`Reef Name: ${reef_name}`}</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <p className="text-sm text-gray-500">{`Reef Type: ${reef_type}`}</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <p className="text-sm text-gray-500">{`Water Temp (C): ${water_temp}`}</p>
          </div>
          <div className="flex flex-row items-center gap-2">
            <p className="text-sm text-gray-500">{`Average Depth (m): ${average_depth}`}</p>
          </div>
        </div>
        <p className="text-gray-600">{description}</p>
        {hasValidPhotos && (
          <div className="space-y-2">
            <div className="relative">
              <div className="relative group aspect-video rounded-lg overflow-hidden">
                <img
                  src={photos[currentImageIndex].photo_url}
                  alt={`${title} - image ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover"
                />

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowDetectionModal(true)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/80 text-white"
                >
                  <SearchCheck className="w-4 h-4" />
                </Button>
              </div>

              {photos.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                    onClick={nextImage}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto py-2">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    className={`flex-shrink-0 relative ${
                      currentImageIndex === index ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => selectImage(index)}
                  >
                    <img
                      src={photo.photo_url}
                      alt={`${title} thumbnail ${index + 1}`}
                      className="w-16 h-16 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {hasValidVideos && (
          <div className="space-y-2">
            <div className="relative">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                {videos.map((video, i) => (
                  <div key={i}>
                    <video
                      controls
                      className="w-full h-full object-cover"
                      src={video.s3_url}
                    >
                      Your browser does not support the video tag
                    </video>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasValidDocuments && (
          <div className="space-y-2">
            <div className="relative">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg flex flex-col items-start justify-between bg-white shadow hover:shadow-md transition overflow-hidden max-w-[200px]"
                  >
                    <p className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {truncateFileName(doc.file_name, 20)}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      {/* Preview in new tab */}
                      <a
                        href={doc.s3_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 text-sm underline cursor-pointer"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      {user.role === "researcher" && (
        <ReportVerification
          reportId={report.id}
          currentStatus={status}
          onStatusUpdate={handleStatusUpdate}
          url={url}
          token={token}
        />
      )}
      <CardFooter>
        <div className="flex gap-6 items-center">
          <Button
            variant="ghost"
            size="sm"
            aria-label="Comment on Report"
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500"
            onClick={handleCommentClick}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">{comments.length}</span>
          </Button>

          <Comment
            isOpen={isCommentDialogOpen}
            setIsOpen={setIsCommentDialogOpen}
            initialComment={comments}
            reportId={report.id}
            onCommentAdded={handleCommentAdded}
            token={token}
            url={url}
          />

          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-2 ${
              isLiked ? "text-pink-500" : "text-gray-500 hover:text-pink-500"
            }`}
            onClick={handleLikeReport}
          >
            <Heart className="w-4 h-4" />
            <span className="text-sm">{likesCount}</span>
          </Button>
        </div>
      </CardFooter>
      {showDetectionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 max-w-3xl w-full relative">
            <button
              onClick={() => setShowDetectionModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4">AI Detection</h2>
            <img
              src={photos[currentImageIndex].photo_detection} // You need to pass this prop or state
              alt="AI Detection"
              className="w-full h-auto rounded"
            />
          </div>
        </div>
      )}
    </Card>
  );
};

export default Reports;
