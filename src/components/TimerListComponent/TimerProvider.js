import React, { useState, createContext } from "react";

export const TimerContext = createContext({});

export const TimerProvider = ({ children }) => {
  const [napText, setNapText] = useState();
  return (
    <TimerContext.Provider
      value={{
        napText,
        setNapText,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
