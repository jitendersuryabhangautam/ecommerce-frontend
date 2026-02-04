"use server";

import { apiHandler } from "@/lib/server/apiHandler";

export const createReturnAction = async (returnData) =>
  apiHandler({ path: "/returns", method: "POST", body: returnData });

export const getUserReturnsAction = async (params = {}) =>
  apiHandler({ path: "/returns", query: params });

export const getReturnByIdAction = async (returnId) =>
  apiHandler({ path: `/returns/${returnId}` });

// Admin
export const getAllReturnsAction = async (params = {}) =>
  apiHandler({ path: "/admin/returns", query: params });

export const processReturnAction = async (returnId, returnData) =>
  apiHandler({
    path: `/admin/returns/${returnId}/process`,
    method: "PUT",
    body: returnData,
  });
