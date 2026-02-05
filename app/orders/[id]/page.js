"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Home,
  ArrowLeft,
  Download,
  Printer,
  MessageCircle,
  RefreshCw,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrderAction, cancelOrderAction } from "@/app/actions/orderActions";
import { getUserReturnsAction } from "@/app/actions/returnActions";
import { formatCurrency, formatDate, getProductImage } from "@/utils/helpers";
import {
  ORDER_STATUS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS,
  RETURN_STATUS,
} from "@/utils/constants";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { toast } from "react-hot-toast";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(false);
  const [returning, setReturning] = useState(false);
  const [returnItem, setReturnItem] = useState(null);

  useEffect(() => {
    if (params.id && isAuthenticated) {
      fetchOrder();
    }
  }, [params.id, isAuthenticated]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const [orderResponse, returnsResponse] = await Promise.all([
        getOrderAction(params.id),
        getUserReturnsAction(),
      ]);
      // console.log("Order detail API response:", orderResponse);
      // console.log("Order detail returns response:", returnsResponse);

      const extractedOrder =
        orderResponse?.data?.data ||
        orderResponse?.data?.order ||
        orderResponse?.data ||
        orderResponse?.order ||
        orderResponse;
      setOrder(extractedOrder);

      const extractArray = (response, key) => {
        if (response?.data?.[key]) return response.data[key];
        if (response?.[key]) return response[key];
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data?.data)) return response.data.data;
        return [];
      };

      const returnsData = extractArray(returnsResponse, "returns");
      const matchedReturn = returnsData.find((item) => {
        const orderId = item.order_id || item.order?.id || item.orderId;
        return orderId === params.id || orderId === extractedOrder?.id;
      });
      setReturnItem(matchedReturn || null);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      toast.error("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCanceling(true);
      await cancelOrderAction(params.id);
      toast.success("Order cancelled successfully");
      fetchOrder(); // Refresh order data
    } catch (error) {
      toast.error(error.data?.message || error.message || "Failed to cancel order");
    } finally {
      setCanceling(false);
    }
  };

  const handleCreateReturn = async () => {
    try {
      setReturning(true);
      // Navigate to return creation page with order ID
      router.push(`/returns/create?order_id=${order.id}`);
    } catch (error) {
      toast.error("Failed to initiate return");
    } finally {
      setReturning(false);
    }
  };

  const handleViewPayment = () => {
    if (order?.id) {
      // Navigate to payment page for this order
      router.push(`/payments?order_id=${order.id}`);
    } else {
      toast.error("Order ID not found");
    }
  };

  const handleContactSupport = () => {
    // Navigate to contact page with order context
    router.push(`/contact?order_id=${order?.id || ""}&subject=Order%20Support`);
  };

  const handlePrintInvoice = () => {
    // Implement invoice printing logic
    window.print();
  };

  const handleDownloadInvoice = async () => {
    try {
      // Mock invoice download - in real app, call API to generate invoice
      const invoiceContent = `
        Invoice for Order #${order?.order_number}
        Date: ${formatDate(order?.created_at || new Date())}
        
        Items:
          ${order?.items
          ?.map(
            (item) =>
              `${item.product?.name} x ${item.quantity} - ${formatCurrency(
                item.price_at_time * item.quantity
              )}`
          )
          .join("\n")}

        Total: ${formatCurrency(order?.total_amount)}
        
        Shipping Address:
        ${order?.shipping_address?.full_name}
        ${order?.shipping_address?.street}
        ${order?.shipping_address?.city}, ${order?.shipping_address?.state} ${
          order?.shipping_address?.postal_code
        }
        
        Thank you for your order!
      `;

      const blob = new Blob([invoiceContent], { type: "text/plain" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${order?.order_number}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.COMPLETED:
      case ORDER_STATUS.DELIVERED:
        return CheckCircle;
      case "return_requested":
        return RefreshCw;
      case ORDER_STATUS.CANCELLED:
        return XCircle;
      case ORDER_STATUS.SHIPPED:
        return Truck;
      default:
        return Clock;
    }
  };

  const canCancelOrder =
    order?.status === ORDER_STATUS.PENDING ||
    order?.status === ORDER_STATUS.PROCESSING;
  const canReturnOrder =
    (order?.status === ORDER_STATUS.DELIVERED ||
      order?.status === ORDER_STATUS.COMPLETED) &&
    // Check if return already exists
    !returnItem;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mt-2">
            Please login to view order details
          </p>
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
          <Package className="h-16 w-16 text-gray-400 mx-auto" />
          <h1 className="text-2xl font-bold text-gray-900 mt-4">
            Order Not Found
          </h1>
          <p className="text-gray-600 mt-2">
            The order you're looking for doesn't exist
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

  const StatusIcon = getStatusIcon(order.status);
  const statusLabel =
    order.status === "return_requested"
      ? "Return Requested"
      : ORDER_STATUS_LABELS[order.status] || order.status;
  const statusColorClass =
    ORDER_STATUS_COLORS[order.status] ||
    (order.status === "return_requested"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-gray-100 text-gray-800");
  const returnStatusLabels = {
    [RETURN_STATUS.REQUESTED]: "Return Requested",
    [RETURN_STATUS.APPROVED]: "Return Approved",
    [RETURN_STATUS.REJECTED]: "Return Rejected",
    [RETURN_STATUS.COMPLETED]: "Return Completed",
  };
  const returnStatusColors = {
    [RETURN_STATUS.REQUESTED]: "bg-yellow-100 text-yellow-800",
    [RETURN_STATUS.APPROVED]: "bg-brand-soft text-[rgb(var(--brand-primary-dark))]",
    [RETURN_STATUS.REJECTED]: "bg-red-100 text-red-800",
    [RETURN_STATUS.COMPLETED]: "bg-green-100 text-green-800",
  };
  const returnStatus = returnItem?.status || RETURN_STATUS.REQUESTED;

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Link
                href="/orders"
                className="flex items-center text-brand hover:text-[rgb(var(--brand-primary-dark))] mr-4 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Orders
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Order Details
              </h1>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrintInvoice}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Invoice
              </button>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Order #{order.order_number?.replace("ORD-", "")} • Placed on{" "}
            {formatDate(order.created_at)}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Order Summary */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Status Card */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <div
                    className={`${statusColorClass} px-4 py-2 rounded-full flex items-center`}
                  >
                    <StatusIcon className="h-5 w-5 mr-2" />
                    <span className="font-medium">{statusLabel}</span>
                  </div>
                  {returnItem && (
                    <div
                      className={`px-4 py-2 rounded-full flex items-center ${returnStatusColors[returnStatus]}`}
                    >
                      {(returnStatus === RETURN_STATUS.REJECTED && (
                        <AlertTriangle className="h-5 w-5 mr-2" />
                      )) || <RefreshCw className="h-5 w-5 mr-2" />}
                      <span className="font-medium">
                        {returnStatusLabels[returnStatus] || "Return Requested"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="sm:text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </p>
                  <p className="text-sm text-gray-500">Total Amount</p>
                </div>
              </div>

              {/* Status Timeline */}
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 ml-3"></div>
                {(() => {
                  const steps = [
                    {
                      status: ORDER_STATUS.PENDING,
                      label: "Order Placed",
                      date: order.created_at,
                      type: "order",
                    },
                    {
                      status: ORDER_STATUS.PROCESSING,
                      label: "Processing",
                      date: order.updated_at,
                      type: "order",
                    },
                    {
                      status: ORDER_STATUS.SHIPPED,
                      label: "Shipped",
                      date: null,
                      type: "order",
                    },
                    {
                      status: ORDER_STATUS.DELIVERED,
                      label: "Delivered",
                      date: null,
                      type: "order",
                    },
                  ];

                  if (order.status === ORDER_STATUS.CANCELLED) {
                    steps.push({
                      status: ORDER_STATUS.CANCELLED,
                      label: "Cancelled",
                      date: order.updated_at || order.created_at,
                      type: "order",
                    });
                  }

                  if (order.status === "return_requested") {
                    steps.push({
                      status: "return_requested",
                      label: "Return Requested",
                      date: order.updated_at || order.created_at,
                      type: "return",
                    });
                  }

                  if (returnItem) {
                    steps.push({
                      status: returnStatus,
                      label:
                        returnStatusLabels[returnStatus] || "Return Requested",
                      date: returnItem.created_at || returnItem.updated_at,
                      type: "return",
                    });
                  }

                  const normalizedStatus =
                    order.status === "return_requested"
                      ? ORDER_STATUS.DELIVERED
                      : order.status === ORDER_STATUS.CANCELLED
                        ? ORDER_STATUS.PENDING
                        : order.status;
                  const orderProgressIndex = [
                    ORDER_STATUS.PENDING,
                    ORDER_STATUS.PROCESSING,
                    ORDER_STATUS.SHIPPED,
                    ORDER_STATUS.DELIVERED,
                    ORDER_STATUS.COMPLETED,
                  ].indexOf(normalizedStatus);

                  return steps.map((step, index) => {
                    const isCompleted =
                      step.type === "return"
                        ? true
                        : orderProgressIndex >= index;
                    const isCurrent =
                      step.type === "return"
                        ? true
                        : order.status === step.status;

                    return (
                      <div
                        key={`${step.type}-${step.status}`}
                        className="relative flex items-center mb-8"
                      >
                        <div
                          className={`h-6 w-6 rounded-full border-2 z-10 shrink-0 ${
                            isCompleted
                              ? "bg-brand border-brand"
                              : "bg-white border-gray-300"
                          } ${isCurrent ? "ring-4 ring-[rgba(255,63,108,0.18)]" : ""}`}
                        >
                          {isCompleted && (
                            <CheckCircle className="h-4 w-4 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">
                            {step.label}
                          </p>
                          {step.date && (
                            <p className="text-sm text-gray-500">
                              {formatDate(step.date)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-8 border-t border-gray-200 flex flex-col sm:flex-row flex-wrap gap-3">
                {canCancelOrder && (
                  <Button
                    variant="danger"
                    onClick={handleCancelOrder}
                    loading={canceling}
                    disabled={canceling}
                    className="w-full sm:w-auto"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Order
                  </Button>
                )}

                {canReturnOrder && (
                  <Button
                    variant="outline"
                    onClick={handleCreateReturn}
                    loading={returning}
                    disabled={returning}
                    className="w-full sm:w-auto"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Return Items
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={handleContactSupport}
                  className="w-full sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>

                <Button
                  variant="outline"
                  onClick={handleViewPayment}
                  className="w-full sm:w-auto"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  View Payment
                </Button>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Items
              </h2>
              <div className="space-y-4 sm:space-y-6">
                {order.items?.map((item, index) => (
                  <div
                    key={item.id || item.product_id || `${item.product?.id || "item"}-${index}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center border-b pb-5 sm:pb-6 last:border-0 last:pb-0 gap-4"
                  >
                    <div className="h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <Image
                        src={getProductImage(item.product?.image_url)}
                        alt={item.product?.name}
                        width={80}
                        height={80}
                        unoptimized
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1">
                          <Link
                            href={`/products/${item.product_id}`}
                            className="font-medium text-gray-900 hover:text-brand transition-colors"
                          >
                            {item.product?.name}
                          </Link>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            SKU: {item.product?.sku}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500">
                            <span>Qty: {item.quantity}</span>
                            <span className="hidden sm:inline">•</span>
                            <span>{formatCurrency(item.price_at_time)} each</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end sm:text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(item.price_at_time * item.quantity)}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 sm:hidden">
                            {formatCurrency(item.price_at_time)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Order Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span>{formatCurrency(order.total_amount * 0.08)}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-gray-200 font-bold text-lg">
                    <span>Total</span>
                    <span>
                      {formatCurrency(
                        order.total_amount + order.total_amount * 0.08
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Shipping & Payment Info */}
          <div className="space-y-8">
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 text-brand mr-3" />
                <h2 className="text-lg font-bold text-gray-900">
                  Shipping Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {order.shipping_address?.full_name}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address?.street}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address?.city},{" "}
                    {order.shipping_address?.state}{" "}
                    {order.shipping_address?.postal_code}
                  </p>
                  <p className="text-gray-600">
                    {order.shipping_address?.country}
                  </p>
                </div>

                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{order.shipping_address?.phone}</span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Shipping Method
                  </h3>
                  <p className="text-gray-600">Standard Shipping • Free</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Estimated delivery: 3-5 business days
                  </p>
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-brand mr-3" />
                <h2 className="text-lg font-bold text-gray-900">
                  Billing Information
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-900">
                    {order.billing_address?.full_name}
                  </p>
                  <p className="text-gray-600">
                    {order.billing_address?.street}
                  </p>
                  <p className="text-gray-600">
                    {order.billing_address?.city},{" "}
                    {order.billing_address?.state}{" "}
                    {order.billing_address?.postal_code}
                  </p>
                  <p className="text-gray-600">
                    {order.billing_address?.country}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Payment Method
                  </h3>
                  <p className="text-gray-600">
                    {order.payment_method === "cod"
                      ? "Cash on Delivery"
                      : order.payment_method === "dc"
                      ? "Debit Card"
                      : order.payment_method === "cc"
                      ? "Credit Card"
                      : "Payment Method"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Paid on {formatDate(order.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Support */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Need Help?
              </h2>
              <div className="space-y-4">
                <button
                  onClick={handleContactSupport}
                  className="flex items-center p-3 bg-brand-soft rounded-lg hover:bg-brand-soft transition-colors w-full text-left"
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-brand mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Call Us</p>
                    <p className="text-sm text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </button>

                <button
                  onClick={handleContactSupport}
                  className="flex items-center p-3 bg-brand-soft rounded-lg hover:bg-brand-soft transition-colors w-full text-left"
                >
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-brand mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Email Us</p>
                    <p className="text-sm text-gray-600">
                      support@shopcart.com
                    </p>
                  </div>
                </button>

                <button
                  onClick={handleContactSupport}
                  className="flex items-center p-3 bg-brand-soft rounded-lg hover:bg-brand-soft transition-colors w-full text-left"
                >
                  <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-brand mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Live Chat</p>
                    <p className="text-sm text-gray-600">Available 24/7</p>
                  </div>
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">
                  Order Updates
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Get real-time updates about your order status
                </p>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-brand rounded focus:ring-[rgba(255,63,108,0.6)]"
                      defaultChecked
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Email notifications
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-brand rounded focus:ring-[rgba(255,63,108,0.6)]"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      SMS notifications
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Actions */}
        <div className="mt-10 sm:mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Related Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Link
              href="/products"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow block"
            >
              <div className="flex items-center mb-4">
                <Home className="h-6 w-6 sm:h-8 sm:w-8 text-brand mr-4" />
                <h3 className="text-lg font-bold text-gray-900">
                  Continue Shopping
                </h3>
              </div>
              <p className="text-gray-600">
                Browse more products and discover amazing deals
              </p>
            </Link>

            <Link
              href="/orders"
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow block"
            >
              <div className="flex items-center mb-4">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-brand mr-4" />
                <h3 className="text-lg font-bold text-gray-900">
                  View All Orders
                </h3>
              </div>
              <p className="text-gray-600">
                Check your order history and track other orders
              </p>
            </Link>

            <button
              onClick={handleContactSupport}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left w-full"
            >
              <div className="flex items-center mb-4">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-brand mr-4" />
                <h3 className="text-lg font-bold text-gray-900">
                  Contact Support
                </h3>
              </div>
              <p className="text-gray-600">
                Need help? Our support team is here for you 24/7
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}




