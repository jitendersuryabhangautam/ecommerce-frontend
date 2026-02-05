"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  ChevronRight,
  Filter,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersAction } from "@/app/actions/orderActions";
import { getUserReturnsAction } from "@/app/actions/returnActions";
import { formatCurrency, formatDate } from "@/utils/helpers";
import {
  ORDER_STATUS,
  ORDER_STATUS_COLORS,
  ORDER_STATUS_LABELS,
  RETURN_STATUS,
} from "@/utils/constants";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function OrdersPage() {
  const { isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [returnsByOrderId, setReturnsByOrderId] = useState({});

  // console.log("OrdersPage render - user:", user, "isAuthenticated:", isAuthenticated);

  useEffect(() => {
    // console.log("Orders page useEffect - isAuthenticated:", isAuthenticated);
    if (isAuthenticated) {
      // console.log("Calling fetchOrders...");
      fetchOrders();
    } else {
      // console.log("User not authenticated, skipping orders fetch");
      setLoading(false);
    }
  }, [isAuthenticated, filter, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (filter !== "all") {
        params.status = filter;
      }

      // console.log("Orders fetch params:", params);
      const [ordersResponse, returnsResponse] = await Promise.all([
        getOrdersAction(params),
        getUserReturnsAction(),
      ]);
      // console.log("Orders API response:", ordersResponse);
      // console.log("Returns API response:", returnsResponse);

      const extractArray = (response, key) => {
        if (response?.data?.[key]) return response.data[key];
        if (response?.[key]) return response[key];
        if (Array.isArray(response?.data)) return response.data;
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.data?.data)) return response.data.data;
        return [];
      };

      const ordersData = extractArray(ordersResponse, "orders");
      const returnsData = extractArray(returnsResponse, "returns");

      const mappedReturns = returnsData.reduce((acc, returnItem) => {
        const orderId =
          returnItem.order_id || returnItem.order?.id || returnItem.orderId;
        if (!orderId) return acc;

        const current = acc[orderId];
        if (!current) {
          acc[orderId] = returnItem;
          return acc;
        }

        const currentDate = new Date(
          current.updated_at || current.created_at || 0
        ).getTime();
        const incomingDate = new Date(
          returnItem.updated_at || returnItem.created_at || 0
        ).getTime();
        if (incomingDate >= currentDate) {
          acc[orderId] = returnItem;
        }
        return acc;
      }, {});

      // console.log("Extracted orders:", ordersData);
      // console.log("Mapped returns by order:", mappedReturns);
      setOrders(ordersData);
      setReturnsByOrderId(mappedReturns);
      setTotalPages(
        ordersResponse.data?.meta?.totalPages ||
          ordersResponse.meta?.totalPages ||
          1
      );
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      console.error("Error response:", error.data);
    } finally {
      setLoading(false);
    }
  };

  const visibleOrders = orders.filter((order) => {
    if (filter === "all") return true;
    if (filter === "return_requested") {
      const returnItem = returnsByOrderId[order.id];
      return (
        order.status === "return_requested" ||
        returnItem?.status === RETURN_STATUS.REQUESTED
      );
    }
    return order.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case ORDER_STATUS.COMPLETED:
      case ORDER_STATUS.DELIVERED:
        return CheckCircle;
      case ORDER_STATUS.CANCELLED:
        return XCircle;
      case ORDER_STATUS.SHIPPED:
        return Truck;
      default:
        return Clock;
    }
  };

  const getStatusColor = (status) => {
    return ORDER_STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
  };

  const getReturnBadge = (returnItem) => {
    if (!returnItem) return null;

    const status = returnItem.status || RETURN_STATUS.REQUESTED;
    const returnStatusColors = {
      [RETURN_STATUS.REQUESTED]: "bg-yellow-100 text-yellow-800",
      [RETURN_STATUS.APPROVED]: "bg-brand-soft text-[rgb(var(--brand-primary-dark))]",
      [RETURN_STATUS.REJECTED]: "bg-red-100 text-red-800",
      [RETURN_STATUS.COMPLETED]: "bg-green-100 text-green-800",
    };
    const returnStatusLabels = {
      [RETURN_STATUS.REQUESTED]: "Return Requested",
      [RETURN_STATUS.APPROVED]: "Return Approved",
      [RETURN_STATUS.REJECTED]: "Return Rejected",
      [RETURN_STATUS.COMPLETED]: "Return Completed",
    };
    const ReturnIcon =
      status === RETURN_STATUS.REJECTED ? AlertTriangle : RefreshCw;

    return (
      <div
        className={`px-3 py-1 rounded-full flex items-center ${returnStatusColors[status]}`}
      >
        <ReturnIcon className="h-4 w-4 mr-2" />
        <span className="text-sm font-medium">
          {returnStatusLabels[status] || "Return Requested"}
        </span>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          No orders found
        </h1>
        <p className="text-gray-600 mt-2">Please login to view your orders</p>
        <Link
          href="/login"
          className="inline-block mt-6 px-6 py-3 bg-brand text-white rounded-lg hover:bg-[#e11e5a]"
        >
          Login to Continue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-8">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Orders
          </h1>
          <p className="text-gray-600 mt-2">View and manage your orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:space-x-4">
          <div className="flex items-center">
            <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
            <span className="text-sm font-medium text-gray-700">
              Filter by:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              "all",
              "pending",
              "processing",
              "shipped",
              "delivered",
              "return_requested",
              "cancelled",
            ].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setFilter(status);
                  setPage(1);
                }}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium ${
                  filter === status
                    ? "bg-brand text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {status === "all"
                  ? "All Orders"
                  : ORDER_STATUS_LABELS[status] || status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visibleOrders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Package className="h-16 w-16 text-gray-400 mx-auto" />
          <h2 className="text-xl font-medium text-gray-900 mt-4">
            No orders found
          </h2>
          <p className="text-gray-600 mt-2">
            {filter === "all"
              ? "You haven't placed any orders yet."
              : `No ${filter} orders found.`}
          </p>
          <Link
            href="/products"
            className="inline-block mt-6 px-6 py-3 bg-brand text-white rounded-lg hover:bg-[#e11e5a]"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {visibleOrders.map((order) => {
            const StatusIcon = getStatusIcon(order.status);
            const returnItem = returnsByOrderId[order.id];
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <div
                        className={`${getStatusColor(
                          order.status
                        )} px-3 py-1 rounded-full flex items-center`}
                      >
                        <StatusIcon className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                      {getReturnBadge(returnItem)}
                      <span className="text-xs sm:text-sm text-gray-500">
                        Order #{order.order_number?.replace("ORD-", "")}
                      </span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Date Placed</p>
                      <p className="font-medium">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Items</p>
                      <p className="font-medium">
                        {order.items?.length || 0} items
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Shipping To</p>
                      <p className="font-medium truncate">
                        {order.shipping_address?.city},{" "}
                        {order.shipping_address?.state}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPage(page - 1)}
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
              } else if (pageNumber === page - 2 || pageNumber === page + 2) {
                return (
                  <span key={pageNumber} className="px-2">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() => setPage(page + 1)}
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



