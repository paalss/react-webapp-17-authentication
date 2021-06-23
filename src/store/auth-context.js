import { createContext, useCallback, useEffect, useState } from "react";

let logoutTimer;

const AuthContext = createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

export const AuthContextProvider = ({ children }) => {
  // console.debug("AuthContextProvider RUNNING");
  // Hent gyldig token om det finnes
  const initialToken = localStorage.getItem("token");
  const [token, setToken] = useState(initialToken);

  const isLoggedIn = !!token;
  // console.log("logget inn?", isLoggedIn);

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("deadLine");

    clearTimeout(logoutTimer);
  }, []);

  const loginHandler = (token, deadLine) => {
    // console.debug("loginHandler RUNNING");
    // gjør token og deadline tilgjengelig etter page reload
    localStorage.setItem("token", token);
    localStorage.setItem("deadLine", deadLine);
    // console.log("localstorage har lagret token og deadline");

    logoutTimer = setTimeout(logoutHandler, deadLine - Date.now());
    // console.log("setToken(token)");
    setToken(token);
  };

  // sett logouthandler til remaining time hvis man logges inn automatisk
  useEffect(() => {
    if (token) {
      let timeLeft = localStorage.getItem("deadLine") - Date.now();
      if (timeLeft < 6000) timeLeft = 0;
      logoutTimer = setTimeout(logoutHandler, timeLeft);
    }
  }, [token, logoutHandler]);

  const contextValue = {
    token,
    isLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
