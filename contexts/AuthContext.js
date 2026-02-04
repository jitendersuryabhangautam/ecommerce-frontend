"use client";

import {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  loginAction,
  registerAction,
  logoutAction,
  getProfileAction,
  updateProfileAction,
  changePasswordAction,
} from "@/app/actions/authActions";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(async () => {
    await logoutAction();
    setUser(null);
    router.push("/login");
    toast.info("Logged out successfully");
  }, [router]);

  useEffect(() => {
    const initializeAuth = async () => {
      const result = await getProfileAction();
      if (result.success) {
        setUser(result.user);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []); // Empty dependency array - runs only once on mount

  const fetchProfile = async () => {
    const result = await getProfileAction();
    if (result.success) {
      setUser(result.user);
    } else {
      logout();
    }
  };

  const login = async (email, password) => {
    const result = await loginAction(email, password);
    if (result.success) {
      setUser(result.user);
      toast.success("Login successful!");
      return { success: true };
    }
    toast.error(result.error || "Login failed");
    return { success: false, error: result.error };
  };

  const register = async (userData) => {
    const result = await registerAction(userData);
    if (result.success) {
      setUser(result.user);
      toast.success("Registration successful!");
      return { success: true };
    }
    toast.error(result.error || "Registration failed");
    return { success: false, error: result.error };
  };

  const updateProfile = async (profileData) => {
    const result = await updateProfileAction(profileData);
    if (result.success) {
      setUser(result.user);
      toast.success("Profile updated successfully!");
      return { success: true };
    }
    toast.error(result.error || "Update failed");
    return { success: false, error: result.error };
  };

  const changePassword = async (currentPassword, newPassword) => {
    const result = await changePasswordAction(currentPassword, newPassword);
    if (result.success) {
      toast.success("Password changed successfully!");
      return { success: true };
    }
    toast.error(result.error || "Password change failed");
    return { success: false, error: result.error };
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
