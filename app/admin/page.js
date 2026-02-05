"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  getAdminAnalyticsAction,
  getRecentAdminOrdersAction,
  getTopAdminProductsAction,
} from "@/app/actions/adminActions";
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  BarChart3,
  Filter,
  Download,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
  Calendar,
} from "lucide-react";
import { formatCurrency } from "@/utils/helpers";

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
export default function AdminDashboard() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [error, setError] = useState("");
  const [rangeDays, setRangeDays] = useState(30);
  const [recentPage, setRecentPage] = useState(1);
  const [recentLimit, setRecentLimit] = useState(5);
  const [topPage, setTopPage] = useState(1);
  const [topLimit, setTopLimit] = useState(5);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      const [analyticsResponse, recentOrdersResponse, topProductsResponse] =
        await Promise.all([
          getAdminAnalyticsAction(rangeDays),
          getRecentAdminOrdersAction({ limit: 10, rangeDays }),
          getTopAdminProductsAction({ limit: 5, rangeDays }),
        ]);

      const analytics = analyticsResponse?.data || analyticsResponse;
      console.log("Admin dashboard analytics:", analyticsResponse);
      const totals = analytics?.totals || {};

      const recentOrdersPayload =
        recentOrdersResponse?.data || recentOrdersResponse;
      const recentOrdersList = recentOrdersPayload?.orders || [];

      const topProductsPayload =
        topProductsResponse?.data || topProductsResponse;
      const topProductsList = topProductsPayload?.items || [];

      const recentOrdersData = recentOrdersList.map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        customer: order.user?.email || order.user_id || "Customer",
        date: order.created_at,
        amount: order.total_amount,
        status: order.status,
      }));

      const topProductsData = topProductsList.map((item) => ({
        id: item.product?.id,
        name: item.product?.name,
        category: item.product?.category,
        price: item.product?.price,
        stock: item.product?.stock,
        sales: item.total_quantity || 0,
      }));

      const pickTotal = (primary, fallbacks = []) => {
        if (typeof primary === "number") return primary;
        for (const key of fallbacks) {
          if (typeof totals?.[key] === "number") return totals[key];
        }
        return 0;
      };

      setStats({
        totalRevenue: pickTotal(totals.total_revenue, [
          "revenue",
          "totalRevenue",
          "total_revenue",
        ]),
        totalOrders: pickTotal(totals.total_orders, [
          "orders",
          "totalOrders",
          "total_orders",
        ]),
        totalProducts: pickTotal(totals.total_products, [
          "products",
          "totalProducts",
          "total_products",
        ]),
        totalCustomers: pickTotal(totals.total_customers, [
          "customers",
          "totalCustomers",
          "total_customers",
        ]),
      });
      setRecentOrders(recentOrdersData);
      setRecentProducts(topProductsData);
      setRecentPage(1);
      setTopPage(1);
    } catch (err) {
      console.error("Failed to load admin dashboard data:", err);
      setError(err?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // console.log("User:", user);
    // console.log("IsAdmin:", isAdmin);

    // if (!isAdmin) {
    //   router.push("/");
    //   return;
    // }
    fetchDashboardData();
  }, [isAdmin, user, rangeDays]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-brand-soft text-[rgb(var(--brand-primary-dark))]";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600">Access denied. Admins only.</p>
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

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(stats.totalRevenue),
      icon: IndianRupee,
      color: "bg-green-500",
      change: "+12.5%",
      changeColor: "text-green-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "bg-brand",
      change: "+8.2%",
      changeColor: "text-brand",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "bg-purple-500",
      change: "+5.7%",
      changeColor: "text-purple-600",
      href: "/admin/products",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: "bg-orange-500",
      change: "+15.3%",
      changeColor: "text-orange-600",
    },
  ];

  const recentTotalPages = Math.max(
    1,
    Math.ceil(recentOrders.length / recentLimit)
  );
  const topTotalPages = Math.max(
    1,
    Math.ceil(recentProducts.length / topLimit)
  );
  const visibleRecentOrders = recentOrders.slice(
    (recentPage - 1) * recentLimit,
    recentPage * recentLimit
  );
  const visibleTopProducts = recentProducts.slice(
    (topPage - 1) * topLimit,
    topPage * topLimit
  );

  const quickActions = [
    {
      title: "Add New Product",
      description: "Create a new product listing",
      icon: Package,
      href: "/admin/products/new",
      color: "bg-brand-soft text-brand",
    },
    {
      title: "View Orders",
      description: "Manage customer orders",
      icon: CreditCard,
      href: "/admin/orders",
      color: "bg-green-100 text-green-600",
    },
    {
      title: "View Analytics",
      description: "See detailed analytics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Manage Users",
      description: "View and manage users",
      icon: Users,
      href: "/admin/users",
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.first_name}!</p>
        </div>
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
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const Wrapper = stat.href ? "a" : "div";
          return (
            <Wrapper
              key={stat.title}
              href={stat.href}
              className={`bg-white rounded-lg shadow-sm p-6 ${
                stat.href ? "hover:shadow-md transition-shadow cursor-pointer" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  {stat.change && (
                    <p
                      className={`text-sm font-medium mt-1 ${stat.changeColor}`}
                    >
                      {stat.change} from last month
                    </p>
                  )}
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </Wrapper>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <a
                key={action.title}
                href={action.href}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div
                  className={`inline-flex p-3 rounded-lg mb-4 ${action.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </a>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Orders
                </h2>
                <p className="text-sm text-gray-600">Latest customer orders</p>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={recentLimit}
                  onChange={(e) => {
                    setRecentPage(1);
                    setRecentLimit(Number(e.target.value));
                  }}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Filter className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Download className="h-5 w-5" />
                </button>
                <a
                  href="/admin/orders"
                  className="flex items-center text-brand hover:text-[rgb(var(--brand-primary-dark))] text-sm font-medium"
                >
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              {visibleRecentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.customer}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(order.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <a
                          href={`/orders/${order.id}`}
                          className="text-brand hover:text-[rgb(var(--brand-primary-dark))]"
                          title="View Order"
                        >
                          <Eye className="h-4 w-4" />
                        </a>
                        <a
                          href={`/admin/orders?order_id=${order.id}`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Manage Order"
                        >
                          <Edit className="h-4 w-4" />
                        </a>
                        <button
                          className="text-red-600/40 cursor-not-allowed"
                          title="Delete not supported"
                          disabled
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentTotalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <div className="flex items-center space-x-2 text-sm">
                <button
                  onClick={() => setRecentPage((p) => Math.max(1, p - 1))}
                  disabled={recentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>
                <span>
                  {recentPage} / {recentTotalPages}
                </span>
                <button
                  onClick={() =>
                    setRecentPage((p) => Math.min(recentTotalPages, p + 1))
                  }
                  disabled={recentPage === recentTotalPages}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Top Products
                </h2>
                <p className="text-sm text-gray-600">Best selling products</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={topLimit}
                  onChange={(e) => {
                    setTopPage(1);
                    setTopLimit(Number(e.target.value));
                  }}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-xs"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
                <a
                  href="/admin/products"
                  className="flex items-center text-brand hover:text-[rgb(var(--brand-primary-dark))] text-sm font-medium"
                >
                  View all
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {visibleTopProducts.map((product) => (
              <div key={product.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {product.category}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-8">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.sales} sales
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          product.stock > 10 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {product.stock} in stock
                      </p>
                      <p className="text-xs text-gray-500">Stock</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {topTotalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <div className="flex items-center space-x-2 text-sm">
                <button
                  onClick={() => setTopPage((p) => Math.max(1, p - 1))}
                  disabled={topPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Prev
                </button>
                <span>
                  {topPage} / {topTotalPages}
                </span>
                <button
                  onClick={() =>
                    setTopPage((p) => Math.min(topTotalPages, p + 1))
                  }
                  disabled={topPage === topTotalPages}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Charts and Additional Stats */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Revenue Overview
              </h2>
              <p className="text-sm text-gray-600">Last 30 days performance</p>
            </div>
            <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 days
            </button>
          </div>
          {/* Placeholder for chart */}
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-12 w-12 text-gray-400" />
            <p className="ml-3 text-gray-600">Revenue chart will appear here</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[
              {
                user: "John Doe",
                action: "placed an order",
                time: "2 hours ago",
                color: "bg-brand",
              },
              {
                user: "Jane Smith",
                action: "added a new product",
                time: "4 hours ago",
                color: "bg-green-500",
              },
              {
                user: "System",
                action: "processed 15 orders",
                time: "6 hours ago",
                color: "bg-purple-500",
              },
              {
                user: "Admin",
                action: "updated product prices",
                time: "1 day ago",
                color: "bg-orange-500",
              },
            ].map((activity, index) => (
              <div key={index} className="flex items-start">
                <div
                  className={`${activity.color} h-2 w-2 rounded-full mt-2 mr-3`}
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



