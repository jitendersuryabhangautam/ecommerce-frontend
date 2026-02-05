"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getAllProductsAction,
  createProductAction,
  updateProductAction,
  deleteProductAction,
} from "@/app/actions/productActions";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatCurrency } from "@/utils/helpers";
import { CATEGORIES } from "@/utils/constants";
import { Plus, Edit, Trash2, Package, AlertCircle, ArrowLeft } from "lucide-react";
import { getProductImage } from "@/utils/helpers";
import Link from "next/link";

const emptyForm = {
  name: "",
  sku: "",
  category: "",
  price: "",
  stock: "",
  image_url: "",
  description: "",
};

export default function AdminProductsPage() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [rangeDays, setRangeDays] = useState(30);
  const [dialog, setDialog] = useState({ open: false, product: null });
  const [form, setForm] = useState(emptyForm);
  const [skuTouched, setSkuTouched] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllProductsAction({
        page,
        limit,
        range_days: rangeDays,
      });
      const payload = response?.data || response;
      setProducts(payload?.products || []);
      setTotalPages(payload?.meta?.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError(err?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchProducts();
    }
  }, [isAuthenticated, isAdmin, page, limit, rangeDays]);

  const openCreate = () => {
    setForm(emptyForm);
    setSkuTouched(false);
    setDialog({ open: true, product: null });
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      image_url: product.image_url || "",
      description: product.description || "",
    });
    setSkuTouched(Boolean(product.sku));
    setDialog({ open: true, product });
  };

  const closeDialog = () => {
    if (saving) return;
    setDialog({ open: false, product: null });
    setForm(emptyForm);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const buildSku = (category, name) => {
    const cat = (category || "").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
    const nm = (name || "").replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase();
    const suffix = String(Date.now()).slice(-4);
    if (!cat && !nm) return "";
    return `${cat || "GEN"}-${nm || "PRD"}-${suffix}`;
  };

  useEffect(() => {
    if (skuTouched) return;
    if (!form.category && !form.name) return;
    setForm((prev) => ({
      ...prev,
      sku: buildSku(prev.category, prev.name),
    }));
  }, [form.category, form.name, skuTouched]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      console.log("Admin product save start", {
        mode: dialog.product ? "edit" : "create",
        form,
      });
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      };

      if (dialog.product) {
        const result = await updateProductAction(dialog.product.id, payload);
        console.log("Admin product update result", result);
      } else {
        const result = await createProductAction(payload);
        console.log("Admin product create result", result);
      }
      closeDialog();
      fetchProducts();
    } catch (err) {
      console.error("Failed to save product:", err);
      setError(err?.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProductAction(productId);
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError(err?.message || "Failed to delete product");
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
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/admin"
        className="inline-flex items-center text-brand hover:text-[rgb(var(--brand-primary-dark))] mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="text-brand" size={32} />
          Products
        </h1>
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
          <select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value={10}>10 / page</option>
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
          </select>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 bg-brand text-white px-4 py-2 rounded-lg hover:bg-[#e11e5a]"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                        <img
                          src={getProductImage(product.image_url)}
                          alt={product.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                          width="48"
                          height="48"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          SKU: {product.sku || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {product.category || "Uncategorized"}
                  </td>
                  <td className="px-6 py-4 text-right text-sm text-gray-900">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <span
                      className={`font-medium ${
                        product.stock > 10 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(product)}
                        className="text-brand hover:text-[rgb(var(--brand-primary-dark))]"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No products found.
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
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
              }
              if (pageNumber === page - 2 || pageNumber === page + 2) {
                return (
                  <span key={pageNumber} className="px-2">
                    ...
                  </span>
                );
              }
              return null;
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {dialog.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {dialog.product ? "Edit Product" : "Add Product"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Product name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              />
              <input
                name="sku"
                value={form.sku}
                onChange={(e) => {
                  setSkuTouched(true);
                  handleChange(e);
                }}
                placeholder="SKU"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSkuTouched(false);
                    setForm((prev) => ({
                      ...prev,
                      sku: buildSku(prev.category, prev.name),
                    }));
                  }}
                  className="text-xs text-brand hover:text-[rgb(var(--brand-primary-dark))]"
                >
                  Regenerate SKU
                </button>
              </div>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.filter((category) => category !== "All").map(
                  (category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  )
                )}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Price"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                <input
                  name="stock"
                  type="number"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="Stock"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="Image URL"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Description"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-[#e11e5a] disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
