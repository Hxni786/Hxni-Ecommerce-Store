'use strict';

import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.100.10:3001/api';

/**
 * Helper to fetch with auth token and error handling
 */
const fetchAPI = async (endpoint, options = {}) => {
  const token = await AsyncStorage.getItem('@hxni/token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.error || 'API Request Failed');
  }

  return json;
};

// ─── Products ──────────────────────────────────────────────

export const fetchProducts = async () => {
  return await fetchAPI('/products');
};

export const fetchProduct = async (id) => {
  return await fetchAPI(`/products/${id}`);
};

// ─── Auth ──────────────────────────────────────────────────

export const registerUser = async (email, password) => {
  return await fetchAPI('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

export const loginUser = async (email, password) => {
  return await fetchAPI('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

// ─── Cart (Database-backed) ────────────────────────────────

export const fetchCart = async () => {
  return await fetchAPI('/cart');
};

export const addToCartAPI = async (productId, quantity = 1) => {
  return await fetchAPI('/cart', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });
};

export const updateCartItemAPI = async (productId, quantity) => {
  return await fetchAPI(`/cart/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  });
};

export const removeFromCartAPI = async (productId) => {
  return await fetchAPI(`/cart/${productId}`, {
    method: 'DELETE',
  });
};

export const clearCartAPI = async () => {
  return await fetchAPI('/cart', {
    method: 'DELETE',
  });
};
