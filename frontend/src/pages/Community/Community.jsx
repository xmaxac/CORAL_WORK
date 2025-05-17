/**
 * Community Page Component
 *
 * This component displays a community forum where users can:
 * - View reports submitted by other users
 * - See latest news in a sidebar
 * - Delete their own reports
 *
 * The page requires user authentication to access content.
 * If a user is not logged in, they will see a message prompting them to sign in.
 */

import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import Reports from "@/components/community/Reports";
import { AppContext } from "@/context/AppContext";
import { toast } from "react-toastify";
import LatestNewsSidebar from "@/components/community/LatestNewsSidebar";
import countries from "i18n-iso-countries";
import enLocale from "i18n-iso-countries/langs/en.json";
import { useTranslation } from "react-i18next";
import { Loader2, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Community = () => {
  const { token, url, user } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [REPORTS, setREPORTS] = useState({});
  const [groups, setGroups] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [countryOptions, setCountryOptions] = useState([]);
  const { t } = useTranslation();

  countries.registerLocale(enLocale);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the earth in km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Function that runs when the component loads or when token/url changes
  useEffect(() => {
    const fetchData = async () => {
      // Don't attempt to fetch data if user is not logged in
      if (!token) return;

      // Show loading indicator
      setIsLoading(true);

      try {
        // Request all reports from the server
        const response = await axios.get(`${url}/api/report/all`, {
          headers: {
            Authorization: `Bearer ${token}`, // Include authentication token
          },
        });

        // Extract reports data from response and store in state
        const data = response.data.reports;

        const countrySet = new Set();
        data.forEach((report) => {
          if (report.country_code?.trim()) {
            countrySet.add(report.country_code.trim());
          }
        });
        const countryList = Array.from(countrySet).sort();
        setCountryOptions(countryList);

        navigator.geolocation.getCurrentPosition((position) => {
          const userLat = position.coords.latitude;
          const userLon = position.coords.longitude;
          // then fetch and sort reports

          const sortedData = data.sort((a, b) => {
            const aDist = getDistanceFromLatLonInKm(
              userLat,
              userLon,
              parseFloat(a.latitude),
              parseFloat(a.longitude)
            );
            const bDist = getDistanceFromLatLonInKm(
              userLat,
              userLon,
              parseFloat(b.latitude),
              parseFloat(b.longitude)
            );
            return aDist - bDist; // closer first
          });
          setREPORTS(sortedData);
        });
      } catch (e) {
        // Handle unauthorized access error
        if (e.response && e.response.status === 401) {
          toast.error("You are not authorized to view this page", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
          });
        } else {
          // Handle general errors
          toast.error("Something went wrong", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: true,
          });
        }
      } finally {
        // Hide loading indicator when done (whether successful or not)
        setIsLoading(false);
      }
    };

    // Call the fetch function
    fetchData();
  }, [token, url]); // Re-run this effect if token or URL changes

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupRes = await axios.get(`${url}/api/groups/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setGroups(groupRes.data);
      } catch (e) {
        toast.error("Failed to load group reports");
      }
    };
    fetchData();
  }, [token])

  // Function to remove a report from the displayed list when deleted
  const handleDelete = (reportId) => {
    setREPORTS((prevREPORTS) =>
      prevREPORTS.filter((report) => report.id !== reportId)
    );
  };

  const toCountryName = (countryCode) => {
    const countryName = countries.getName(countryCode.trim(), "en", {
      select: "official",
    });

    return countryName;
  }

  return (
    <>
      {/* Only show content if user is logged in (has a token) */}
      {token ? (
        <>
          {/* Show loading spinner when data is being fetched */}
          {isLoading && (
            <div className="flex items-center justify-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          )}

          <div className="flex justify-between items-center mb-4 px-8">
            <div>
              <label htmlFor="countryFilter" className="mr-2 font-medium">
                Filter by Country:
              </label>
              <select
                id="countryFilter"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="border rounded p-2"
              >
                <option value="All">All Countries</option>
                {countryOptions.map((code) => (
                  <option key={code} value={code}>
                    {toCountryName(code)}
                  </option>
                ))}
              </select>
            </div>
            <Link to="/group" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              View Groups
            </Link>
          </div>

          {/* Show message when no reports are available */}
          {!isLoading && REPORTS?.length === 0 && (
            <p className="text-center my-4">{t("community.none")}</p>
          )}

          {/* Show reports and news sidebar when reports are available */}
          {!isLoading && REPORTS?.length > 0 && (
            <div className="flex justify-between px-6">
              {/* Main content area with reports */}
              <div>
                {groups.map((group) => (
                  REPORTS.filter((report) => selectedCountry === "All" || report.country_code?.trim() === selectedCountry).map((report) => (
                    <Reports
                      key={report.id}
                      report={report}
                      currentUserId={user?.id} // Pass current user ID to enable delete function for own reports
                      onDelete={handleDelete}
                      group={group}
                    />
                  ))
                ))}
              </div>

              {/* Sidebar showing latest news */}
              <LatestNewsSidebar />
            </div>
          )}
        </>
      ) : (
        // Show sign-in message if user is not logged in
        <div className="flex items-center justify-center h-screen">
          <p className="text-center text-xl">{t("global.signToView")}</p>
        </div>
      )}
    </>
  );
};

export default Community;
