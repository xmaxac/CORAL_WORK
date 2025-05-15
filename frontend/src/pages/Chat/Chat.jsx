import React, {
  useEffect,
  useState,
  useRef,
  useContext,
  useCallback,
} from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { AppContext } from "@/context/AppContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Chat = ({
  currentUserId,
  recipientId,
  recipientName,
  isRecipientOnline,
}) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [lastMarkedRecipient, setLastMarkedRecipient] = useState(null);
  const [messageProcessing, setMessageProcessing] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { token, url, fetchProfileByUsername, profile, setProfile } = useContext(AppContext);

  // Create a stable socket reference
  const socketRef = useRef(null);

  const fetchProfile = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      if (!profile || profile.username !== recipientName) {
        const fetchedProfile = await fetchProfileByUsername(
          recipientName,
          token
        );
        if (fetchedProfile) {
          setProfile(fetchedProfile);
        }
      }
    } catch (e) {
      console.error("Error fetching profile:", e);
      toast.error("Failed to load profile", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });
    }
  }, [recipientName, token, fetchProfileByUsername, setProfile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Initialize socket connection
  useEffect(() => {
    socketRef.current = io("http://localhost:4000", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on("connect", () => {
      setSocketConnected(true);
      socketRef.current.emit("register", currentUserId);
    });

    socketRef.current.on("disconnect", () => {
      setSocketConnected(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [currentUserId]);

  // Register user ID when socket connects or user changes
  useEffect(() => {
    if (socketRef.current && socketConnected) {
      socketRef.current.emit("register", currentUserId);
    }
  }, [currentUserId, socketConnected]);

  // Fetch message history when recipient changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!recipientId) return;

      setLoading(true);
      try {
        const response = await axios.get(`${url}/api/chat/${recipientId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;
        const uniqueMessages = Array.from(
          new Map(data.map(msg => [msg.id, msg])).values()
        );
        setMessages(uniqueMessages.reverse());
      } catch (e) {
        console.error("Failed to load messages", e);
      } finally {
        setLoading(false);
      }
    };

    if (recipientId) {
      fetchMessages();
    }
  }, [recipientId, token, url]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socketRef.current) return;

    const handleReceiveMessage = (data) => {
      console.log("Received message:", data);
      // Only add the message if it's part of this conversation
      if (
        (data.message.sender_id === recipientId &&
          data.message.recipient_id === currentUserId) ||
        (data.message.sender_id === currentUserId &&
          data.message.recipient_id === recipientId)
      ) {
        setMessages((prev) => {
          const messageExists = prev.some(msg => msg.id === data.message.id);
          if (messageExists) {
            return prev;
          }
          return [...prev, data.message];
        });
      }
    };

    const handleTyping = ({ fromUserId }) => {
      if (fromUserId === recipientId) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    };

    const handleReadReceipt = ({ reader_id, sender_id }) => {
      if (reader_id === recipientId && sender_id === currentUserId) {
        // Update messages to mark as read
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sender_id === currentUserId && !msg.read
              ? { ...msg, read: true }
              : msg
          )
        );
      }
    };

    socketRef.current.on("receiveMessage", handleReceiveMessage);
    socketRef.current.on("typing", handleTyping);
    socketRef.current.on("readReceipt", handleReadReceipt);

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receiveMessage", handleReceiveMessage);
        socketRef.current.off("typing", handleTyping);
        socketRef.current.off("readReceipt", handleReadReceipt);
      }
    };
  }, [recipientId, currentUserId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle marking messages as read when chat is visible
  useEffect(() => {
    if (
      !recipientId ||
      messages.length === 0 ||
      recipientId === lastMarkedRecipient
    )
      return;

    const timeout = setTimeout(() => {
      const markAsRead = async () => {
        try {
          await axios.put(
            `${url}/api/chat/read/${recipientId}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setLastMarkedRecipient(recipientId);
          handleMarkRead();
        } catch (error) {
          console.error("Failed to mark messages as read:", error);
        }
      };

      markAsRead();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [recipientId, messages, lastMarkedRecipient]);

  const handleSend = async () => {
    if (!newMessage.trim() || !socketRef.current) return;

    try {
      setMessageProcessing(true);

      const response = await axios.post(
        `${url}/api/chat/`,
        {
          recipient_id: recipientId,
          content: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const savedMessage = response.data;

      // Add message to local state to show it immediately
      setMessages((prev) => {
        // Check if the message already exists
        const messageExists = prev.some(msg => 
          msg.id === savedMessage.id || 
          (msg.content === savedMessage.content && 
           msg.sender_id === savedMessage.sender_id &&
           msg.recipient_id === savedMessage.recipient_id &&
           Math.abs(new Date(msg.created_at) - new Date(savedMessage.created_at)) < 1000)
        );
        
        if (messageExists) {
          return prev;
        }
        return [...prev, savedMessage];
      });

      // Notify other clients via socket
      socketRef.current.emit("sendMessage", {
        sender_id: currentUserId,
        recipient_id: recipientId,
        content: newMessage,
      });

      setNewMessage("");
      inputRef.current?.focus();
    } catch (e) {
      console.error("Message send failed", e);
      // Show error notification
      alert("Failed to send message. Please try again.");
    } finally {
      setMessageProcessing(false);
    }
  };

  const handleTyping = () => {
    if (socketRef.current && recipientId) {
      socketRef.current.emit("typing", {
        fromUserId: currentUserId,
        toUserId: recipientId,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Properly debounce typing events
  const [typingTimeout, setTypingTimeout] = useState(null);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout for typing indicator
    const newTimeout = setTimeout(() => {
      handleTyping();
    }, 300);

    setTypingTimeout(newTimeout);
  };

  // Clear typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

  const handleMarkRead = () => {
    if (socketRef.current && recipientId) {
      socketRef.current.emit("markRead", {
        reader_id: currentUserId,
        sender_id: recipientId,
      });
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Helper to group messages by date
  const groupMessagesByDate = (msgs) => {
    const groups = {};

    msgs.forEach((msg) => {
      const date = new Date(msg.created_at);
      const dateKey = date.toLocaleDateString();

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      groups[dateKey].push(msg);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      messages,
    }));
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-md shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-md">
        <div className="flex items-center space-x-3">
          {profile?.profile_image ? (
            <Avatar>
              <AvatarImage src={profile.profile_image} alt="Profile" />
              <AvatarFallback>{profile.username[0]}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="w-9 h-9">
              <AvatarImage src="/avatar-placeholder.png" alt="Default" />
            </Avatar>
          )}
          <div
            className={`absolute bottom-0 right-0 w-3 h03 rounded-full ${
              isRecipientOnline ? "bg-green-400" : "bg-gray-400"
            } border-2 border-r-white`}
          ></div>
          <div>
            <h3 className="font-medium text-gray-900">
              {recipientName || "Chat"}
            </h3>
            {isTyping ? (
              <span className="text-xs text-gray-500 animate-pulse">
                Typing...
              </span>
            ) : (
              <span className="text-xs text-gray-500">
                {isRecipientOnline ? "Online" : "Offline"}
              </span>
            )}
          </div>
        </div>

        {!socketConnected && (
          <div className="flex items-center text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Reconnecting...
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 p-4 overflow-y-auto w-full overflow-x-hidden space-y-4 bg-gray-50"
        onClick={handleMarkRead}
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No messages yet. Start the conversation!😊
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-4">
              {/* Date separator */}
              <div className="flex justify-center">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {new Date(group.date).toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>

              {/* Messages for this date */}
              {group.messages.map((msg, msgIndex) => (
                <div
                  key={`${groupIndex}-${msgIndex}`}
                  className={`flex ${
                    msg.sender_id === currentUserId
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] break-all rounded-lg px-4 py-2 ${
                      msg.sender_id === currentUserId
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-gray-700 border border-gray-200"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">
                      {msg.content}
                    </div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`text-xs mt-1 ${
                          msg.sender_id === currentUserId
                            ? "text-indigo-200"
                            : "text-gray-400"
                        }`}
                      >
                        {formatMessageTime(msg.created_at)}
                      </div>

                      {msg.sender_id === currentUserId && msg.read && (
                        <div className="text-xs ml-2 text-indigo-200">Read</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-200 bg-white rounded-b-md">
        <div className="flex items-center space-x-2">
          <textarea
            ref={inputRef}
            className="flex-1 resize-none border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={newMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            disabled={!socketConnected}
          />
          <button
            onClick={handleSend}
            disabled={!newMessage.trim() || !socketConnected}
            className={`p-2 rounded-md ${
              newMessage.trim() && socketConnected
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            } transition-colors`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
