import React, { useState, createContext } from "react";

export const AuthenticatedUserContext = createContext({});

export const AuthenticatedUserProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [baby, setBaby] = useState(null);

  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser, baby, setBaby }}>
      {children}
    </AuthenticatedUserContext.Provider>
  );
};
