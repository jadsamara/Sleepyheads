import React, { useState, createContext, useEffect } from "react";
import { Platform } from "react-native";

export const GeneralContext = createContext({});

export const GeneralProvider = ({ children }) => {
  const [adState, setAdState] = useState("");

  useEffect(() => {
    if (Platform.OS === "android") {
      setAdState("ca-app-pub-5241901605191458/2025728345");
    } else {
      setAdState("ca-app-pub-5241901605191458/2967501896");
    }
  }, []);

  return (
    <GeneralContext.Provider value={{ adState }}>
      {children}
    </GeneralContext.Provider>
  );
};
