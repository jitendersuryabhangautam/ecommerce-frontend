"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import {
  DollarSign,
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

// Add these helper functions at the top or import from utils
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
export default function AdminDashboard() {
  const router = useRouter();
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

  const fetchDashboardData = async () => {
    // In a real app, you would fetch this from your API
    setTimeout(() => {
      setStats({
        totalRevenue: 12542.75,
        totalOrders: 342,
        totalProducts: 156,
        totalCustomers: 1245,
      });

      setRecentOrders([
        {
          id: "1",
          orderNumber: "ORD-12345",
          customer: "John Doe",
          date: "2024-01-15T10:30:00Z",
          amount: 249.99,
          status: "completed",
        },
        {
          id: "2",
          orderNumber: "ORD-12346",
          customer: "Jane Smith",
          date: "2024-01-14T14:20:00Z",
          amount: 129.99,
          status: "processing",
        },
        {
          id: "3",
          orderNumber: "ORD-12347",
          customer: "Bob Johnson",
          date: "2024-01-14T09:15:00Z",
          amount: 89.99,
          status: "pending",
        },
        {
          id: "4",
          orderNumber: "ORD-12348",
          customer: "Alice Brown",
          date: "2024-01-13T16:45:00Z",
          amount: 199.99,
          status: "shipped",
        },
      ]);

      setRecentProducts([
        {
          id: "1",
          name: "Premium Gaming Laptop",
          category: "Electronics",
          price: 1499.99,
          stock: 15,
          sales: 42,
        },
        {
          id: "2",
          name: "Wireless Headphones",
          category: "Audio",
          price: 199.99,
          stock: 56,
          sales: 89,
        },
        {
          id: "3",
          name: "Smart Watch Pro",
          category: "Wearables",
          price: 299.99,
          stock: 23,
          sales: 67,
        },
        {
          id: "4",
          name: "Ergonomic Office Chair",
          category: "Furniture",
          price: 399.99,
          stock: 8,
          sales: 34,
        },
      ]);

      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    console.log("User:", user);
    console.log("IsAdmin:", isAdmin);

    // if (!isAdmin) {
    //   router.push("/");
    //   return;
    // }
    fetchDashboardData();
  }, [isAdmin, router, user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!isAdmin) {
    return null;
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
      icon: DollarSign,
      color: "bg-green-500",
      change: "+12.5%",
      changeColor: "text-green-600",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "bg-blue-500",
      change: "+8.2%",
      changeColor: "text-blue-600",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "bg-purple-500",
      change: "+5.7%",
      changeColor: "text-purple-600",
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

  const quickActions = [
    {
      title: "Add New Product",
      description: "Create a new product listing",
      icon: Package,
      href: "/admin/products/new",
      color: "bg-blue-100 text-blue-600",
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome back, {user?.first_name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                  <p className={`text-sm font-medium mt-1 ${stat.changeColor}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
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
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Filter className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Download className="h-5 w-5" />
                </button>
                <a
                  href="/admin/orders"
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
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
                {recentOrders.map((order) => (
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
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
              <a
                href="/admin/products"
                className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {recentProducts.map((product) => (
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
                color: "bg-blue-500",
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
