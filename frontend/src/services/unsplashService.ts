import axios from 'axios';

const UNSPLASH_URL = 'https://api.unsplash.com';
const accessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
const headers = { Authorization: `Client-ID ${accessKey}` };

export const fetchImages = async (page = 1, perPage = 12) => {
  const res = await axios.get(`${UNSPLASH_URL}/photos`, {
    params: { page, per_page: perPage },
    headers,
  });
  return res.data;
};

export const searchImages = async (query: string, page = 1, perPage = 12) => {
  const res = await axios.get(`${UNSPLASH_URL}/search/photos`, {
    params: { query, page, per_page: perPage },
    headers,
  });
  return res.data; // { results, total, total_pages }
};

export const fetchImageDetails = async (id: string) => {
  const res = await axios.get(`${UNSPLASH_URL}/photos/${id}`, { headers });
  return res.data;
};

export const fetchMultipleImages = async (ids: string[]) => {
  const results = await Promise.all(
    ids.map(id =>
      axios.get(`${UNSPLASH_URL}/photos/${id}`, { headers })
        .then(res => res.data)
        .catch(() => null)
    )
  );
  return results.filter(Boolean);
};
