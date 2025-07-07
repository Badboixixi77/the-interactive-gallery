import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const fetchComments = async (imageId: string) => {
  const res = await axios.get(`${API_URL}/api/comments/${imageId}`);
  return res.data;
};

export const postComment = async (imageId: string, author: string, text: string) => {
  const res = await axios.post(`${API_URL}/api/comments/${imageId}`, { author, text });
  return res.data;
}; 