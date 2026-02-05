"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { productService } from "@/services/api";
import { SEARCH_KEYWORDS } from "@/utils/searchKeywords";
import { buildKeywordIndex, searchKeywordIndex } from "@/utils/keywordSearch";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [productIndex, setProductIndex] = useState([]);
  const searchTimeoutRef = useRef(null);
  const hasFetchedProductsRef = useRef(false);

  const keywordIndex = useMemo(
    () => buildKeywordIndex(SEARCH_KEYWORDS, 8),
    []
  );

  const fetchProductIndex = async () => {
    if (hasFetchedProductsRef.current) return;
    try {
      setSearchLoading(true);
      const response = await productService.getAllProducts({ limit: 200 });
      const payload = response.data?.data || response.data || {};
      const list = payload.products || [];
      setProductIndex(Array.isArray(list) ? list : []);
      hasFetchedProductsRef.current = true;
    } catch (error) {
      console.error("Search index fetch failed:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const productSuggestions = useMemo(() => {
    if (!trimmedQuery || trimmedQuery.length < 2) return [];
    const matches = productIndex.filter((item) => {
      const name = item?.name?.toLowerCase() || "";
      const sku = item?.sku?.toLowerCase() || "";
      const category = item?.category?.toLowerCase() || "";
      const description = item?.description?.toLowerCase() || "";
      return (
        name.includes(trimmedQuery) ||
        sku.includes(trimmedQuery) ||
        category.includes(trimmedQuery) ||
        description.includes(trimmedQuery)
      );
    });
    return matches.slice(0, 6);
  }, [productIndex, trimmedQuery]);

  const keywordMatches = useMemo(() => {
    if (!trimmedQuery || trimmedQuery.length < 2) return [];
    return searchKeywordIndex(keywordIndex, trimmedQuery, {
      limit: 6,
      fuzzyDistance: 1,
    });
  }, [keywordIndex, trimmedQuery]);

  useEffect(() => {
    if (!trimmedQuery || trimmedQuery.length < 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      return;
    }
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchProductIndex();
    }, 250);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [trimmedQuery]);

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
            <Link href="/" className="flex items-center lg:ml-0">
              <div className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center shadow-sm">
                <Package className="h-5 w-5 text-white" />
              </div>
              <span className="ml-2 text-lg font-bold tracking-tight text-gray-900">
                ShopCart
              </span>
            </Link>

            {/* Mobile right actions */}
            <div className="relative flex items-center gap-3 lg:hidden">
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

              {isAuthenticated ? (
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="h-8 w-8 rounded-full bg-brand-soft flex items-center justify-center">
                    <User className="h-5 w-5 text-brand" />
                  </div>
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-brand"
                >
                  Login
                </Link>
              )}

              {isAuthenticated && userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-lg py-1 z-20">
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
            <div className="flex items-center gap-2">
              <button
                onClick={onMenuClick}
                className="inline-flex items-center justify-center h-10 w-10 rounded-full text-gray-700 bg-gray-50 hover:bg-gray-100 lg:hidden shrink-0"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <form
                onSubmit={handleSearch}
                className="relative flex-1"
                onFocus={() => setIsSearchOpen(true)}
                onBlur={() => setIsSearchOpen(false)}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="search"
                    placeholder="Search products..."
                    className="w-full min-w-0 pl-10 pr-12 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[rgba(255,63,108,0.25)] focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchOpen(true)}
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100"
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
                {isSearchOpen && trimmedQuery.length >= 2 && (
                  <div
                    className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-40"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {searchLoading && (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Loading suggestions...
                      </div>
                    )}
                    {!searchLoading &&
                      productSuggestions.length === 0 &&
                      keywordMatches.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No suggestions found.
                        </div>
                      )}
                    {productSuggestions.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Products
                        </div>
                        {productSuggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              router.push(`/products/${item.id}`);
                              setIsSearchOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                          >
                            <span className="text-sm text-gray-900">
                              {item.name}
                            </span>
                            {item.sku && (
                              <span className="text-xs text-gray-400">
                                {item.sku}
                              </span>
                            )}
                            {item.category && (
                              <span className="ml-auto text-xs text-gray-500">
                                {item.category}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    {keywordMatches.length > 0 && (
                      <div className="py-2 border-t border-gray-100">
                        <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Suggestions
                        </div>
                        {keywordMatches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => {
                              setSearchQuery(term);
                              router.push(
                                `/products?search=${encodeURIComponent(term)}`
                              );
                              setIsSearchOpen(false);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right side - User menu and Cart */}
          <div className="hidden lg:flex items-center justify-end gap-3 w-full lg:w-auto">
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
