"use server";

import { apiHandler } from "@/lib/server/apiHandler";

export const createOrderAction = async (orderData) =>
  apiHandler({ path: "/orders", method: "POST", body: orderData });

export const getOrdersAction = async (params = {}) =>
  apiHandler({ path: "/orders", query: params });

export const getOrderAction = async (id) =>
  apiHandler({ path: `/orders/${id}` });

export const cancelOrderAction = async (id) =>
  apiHandler({ path: `/orders/${id}/cancel`, method: "PUT" });

// Admin
export const getAllOrdersAction = async (params = {}) =>
  apiHandler({ path: "/admin/orders", query: params });

export const updateOrderStatusAction = async (orderId, statusData) =>
  apiHandler({
    path: `/admin/orders/${orderId}/status`,
    method: "PUT",
    body: statusData,
  });
