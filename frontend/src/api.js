import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);

export const createOrder = (data) => API.post('/orders', data);
export const getOrders = (params) => API.get('/orders', { params });
export const updateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });

export const registerUser = (data) => API.post('/users/register', data);
export const loginUser = (data) => API.post('/users/login', data);

export const sendContact = (data) => API.post('/contact', data);

export default API;
