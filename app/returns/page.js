"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { returnService, orderService } from "@/services/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  Package,
  RefreshCw,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ShoppingBag,
  Plus,
  Calendar,
  DollarSign,
  AlertCircle,
  Search,
  ChevronDown,
  X,
} from "lucide-react";

const returnStatusColors = {
  requested: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-green-100 text-green-800 border-green-200",
};

const returnStatusIcons = {
  requested: AlertTriangle,
  approved: CheckCircle,
  rejected: XCircle,
  completed: CheckCircle,
};

export default function ReturnsPage() {
  const { user, isAuthenticated } = useAuth();
  const [returns, setReturns] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState({
    open: false,
    orderId: "",
    reason: "",
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [returnsData, ordersData] = await Promise.all([
        returnService.getUserReturns(),
        orderService.getUserOrders(),
      ]);
      console.log("Fetched Returns Data:", returnsData);
      console.log("Fetched Orders Data:", ordersData);
      setReturns(returnsData.returns || []);
      setOrders(
        ordersData.orders?.filter((order) =>
          ["delivered", "completed"].includes(order.status)
        ) || []
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      setSnackbar({
        open: true,
        message: "Error loading data",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReturn = () => {
    if (!createDialog.orderId || !createDialog.reason) {
      setSnackbar({
        open: true,
        message: "Please select an order and provide a reason",
        severity: "error",
      });
      return;
    }

    submitReturnRequest();
  };

  const submitReturnRequest = async () => {
    try {
      await returnService.createReturn({
        order_id: createDialog.orderId,
        reason: createDialog.reason,
      });
      setSnackbar({
        open: true,
        message: "Return request submitted successfully",
        severity: "success",
      });
      setCreateDialog({ open: false, orderId: "", reason: "" });
      fetchData();
    } catch (error) {
      console.error("Error creating return:", error);
      setSnackbar({
        open: true,
        message: "Error submitting return request",
        severity: "error",
      });
    }
  };

  const filteredReturns = returns.filter((returnItem) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      returnItem.id.toLowerCase().includes(searchLower) ||
      (returnItem.order?.order_number || "")
        .toLowerCase()
        .includes(searchLower) ||
      returnItem.reason.toLowerCase().includes(searchLower) ||
      returnItem.status.toLowerCase().includes(searchLower)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-500 mr-2" />
            <p className="text-blue-700">Please login to view your returns.</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <RefreshCw className="h-8 w-8 mr-3 text-blue-600" />
            My Returns
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your return requests and track their status
          </p>
        </div>
        <button
          onClick={() =>
            setCreateDialog({ open: true, orderId: "", reason: "" })
          }
          disabled={orders.length === 0}
          className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
            orders.length === 0
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg"
          }`}
        >
          <Plus className="h-5 w-5 mr-2" />
          Request Return
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search returns by ID, order number, reason, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Returns Table */}
      {filteredReturns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Return Requests Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "No returns match your search criteria"
                : "You haven't made any return requests yet. Start by requesting a return for a delivered order."}
            </p>
            {!searchTerm && orders.length > 0 && (
              <button
                onClick={() =>
                  setCreateDialog({ open: true, orderId: "", reason: "" })
                }
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4 mr-2" />
                Request Your First Return
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Return ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Requested Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Refund Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReturns.map((returnItem) => {
                  const StatusIcon =
                    returnStatusIcons[returnItem.status] || AlertTriangle;
                  return (
                    <tr
                      key={returnItem.id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {returnItem.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ShoppingBag className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {returnItem.order?.order_number || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {returnItem.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {new Date(
                              returnItem.created_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-sm font-medium text-gray-900">
                            {returnItem.refund_amount
                              ? `$${returnItem.refund_amount}`
                              : "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                            returnStatusColors[returnItem.status]
                          }`}
                        >
                          <StatusIcon className="h-3 w-3 mr-1.5" />
                          {returnItem.status.charAt(0).toUpperCase() +
                            returnItem.status.slice(1)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {returns.length > 0 && (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg mr-4">
                <RefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">
                  {returns.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg mr-4">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {returns.filter((r) => r.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-50 rounded-lg mr-4">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {
                    returns.filter(
                      (r) => r.status === "requested" || r.status === "approved"
                    ).length
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 bg-red-50 rounded-lg mr-4">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {returns.filter((r) => r.status === "rejected").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Return Dialog */}
      {createDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowLeft className="h-5 w-5 text-blue-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Request Return
                  </h2>
                </div>
                <button
                  onClick={() =>
                    setCreateDialog({ open: false, orderId: "", reason: "" })
                  }
                  className="text-gray-400 hover:text-gray-600 transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Order
                  </label>
                  <div className="relative">
                    <select
                      value={createDialog.orderId}
                      onChange={(e) =>
                        setCreateDialog({
                          ...createDialog,
                          orderId: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none"
                    >
                      <option value="" disabled>
                        Choose an order...
                      </option>
                      {orders.map((order) => (
                        <option key={order.id} value={order.id}>
                          Order #{order.order_number} - ${order.total_amount} -{" "}
                          {order.status}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Return
                  </label>
                  <textarea
                    value={createDialog.reason}
                    onChange={(e) =>
                      setCreateDialog({
                        ...createDialog,
                        reason: e.target.value,
                      })
                    }
                    placeholder="Please describe why you want to return this item..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Please be specific about the reason for your return request.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() =>
                    setCreateDialog({ open: false, orderId: "", reason: "" })
                  }
                  className="px-5 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateReturn}
                  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex items-center"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Submit Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`rounded-lg shadow-lg border p-4 max-w-sm transform transition-all duration-300 ${
              snackbar.severity === "success"
                ? "bg-green-50 border-green-200"
                : snackbar.severity === "error"
                ? "bg-red-50 border-red-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-start">
              {snackbar.severity === "success" ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-3 shrink-0 mt-0.5" />
              ) : snackbar.severity === "error" ? (
                <XCircle className="h-5 w-5 text-red-600 mr-3 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-blue-600 mr-3 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={`font-medium ${
                    snackbar.severity === "success"
                      ? "text-green-800"
                      : snackbar.severity === "error"
                      ? "text-red-800"
                      : "text-blue-800"
                  }`}
                >
                  {snackbar.message}
                </p>
              </div>
              <button
                onClick={() => setSnackbar({ ...snackbar, open: false })}
                className="ml-4 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
