import React, { useEffect, useState } from 'react';
import Gallery from '../components/Gallery';
import { fetchImages } from '../services/unsplashService';

const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        const data = await fetchImages();
        setImages(data);
      } catch (err) {
        setError('Failed to load images');
      } finally {
        setLoading(false);
      }
    };
    loadImages();
  }, []);

  if (error) return <div style={{ textAlign: 'center', padding: 40, color: '#e74c3c' }}>{error}</div>;

  if (loading) {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    );
  }

  return <Gallery images={images} />;
};

export default GalleryPage;
