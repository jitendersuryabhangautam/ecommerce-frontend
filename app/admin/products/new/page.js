"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createProductAction } from "@/app/actions/productActions";
import { Package, AlertCircle, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/utils/helpers";
import { CATEGORIES } from "@/utils/constants";
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

export default function NewProductPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [skuTouched, setSkuTouched] = useState(false);

  const buildSku = (category, name) => {
    const cat = (category || "")
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 3)
      .toUpperCase();
    const nm = (name || "")
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 3)
      .toUpperCase();
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      console.log("Admin product create start", form);
      await createProductAction({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
      });
      console.log("Admin product create success");
      router.push("/admin/products");
    } catch (err) {
      console.error("Failed to create product:", err);
      setError(err?.message || "Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Link
        href="/admin/products"
        className="inline-flex items-center text-brand hover:text-[rgb(var(--brand-primary-dark))] mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Products
      </Link>
      <div className="flex items-center gap-3 mb-6">
        <Package className="text-brand" size={28} />
        <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm p-6 space-y-4 lg:col-span-2"
        >
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
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-[#e11e5a] disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create Product"}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-lg shadow-sm p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Live Preview
          </h2>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="aspect-[4/3] bg-gray-100">
              <img
                src={
                  form.image_url ||
                  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
                }
                alt={form.name || "Product preview"}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                width="400"
                height="300"
              />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  {form.category || "Category"}
                </span>
                <span className="text-xs text-gray-400">
                  SKU: {form.sku || "N/A"}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {form.name || "Product name"}
              </h3>
              <p className="text-sm text-gray-600">
                {form.description || "Product description will appear here."}
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-gray-900">
                  {form.price
                    ? formatCurrency(Number(form.price))
                    : formatCurrency(0)}
                </span>
                <span className="text-sm text-gray-500">
                  Stock: {form.stock || 0}
                </span>
              </div>
              <button
                type="button"
                className="mt-3 w-full px-4 py-2 rounded-lg bg-brand text-white disabled:opacity-60"
                disabled
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
