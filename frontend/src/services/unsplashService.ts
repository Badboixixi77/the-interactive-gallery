import axios from 'axios';

const UNSPLASH_URL = 'https://api.unsplash.com';
const accessKey = process.env.REACT_APP_UNSPLASH_ACCESS_KEY;
const headers = { Authorization: `Client-ID ${accessKey}` };

export interface SearchFilters {
  orientation?: 'landscape' | 'portrait' | 'squarish';
  color?: string;
  order_by?: 'relevant' | 'latest';
}

export const fetchImages = async (page = 1, perPage = 12) => {
  const res = await axios.get(`${UNSPLASH_URL}/photos`, {
    params: { page, per_page: perPage },
    headers,
  });
  return res.data;
};

export const searchImages = async (
  query: string,
  page = 1,
  perPage = 12,
  filters: SearchFilters = {}
) => {
  const params: any = { query, page, per_page: perPage };
  if (filters.orientation) params.orientation = filters.orientation;
  if (filters.color) params.color = filters.color;
  if (filters.order_by) params.order_by = filters.order_by;
  const res = await axios.get(`${UNSPLASH_URL}/search/photos`, {
    params,
    headers,
  });
  return res.data; // { results, total, total_pages }
};

export const fetchSuggestions = async (query: string): Promise<string[]> => {
  if (!query || query.length < 2) return [];
  try {
    const res = await axios.get(`${UNSPLASH_URL}/search/photos`, {
      params: { query, page: 1, per_page: 1 },
      headers,
    });
    // Extract tags from top result as suggestions
    const tags = res.data.results?.[0]?.tags?.map((t: any) => t.title) || [];
    return tags.slice(0, 5);
  } catch {
    return [];
  }
};

export const fetchTopics = async (perPage = 8) => {
  const res = await axios.get(`${UNSPLASH_URL}/topics`, {
    params: { per_page: perPage, order_by: 'featured' },
    headers,
  });
  return res.data;
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
