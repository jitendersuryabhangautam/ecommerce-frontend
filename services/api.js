import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ecommerce-backend-go-production.up.railway.app/api/v1";

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
// Admin Services
export const adminService = {
  // Products
  createProduct: (productData) => api.post("/admin/products", productData),
  updateProduct: (productId, productData) =>
    api.put(`/admin/products/${productId}`, productData),
  deleteProduct: (productId) => api.delete(`/admin/products/${productId}`),

  // Orders
  getAllOrders: (params = {}) => api.get("/admin/orders", { params }),
  updateOrderStatus: (orderId, statusData) =>
    api.put(`/admin/orders/${orderId}/status`, statusData),

  // Returns
  getAllReturns: (params = {}) => api.get("/admin/returns", { params }),
  processReturn: (returnId, returnData) =>
    api.put(`/admin/returns/${returnId}/process`, returnData),
};

// Customer Returns Service
export const returnService = {
  createReturn: (returnData) => api.post("/returns", returnData),
  getUserReturns: (params = {}) => api.get("/returns", { params }),
  getReturnById: (returnId) => api.get(`/returns/${returnId}`),
};

// Payment Service
export const paymentService = {
  createPayment: (paymentData) => api.post("/payments", paymentData),
  verifyPayment: (paymentId, verificationData) =>
    api.post(`/payments/${paymentId}/verify`, verificationData),
  getPaymentByOrder: (orderId) => api.get(`/orders/${orderId}/payment`),
};

// Export all services
export const productService = {
  getAllProducts: (params = {}) => api.get("/products", { params }),
  getProductById: (productId) => api.get(`/products/${productId}`),
  ...adminService, // Include admin methods for products
};

export const orderService = {
  createOrder: (orderData) => api.post("/orders", orderData),
  getUserOrders: (params = {}) => api.get("/orders", { params }),
  getOrderById: (orderId) => api.get(`/orders/${orderId}`),
  cancelOrder: (orderId) => api.put(`/orders/${orderId}/cancel`),
  ...adminService, // Include admin methods for orders
};
