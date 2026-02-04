"use server";

import { apiHandler } from "@/lib/server/apiHandler";

export const getAllProductsAction = async (params = {}) =>
  apiHandler({ path: "/products", query: params });

export const getProductByIdAction = async (productId) =>
  apiHandler({ path: `/products/${productId}` });

// Admin
export const createProductAction = async (productData) =>
  apiHandler({ path: "/admin/products", method: "POST", body: productData });

export const updateProductAction = async (productId, productData) =>
  apiHandler({
    path: `/admin/products/${productId}`,
    method: "PUT",
    body: productData,
  });

export const deleteProductAction = async (productId) =>
  apiHandler({ path: `/admin/products/${productId}`, method: "DELETE" });
