"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Save,
  Camera,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail } from "@/utils/helpers";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm({
    defaultValues: {
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: "",
      postal_code: "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch,
  } = useForm({
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  });

  const handleProfileUpdate = async (data) => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await updateProfile(data);
      if (result.success) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        resetProfile(data); // Update form with new data
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to update profile",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (data) => {
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const result = await changePassword(
        data.current_password,
        data.new_password
      );
      if (result.success) {
        setMessage({ type: "success", text: "Password changed successfully!" });
        resetPassword();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Failed to change password",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          {/* Profile Header */}
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="h-20 w-20 rounded-full bg-brand-soft flex items-center justify-center">
                    <User className="h-10 w-10 text-brand" />
                  </div>
                  <button className="absolute bottom-0 right-0 bg-brand text-white p-1 rounded-full hover:bg-[#e11e5a]">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {user.first_name} {user.last_name}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Member since{" "}
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "profile"
                    ? "border-brand text-brand"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab("password")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "password"
                    ? "border-brand text-brand"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Change Password
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === "orders"
                    ? "border-brand text-brand"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                My Orders
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "profile" && (
              <form onSubmit={handleSubmitProfile(handleProfileUpdate)}>
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First Name *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            {...registerProfile("first_name", {
                              required: "First name is required",
                            })}
                            className="input-primary pl-10"
                          />
                        </div>
                        {profileErrors.first_name && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.first_name.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last Name *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            {...registerProfile("last_name", {
                              required: "Last name is required",
                            })}
                            className="input-primary pl-10"
                          />
                        </div>
                        {profileErrors.last_name && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Contact Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Address *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            {...registerProfile("email", {
                              required: "Email is required",
                              validate: (value) =>
                                validateEmail(value) ||
                                "Please enter a valid email",
                            })}
                            className="input-primary pl-10"
                          />
                        </div>
                        {profileErrors.email && (
                          <p className="mt-1 text-sm text-red-600">
                            {profileErrors.email.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            {...registerProfile("phone")}
                            className="input-primary pl-10"
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Address Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            {...registerProfile("address")}
                            className="input-primary pl-10"
                            placeholder="123 Main St"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            {...registerProfile("city")}
                            className="input-primary"
                            placeholder="New York"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State/Province
                          </label>
                          <input
                            type="text"
                            {...registerProfile("state")}
                            className="input-primary"
                            placeholder="NY"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            {...registerProfile("country")}
                            className="input-primary"
                            placeholder="United States"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            {...registerProfile("postal_code")}
                            className="input-primary"
                            placeholder="10001"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-6 py-3 bg-brand text-white rounded-lg hover:bg-[#e11e5a] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {activeTab === "password" && (
              <form onSubmit={handleSubmitPassword(handlePasswordChange)}>
                <div className="space-y-6 max-w-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Change Password
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        {...registerPassword("current_password", {
                          required: "Current password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        className="input-primary pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.current_password && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordErrors.current_password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        {...registerPassword("new_password", {
                          required: "New password is required",
                          minLength: {
                            value: 6,
                            message: "Password must be at least 6 characters",
                          },
                        })}
                        className="input-primary pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                        )}
                      </button>
                    </div>
                    {passwordErrors.new_password && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordErrors.new_password.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        {...registerPassword("confirm_password", {
                          required: "Please confirm your password",
                          validate: (value) =>
                            value === watch("new_password") ||
                            "Passwords do not match",
                        })}
                        className="input-primary pl-10"
                      />
                    </div>
                    {passwordErrors.confirm_password && (
                      <p className="mt-1 text-sm text-red-600">
                        {passwordErrors.confirm_password.message}
                      </p>
                    )}
                  </div>

                  <div className="bg-brand-soft border border-[rgba(255,63,108,0.2)] rounded-lg p-4">
                    <h4 className="text-sm font-medium text-[rgb(var(--brand-primary-dark))] mb-2">
                      Password Requirements
                    </h4>
                    <ul className="text-sm text-[rgb(var(--brand-primary-dark))] space-y-1">
                      <li className="flex items-center">
                        <div className="h-2 w-2 bg-brand rounded-full mr-2"></div>
                        At least 6 characters long
                      </li>
                      <li className="flex items-center">
                        <div className="h-2 w-2 bg-brand rounded-full mr-2"></div>
                        Contains letters and numbers
                      </li>
                      <li className="flex items-center">
                        <div className="h-2 w-2 bg-brand rounded-full mr-2"></div>
                        Different from your previous password
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center px-6 py-3 bg-brand text-white rounded-lg hover:bg-[#e11e5a] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="h-5 w-5 mr-2" />
                          Change Password
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {activeTab === "orders" && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  My Orders
                </h3>
                <p className="text-gray-600 mb-6">
                  View and manage your recent orders. For detailed order
                  information, please visit the{" "}
                  <a
                    href="/orders"
                    className="text-brand hover:text-[rgb(var(--brand-primary-dark))] font-medium"
                  >
                    Orders page
                  </a>
                  .
                </p>

                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <div className="inline-flex p-3 bg-brand-soft rounded-lg mb-4">
                    <svg
                      className="h-8 w-8 text-brand"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    View All Orders
                  </h4>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    To see your complete order history and manage your orders,
                    please visit the orders page.
                  </p>
                  <a
                    href="/orders"
                    className="inline-flex items-center px-6 py-3 bg-brand text-white rounded-lg hover:bg-[#e11e5a]"
                  >
                    Go to Orders
                    <svg
                      className="ml-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



