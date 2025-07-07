import axios from 'axios';

const UNSPLASH_URL = 'https://api.unsplash.com';
const accessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;

export const fetchImages = async (page = 1, perPage = 12) => {
  const res = await axios.get(`${UNSPLASH_URL}/photos`, {
    params: { page, per_page: perPage },
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  return res.data;
};

export const fetchImageDetails = async (id: string) => {
  const res = await axios.get(`${UNSPLASH_URL}/photos/${id}`, {
    headers: { Authorization: `Client-ID ${accessKey}` },
  });
  return res.data;
}; 