import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'gallery_favorites';

function getStoredFavorites(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(getStoredFavorites);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = useCallback((imageId: string) => {
    setFavorites(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  }, []);

  const isFavorite = useCallback(
    (imageId: string) => favorites.includes(imageId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, count: favorites.length };
}
