import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import Reports from "@/components/community/Reports";
import { AppContext } from "@/context/AppContext";
import { toast } from "react-toastify";
import LatestNewsSidebar from "@/components/community/LatestNewsSidebar";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

const Community = () => {
  const { token, url, user } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [REPORTS, setREPORTS] = useState({});
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      setIsLoading(true);
      try {
        const response = await axios.get(`${url}/api/report/all`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data.reports;
        setREPORTS(data);
      } catch (e) {
        if (e.response && e.response.status === 401) {
          toast.error("You are not authorized to view this page", {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: true,
          });
        } else {
          toast.error("Something went wrong", {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: true,
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token, url]);

  const handleDelete = (reportId) => {
    setREPORTS((prevREPORTS) =>
      prevREPORTS.filter((report) => report.id !== reportId)
    );
  };

  return (
    <>
      {token ? (
        <>
          {isLoading && (
            <div className="flex items-center justify-center h-screen">
              <Loader2 className="h-8 w-8 animate-spin"/>
            </div>
          )}
          {!isLoading && REPORTS?.length === 0 && (
            <p className="text-center my-4">{t('community.none')}</p>
          )}
          {!isLoading && REPORTS?.length > 0 && (
            <div className="flex justify-between px-6">
              <div>
                {REPORTS.map((report) => (
                  <Reports
                    key={report.id}
                    report={report}
                    currentUserId={user?.id}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
              <LatestNewsSidebar/>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-center text-xl">{t('global.signToView')}</p>
        </div>
      )}
    </>
  );
};

export default Community;
