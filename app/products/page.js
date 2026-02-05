"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { Filter, Grid, List, ChevronDown } from "lucide-react";
import ProductGrid from "@/components/products/ProductGrid";
import { getAllProductsAction } from "@/app/actions/productActions";
import { CATEGORIES } from "@/utils/constants";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);
  const pagingRef = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 16,
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || "",
    sort: "newest",
  });
  const [showFilters, setShowFilters] = useState(false);

  const computeHasMore = ({ currentCount, nextBatchCount, total }) => {
    if (typeof total === "number" && total > 0) {
      return currentCount + nextBatchCount < total;
    }
    return nextBatchCount > 0;
  };

  useEffect(() => {
    fetchProducts();
  }, [filters.page, filters.category, filters.search, filters.sort, filters.limit]);

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
      limit: 16,
    }));
    setProducts([]);
    setHasMore(true);
    pagingRef.current = false;
  }, [searchParams]);

  useEffect(() => {
    if (pathname === "/products") return;
    setFilters({
      page: 1,
      limit: 16,
      category: "",
      search: "",
      sort: "newest",
    });
    setProducts([]);
    setHasMore(true);
    pagingRef.current = false;
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/products") return;
    setFilters((prev) => ({
      ...prev,
      page: 1,
      limit: 16,
    }));
    setProducts([]);
    setHasMore(true);
    pagingRef.current = false;
  }, [pathname]);

  const fetchProducts = async () => {
    try {
      console.log("Products fetch start", {
        page: filters.page,
        limit: filters.limit,
        category: filters.category,
        search: filters.search,
        sort: filters.sort,
      });
      if (filters.page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      const response = await getAllProductsAction(filters);
      const payload = response.data || response;
      const nextProducts = payload.products || [];
      const nextTotal =
        payload.meta?.total ?? payload.total ?? payload.meta?.count ?? 0;
      console.log("Products fetch result", {
        page: filters.page,
        received: nextProducts.length,
        total: nextTotal,
        hasProductsArray: Array.isArray(payload.products),
        meta: payload.meta,
      });
      if (filters.page > 1 && nextProducts.length === 0) {
        setHasMore(false);
        return;
      }
      setProducts((prev) => {
        const merged =
          filters.page === 1 ? nextProducts : [...prev, ...nextProducts];
        setHasMore(
          computeHasMore({
            currentCount: filters.page === 1 ? 0 : prev.length,
            nextBatchCount: nextProducts.length,
            total: nextTotal,
          })
        );
        return merged;
      });
      setTotalProducts(nextTotal);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      pagingRef.current = false;
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
      limit: 16,
      category: "",
      search: "",
      sort: "newest",
    });
    setProducts([]);
  };

  const totalPages = Math.ceil(totalProducts / filters.limit);

  useEffect(() => {
    const handleScroll = () => {
      if (pagingRef.current || loadingMore || loading || !hasMore) return;
      const threshold = 400;
      const scrollY = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      if (scrollY + viewportHeight >= fullHeight - threshold) {
        console.log("Products scroll: loading next page", {
          currentPage: filters.page,
          nextPage: filters.page + 1,
          hasMore,
          loading,
          loadingMore,
        });
        pagingRef.current = true;
        setFilters((prev) => ({ ...prev, page: prev.page + 1 }));
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [filters.page, loadingMore, loading, hasMore]);

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
                <div className="text-sm text-gray-600">
                  Loaded {products.length} of {totalProducts}
                </div>
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

          <div ref={sentinelRef} className="h-10" />
          {loadingMore && (
            <div className="mt-6 flex justify-center text-sm text-gray-500">
              Loading more products...
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

