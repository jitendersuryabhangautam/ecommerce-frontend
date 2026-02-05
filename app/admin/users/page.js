"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAdminUsersAction,
  updateAdminUserRoleAction,
} from "@/app/actions/adminActions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Users, AlertCircle, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
  const { isAuthenticated, isAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [rangeDays, setRangeDays] = useState(30);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminUsersAction({
        page,
        limit,
        range_days: rangeDays,
      });
      const payload = response?.data || response;
      setUsers(payload?.users || []);
      setTotalPages(payload?.meta?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load users:", err);
      setError(err?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin, page, limit, rangeDays]);

  const handleRoleChange = async (userId, role) => {
    try {
      setUpdatingId(userId);
      await updateAdminUserRoleAction(userId, role);
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role:", err);
      setError(err?.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-800">
            Access denied. Admin privileges required.
          </span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <Link
        href="/admin"
        className="inline-flex items-center text-brand hover:text-[rgb(var(--brand-primary-dark))] mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Users className="text-brand h-6 w-6 sm:h-7 sm:w-7" size={28} />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Users
          </h1>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <label className="text-sm text-gray-600">Range</label>
          <select
            value={rangeDays}
            onChange={(e) => setRangeDays(Number(e.target.value))}
            className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={180}>Last 180 days</option>
            <option value={365}>Last 365 days</option>
          </select>
          <select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            className="w-full sm:w-auto border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="md:hidden divide-y divide-gray-200">
          {users.map((user) => (
            <div key={user.id} className="px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <Shield size={12} className="text-gray-400" />
                  {user.role}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <button
                  onClick={() => handleRoleChange(user.id, "admin")}
                  disabled={
                    user.role === "admin" ||
                    updatingId === user.id ||
                    user.id === currentUser?.id
                  }
                  className="text-brand hover:text-[rgb(var(--brand-primary-dark))] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Make Admin
                </button>
                <button
                  onClick={() => handleRoleChange(user.id, "customer")}
                  disabled={
                    user.role === "customer" ||
                    updatingId === user.id ||
                    user.id === currentUser?.id
                  }
                  className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Make Customer
                </button>
                {user.id === currentUser?.id && (
                  <span className="text-xs text-gray-500">(current user)</span>
                )}
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found.
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <span className="inline-flex items-center gap-2">
                      <Shield size={14} className="text-gray-400" />
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleRoleChange(user.id, "admin")}
                        disabled={
                          user.role === "admin" ||
                          updatingId === user.id ||
                          user.id === currentUser?.id
                        }
                        className="text-brand hover:text-[rgb(var(--brand-primary-dark))] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Make Admin
                      </button>
                      <button
                        onClick={() => handleRoleChange(user.id, "customer")}
                        disabled={
                          user.role === "customer" ||
                          updatingId === user.id ||
                          user.id === currentUser?.id
                        }
                        className="text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Make Customer
                      </button>
                      {user.id === currentUser?.id && (
                        <span className="text-xs text-gray-500">
                          (current user)
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No users found.
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => {
              const pageNumber = i + 1;
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= page - 1 && pageNumber <= page + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setPage(pageNumber)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      page === pageNumber
                        ? "bg-brand text-white"
                        : "border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              if (pageNumber === page - 2 || pageNumber === page + 2) {
                return (
                  <span key={pageNumber} className="px-2">
                    ...
                  </span>
                );
              }
              return null;
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
