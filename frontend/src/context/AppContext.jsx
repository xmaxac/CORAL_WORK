import { createContext, useState } from "react";

export const AppContext = createContext(null);

const AppContextProvider = (props) => {

  const url = "http://localhost:4000";
  const [token, setToken] = useState("");

  const contextValue = {
    url,
    token,
    setToken
  }
  return (
    <AppContext.Provider value={contextValue}>
      {props.children}
    </AppContext.Provider>
  )
}
export default AppContextProvider;