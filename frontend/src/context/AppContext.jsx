import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AppContext = createContext(null);

const AppContextProvider = (props) => {
  // const url = "https://api.coralbase.net";
  const url = "http://localhost:4000";
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);

  // Fetch user data when token changes
  const fetchUserData = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${url}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data.user;
      setUser(userData);

      if (userData.username) {
        const profileResponse = await axios.get(
          `${url}/api/user/profile/${userData.username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setProfile(profileResponse.data)
      }
    } catch (e) {
      console.error("Error fetching user data:", e.response?.data);
      toast.error("Failed to fetch user data.", {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
      });

      if (e.response?.status === 401) {
        localStorage.removeItem("token");
        setToken("");
      }
    }
  }, [token, url])

  useEffect(() => {
    if (token) {
      fetchUserData();
    } else {
      setUser(null);
      setProfile(null);
    }
  }, [token, fetchUserData]);


  const fetchProfileByUsername = useCallback(async (username, token) => {
    if (!username || !token) return null;

    try {
      const response = await axios.get(`${url}/api/user/profile/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (e) {
      console.error("Error fetching profile data:", e.response?.data);
      toast.error("Failed to fetch user profile.", {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: true,
      });
      return null;
    }
  }, [url]);

  const contextValue = {
    url,
    token,
    setToken,
    user,
    setUser,
    profile,
    setProfile,
    fetchProfileByUsername,
    fetchUserData
  };

  return (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
