"use server";

import { apiHandler } from "@/lib/server/apiHandler";

export const getAdminAnalyticsAction = async (rangeDays = 30) =>
  apiHandler({
    path: "/admin/analytics",
    query: { range_days: rangeDays },
  });

export const getRecentAdminOrdersAction = async ({
  limit = 10,
  rangeDays = 30,
} = {}) =>
  apiHandler({
    path: "/admin/orders/recent",
    query: { limit, range_days: rangeDays },
  });

export const getTopAdminProductsAction = async ({
  limit = 5,
  rangeDays = 30,
} = {}) =>
  apiHandler({
    path: "/admin/products/top",
    query: { limit, range_days: rangeDays },
  });

export const getAdminUsersAction = async (params = {}) =>
  apiHandler({
    path: "/admin/users",
    query: params,
  });

export const updateAdminUserRoleAction = async (userId, role) =>
  apiHandler({
    path: `/admin/users/${userId}/role`,
    method: "PUT",
    body: { role },
  });
