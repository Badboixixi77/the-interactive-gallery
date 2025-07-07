import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchImageDetails } from '../services/unsplashService';
import CommentSection from '../components/CommentSection';

const ImageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (id) {
          const data = await fetchImageDetails(id);
          setImage(data);
        }
      } catch (err) {
        setError('Failed to load image details');
      } finally {
        setLoading(false);
      }
    };
    loadImage();
  }, [id]);

  if (loading) return <div>Loading image...</div>;
  if (error) return <div>{error}</div>;
  if (!image) return <div>Image not found</div>;

  return (
    <div>
      <img src={image.urls?.regular} alt={image.alt_description} style={{ maxWidth: '100%' }} />
      <h2>{image.description || image.alt_description}</h2>
      <p>By: {image.user?.name}</p>
      <div>
        {image.tags && image.tags.map((tag: any) => (
          <span key={tag.title} style={{ marginRight: 8 }}>#{tag.title}</span>
        ))}
      </div>
      <CommentSection imageId={id!} />
    </div>
  );
};

export default ImageDetailPage; 