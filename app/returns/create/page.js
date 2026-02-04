"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrderAction } from "@/app/actions/orderActions";
import { createReturnAction } from "@/app/actions/returnActions";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { toast } from "react-hot-toast";
import { formatCurrency } from "@/utils/helpers";

function CreateReturnPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [reason, setReason] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  useEffect(() => {
    if (isAuthenticated && orderId) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await getOrderAction(orderId);
      setOrder(response.data || response);

      // Pre-select all items
      setSelectedItems(
        (response.data || response).items?.map((item) => item.id) || []
      );
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedItems.length === 0) {
      toast.error("Please select at least one item to return");
      return;
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for the return");
      return;
    }

    try {
      setSubmitting(true);

      const returnData = {
        order_id: orderId,
        reason: reason,
        notes: additionalNotes,
        items: selectedItems,
      };

      // console.log("Submitting return data:", returnData);

      // Call your return service
      const response = await createReturnAction(returnData);
      // console.log("Return response:", response);

      toast.success("Return request submitted successfully!");

      // Redirect to the specific return page instead of list
      if (response.data?.id) {
        router.push(`/returns/${response.data.id}`);
      } else {
        router.push("/returns");
      }
    } catch (error) {
      console.error("Failed to submit return:", error);
      console.error("Error details:", error.data);
      toast.error(
        error.data?.message || error.message || "Failed to submit return request"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mt-2">Please login to create a return</p>
          <Link
            href="/login"
            className="inline-block mt-6 px-6 py-3 bg-brand text-white rounded-lg hover:bg-[#e11e5a] transition-colors"
          >
            Login to Continue
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Order Not Found
          </h1>
          <p className="text-gray-600 mt-2">
            Unable to find the order for return
          </p>
          <Link
            href="/orders"
            className="inline-block mt-6 px-6 py-3 bg-brand text-white rounded-lg hover:bg-[#e11e5a] transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/orders/${orderId}`}
            className="flex items-center text-brand hover:text-[rgb(var(--brand-primary-dark))] mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Order
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Request Return</h1>
          <p className="text-gray-600 mt-2">
            Order #{order.order_number?.replace("ORD-", "")}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Order Summary */}
          <div className="mb-8 p-4 bg-brand-soft rounded-lg">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Order Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="font-medium">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{order.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Items</p>
                <p className="font-medium">{order.items?.length || 0}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Select Items */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Select Items to Return
              </h2>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="h-5 w-5 text-brand rounded focus:ring-[rgba(255,63,108,0.6)]"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-gray-900">
                        {item.product?.name}
                      </p>
                      <div className="flex justify-between mt-1">
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                        <p className="font-medium">
                          {formatCurrency(item.price_at_time * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Return Reason */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Reason for Return
              </h2>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(255,63,108,0.6)] focus:border-[rgb(var(--brand-primary))]"
                required
              >
                <option value="">Select a reason</option>
                <option value="Damaged product">Damaged product</option>
                <option value="Wrong item received">Wrong item received</option>
                <option value="Product not as described">
                  Product not as described
                </option>
                <option value="Size/Color not suitable">
                  Size/Color not suitable
                </option>
                <option value="Changed my mind">Changed my mind</option>
                <option value="Other">Other</option>
              </select>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgba(255,63,108,0.6)] focus:border-[rgb(var(--brand-primary))]"
                  placeholder="Please provide any additional details about your return..."
                />
              </div>
            </div>

            {/* Return Policy Info */}
            <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="font-bold text-yellow-800 mb-2">
                    Return Policy
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Returns are accepted within 30 days of delivery</li>
                    <li>
                      • Items must be in original condition with all tags
                      attached
                    </li>
                    <li>
                      • Refunds will be processed within 5-7 business days
                    </li>
                    <li>• Shipping costs for returns are not refundable</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Section */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span>You will receive email updates about your return</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={submitting || selectedItems.length === 0}
                >
                  Submit Return Request
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CreateReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
          <LoadingSpinner size="large" />
        </div>
      }
    >
      <CreateReturnPageContent />
    </Suspense>
  );
}



