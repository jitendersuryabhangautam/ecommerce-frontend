"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { returnService } from "@/services/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  CheckCircle,
  XCircle,
  Clock,
  Package,
  DollarSign,
  User,
  Calendar,
  FileText,
  AlertCircle,
} from "lucide-react";

const returnStatusColors = {
  requested: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
  completed: "bg-green-100 text-green-800",
};

export default function AdminReturnsPage() {
  const { user, isAuthenticated } = useAuth();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchReturns();
    }
  }, [isAuthenticated, user]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      const data = await returnService.getAllReturns();
      setReturns(data.returns || []);
    } catch (error) {
      console.error("Error fetching returns:", error);
      showAlert("Error loading returns", "error");
    } finally {
      setLoading(false);
    }
  };

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

      await returnService.processReturn(returnId, payload);
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

  if (!isAuthenticated || user?.role !== "admin") {
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

      <h1 className="text-3xl font-bold mb-6 flex items-center gap-3">
        <Package className="text-blue-600" size={32} />
        Return Management
      </h1>

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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                    <User size={16} />
                    {returnItem.user?.email || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {returnItem.reason}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 flex items-center gap-2">
                    <Calendar size={16} />
                    {new Date(returnItem.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {returnItem.refund_amount ? (
                      <span className="flex items-center gap-1">
                        <DollarSign size={16} />
                        {returnItem.refund_amount}
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
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Process
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
                    $
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
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                <p className="text-sm text-blue-800">
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
