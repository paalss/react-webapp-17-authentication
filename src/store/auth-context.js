import { createContext, useCallback, useEffect, useState } from "react";

let logoutTimer;

const AuthContext = createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

export const AuthContextProvider = ({ children }) => {
  // Hent gyldig token om det finnes
  const initialToken = localStorage.getItem("token");
  const [token, setToken] = useState(initialToken);

  const isLoggedIn = !!token;

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("deadLine");

    clearTimeout(logoutTimer);
  }, []);

  const loginHandler = (token, deadLine) => {
    // gjør token tilgjengelig etter page reload
    localStorage.setItem("token", token);
    localStorage.setItem("deadLine", deadLine);
    logoutTimer = setTimeout(logoutHandler, deadLine - Date.now());
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
