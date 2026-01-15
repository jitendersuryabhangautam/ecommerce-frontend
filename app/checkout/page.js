"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Lock, CreditCard, Truck, Shield } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { orderService } from "@/services/orderService";
import { formatCurrency } from "@/utils/helpers";
import { PAYMENT_METHODS, COUNTRIES } from "@/utils/constants";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, validateCart, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      shipping_full_name: user?.first_name + " " + user?.last_name,
      shipping_street: "",
      shipping_city: "",
      shipping_state: "",
      shipping_country: "United States",
      shipping_postal_code: "",
      shipping_phone: "",
      billing_same_as_shipping: true,
      billing_full_name: "",
      billing_street: "",
      billing_city: "",
      billing_state: "",
      billing_country: "United States",
      billing_postal_code: "",
      billing_phone: "",
    },
  });

  const billingSameAsShipping = watch("billing_same_as_shipping");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Validate cart first
      const validation = await validateCart();
      if (!validation.valid) {
        toast.error("Some items in your cart are no longer available");
        return;
      }

      // Prepare order data
      const orderData = {
        shipping_address: {
          full_name: data.shipping_full_name,
          street: data.shipping_street,
          city: data.shipping_city,
          state: data.shipping_state,
          country: data.shipping_country,
          postal_code: data.shipping_postal_code,
          phone: data.shipping_phone,
        },
        billing_address: billingSameAsShipping
          ? {
              full_name: data.shipping_full_name,
              street: data.shipping_street,
              city: data.shipping_city,
              state: data.shipping_state,
              country: data.shipping_country,
              postal_code: data.shipping_postal_code,
              phone: data.shipping_phone,
            }
          : {
              full_name: data.billing_full_name,
              street: data.billing_street,
              city: data.billing_city,
              state: data.billing_state,
              country: data.billing_country,
              postal_code: data.billing_postal_code,
              phone: data.billing_phone,
            },
      };

      // Create order
      const orderResponse = await orderService.createOrder(orderData);
      console.log("Full order response:", orderResponse);

      // Handle different response structures
      let order;
      if (orderResponse.data?.id) {
        order = orderResponse.data;
      } else if (orderResponse.id) {
        order = orderResponse;
      } else if (orderResponse.data?.data?.id) {
        order = orderResponse.data.data;
      } else if (orderResponse.success) {
        // Backend returned success but no order data
        // This is a backend issue, but we can handle it gracefully
        toast.success(orderResponse.message || "Order placed successfully!");
        await clearCart();
        router.push("/orders");
        return;
      } else {
        console.error("Unexpected order response structure:", orderResponse);
        throw new Error("Order created but unable to retrieve order details");
      }

      console.log("Extracted order:", order);

      // Create payment
      const paymentResponse = await orderService.createPayment({
        order_id: order.id,
        payment_method: paymentMethod,
      });

      toast.success("Order placed successfully!");

      // Clear cart
      await clearCart();

      // Redirect to order confirmation
      router.push(`/orders/${order.id}`);
    } catch (error) {
      console.error("Checkout error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to place order";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="text-gray-600 mt-2">Add some products to checkout</p>
        <button
          onClick={() => router.push("/products")}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const shippingCost = cartTotal > 50 ? 0 : 5;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shippingCost + tax;

  return (
    <div className="py-8">
      {/* Progress Steps */}
      <div className="mb-12">
        <div className="flex items-center justify-center">
          {["Shipping Address", "Payment Method", "Review Order"].map(
            (label, index) => (
              <div key={label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      index + 1 <= step
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      index + 1 <= step ? "text-blue-600" : "text-gray-600"
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`h-1 w-24 mx-4 ${
                      index + 1 < step ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && (
              <div className="space-y-8">
                {/* Shipping Address */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <Truck className="h-6 w-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Shipping Address
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        {...register("shipping_full_name", {
                          required: "Full name is required",
                        })}
                        className="input-primary"
                      />
                      {errors.shipping_full_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.shipping_full_name.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        {...register("shipping_street", {
                          required: "Street address is required",
                        })}
                        className="input-primary"
                      />
                      {errors.shipping_street && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.shipping_street.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        {...register("shipping_city", {
                          required: "City is required",
                        })}
                        className="input-primary"
                      />
                      {errors.shipping_city && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.shipping_city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        {...register("shipping_state", {
                          required: "State is required",
                        })}
                        className="input-primary"
                      />
                      {errors.shipping_state && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.shipping_state.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country *
                      </label>
                      <select
                        {...register("shipping_country", {
                          required: "Country is required",
                        })}
                        className="input-primary"
                      >
                        {COUNTRIES.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        {...register("shipping_postal_code", {
                          required: "Postal code is required",
                        })}
                        className="input-primary"
                      />
                      {errors.shipping_postal_code && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.shipping_postal_code.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        {...register("shipping_phone", {
                          required: "Phone number is required",
                        })}
                        className="input-primary"
                      />
                      {errors.shipping_phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.shipping_phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Billing Address */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                      <h2 className="text-xl font-bold text-gray-900">
                        Billing Address
                      </h2>
                    </div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register("billing_same_as_shipping")}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Same as shipping address
                      </span>
                    </label>
                  </div>

                  {!billingSameAsShipping && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          {...register("billing_full_name", {
                            required:
                              !billingSameAsShipping && "Full name is required",
                          })}
                          className="input-primary"
                          disabled={billingSameAsShipping}
                        />
                        {errors.billing_full_name && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.billing_full_name.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address *
                        </label>
                        <input
                          type="text"
                          {...register("billing_street", {
                            required:
                              !billingSameAsShipping &&
                              "Street address is required",
                          })}
                          className="input-primary"
                          disabled={billingSameAsShipping}
                        />
                        {errors.billing_street && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.billing_street.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          {...register("billing_city", {
                            required:
                              !billingSameAsShipping && "City is required",
                          })}
                          className="input-primary"
                          disabled={billingSameAsShipping}
                        />
                        {errors.billing_city && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.billing_city.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State *
                        </label>
                        <input
                          type="text"
                          {...register("billing_state", {
                            required:
                              !billingSameAsShipping && "State is required",
                          })}
                          className="input-primary"
                          disabled={billingSameAsShipping}
                        />
                        {errors.billing_state && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.billing_state.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Country *
                        </label>
                        <select
                          {...register("billing_country", {
                            required:
                              !billingSameAsShipping && "Country is required",
                          })}
                          className="input-primary"
                          disabled={billingSameAsShipping}
                        >
                          {COUNTRIES.map((country) => (
                            <option key={country} value={country}>
                              {country}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          {...register("billing_postal_code", {
                            required:
                              !billingSameAsShipping &&
                              "Postal code is required",
                          })}
                          className="input-primary"
                          disabled={billingSameAsShipping}
                        />
                        {errors.billing_postal_code && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.billing_postal_code.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          {...register("billing_phone", {
                            required:
                              !billingSameAsShipping &&
                              "Phone number is required",
                          })}
                          className="input-primary"
                          disabled={billingSameAsShipping}
                        />
                        {errors.billing_phone && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.billing_phone.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-4">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                        paymentMethod === method.value
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.value}
                        checked={paymentMethod === method.value}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-900">
                          {method.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Credit Card Form (for demo) */}
                {paymentMethod === "credit_card" && (
                  <div className="mt-8 p-6 border border-gray-300 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Card Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="input-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          className="input-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="input-primary"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          placeholder="John Doe"
                          className="input-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                {/* Order Review */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center mb-6">
                    <Shield className="h-6 w-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-bold text-gray-900">
                      Order Review
                    </h2>
                  </div>

                  <div className="space-y-6">
                    {/* Shipping Info */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Shipping Information
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium">
                          {watch("shipping_full_name")}
                        </p>
                        <p className="text-gray-600">
                          {watch("shipping_street")}
                        </p>
                        <p className="text-gray-600">
                          {watch("shipping_city")}, {watch("shipping_state")}{" "}
                          {watch("shipping_postal_code")}
                        </p>
                        <p className="text-gray-600">
                          {watch("shipping_country")}
                        </p>
                        <p className="text-gray-600">
                          {watch("shipping_phone")}
                        </p>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Payment Method
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium">
                          {
                            PAYMENT_METHODS.find(
                              (m) => m.value === paymentMethod
                            )?.label
                          }
                        </p>
                        {paymentMethod === "credit_card" && (
                          <p className="text-gray-600">
                            Card ending in •••• 3456
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Order Items
                      </h3>
                      <div className="border rounded-lg divide-y">
                        {cart.items.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 flex justify-between"
                          >
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <p className="font-medium">
                              {formatCurrency(
                                item.product.price * item.quantity
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      required
                      className="h-4 w-4 text-blue-600 rounded mt-1"
                    />
                    <span className="ml-3 text-sm text-gray-700">
                      I agree to the{" "}
                      <a
                        href="/terms"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Terms and Conditions
                      </a>{" "}
                      and{" "}
                      <a
                        href="/privacy"
                        className="text-blue-600 hover:text-blue-700"
                      >
                        Privacy Policy
                      </a>
                      . I understand that my order is subject to availability
                      and confirmation of the order price.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 flex justify-between">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="ml-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue to {step === 1 ? "Payment" : "Review"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-auto px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5 mr-2" />
                      Place Order
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 mt-8 lg:mt-0">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Subtotal ({cart.items.length} items)
                </span>
                <span className="font-medium">{formatCurrency(cartTotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">Including VAT</p>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="mt-8">
              <h3 className="font-medium text-gray-900 mb-3">
                Items in your order
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={
                          item.product.image_url ||
                          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
                        }
                        alt={item.product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity} ×{" "}
                        {formatCurrency(item.product.price)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
