"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { formatCurrency, getProductImage } from "@/utils/helpers";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function CartPage() {
  const {
    cart,
    loading,
    updateCartItem,
    removeFromCart,
    clearCart,
    cartTotal,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const [updatingItem, setUpdatingItem] = useState(null);
  const [removingItem, setRemovingItem] = useState(null);

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItem(itemId);
    await updateCartItem(itemId, newQuantity);
    setUpdatingItem(null);
  };

  const handleRemoveItem = async (itemId) => {
    setRemovingItem(itemId);
    await removeFromCart(itemId);
    setRemovingItem(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Your cart is empty
        </h1>
        <p className="text-gray-600 mt-2">Please login to view your cart</p>
        <Link
          href="/login"
          className="inline-block mt-6 px-6 py-3 bg-brand text-white rounded-lg hover:bg-[#e11e5a]"
        >
          Login to Continue
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto" />
        <h1 className="text-2xl font-bold text-gray-900 mt-4">
          Your cart is empty
        </h1>
        <p className="text-gray-600 mt-2">Add some products to get started</p>
        <Link
          href="/products"
          className="inline-block mt-6 px-6 py-3 bg-brand text-white rounded-lg hover:bg-[#e11e5a]"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm">
            {/* Cart Header */}
            <div className="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 text-sm font-medium text-gray-500">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Price</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-center">Total</div>
            </div>

            {/* Cart Items */}
            <div className="divide-y divide-gray-200">
              {cart.items.map((item) => (
                <div key={item.id} className="p-4 md:p-6">
                  <div className="flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-center">
                    {/* Product Info */}
                    <div className="col-span-6">
                      <div className="flex items-center">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200">
                          <Image
                            src={getProductImage(item.product.image_url)}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover object-center"
                          />
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/products/${item.product.id}`}
                            className="font-medium text-gray-900 hover:text-brand"
                          >
                            {item.product.name}
                          </Link>
                          <p className="mt-1 text-sm text-gray-500">
                            SKU: {item.product.sku}
                          </p>
                          {item.product.stock < item.quantity && (
                            <p className="mt-1 text-sm text-red-600">
                              Only {item.product.stock} left in stock
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 mt-4 md:mt-0">
                      <div className="md:text-center">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.product.price)}
                        </p>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-2 mt-4 md:mt-0">
                      <div className="flex items-center justify-center">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={
                              item.quantity <= 1 || updatingItem === item.id
                            }
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="px-3 py-1 border-x border-gray-300 min-w-[40px] text-center">
                            {updatingItem === item.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent mx-auto" />
                            ) : (
                              item.quantity
                            )}
                          </span>
                          <button
                            onClick={() =>
                              handleUpdateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={
                              item.quantity >= item.product.stock ||
                              updatingItem === item.id
                            }
                            className="px-3 py-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Total and Actions */}
                    <div className="col-span-2 mt-4 md:mt-0">
                      <div className="flex items-center justify-between md:justify-center md:space-x-4">
                        <p className="font-medium text-gray-900">
                          {formatCurrency(item.product.price * item.quantity)}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removingItem === item.id}
                          className="text-red-600 hover:text-red-800 md:ml-4"
                        >
                          {removingItem === item.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <Link
                href="/products"
                className="flex items-center text-brand hover:text-[rgb(var(--brand-primary-dark))]"
              >
                <ArrowRight className="h-4 w-4 rotate-180 mr-2" />
                Continue Shopping
              </Link>
              <button
                onClick={clearCart}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(cartTotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {cartTotal > 50 ? "Free" : formatCurrency(5)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">
                  {formatCurrency(cartTotal * 0.08)}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>
                    {formatCurrency(
                      cartTotal + (cartTotal > 50 ? 0 : 5) + cartTotal * 0.08
                    )}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Including VAT</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <Link
                href="/checkout"
                className="block w-full bg-brand hover:bg-[#e11e5a] text-white text-center py-3 px-4 rounded-lg font-medium"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/products"
                className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-center py-3 px-4 rounded-lg font-medium"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Promo Code */}
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Have a promo code?
              </h3>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Enter code"
                  className="flex-1 border border-r-0 border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[rgba(255,63,108,0.6)] focus:border-transparent"
                />
                <button className="bg-gray-800 text-white px-4 py-2 rounded-r-lg hover:bg-gray-900">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


