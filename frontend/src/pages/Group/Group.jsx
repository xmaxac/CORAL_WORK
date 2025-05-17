import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AppContext } from "@/context/AppContext";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

const Group = () => {
  const { token, url, profile } = useContext(AppContext);
  const [groups, setGroups] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const fetchGroups = async () => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await axios.get(`${url}/api/groups/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data;
      setGroups(data);
    } catch (e) {
      toast.error("Failed to load groups");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [token]);

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    } else if (!groupDescription.trim()) {
      ToastContainer.error("Group description is required");
      return;
    }

    setCreating(true);
    try {
      await axios.post(
        `${url}/api/groups/`,
        {
          name: groupName.trim(),
          description: groupDescription.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Group created successfully!");
      setShowPopup(false);
      setGroupName("");
      setGroupDescription("");
      fetchGroups();
    } catch (e) {
      toast.error("Failed to create group");
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await axios.delete(`${url}/api/groups/${groupId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Group deleted successfully", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });

      fetchGroups();
    } catch (e) {
      toast.error("Failed to delete group");
      console.error(e);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Groups</h1>
        <Button onClick={() => setShowPopup(true)}>Create Group</Button>
      </div>
      {isLoading ? (
        <p>Loading groups...</p>
      ) : groups?.length === 0 ? (
        <p>No groups found.</p>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow duration-200 overflow-hidden"
                >
                  <div
                    className="h-24 bg-gradient-to-r from-blue-500 to-purple-600"
                    onClick={() => navigate(`/groups/${group.id}`)}
                  ></div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h2
                        className="text-xl font-semibold cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => navigate(`/groups/${group.id}`)}
                      >
                        {group.name}
                      </h2>
                      {group?.created_by === profile?.id && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete Group"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteGroup(group.id);
                          }}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-gray-700 mt-2 line-clamp-2">
                      {group.description}
                    </p>
                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        Reports: {group.report_count || 0}
                      </span>
                      <Button
                        variant="ghost"
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => navigate(`/group/${group.id}`)}
                      >
                        View Group
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create a New Group</h2>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="secondary" onClick={() => setShowPopup(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup} disabled={creating}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
      ;
    </div>
  );
};

export default Group;
