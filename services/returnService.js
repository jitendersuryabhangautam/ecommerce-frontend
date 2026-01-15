import api from "./api";

export const returnService = {
  createReturn: (returnData) => api.post("/returns", returnData),
  getUserReturns: (params = {}) => api.get("/returns", { params }),
  getReturnById: (returnId) => api.get(`/returns/${returnId}`),
  updateReturn: (returnId, returnData) =>
    api.put(`/returns/${returnId}`, returnData),
  cancelReturn: (returnId) => api.delete(`/returns/${returnId}`),
};
