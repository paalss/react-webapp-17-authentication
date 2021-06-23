import { createContext, useCallback, useEffect, useState } from "react";

let logoutTimer;

const AuthContext = createContext({
  token: "",
  isLoggedIn: false,
  login: (token) => {},
  logout: () => {},
});

const calcRemainingTime = (deadLine) => {
  const currentTime = Date.now();
  console.log(currentTime);
  const adjDeadLine = new Date(deadLine).getTime();

  const remainingTime = adjDeadLine - currentTime;

  return remainingTime;
};

// Hent stored token som ikke har gått ut på dato, om mulig
const retrieveValidToken = () => {
  const storedToken = localStorage.getItem("token");
  const storedDeadLine = localStorage.getItem("deadLine");

  const remainingTime = calcRemainingTime(storedDeadLine);

  // threshold på et minutt. Ikke logg inn om remaining time er under et minutt
  if (remainingTime <= 60000) {
    localStorage.removeItem("token");
    localStorage.removeItem("deadLine");
    return null;
  }

  return {
    token: storedToken,
    duration: remainingTime,
  };
};

export const AuthContextProvider = ({ children }) => {
  const tokenData = retrieveValidToken();
  let initialToken;
  if (tokenData) {
    initialToken = tokenData.token;
  }
  const [token, setToken] = useState(initialToken);

  const userIsLoggedIn = !!token;

  const logoutHandler = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("deadLine");

    if (logoutTimer) {
      clearTimeout(logoutTimer);
    }
  }, []);

  const loginHandler = (token, deadLine) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("deadLine", deadLine);

    const remainingTime = calcRemainingTime(deadLine);

    logoutTimer = setTimeout(logoutHandler, remainingTime);
  };

  // tokenData skal bare endres når komponentet først kjøres
  // hvis automatisk logget inn, kjør logouttimer etter duration
  // Hele dette componentet vil kjøres ved initialisering
  useEffect(() => {
    if (tokenData) {
      logoutTimer = setTimeout(logoutHandler, tokenData.duration);
    }
  }, [tokenData, logoutHandler]);

  const contextValue = {
    token: token,
    isLoggedIn: userIsLoggedIn,
    login: loginHandler,
    logout: logoutHandler,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;
