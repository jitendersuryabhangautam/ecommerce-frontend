"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import api from "@/services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext({});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart(null);
      setCartCount(0);
    }
  }, [isAuthenticated]);

  const fetchCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const response = await api.get("/cart");
      setCart(response.data.data);
      setCartCount(response.data.data?.items?.length || 0);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return { success: false };
    }

    try {
      setLoading(true);
      const response = await api.post("/cart/items", {
        product_id: productId,
        quantity: quantity,
      });

      setCart(response.data.data);
      setCartCount(response.data.data?.items?.length || 0);
      toast.success("Added to cart!");
      return { success: true, cart: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to add to cart";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      const response = await api.put(`/cart/items/${itemId}`, { quantity });

      setCart(response.data.data);
      setCartCount(response.data.data?.items?.length || 0);
      toast.success("Cart updated!");
      return { success: true, cart: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update cart";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const response = await api.delete(`/cart/items/${itemId}`);

      setCart(response.data.data);
      setCartCount(response.data.data?.items?.length || 0);
      toast.success("Item removed from cart");
      return { success: true, cart: response.data.data };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to remove item";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await api.delete("/cart");

      setCart(null);
      setCartCount(0);
      toast.success("Cart cleared");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to clear cart";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const validateCart = async () => {
    try {
      const response = await api.get("/cart/validate");
      return {
        success: true,
        valid: response.data.data.valid,
        errors: response.data.data.errors,
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Validation failed",
      };
    }
  };

  const cartTotal =
    cart?.items?.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartTotal,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        validateCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
