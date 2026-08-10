import React, { useEffect, useState } from 'react';
import Gallery from '../components/Gallery';
import { fetchMultipleImages } from '../services/unsplashService';
import { useFavorites } from '../hooks/useFavorites';

const FavoritesPage: React.FC = () => {
  const { favorites } = useFavorites();
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      if (favorites.length === 0) {
        setImages([]);
        setLoading(false);
        return;
      }
      try {
        const data = await fetchMultipleImages(favorites);
        setImages(data);
      } catch {
        setImages([]);
      } finally {
        setLoading(false);
      }
    };
    loadFavorites();
  }, [favorites]);

  if (loading) {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">&#9825;</div>
        <h2>No favorites yet</h2>
        <p>Click the heart icon on any image to save it here.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <h2 className="page-title">Your Favorites ({images.length})</h2>
      <Gallery images={images} />
    </div>
  );
};

export default FavoritesPage;
