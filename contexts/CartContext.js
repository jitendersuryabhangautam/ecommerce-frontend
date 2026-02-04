"use client";

import { createContext, useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import {
  fetchCartAction,
  addToCartAction,
  updateCartItemAction,
  removeFromCartAction,
  clearCartAction,
  validateCartAction,
} from "@/app/actions/cartActions";
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
      const response = await fetchCartAction();
      setCart(response.data);
      setCartCount(response.data?.items?.length || 0);
    } catch (error) {
      if (error.status === 404 || error?.data?.status === 404) {
        setCart({ items: [] });
        setCartCount(0);
        return;
      }
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
      const response = await addToCartAction(productId, quantity);
      setCart(response.data);
      setCartCount(response.data?.items?.length || 0);
      toast.success("Added to cart!");
      return { success: true, cart: response.data };
    } catch (error) {
      const message = error.data?.message || error.message || "Failed to add to cart";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    try {
      setLoading(true);
      const response = await updateCartItemAction(itemId, quantity);
      setCart(response.data);
      setCartCount(response.data?.items?.length || 0);
      toast.success("Cart updated!");
      return { success: true, cart: response.data };
    } catch (error) {
      const message = error.data?.message || error.message || "Failed to update cart";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      const response = await removeFromCartAction(itemId);
      setCart(response.data);
      setCartCount(response.data?.items?.length || 0);
      toast.success("Item removed from cart");
      return { success: true, cart: response.data };
    } catch (error) {
      const message = error.data?.message || error.message || "Failed to remove item";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      const result = await clearCartAction();
      if (result.success) {
        setCart(null);
        setCartCount(0);
        toast.success("Cart cleared");
        return { success: true };
      }
      const message = result.error || "Failed to clear cart";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  const validateCart = async () => {
    try {
      const response = await validateCartAction();
      return {
        success: true,
        valid: response.data.valid,
        errors: response.data.errors,
      };
    } catch (error) {
      return {
        success: false,
        error: error.data?.message || error.message || "Validation failed",
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
