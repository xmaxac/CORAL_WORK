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

import React, { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { Map, Clipboard, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
  HeatmapLayer,
} from "@react-google-maps/api";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";
import { AppContext } from "@/context/AppContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Required libraries for Google Maps
const libraries = ["places", "visualization"];

const DataPage = () => {
  // Navigation function to change page
  const navigate = useNavigate();

  // State variables to store data and UI states
  const [locations, setLocations] = useState([]); // All report locations for map markers
  const [pos, setPos] = useState({ lat: 0, lng: 0 }); // Current map position
  const [selectedLocation, setSelectedLocation] = useState(null); // Currently selected marker
  const [chartData, setChartData] = useState([]); // Data for country bar chart
  const [latestReports, setLatestReports] = useState([]); // Recent reports for sidebar
  const [showHeatMap, setShowHeatMap] = useState(false);
  const [heatMapData, setHeatMapData] = useState([]);

  // Get authentication token and API URL from app context
  const { token, url } = useContext(AppContext);

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
          const { latitude, longitude } = position.coords;
          setPos({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting current location:", error);
          // Default to a central position if geolocation fails
          setPos({ lat: 20, lng: 0 });
        }
      );
    } else {
      // Default position if geolocation is not available
      setPos({ lat: 20, lng: 0 });
    }

    // Fetch country data for bar chart
    const fetchCountryData = async () => {
      try {
        const response = await axios.get(`${url}/api/report/country`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data;

        setChartData(data);
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    };

    // Fetch latest reports for sidebar alerts
    const fetchLatestReports = async () => {
      try {
        const response = await axios.get(`${url}/api/report/latest-reports`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.data;

        setLatestReports(data);
      } catch (e) {
        console.error("Error fetching latest reports:", e);
      }
    };

    // Fetch all reports for map markers
    const fetchReports = async () => {
      try {
        const response = await axios.get(`${url}/api/report/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = response.data.reports;

        if (Array.isArray(data)) {
          setLocations(data);
          
          // Process data for heatmap once we have locations
          if (window.google && data.length > 0) {
            const heatmapPoints = data.map(loc => ({
              location: new window.google.maps.LatLng(
                parseFloat(loc.latitude),
                parseFloat(loc.longitude)
              ),
              // You can assign different weights based on status or other properties
              weight: loc.status === "approved" ? 2 : 1,
            }));
            setHeatMapData(heatmapPoints);
          }
        } else {
          console.error("Expected an array but got:", data);
        }
      } catch (e) {
        console.error("Error fetching locations:", e);
      }
    };

    // Call all data fetching functions
    fetchReports();
    fetchLatestReports();
    fetchCountryData();
  }, [token, url]); // Re-run this effect if token or URL changes

  // Navigate to community page when clicking a recent report
  const handleReportClick = () => {
    navigate(`/community`);
  };

  // Shorten long descriptions with ellipsis
  const truncateDescription = (description, maxLength) => {
    if (description.length > maxLength) {
      return description.substring(0, maxLength) + "...";
    }
    return description;
  };

  // Configuration for the bar chart appearance
  const ChartConfig = {
    cases: {
      label: "# of Cases ",
      color: "#3b82f6",
    },
  };

  // Handle clicking on a map marker
  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    // Center the map on the selected marker
    if (mapRef.current) {
      mapRef.current.panTo({ lat: location.latitude, lng: location.longitude });
    }
  };

  const truncateFileName = (fileName, maxLength) => {
    if (fileName.length > maxLength) {
      return fileName.substring(0, maxLength) + "...";
    }
    return fileName;
  };

  // Calculate maximum value for chart Y-axis scale
  const maxCases =
    chartData.length > 0 ? Math.max(...chartData.map((data) => data.cases)) : 0;

  return (
    <>
      {/* Only show content if user is logged in (has a token) */}
      {token ? (
        <div>
          {/* Main Content */}
          <div className="max-w-full mx-auto p-4 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Map Section - Takes 2/3 of screen on medium screens and larger */}
            <div className="w-full md:col-span-2">
              <Card className="h-[300px] md:h-[512px] select-none">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Map size={20} />
                      <span>{t("data.map.title")}</span>
                    </div>
                    <button 
                      onClick={() => setShowHeatMap((prev) => !prev)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        showHeatMap 
                          ? "bg-blue-100 text-blue-800 hover:bg-blue-200" 
                          : "bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                      }`}
                    >
                      {showHeatMap ? "Show Markers" : "Show Heatmap"}
                    </button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="w-full h-96 mb-6 bg-slate-100 rounded-lg flex items-center justify-center ">
                    {/* Google Maps Component */}
                    <LoadScript
                      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAP_API_KEY}
                      libraries={libraries}
                    >
                      <GoogleMap
                        mapContainerStyle={{ height: "100%", width: "100%" }}
                        center={pos}
                        zoom={6.5}
                        onLoad={(map) => {
                          mapRef.current = map;
                          
                          // Only create heatmap data if google is available and locations exist
                          if (window.google && locations.length > 0) {
                            // Create heatmap data points from all locations
                            const data = locations.map((loc) => ({
                              location: new window.google.maps.LatLng(
                                parseFloat(loc.latitude),
                                parseFloat(loc.longitude)
                              ),
                              // Assign weights based on report status 
                              weight: loc.status === "approved" ? 5 : 
                                      loc.status === "under review" ? 3 : 
                                      loc.status === "rejected" ? 1 : 2,
                            }));
                            setHeatMapData(data);
                          }
                        }}
                      >
                        {showHeatMap && heatMapData.length > 0 ? (
                          <HeatmapLayer
                            data={heatMapData}
                            options={{
                              radius: 50, // Spread size
                              opacity: 0.8,
                              dissipating: true,
                              maxIntensity: 10,
                              gradient: [
                                'rgba(255, 255, 255, 0)',    // Transparent white (no intensity)
                                'rgba(255, 255, 0, 0.4)',    // Light yellow
                                'rgba(255, 165, 0, 0.6)',    // Orange
                                'rgba(255, 140, 0, 0.8)',    // Darker orange
                                'rgba(255, 69, 0, 0.9)',     // Red-orange
                                'rgba(255, 0, 0, 1)',        // Red
                                'rgba(200, 0, 0, 1)',        // Dark red
                                'rgba(139, 0, 0, 1)',        // Deep crimson
                                'rgba(128, 0, 128, 1)'       // Purple (for very high intensity)
                              ]
                            }}
                          />
                        ) : (
                          <>
                            {/* Create a marker for each report location */}
                            {locations.map((location) => (
                              <Marker
                                key={location.id}
                                position={{
                                  lat: parseFloat(location.latitude),
                                  lng: parseFloat(location.longitude),
                                }}
                                onClick={() => handleMarkerClick(location)}
                                icon={{
                                  path: google.maps.SymbolPath.CIRCLE,
                                  fillColor:
                                    location.status === "approved"
                                      ? "#10B981" // green
                                      : location.status === "under review"
                                      ? "#F59E0B" // yellow
                                      : location.status === "rejected"
                                      ? "#EF4444" // red
                                      : "#6B7280", // gray (default)
                                  fillOpacity: 1,
                                  strokeWeight: 1,
                                  strokeColor: "#FFFFFF",
                                  scale: 8,
                                }}
                              />
                            ))}

                            {/* Show info window when a marker is selected */}
                            {selectedLocation && (
                              <InfoWindow
                                position={{
                                  lat: parseFloat(selectedLocation.latitude),
                                  lng: parseFloat(selectedLocation.longitude),
                                }}
                                onCloseClick={() => setSelectedLocation(null)}
                              >
                                <Card className="w-[300px] rounded-xl shadow-lg overflow-hidden">
                                  <CardHeader className="pb-2">
                                    <h3 className="text-lg font-semibold truncate">
                                      {selectedLocation.title}
                                    </h3>
                                  </CardHeader>

                                  <CardContent className="space-y-2">
                                    {/* Image or Carousel */}
                                    {selectedLocation.photos && 
                                      selectedLocation.photos.length > 0 &&
                                      (selectedLocation.photos.length === 1 ? (
                                        <img
                                          src={selectedLocation.photos[0].photo_url}
                                          alt={selectedLocation.title}
                                          className="rounded-md w-full h-40 object-cover"
                                        />
                                      ) : (
                                        <Carousel
                                          showThumbs={false}
                                          showStatus={false}
                                          infiniteLoop
                                        >
                                          {selectedLocation.photos.map(
                                            (photo, i) => (
                                              <div key={i}>
                                                <img
                                                  src={photo.photo_url}
                                                  alt={`${
                                                    selectedLocation.title
                                                  } ${i + 1}`}
                                                  className="rounded-md w-full h-40 object-cover"
                                                />
                                              </div>
                                            )
                                          )}
                                        </Carousel>
                                      ))}
                                    {selectedLocation.videos &&
                                      selectedLocation.videos.length > 0 &&
                                      (selectedLocation.videos.length === 1 ? (
                                        <video
                                          controls
                                          className="rounded-md w-full h-full object-cover"
                                          src={
                                            selectedLocation.videos[0].s3_url
                                          }
                                        >
                                          Your browser does not support the
                                          video tag
                                        </video>
                                      ) : (
                                        <Carousel
                                          showThumbs={false}
                                          showStatus={false}
                                          infiniteLoop
                                        >
                                          {selectedLocation.videos.map(
                                            (video, i) => (
                                              <div key={i}>
                                                <video
                                                  controls
                                                  className="rounded-md w-full h-full object-cover"
                                                  src={video.s3_url}
                                                >
                                                  Your browser does not support
                                                  the video tag
                                                </video>
                                              </div>
                                            )
                                          )}
                                        </Carousel>
                                      ))}
                                    {selectedLocation.documents &&
                                      selectedLocation.documents.length > 0 && (
                                        <div className="grid gap-4 mt-4">
                                          {selectedLocation.documents.map(
                                            (doc, index) => (
                                              <div
                                                key={index}
                                                className="p-3 border rounded-lg flex flex-col items-start justify-between bg-white shadow hover:shadow-md transition overflow-hidden"
                                              >
                                                <p className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                                  {truncateFileName(
                                                    doc.file_name,
                                                    20
                                                  )}
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
                                            )
                                          )}
                                        </div>
                                      )}
                                    {/* Description */}
                                    {selectedLocation.description && (
                                      <p className="text-sm text-gray-700 max-h-[80px] overflow-y-auto">
                                        {selectedLocation.description}
                                      </p>
                                    )}

                                    {/* Coordinates */}
                                    <div className="text-xs text-gray-500">
                                      <Map className="inline-block w-3 h-3 mr-1" />
                                      {`${parseFloat(
                                        selectedLocation.latitude
                                      ).toFixed(4)}, ${parseFloat(
                                        selectedLocation.longitude
                                      ).toFixed(4)}`}
                                    </div>
                                  </CardContent>
                                </Card>
                              </InfoWindow>
                            )}
                          </>
                        )}
                      </GoogleMap>
                    </LoadScript>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Takes 1/3 of screen on medium screens and larger */}
            <div className="grid grid-cols-1 gap-4">
              {/* Bar Chart Section */}
              <Card className="h-[250px] md:h-[300px] select-none">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clipboard size={20} />
                      <span>{t("data.country.title")}</span>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[210px] rounded-lg flex items-center justify-center">
                    {/* Show bar chart if data is available */}
                    {chartData && chartData.length > 0 ? (
                      <ChartContainer
                        config={ChartConfig}
                        className="min-h-[210px] w-full"
                      >
                        <BarChart accessibilityLayer data={chartData}>
                          <XAxis
                            dataKey="country"
                            tickMargin={10}
                            tickLine={false}
                            tickFormatter={(value) => value.slice(0, 3)} // Show only first 3 characters of country name
                            axisLine={false}
                          />
                          {chartData && chartData.length > 0 && (
                            <YAxis
                              domain={[0, maxCases]} // Set Y-axis scale based on maximum value
                              axisLine={false}
                              tickLine={false}
                              tickMargin={10}
                            />
                          )}
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar
                            dataKey="cases"
                            fill="var(--color-cases)"
                            radius={4}
                          />
                        </BarChart>
                      </ChartContainer>
                    ) : (
                      <p className="text-center my-4">
                        {t("data.none.country")}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Reports Section */}
              <Card className="select-none">
                <CardHeader className="py-3">
                  <CardTitle className="text-lg">
                    {t("data.recentReports.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-4">
                  {/* Show alerts for recent reports if available */}
                  {latestReports.length > 0 ? (
                    <div className="space-y-1">
                      {latestReports.map((report) => (
                        <Alert
                          key={report.id}
                          onClick={() => handleReportClick()}
                          className="cursor-pointer"
                        >
                          <ShieldAlert className="h-4 w-4" />
                          <AlertTitle>{report.title}</AlertTitle>
                          <AlertDescription>
                            {truncateDescription(report.description, 40)}
                          </AlertDescription>
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
          <p className="text-center text-xl">{t("global.signToView")}</p>
        </div>
      )}
    </>
  );
};

export default DataPage;
