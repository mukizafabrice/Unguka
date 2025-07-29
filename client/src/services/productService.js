import axiosInstance from "../api/axiosInstance";

export const fetchProduct = async () => {
  const response = await axiosInstance.get("/products");
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axiosInstance.post("/products", productData);
  return response.data;
};
export const updateProduct = async (id, data) => {
  const response = await axiosInstance.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};

//
