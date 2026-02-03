"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { formatCurrency, getProductImage } from "@/utils/helpers";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { cart, addToCart, updateCartItem, removeFromCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setAddingToCart(true);
    await addToCart(product.id, 1);
    setAddingToCart(false);
  };

  const cartItem = cart?.items?.find(
    (item) => item.product?.id === product.id
  );

  const handleDecrease = async () => {
    if (!cartItem) return;
    setUpdatingItem(true);
    if (cartItem.quantity <= 1) {
      await removeFromCart(cartItem.id);
    } else {
      await updateCartItem(cartItem.id, cartItem.quantity - 1);
    }
    setUpdatingItem(false);
  };

  const handleIncrease = async () => {
    if (cartItem) {
      setUpdatingItem(true);
      await updateCartItem(cartItem.id, cartItem.quantity + 1);
      setUpdatingItem(false);
      return;
    }
    await handleAddToCart({ preventDefault: () => {}, stopPropagation: () => {} });
  };

  const imageUrl = getProductImage(product.image_url);

  return (
    <div className="group relative bg-white border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Product Image */}
      <Link
        href={`/products/${product.id}`}
        aria-label={`View ${product.name}`}
      >
        <div className="relative h-52 w-full overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {/* Stock Status */}
          <div className="absolute top-2 right-2">
            {product.stock > 0 ? (
              <span className="bg-black/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                In Stock
              </span>
            ) : (
              <span className="bg-[#ff3f6c] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-brand bg-brand-soft px-2.5 py-1 rounded-full uppercase tracking-wide">
            {product.category}
          </span>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">4.5</span>
          </div>
        </div>

        {/* Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 hover:text-brand line-clamp-1">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="mt-1 text-xs text-gray-500 line-clamp-2">
          {product.description}
        </p>

        {/* Price and Action */}
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(product.price)}
            </p>
            {product.stock > 0 && (
              <p className="text-xs text-gray-500">
                {product.stock} left in stock
              </p>
            )}
          </div>

          {cartItem ? (
            <div className="flex items-center border border-gray-200">
              <button
                onClick={handleDecrease}
                disabled={updatingItem}
                className="px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                -
              </button>
              <span className="px-3 py-2 border-x border-gray-200 min-w-[36px] text-center text-sm">
                {updatingItem ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent mx-auto" />
                ) : (
                  cartItem.quantity
                )}
              </span>
              <button
                onClick={handleIncrease}
                disabled={updatingItem || cartItem.quantity >= product.stock}
                className="px-3 py-2 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || addingToCart}
              className={`flex items-center justify-center p-2 transition-colors ${
                product.stock > 0
                  ? "bg-brand text-white hover:bg-[#e11e5a]"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {addingToCart ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <ShoppingCart className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

