"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAdminAnalyticsAction,
  getTopAdminProductsAction,
} from "@/app/actions/adminActions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/utils/helpers";

export default function AdminAnalyticsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    avgOrderValue: 0,
  });
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchAnalytics();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");
      const [analyticsResponse, topProductsResponse] = await Promise.all([
        getAdminAnalyticsAction(30),
        getTopAdminProductsAction({ limit: 5, rangeDays: 30 }),
      ]);

      const analytics = analyticsResponse?.data || analyticsResponse;
      console.log("Admin analytics response:", analyticsResponse);
      const totals = analytics?.totals || {};
      const statusRows = analytics?.orders_by_status || [];

      const topProductsPayload =
        topProductsResponse?.data || topProductsResponse;
      const top = (topProductsPayload?.items || []).map((item) => ({
        id: item.product?.id,
        name: item.product?.name,
        sales: item.total_quantity || 0,
        price: item.product?.price || 0,
      }));

      const pickTotal = (primary, fallbacks = []) => {
        if (typeof primary === "number") return primary;
        for (const key of fallbacks) {
          if (typeof totals?.[key] === "number") return totals[key];
        }
        return 0;
      };

      setStats({
        revenue: pickTotal(totals.total_revenue, ["revenue", "totalRevenue"]),
        orders: pickTotal(totals.total_orders, ["orders", "totalOrders"]),
        customers: pickTotal(totals.total_customers, ["customers", "totalCustomers"]),
        avgOrderValue: pickTotal(totals.avg_order_value, ["avg_order_value", "avgOrderValue"]),
      });
      setOrdersByStatus(statusRows);
      setTopProducts(top);
    } catch (err) {
      console.error("Failed to load analytics:", err);
      setError(err?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Track revenue and performance.</p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.revenue)}
              </p>
            </div>
            <TrendingUp className="text-green-500" size={28} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Orders</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.orders}
              </p>
            </div>
            <ShoppingCart className="text-brand" size={28} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Customers</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.customers}
              </p>
            </div>
            <Users className="text-purple-500" size={28} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Order</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.avgOrderValue)}
              </p>
            </div>
            <BarChart3 className="text-orange-500" size={28} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Orders By Status
          </h2>
          <div className="space-y-3">
            {ordersByStatus.map((row) => (
              <div key={row.status} className="flex items-center justify-between">
                <span className="text-gray-600">{row.status}</span>
                <span className="font-medium text-gray-900">{row.count}</span>
              </div>
            ))}
            {ordersByStatus.length === 0 && (
              <p className="text-sm text-gray-500">No order data yet.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Snapshot
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Total revenue in the last 30 days is{" "}
              <span className="font-medium text-gray-900">
                {formatCurrency(stats.revenue)}
              </span>
              .
            </p>
            <p>
              Average order value is{" "}
              <span className="font-medium text-gray-900">
                {formatCurrency(stats.avgOrderValue)}
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Top Products
        </h2>
        <div className="space-y-3">
          {topProducts.map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between"
            >
              <div>
                <p className="font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">
                  {product.sales} sales
                </p>
              </div>
              <span className="font-medium text-gray-900">
                {formatCurrency(product.price)}
              </span>
            </div>
          ))}
          {topProducts.length === 0 && (
            <p className="text-sm text-gray-500">No product sales yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
