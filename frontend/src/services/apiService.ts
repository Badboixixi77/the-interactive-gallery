import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TOKEN_KEY = 'gallery_auth_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface AuthUser {
  id: number;
  username: string;
  email: string;
}

// ===== Auth =====
export const register = async (username: string, email: string, password: string) => {
  const res = await axios.post(`${API_URL}/api/auth/register`, { username, email, password });
  return res.data; // { token, user }
};

export const login = async (email: string, password: string) => {
  const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
  return res.data; // { token, user }
};

export const fetchMe = async () => {
  const res = await axios.get(`${API_URL}/api/auth/me`, { headers: authHeaders() });
  return res.data; // { user }
};

// ===== Comments =====
export const fetchComments = async (imageId: string) => {
  const res = await axios.get(`${API_URL}/api/comments/${imageId}`);
  return res.data;
};

export const postComment = async (imageId: string, author: string, text: string) => {
  const res = await axios.post(
    `${API_URL}/api/comments/${imageId}`,
    { author, text },
    { headers: authHeaders() }
  );
  return res.data;
};

export const deleteComment = async (commentId: number) => {
  const res = await axios.delete(`${API_URL}/api/comments/${commentId}`, {
    headers: authHeaders(),
  });
  return res.data;
};
