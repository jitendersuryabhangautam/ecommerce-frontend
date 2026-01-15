import api from "./api";

export const productService = {
  // Get all products
  getProducts: async (params = {}) => {
    const { page = 1, limit = 12, category, search, sort } = params;
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(category && { category }),
      ...(search && { search }),
      ...(sort && { sort }),
    });

    const response = await api.get(`/products?${queryParams}`);
    return response.data;
  },

  // Get single product
  getProduct: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Get categories
  getCategories: async () => {
    // This would come from your backend
    return ["Electronics", "Clothing", "Books", "Home", "Sports", "Beauty"];
  },
};
