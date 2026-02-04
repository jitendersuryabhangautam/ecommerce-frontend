"use server";

import { apiHandler } from "@/lib/server/apiHandler";

export const createPaymentAction = async (paymentData) =>
  apiHandler({ path: "/payments", method: "POST", body: paymentData });

export const verifyPaymentAction = async (paymentId, verificationData) =>
  apiHandler({
    path: `/payments/${paymentId}/verify`,
    method: "POST",
    body: verificationData,
  });

export const getPaymentByOrderAction = async (orderId) =>
  apiHandler({ path: `/orders/${orderId}/payment` });

export const getPaymentsAction = async (params = {}) =>
  apiHandler({ path: "/payments", query: params });

export const getPaymentHistoryAction = async (params = {}) =>
  apiHandler({ path: "/payments/history", query: params });
