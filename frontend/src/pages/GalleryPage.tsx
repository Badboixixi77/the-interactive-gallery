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

  if (loading) return <div>Loading images...</div>;
  if (error) return <div>{error}</div>;

  return <Gallery images={images} />;
};

export default GalleryPage; 