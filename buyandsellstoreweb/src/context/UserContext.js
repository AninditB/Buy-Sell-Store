import React, { createContext, useState, useContext, useEffect } from "react";

// Create User Context
const UserContext = createContext();

// Custom hook to use User Context
export const useUserContext = () => useContext(UserContext);

// User Context Provider
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Load from localStorage on first render
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // Save to localStorage
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
