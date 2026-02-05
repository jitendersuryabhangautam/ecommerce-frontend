"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import ProductCard from "./ProductCard";
import { formatCurrency, getProductImage } from "@/utils/helpers";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function ProductGrid({
  products,
  loading,
  emptyMessage = "No products found",
  viewMode = "grid",
  imageHeightClass = "h-64",
}) {
  const { cart, addToCart, updateCartItem, removeFromCart } = useCart();
  const [addingId, setAddingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className={`bg-gray-200 ${imageHeightClass}`}></div>
            <div className="mt-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No products
          </h3>
          <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {products.map((product) => {
          const imageUrl = getProductImage(product.image_url);
          const cartItem = cart?.items?.find(
            (item) => item.product?.id === product.id
          );
          return (
            <div
              key={product.id}
              className="bg-white border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
              style={{
                contentVisibility: "auto",
                containIntrinsicSize: "160px",
              }}
            >
              <Link href={`/products/${product.id}`} className="shrink-0">
                <div className="relative h-28 w-28 bg-gray-100 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/products/${product.id}`}
                  className="text-base font-semibold text-gray-900 hover:text-brand"
                >
                  {product.name}
                </Link>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                  {product.description}
                </p>
                <div className="mt-2 text-sm text-gray-600">
                  {product.category}
                </div>
              </div>

              <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-3">
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </div>
                {cartItem ? (
                  <div className="flex items-center border border-gray-200">
                    <button
                      onClick={async () => {
                        setUpdatingId(product.id);
                        if (cartItem.quantity <= 1) {
                          await removeFromCart(cartItem.id);
                        } else {
                          await updateCartItem(
                            cartItem.id,
                            cartItem.quantity - 1
                          );
                        }
                        setUpdatingId(null);
                      }}
                      disabled={updatingId === product.id}
                      className="px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 border-x border-gray-200 min-w-9 text-center text-sm">
                      {updatingId === product.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent mx-auto" />
                      ) : (
                        cartItem.quantity
                      )}
                    </span>
                    <button
                      onClick={async () => {
                        setUpdatingId(product.id);
                        await updateCartItem(
                          cartItem.id,
                          cartItem.quantity + 1
                        );
                        setUpdatingId(null);
                      }}
                      disabled={
                        updatingId === product.id ||
                        cartItem.quantity >= product.stock
                      }
                      className="px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={async () => {
                      setAddingId(product.id);
                      await addToCart(product.id, 1);
                      setAddingId(null);
                    }}
                    disabled={addingId === product.id}
                    className="flex items-center gap-2 px-3 py-2 bg-brand text-white hover:bg-[#e11e5a] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {addingId === product.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <ShoppingCart className="h-4 w-4" />
                    )}
                    Add
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          style={{ contentVisibility: "auto", containIntrinsicSize: "360px" }}
        >
          <ProductCard product={product} imageHeightClass={imageHeightClass} />
        </div>
      ))}
    </div>
  );
}
