"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllOrdersAction,
  updateOrderStatusAction,
} from "@/app/actions/orderActions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-toastify";
import {
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Truck,
  IndianRupee,
  User,
  Calendar,
  AlertCircle,
  Edit,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { formatCurrency } from "@/utils/helpers";
import Link from "next/link";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-brand-soft text-[rgb(var(--brand-primary-dark))]",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const statusIcons = {
  pending: Clock,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  completed: CheckCircle,
  cancelled: XCircle,
  refunded: IndianRupee,
};

export default function AdminOrdersPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [rangeDays, setRangeDays] = useState(30);
  const [alert, setAlert] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    orderId: null,
    currentStatus: "",
  });
  const [newStatus, setNewStatus] = useState("");
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await getAllOrdersAction({ page, limit, range_days: rangeDays });
      const payload = data?.data || data;
      setOrders(payload.orders || []);
      setTotalPages(payload.meta?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showAlert("Error loading orders", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchOrders();
    }
  }, [isAuthenticated, isAdmin, page, limit, rangeDays]);

  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(
      () => setAlert({ show: false, message: "", type: "success" }),
      5000
    );
  };

  const handleStatusChange = (orderId, currentStatus) => {
    setStatusDialog({ open: true, orderId, currentStatus });
    setNewStatus(currentStatus);
  };

  const updateOrderStatus = async () => {
    try {
      await updateOrderStatusAction(statusDialog.orderId, {
        status: newStatus,
      });
      showAlert("Order status updated successfully", "success");
      fetchOrders();
      setStatusDialog({ open: false, orderId: null, currentStatus: "" });
    } catch (error) {
      console.error("Error updating order status:", error);
      const message =
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        "Error updating order status";
      showAlert(message, "error");
      toast.error(message);
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
      {/* Alert */}
      {alert.show && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <XCircle size={20} />
          )}
          <span>{alert.message}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Package className="text-brand h-6 w-6 sm:h-8 sm:w-8" size={32} />
          Order Management
        </h1>
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="md:hidden divide-y divide-gray-200">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status] || Clock;
            return (
              <div key={order.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-gray-500">
                      {order.user?.email || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${
                      statusColors[order.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <StatusIcon size={12} />
                    {order.status}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Items</p>
                    <p className="font-medium text-gray-900">
                      {Array.isArray(order.items) ? order.items.length : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(order.total_amount)}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                  <a
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Eye size={14} />
                    Details
                  </a>
                  <button
                    onClick={() => handleStatusChange(order.id, order.status)}
                    className="inline-flex items-center gap-2 px-3 py-2 border border-brand text-brand rounded-lg hover:bg-brand-soft transition-colors"
                  >
                    <Edit size={14} />
                    Change Status
                  </button>
                </div>
              </div>
            );
          })}

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => {
                const StatusIcon = statusIcons[order.status] || Clock;
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      {order.user?.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {Array.isArray(order.items) ? order.items.length : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(order.created_at).toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <span className="font-semibold">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full ${
                          statusColors[order.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <StatusIcon size={14} />
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <a
                          href={`/orders/${order.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <Eye size={16} />
                          Details
                        </a>
                        <button
                          onClick={() =>
                            handleStatusChange(order.id, order.status)
                          }
                          className="inline-flex items-center gap-2 px-3 py-2 border border-brand text-brand rounded-lg hover:bg-brand-soft transition-colors"
                        >
                          <Edit size={16} />
                          Change Status
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No orders found</p>
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

      {/* Status Update Dialog */}
      {statusDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Update Order Status</h2>
            </div>
            <div className="px-6 py-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(255,63,108,0.6)] focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
              <div className="mt-4 bg-brand-soft border border-[rgba(255,63,108,0.2)] rounded-lg p-4 flex items-start gap-3">
                <AlertCircle
                  className="text-brand mt-0.5 shrink-0"
                  size={20}
                />
                <p className="text-sm text-[rgb(var(--brand-primary-dark))]">
                  Changing the order status will notify the customer via email.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() =>
                  setStatusDialog({
                    open: false,
                    orderId: null,
                    currentStatus: "",
                  })
                }
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={updateOrderStatus}
                className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-[#e11e5a] transition-colors flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



