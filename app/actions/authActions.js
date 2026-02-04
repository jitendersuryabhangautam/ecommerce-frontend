"use server";

import { cookies } from "next/headers";
import { apiHandler } from "@/lib/server/apiHandler";

const ACCESS_COOKIE = "access_token";
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

const extractAuth = (data) => {
  const payload = data?.data || data;
  return {
    user: payload?.user,
    accessToken: payload?.access_token,
  };
};

export const loginAction = async (email, password) => {
  try {
    const data = await apiHandler({
      path: "/auth/login",
      method: "POST",
      body: { email, password },
      auth: false,
    });
    const { user, accessToken } = extractAuth(data);
    if (accessToken) {
      const cookieStore = await cookies();
      cookieStore.set(ACCESS_COOKIE, accessToken, cookieOptions);
    }
    return { success: true, user, data };
  } catch (error) {
    return {
      success: false,
      error: error.data?.message || error.message,
      status: error.status,
      data: error.data,
    };
  }
};

export const registerAction = async (userData) => {
  try {
    const data = await apiHandler({
      path: "/auth/register",
      method: "POST",
      body: userData,
      auth: false,
    });
    const { user, accessToken } = extractAuth(data);
    if (accessToken) {
      const cookieStore = await cookies();
      cookieStore.set(ACCESS_COOKIE, accessToken, cookieOptions);
    }
    return { success: true, user, data };
  } catch (error) {
    return {
      success: false,
      error: error.data?.message || error.message,
      status: error.status,
      data: error.data,
    };
  }
};

export const logoutAction = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  return { success: true };
};

export const getProfileAction = async () => {
  try {
    const data = await apiHandler({ path: "/users/profile" });
    return { success: true, user: data?.data || data, data };
  } catch (error) {
    return {
      success: false,
      error: error.data?.message || error.message,
      status: error.status,
      data: error.data,
    };
  }
};

export const updateProfileAction = async (profileData) => {
  try {
    const data = await apiHandler({
      path: "/users/profile",
      method: "PUT",
      body: profileData,
    });
    return { success: true, user: data?.data || data, data };
  } catch (error) {
    return {
      success: false,
      error: error.data?.message || error.message,
      status: error.status,
      data: error.data,
    };
  }
};

export const changePasswordAction = async (
  currentPassword,
  newPassword
) => {
  try {
    const data = await apiHandler({
      path: "/users/change-password",
      method: "PUT",
      body: {
        current_password: currentPassword,
        new_password: newPassword,
      },
    });
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.data?.message || error.message,
      status: error.status,
      data: error.data,
    };
  }
};
