import React, { useEffect, useState, useContext } from "react";
import { AppContext } from "@/context/AppContext";
import { io } from "socket.io-client";
import axios from "axios";
import Chat from "./Chat";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

const ChatPage = ({ currentUserId }) => {
  const [conversations, setConversations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isMobileView, setIsMobileView] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState({});
  const { url, token, fetchProfileByUsername, profile } = useContext(AppContext);

  useEffect(() => {
    fetchConversations();

    const socket = io("http://localhost:4000");

    socket.on("connect", () => {
      console.log("Connected to socket for online status");
      socket.emit("register", currentUserId);
    });

    socket.on("onlineUsers", (users) => {
      console.log("Online users updated:", users);
      const onlineUsersObj = users.reduce((acc, userId) => {
        acc[userId] = true;
        return acc;
      }, {});
      setOnlineUsers(onlineUsersObj);
    });

    socket.on("userConnected", (userId) => {
      console.log("User connected:", userId);
      setOnlineUsers((prev) => ({ ...prev, [userId]: true }));
    });

    socket.on("userDisconnected", (userId) => {
      console.log("User disconnected:", userId);
      setOnlineUsers((prev) => {
        const updated = { ...prev };
        delete updated[userId];
        return updated;
      });
    });

    // Add responsive layout handler
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setShowSidebar(true);
      }
    };

    handleResize(); // Initialize on mount
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      socket.disconnect();
    };
  }, [currentUserId]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;

      const completeData = await Promise.all(
        data.map(async (user) => {
          if (!user.profile_image && user.username) {
            try {
              const profileData = await fetchProfileByUsername(user.username);
              return {...user, ...profileData};
            } catch (e) {
              console.error(`Failed to fetch profile for ${user.username}:`, e);
              return user;
            }
          }
          return user;
        })
      )
      setConversations(completeData);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`${url}/api/chat/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      const filtered = data.filter(
        (u) =>
          u.id !== currentUserId &&
          (u.username?.toLowerCase().includes(query.toLowerCase()) ||
            u.email?.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(filtered);
    } catch (error) {
      console.error("Failed to search users:", error);
    }
  };

  const selectUser = (user) => {
    setSelectedUserId(user.id);
    setSelectedUser(user);

    // In mobile view, hide sidebar when a user is selected
    if (isMobileView) {
      setShowSidebar(false);
    }
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const getDisplayName = (user) => {
    return user.username || user.email?.split("@")[0] || "User";
  };

  const isUserOnline = (userId) => {
    return Boolean(onlineUsers[userId]);
  };

  const renderUserList = (users) => {
    if (loading) {
      return (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="text-center text-gray-500 py-6">
          {searchQuery ? "No users found" : "No conversations yet"}
        </div>
      );
    }

    return users.map((user) => (
      <div key={user.id} className="mb-1">
        <button
          onClick={() => selectUser(user)}
          className={`w-full text-left p-3 rounded-md transition-colors ${
            selectedUserId === user.id
              ? "bg-indigo-100 text-indigo-800"
              : "hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              {user?.profile_image ? (
                <Avatar>
                  <AvatarImage src={user.profile_image} alt="Profile" />
                  <AvatarFallback>{getDisplayName(user)[0]}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className="w-9 h-9">
                  <AvatarImage src="/avatar-placeholder.png" alt="Default" />
                </Avatar>
              )}
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
                  isUserOnline(user.id) ? "bg-green-400" : "bg-gray-400"
                } border-2 border-white`}
              ></div>
            </div>
            <div className="flex flex-col">
              <span className="truncate">{getDisplayName(user)}</span>
              <span className="text-xs text-gray-500">
                {isUserOnline(user.id) ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </button>
      </div>
    ));
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex">
      {/* Mobile back button */}
      {isMobileView && selectedUserId && !showSidebar && (
        <button
          onClick={toggleSidebar}
          className="fixed top-16 left-4 z-10 p-2 bg-indigo-600 rounded-full text-white shadow-md"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
        </button>
      )}

      {/* Sidebar */}
      {(!isMobileView || showSidebar) && (
        <div
          className={`${
            isMobileView ? "fixed inset-0 z-10 bg-white" : "w-80"
          } border-r border-gray-200 bg-white flex flex-col`}
        >
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
            {isMobileView && selectedUserId && (
              <button
                onClick={toggleSidebar}
                className="p-1 rounded-md hover:bg-gray-100"
              >
                <svg
                  className="w-6 h-6 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            )}
          </div>

          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            {searchQuery === ""
              ? renderUserList(conversations)
              : renderUserList(searchResults)}
          </div>
        </div>
      )}

      {/* Chat area */}
      <div
        className={`flex-1 ${isMobileView && showSidebar ? "hidden" : "flex"}`}
      >
        {selectedUserId ? (
          <Chat
            currentUserId={currentUserId}
            recipientId={selectedUserId}
            recipientName={selectedUser ? getDisplayName(selectedUser) : ""}
            isRecipientOnline={isUserOnline(selectedUserId)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center p-6 max-w-md">
              <div className="flex justify-center mb-4">
                <svg
                  className="w-16 h-16 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Your Messages
              </h3>
              <p className="text-gray-500 mb-6">
                Select a conversation or search for a user to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
