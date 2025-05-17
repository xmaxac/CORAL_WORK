import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { AppContext } from "@/context/AppContext";
import { toast } from "react-toastify";
import Reports from "@/components/community/Reports";
import { MessageSquare, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const GroupReportsPage = () => {
  const { token, url, user } = useContext(AppContext);
  const { groupId } = useParams();

  const [group, setGroup] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || !groupId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const groupRes = await axios.get(`${url}/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const reportRes = await axios.get(
          `${url}/api/groups/${groupId}/reports`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setGroup(groupRes.data);
        setReports(reportRes.data.reports);
      } catch (e) {
        toast.error("Failed to load group reports");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, groupId]);

  if (!token) return <p className="p-8">Please sign in to view reports.</p>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-lg shadow-md text-white">
              <h1 className="text-3xl font-bold mb-2">
                {group?.name || "Group"}
              </h1>
              <p className="text-gray-100 mb-4">{group?.description}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>{reports?.length || 0} Reports</span>
                </div>
                <Link
                  to="/community"
                  className="text-white hover:underline flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to Community
                </Link>
              </div>
            </div>
          </div>

          {reports?.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <p className="text-gray-600 mb-4">
                No reports found in this group.
              </p>
              <Link
                to="/community"
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Back to Community
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {reports?.map((report) => (
                <Reports
                  key={report.id}
                  report={report}
                  currentUserId={user?.id}
                  group={group}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupReportsPage;
