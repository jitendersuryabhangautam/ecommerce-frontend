import { cookies } from "next/headers";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ecommerce-backend-go-production.up.railway.app/api/v1";

const buildUrl = (path, query) => {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
};

export const apiHandler = async ({
  path,
  method = "GET",
  body,
  query,
  headers = {},
  auth = true,
  cache = "no-store",
  allowStatuses = [],
}) => {
  const cookieStore = await cookies();
  const token = auth ? cookieStore.get("access_token")?.value : null;

  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };
  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
    cache,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok && allowStatuses.includes(response.status)) {
    return data;
  }

  if (!response.ok) {
    console.error("apiHandler request failed", {
      method,
      url: buildUrl(path, query),
      body,
      status: response.status,
      data,
    });
    const error = new Error(data?.message || data?.error || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  console.log("apiHandler request ok", {
    method,
    url: buildUrl(path, query),
    body,
    status: response.status,
    data,
  });
  return data;
};
