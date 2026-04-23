import axios from 'axios';

// Local mein localhost, Vercel pe backend ka URL
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const API = axios.create({ baseURL: BASE_URL });

export const getProducts       = (params) => API.get('/products', { params });
export const getProduct        = (id)     => API.get(`/products/${id}`);
export const createProduct     = (data)   => API.post('/products', data);
export const updateProduct     = (id, d)  => API.put(`/products/${id}`, d);
export const deleteProduct     = (id)     => API.delete(`/products/${id}`);

export const createOrder       = (data)        => API.post('/orders', data);
export const getOrders         = (params)      => API.get('/orders', { params });
export const updateOrderStatus = (id, status)  => API.put(`/orders/${id}/status`, { status });
export const sendManualReminder= (id)          => API.post(`/orders/${id}/send-reminder`);
export const createPaymentOrder= (id)          => API.post(`/orders/${id}/create-payment`);
export const verifyPayment     = (id, data)    => API.post(`/orders/${id}/verify-payment`, data);

export const registerUser = (data) => API.post('/users/register', data);
export const loginUser    = (data) => API.post('/users/login', data);

export const sendContact  = (data) => API.post('/contact', data);

export default API;

