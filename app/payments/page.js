"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getPaymentByOrderAction,
  getPaymentHistoryAction,
} from "@/app/actions/paymentActions";
import { toast } from "react-toastify";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/utils/helpers";
import {
  CreditCard,
  Calendar,
  IndianRupee,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Eye,
} from "lucide-react";

const statusColors = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

const statusIcons = {
  completed: CheckCircle,
  pending: Clock,
  failed: XCircle,
  refunded: IndianRupee,
};

function PaymentsPageContent() {
  const { user, isAuthenticated } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [viewLoadingId, setViewLoadingId] = useState(null);
  const searchParams = useSearchParams();
  const orderIdFilter = searchParams.get("order_id");

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
    }
  }, [isAuthenticated, orderIdFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      if (orderIdFilter) {
        const response = await getPaymentByOrderAction(orderIdFilter);
        const paymentData =
          response?.data?.data ||
          response?.data ||
          response?.payment ||
          response;
        setPayments(paymentData ? [paymentData] : []);
        return;
      }

      const response = await getPaymentHistoryAction();
      const extracted =
        response?.data?.payments ||
        response?.payments ||
        response?.data?.data?.payments ||
        response?.data?.data ||
        response?.data ||
        [];
      setPayments(Array.isArray(extracted) ? extracted : []);
    } catch (error) {
      console.error("Error fetching payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayment = async (orderId) => {
    if (!orderId) {
      toast.error("Order ID not found for this payment");
      return;
    }
    try {
      setViewLoadingId(orderId);
      const response = await getPaymentByOrderAction(orderId);
      const paymentData =
        response?.data?.data ||
        response?.data ||
        response?.data?.data?.payment ||
        response?.payment ||
        response;
      setSelectedPayment(paymentData);
      // console.log("Payment by order response:", response);
    } catch (error) {
      console.error("Error fetching payment by order:", error);
      toast.error("Failed to load payment details");
    } finally {
      setViewLoadingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <span className="text-red-800">
            Please log in to view your payments.
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
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3 text-gray-900">
          <CreditCard className="text-brand h-6 w-6 sm:h-8 sm:w-8" size={32} />
          Payment History
        </h1>
        <p className="text-gray-600">View all your payment transactions</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="md:hidden divide-y divide-gray-200">
          {payments.map((payment, index) => {
            const StatusIcon = statusIcons[payment.status] || Clock;
            return (
              <div
                key={
                  payment.id ||
                  payment.transaction_id ||
                  `${payment.order_id || "payment"}-${payment.created_at || "date"}-${index}`
                }
                className="px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {(payment.transaction_id ||
                        (payment.id ? String(payment.id).substring(0, 12) : "N/A"))}
                    </p>
                    <p className="text-xs text-gray-500">
                      Order: {payment.order?.order_number || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full ${
                      statusColors[payment.status] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <StatusIcon size={12} />
                    {payment.status}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  {payment.created_at
                    ? new Date(payment.created_at).toLocaleDateString()
                    : "N/A"}
                </div>
                <div className="mt-2 text-sm text-gray-700 flex items-center gap-2">
                  <CreditCard size={14} className="text-gray-400" />
                  {payment.payment_method || "N/A"}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                    <IndianRupee size={14} className="text-gray-400" />
                    {formatCurrency(payment.amount)}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <button
                      onClick={() => handleViewPayment(payment.order_id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-brand hover:bg-brand-soft rounded-lg transition-colors"
                    >
                      <Eye size={14} />
                      {viewLoadingId === payment.order_id ? "Loading..." : "View"}
                    </button>
                    {payment.status === "completed" && (
                      <button className="inline-flex items-center gap-1 px-2.5 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Download size={14} />
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
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
              {payments.map((payment) => {
                const StatusIcon = statusIcons[payment.status] || Clock;
                return (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(payment.transaction_id ||
                        (payment.id ? String(payment.id).substring(0, 12) : "N/A"))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.order?.order_number || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        {new Date(payment.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-gray-400" />
                        {payment.payment_method || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      <span className="font-semibold flex items-center justify-end gap-1">
                        <IndianRupee size={16} className="text-gray-400" />
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex items-center gap-1.5 text-xs leading-5 font-semibold rounded-full ${
                          statusColors[payment.status] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <StatusIcon size={14} />
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewPayment(payment.order_id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-brand hover:bg-brand-soft rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                          {viewLoadingId === payment.order_id
                            ? "Loading..."
                            : "View"}
                        </button>
                        {payment.status === "completed" && (
                          <button
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                            title="Download Receipt"
                          >
                            <Download size={16} />
                            Receipt
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {payments.length === 0 && (
            <div className="text-center py-12">
              <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-2">
                No payments found
              </p>
              <p className="text-gray-400 text-sm">
                Your payment history will appear here once you make a purchase
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedPayment && (
        <div className="mt-6 bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Details
            </h2>
            <button
              onClick={() => setSelectedPayment(null)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Payment ID</p>
              <p className="font-medium text-gray-900">{selectedPayment.id}</p>
            </div>
            <div>
              <p className="text-gray-500">Order ID</p>
              <p className="font-medium text-gray-900">
                {selectedPayment.order_id}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Status</p>
              <p className="font-medium text-gray-900">
                {selectedPayment.status}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Payment Method</p>
              <p className="font-medium text-gray-900">
                {selectedPayment.payment_method}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Amount</p>
              <p className="font-medium text-gray-900">
                {formatCurrency(selectedPayment.amount)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Created At</p>
              <p className="font-medium text-gray-900">
                {new Date(selectedPayment.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Summary Card */}
      {payments.length > 0 && (
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600 h-5 w-5 sm:h-6 sm:w-6" size={24} />
              <div>
                <p className="text-sm text-green-600 font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-800">
                  {payments.filter((p) => p.status === "completed").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-600 h-5 w-5 sm:h-6 sm:w-6" size={24} />
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {payments.filter((p) => p.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-brand-soft border border-[rgba(255,63,108,0.2)] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <IndianRupee className="text-brand h-5 w-5 sm:h-6 sm:w-6" size={24} />
              <div>
                <p className="text-sm text-brand font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-[rgb(var(--brand-primary-dark))]">
                  {formatCurrency(
                    payments
                      .filter((p) => p.status === "completed")
                      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0)
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="large" />
        </div>
      }
    >
      <PaymentsPageContent />
    </Suspense>
  );
}


