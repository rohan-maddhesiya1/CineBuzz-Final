// src/context/AuthContext.jsx
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // axios instance (baseURL points to your server)
  const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    // you can add defaults here like timeout
  });

  // helper to get token from localStorage
  const getToken = () => localStorage.getItem("token");

  // load user from localStorage once (on app start)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  // register
  const register = async (name, email, password) => {
    const res = await axiosInstance.post("/api/auth/register", {
      name,
      email,
      password,
    });
    if (!res.data.success) throw new Error(res.data.message || "Register failed");
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  // login (email + password)
  const login = async (email, password) => {
    const res = await axiosInstance.post("/api/auth/login", {
      email,
      password,
    });
    if (!res.data.success) throw new Error(res.data.message || "Login failed");
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data;
  };

  // logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  // refresh user from server (useful after membership purchase)
  const refreshUser = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await axiosInstance.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error("refreshUser error:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAdmin: user?.role === "admin",
        getToken,
        axios: axiosInstance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
