"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  Home,
  Package,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

export default function Header({ onMenuClick }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  console.log(
    "Header user role:",
    user?.role,
    "isAdmin:",
    isAdmin,
    "isAuthenticated:",
    isAuthenticated
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Products", href: "/products", icon: Package },
    { name: "Orders", href: "/orders", icon: CreditCard },
  ];

  if (isAdmin) {
    navigation.push({ name: "Admin", href: "/admin", icon: User });
  }

  return (
    <header className="bg-white/90 backdrop-blur sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 py-3 lg:flex-row lg:items-center lg:justify-between lg:h-16 lg:py-0">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center justify-between lg:justify-start w-full lg:w-auto">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-700 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            <Link href="/" className="flex items-center ml-2 lg:ml-0">
              <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center shadow-sm">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-bold tracking-tight text-gray-900">
                ShopCart
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:ml-8 lg:flex lg:space-x-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wider ${
                      pathname === item.href
                        ? "bg-brand-soft text-brand"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center - Search */}
          <div className="w-full lg:flex-1 lg:max-w-2xl lg:mx-4 min-w-0">
            <form onSubmit={handleSearch} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="search"
                  placeholder="Search products..."
                  className="w-full min-w-0 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[rgba(255,63,108,0.25)] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right side - User menu and Cart */}
          <div className="flex items-center justify-end gap-3 w-full lg:w-auto">
            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-700 hover:text-brand"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="h-8 w-8 rounded-full bg-brand-soft flex items-center justify-center">
                    <User className="h-5 w-5 text-brand" />
                  </div>
                  <span className="hidden md:inline text-sm font-medium">
                    {user?.first_name}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium">
                          {user?.first_name} {user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Orders
                      </Link>
                      {user?.role === "admin" && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex space-x-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-brand"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white rounded-full bg-linear-to-r from-[#ff3f6c] to-[#ff7a59] hover:from-[#ff2f60] hover:to-[#ff6d4e] shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
