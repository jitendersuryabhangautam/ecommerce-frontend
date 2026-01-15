"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { formatCurrency, getProductImage } from "@/utils/helpers";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setAddingToCart(true);
    await addToCart(product.id, 1);
    setAddingToCart(false);
  };

  const imageUrl = getProductImage(product.image_url);

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Product Image */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
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
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
              In Stock
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Category */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {product.category}
          </span>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">4.5</span>
          </div>
        </div>

        {/* Name */}
        <Link href={`/products/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">
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

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addingToCart}
            className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
              product.stock > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {addingToCart ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
