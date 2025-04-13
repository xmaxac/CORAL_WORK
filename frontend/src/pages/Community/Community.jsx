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
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

const Community = () => {
  // Access application-wide data like authentication token and API URL
  const { token, url, user } = useContext(AppContext);
  
  // State to track if data is currently being loaded
  const [isLoading, setIsLoading] = useState(false);
  
  // State to store the reports retrieved from the server
  const [REPORTS, setREPORTS] = useState({});
  
  // Hook for handling multi-language text translation
  const { t } = useTranslation();

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
            Authorization: `Bearer ${token}`,  // Include authentication token
          },
        });

        // Extract reports data from response and store in state
        const data = response.data.reports;
        setREPORTS(data);
      } catch (e) {
        // Handle unauthorized access error
        if (e.response && e.response.status === 401) {
          toast.error("You are not authorized to view this page", {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: true,
          });
        } else {
          // Handle general errors
          toast.error("Something went wrong", {
            position: 'top-center',
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
  }, [token, url]);  // Re-run this effect if token or URL changes

  // Function to remove a report from the displayed list when deleted
  const handleDelete = (reportId) => {
    setREPORTS((prevREPORTS) =>
      prevREPORTS.filter((report) => report.id !== reportId)
    );
  };

  return (
    <>
      {/* Only show content if user is logged in (has a token) */}
      {token ? (
        <>
          {/* Show loading spinner when data is being fetched */}
          {isLoading && (
            <div className="flex items-center justify-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin"/>
            </div>
          )}
          
          {/* Show message when no reports are available */}
          {!isLoading && REPORTS?.length === 0 && (
            <p className="text-center my-4">{t('community.none')}</p>
          )}
          
          {/* Show reports and news sidebar when reports are available */}
          {!isLoading && REPORTS?.length > 0 && (
            <div className="flex justify-between px-6">
              {/* Main content area with reports */}
              <div>
                {REPORTS.map((report) => (
                  <Reports
                    key={report.id}
                    report={report}
                    currentUserId={user?.id}  // Pass current user ID to enable delete function for own reports
                    onDelete={handleDelete}
                  />
                ))}
              </div>
              
              {/* Sidebar showing latest news */}
              <LatestNewsSidebar/>
            </div>
          )}
        </>
      ) : (
        // Show sign-in message if user is not logged in
        <div className="flex items-center justify-center h-screen">
          <p className="text-center text-xl">{t('global.signToView')}</p>
        </div>
      )}
    </>
  );
};

export default Community;