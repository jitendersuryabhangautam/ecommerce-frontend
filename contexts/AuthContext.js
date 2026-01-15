"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "@/services/api";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
    toast.info("Logged out successfully");
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/users/profile");
      setUser(response.data.data);
      localStorage.setItem("user", JSON.stringify(response.data.data));
    } catch (error) {
      logout();
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { user, access_token } = response.data.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { user, access_token } = response.data.data;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      toast.success("Registration successful!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put("/users/profile", profileData);
      setUser(response.data.data);
      localStorage.setItem("user", JSON.stringify(response.data.data));
      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put("/users/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully!");
      return { success: true };
    } catch (error) {
      toast.error(error.response?.data?.message || "Password change failed");
      return { success: false, error: error.response?.data?.message };
    }
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
