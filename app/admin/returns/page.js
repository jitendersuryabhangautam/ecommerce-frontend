"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllReturnsAction,
  processReturnAction,
} from "@/app/actions/returnActions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  CheckCircle,
  XCircle,
  Clock,
  Package,
  IndianRupee,
  User,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/utils/helpers";

const returnStatusColors = {
  requested: "bg-yellow-100 text-yellow-800",
  approved: "bg-brand-soft text-[rgb(var(--brand-primary-dark))]",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
};

export default function AdminReturnsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [returns, setReturns] = useState([]);
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
  const [processDialog, setProcessDialog] = useState({
    open: false,
    returnId: null,
    currentStatus: "",
    refundAmount: "",
  });

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const data = await getAllReturnsAction({ page, limit, range_days: rangeDays });
      const payload = data?.data || data;
      setReturns(payload.returns || []);
      setTotalPages(payload.meta?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching returns:", error);
      showAlert("Error loading returns", "error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchReturns();
    }
  }, [isAuthenticated, isAdmin, page, limit, rangeDays]);

  const showAlert = (message, type = "success") => {
    setAlert({ show: true, message, type });
    setTimeout(
      () => setAlert({ show: false, message: "", type: "success" }),
      5000
    );
  };

  const handleProcessReturn = (returnItem) => {
    setProcessDialog({
      open: true,
      returnId: returnItem.id,
      currentStatus: returnItem.status,
      refundAmount: returnItem.refund_amount || "",
    });
  };

  const processReturn = async (action = "approve") => {
    try {
      const { returnId, refundAmount } = processDialog;
      const payload = {
        status: action === "approve" ? "approved" : "rejected",
        refund_amount: action === "approve" ? parseFloat(refundAmount) || 0 : 0,
      };

      await processReturnAction(returnId, payload);
      showAlert(
        `Return ${action === "approve" ? "approved" : "rejected"} successfully`,
        "success"
      );
      fetchReturns();
      setProcessDialog({
        open: false,
        returnId: null,
        currentStatus: "",
        refundAmount: "",
      });
    } catch (error) {
      console.error("Error processing return:", error);
      showAlert("Error processing return", "error");
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
    <div className="container mx-auto px-4 py-8">
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
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="text-brand" size={32} />
          Return Management
        </h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Range</label>
          <select
            value={rangeDays}
            onChange={(e) => setRangeDays(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Return ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Refund Amount
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
              {returns.map((returnItem) => (
                <tr key={returnItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {returnItem.id.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {returnItem.order?.order_number || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      {returnItem.user?.email || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div
                      className="max-w-xs truncate"
                      title={returnItem.reason}
                    >
                      {returnItem.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {new Date(returnItem.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {returnItem.refund_amount ? (
                      <span className="flex items-center gap-1 font-semibold">
                        <IndianRupee size={16} className="text-gray-400" />
                        {formatCurrency(returnItem.refund_amount)}
                      </span>
                    ) : (
                      "N/A"
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        returnStatusColors[returnItem.status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {returnItem.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {returnItem.status === "requested" && (
                      <button
                        onClick={() => handleProcessReturn(returnItem)}
                        className="bg-brand text-white px-4 py-2 rounded-lg hover:bg-[#e11e5a] transition-colors"
                      >
                        Process
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {returns.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">No returns found</p>
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

      {/* Process Return Dialog */}
      {processDialog.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold">Process Return Request</h2>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refund Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={processDialog.refundAmount}
                    onChange={(e) =>
                      setProcessDialog({
                        ...processDialog,
                        refundAmount: e.target.value,
                      })
                    }
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(255,63,108,0.6)] focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="bg-brand-soft border border-[rgba(255,63,108,0.2)] rounded-lg p-4 flex items-start gap-3">
                <AlertCircle
                  className="text-brand mt-0.5 shrink-0"
                  size={20}
                />
                <p className="text-sm text-[rgb(var(--brand-primary-dark))]">
                  This will approve the return and issue a refund to the
                  customer.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() =>
                  setProcessDialog({
                    open: false,
                    returnId: null,
                    currentStatus: "",
                    refundAmount: "",
                  })
                }
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => processReturn("reject")}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <XCircle size={16} />
                Reject
              </button>
              <button
                onClick={() => processReturn("approve")}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Approve & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



