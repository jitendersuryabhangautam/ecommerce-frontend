"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, Home, Package, ShoppingCart, User, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/products", icon: Package, label: "Products" },
    { href: "/cart", icon: ShoppingCart, label: "Cart" },
  ];

  const authNavItems = user
    ? [
        { href: "/orders", icon: User, label: "My Orders" },
        { href: "/admin", icon: User, label: "Admin", adminOnly: true },
      ]
    : [{ href: "/login", icon: LogIn, label: "Login" }];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname === item.href
                        ? "bg-brand-soft text-brand"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}

            <li className="pt-4 border-t">
              {authNavItems.map((item) => {
                if (item.adminOnly && user?.role !== "admin") return null;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname === item.href
                        ? "bg-brand-soft text-brand"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </li>

            {user && (
              <li>
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
}


