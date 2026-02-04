"use server";

import { apiHandler } from "@/lib/server/apiHandler";

export const fetchCartAction = async () => {
  const data = await apiHandler({ path: "/cart", allowStatuses: [404] });
  if (data?.message === "Cart not found") {
    return { data: { items: [] } };
  }
  return data;
};

export const addToCartAction = async (productId, quantity = 1) =>
  apiHandler({
    path: "/cart/items",
    method: "POST",
    body: { product_id: productId, quantity },
  });

export const updateCartItemAction = async (itemId, quantity) =>
  apiHandler({
    path: `/cart/items/${itemId}`,
    method: "PUT",
    body: { quantity },
  });

export const removeFromCartAction = async (itemId) =>
  apiHandler({ path: `/cart/items/${itemId}`, method: "DELETE" });

export const clearCartAction = async () => {
  try {
    const data = await apiHandler({
      path: "/cart",
      method: "DELETE",
      allowStatuses: [404],
    });
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error.data?.message || error.message,
      status: error.status,
      data: error.data,
    };
  }
};

export const validateCartAction = async () =>
  apiHandler({ path: "/cart/validate" });
