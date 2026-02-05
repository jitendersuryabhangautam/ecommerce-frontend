"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getReturnByIdAction } from "@/app/actions/returnActions";
import {
  ArrowLeft,
  Receipt,
  Package,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  RefreshCw,
  Truck,
  CheckSquare,
  AlertCircle,
  ShoppingBag,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/utils/helpers";

const returnStatusColors = {
  requested: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-brand-soft text-[rgb(var(--brand-primary-dark))] border-[rgba(255,63,108,0.2)]",
  rejected: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-green-100 text-green-800 border-green-200",
};

const returnStatusIcons = {
  requested: AlertTriangle,
  approved: CheckCircle,
  rejected: XCircle,
  completed: CheckSquare,
};

export default function ReturnDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { isAuthenticated } = useAuth();
  const [returnItem, setReturnItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchReturnDetail();
    }
  }, [isAuthenticated, id]);

  const fetchReturnDetail = async () => {
    try {
      setLoading(true);
      const data = await getReturnByIdAction(id);
      setReturnItem(data.return || data);
    } catch (error) {
      console.error("Error fetching return details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-brand-soft border border-[rgba(255,63,108,0.2)] rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-brand mr-2" />
            <p className="text-[rgb(var(--brand-primary-dark))]">
              Please login to view return details.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (!returnItem) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">Return not found.</p>
          </div>
        </div>
      </div>
    );
  }

  const statusValue = returnItem.status || "requested";
  const StatusIcon = returnStatusIcons[statusValue] || AlertTriangle;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => router.push("/returns")}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Returns
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <RefreshCw className="h-8 w-8 mr-3 text-brand" />
            Return Details
          </h1>
          <p className="text-gray-600 mt-2">
            Return ID: <span className="font-mono">{returnItem.id}</span>
          </p>
        </div>
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${
            returnStatusColors[returnItem.status]
          }`}
        >
          <StatusIcon className="h-4 w-4 mr-2" />
          {statusValue.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Return Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-brand" />
              Return Information
            </h2>
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-1">
                    <div className="w-3 h-3 bg-brand rounded-full mr-2"></div>
                    <p className="text-sm font-medium text-gray-700">
                      Return ID
                    </p>
                  </div>
                  <p className="text-base font-mono text-gray-900">
                    {returnItem.id}
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <ShoppingBag className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm font-medium text-gray-700">
                      Order Number
                    </p>
                  </div>
                  <p className="text-base font-medium text-gray-900">
                    {returnItem.order?.order_number || "N/A"}
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm font-medium text-gray-700">
                      Request Date
                    </p>
                  </div>
                  <p className="text-base text-gray-900">
                    {new Date(returnItem.created_at).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>

                <div>
                  <div className="flex items-center mb-1">
                    <Clock className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm font-medium text-gray-700">
                      Last Updated
                    </p>
                  </div>
                  <p className="text-base text-gray-900">
                    {new Date(returnItem.updated_at).toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              {/* Reason for Return */}
              <div className="mt-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Reason for Return
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {returnItem.reason}
                  </p>
                </div>
              </div>

              {/* Refund Information */}
              {returnItem.refund_amount && (
                <div className="mt-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                    <IndianRupee className="h-5 w-5 mr-2 text-green-600" />
                    Refund Information
                  </h3>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Receipt className="h-5 w-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-green-800 font-medium">
                          Refund Amount Processed
                        </p>
                        <p className="text-2xl font-bold text-green-900">
                          {formatCurrency(returnItem.refund_amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Return Timeline
            </h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="shrink-0">
                  <div className="w-8 h-8 rounded-full bg-brand-soft flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-brand" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">
                    Return Requested
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(returnItem.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              {returnItem.updated_at &&
                returnItem.updated_at !== returnItem.created_at && (
                  <div className="flex items-start">
                    <div className="shrink-0">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        Status Updated
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(returnItem.updated_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

              {returnItem.status === "completed" &&
                returnItem.refund_amount && (
                  <div className="flex items-start">
                    <div className="shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckSquare className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        Refund Processed
                      </p>
                      <p className="text-sm text-gray-500">
                        Refund of {formatCurrency(returnItem.refund_amount)} completed
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Information Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ShoppingBag className="h-5 w-5 mr-2 text-gray-600" />
              Order Information
            </h2>
            <div className="border-t border-gray-200 pt-4">
              {returnItem.order ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Order Total
                    </p>
                    <div className="flex items-center mt-1">
                      <IndianRupee className="h-4 w-4 text-gray-400 mr-1" />
                      <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(returnItem.order.total_amount)}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Order Status
                    </p>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                      {returnItem.order.status}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Order Date
                    </p>
                    <div className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">
                        {new Date(
                          returnItem.order.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-brand-soft border border-[rgba(255,63,108,0.2)] rounded-lg p-4">
                  <div className="flex items-center">
                    <Info className="h-5 w-5 text-brand mr-2" />
                    <p className="text-[rgb(var(--brand-primary-dark))]">
                      Order information not available
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Next Steps
            </h2>
            <div className="border-t border-gray-200 pt-4">
              {returnItem.status === "requested" && (
                <div className="bg-brand-soft border border-[rgba(255,63,108,0.2)] rounded-lg p-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-brand mr-3 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-[rgb(var(--brand-primary-dark))]">Under Review</p>
                      <p className="text-sm text-[rgb(var(--brand-primary-dark))] mt-1">
                        Your return request has been submitted and is under
                        review by our team.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {returnItem.status === "approved" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <Truck className="h-5 w-5 text-green-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">
                        Return Approved
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Your return has been approved. Please ship the item back
                        using the provided return label.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {returnItem.status === "rejected" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <XCircle className="h-5 w-5 text-red-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">
                        Return Rejected
                      </p>
                      <p className="text-sm text-red-700 mt-1">
                        Your return request has been rejected. Contact customer
                        support for more information.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {returnItem.status === "completed" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">
                        Return Completed
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        Return process completed successfully. Refund has been
                        processed to your original payment method.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              Need Help?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              If you have questions about your return, contact our customer
              support team.
            </p>
            <button
              onClick={() => router.push("/contact")}
              className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}



