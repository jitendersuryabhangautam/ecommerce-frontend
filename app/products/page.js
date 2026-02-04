"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Filter, Grid, List, ChevronDown } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { getAllProductsAction } from "@/app/actions/productActions";
import { CATEGORIES } from "@/utils/constants";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
    sort: "newest",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    const categoryParam = searchParams.get("category") || "";
    const searchParam = searchParams.get("search") || "";
    const normalizedCategory =
      CATEGORIES.find(
        (category) =>
          category !== "All" &&
          category.toLowerCase() === categoryParam.toLowerCase()
      ) || "";

    setFilters((prev) => ({
      ...prev,
      category: normalizedCategory,
      search: searchParam,
      page: 1,
    }));
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProductsAction(filters);
      const payload = response.data || response;
      setProducts(payload.products || []);
      setTotalProducts(payload.meta?.total || 0);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
      category: "",
      search: "",
      sort: "newest",
    });
  };

  const totalPages = Math.ceil(totalProducts / filters.limit);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-2">
          {totalProducts} {totalProducts === 1 ? "product" : "products"} found
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm mb-4 border border-gray-100"
            >
              <div className="flex items-center">
                <Filter className="h-5 w-5 mr-2" />
                <span className="font-medium">Filters</span>
              </div>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  showFilters ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Filters */}
            <div
              className={`${
                showFilters ? "block" : "hidden"
              } lg:block bg-white rounded-2xl shadow-sm p-6 border border-gray-100`}
            >
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Category</h3>
                  <div className="space-y-2">
                    {CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() =>
                          handleFilterChange(
                            "category",
                            category === "All" ? "" : category
                          )
                        }
                        className={`block w-full text-left px-3 py-2 rounded-full text-sm font-medium ${
                          filters.category ===
                          (category === "All" ? "" : category)
                            ? "bg-brand-soft text-brand"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Filter */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                    className="input-primary"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name_asc">Name: A to Z</option>
                    <option value="name_desc">Name: Z to A</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <button onClick={clearFilters} className="btn-ghost w-full">
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          {/* Toolbar */}
          <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* View Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-full ${
                      viewMode === "grid"
                        ? "bg-brand-soft text-brand"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <Grid className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-full ${
                      viewMode === "list"
                        ? "bg-brand-soft text-brand"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <List className="h-5 w-5" />
                  </button>
                </div>

                {/* Items per page */}
                <select
                  value={filters.limit}
                  onChange={(e) =>
                    handleFilterChange("limit", parseInt(e.target.value))
                  }
                  className="input-primary text-sm py-1"
                >
                  <option value={12}>12 per page</option>
                  <option value={24}>24 per page</option>
                  <option value={48}>48 per page</option>
                </select>
              </div>

              {/* Pagination Info */}
              <div className="text-sm text-gray-600">
                Showing {(filters.page - 1) * filters.limit + 1}-
                {Math.min(filters.page * filters.limit, totalProducts)} of{" "}
                {totalProducts}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className={viewMode === "grid" ? "" : "space-y-4"}>
            <ProductGrid
              products={products}
              loading={loading}
              emptyMessage="No products found. Try adjusting your filters."
              viewMode={viewMode}
            />
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page === 1}
                  className="px-3 py-2 rounded-full border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, i) => {
                  const pageNumber = i + 1;
                  // Show first, last, and pages around current
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= filters.page - 1 &&
                      pageNumber <= filters.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => handlePageChange(pageNumber)}
                        className={`px-3 py-2 rounded-full text-sm ${
                          filters.page === pageNumber
                            ? "bg-brand text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === filters.page - 2 ||
                    pageNumber === filters.page + 2
                  ) {
                    return (
                      <span key={pageNumber} className="px-2">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page === totalPages}
                  className="px-3 py-2 rounded-full border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-gray-600">Loading products...</div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}

