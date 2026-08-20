import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchImageDetails } from '../services/unsplashService';
import CommentSection from '../components/CommentSection';
import Lightbox from '../components/Lightbox';

const ImageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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

  if (error) return <div className="error-message">{error}</div>;

  if (loading) {
    return (
      <div className="detail-page">
        <Link to="/" className="detail-back-btn">&larr; Back to Gallery</Link>
        <div className="detail-layout">
          <div className="skeleton skeleton-detail-image" />
          <div>
            <div className="skeleton skeleton-detail-title" />
            <div className="skeleton skeleton-detail-text" />
          </div>
        </div>
      </div>
    );
  }

  if (!image) return <div className="error-message">Image not found</div>;

  return (
    <div className="detail-page fade-in">
      <Link to="/" className="detail-back-btn">&larr; Back to Gallery</Link>

      <div className="detail-layout">
        <div className="detail-image-wrapper">
          <img
            className="detail-image-clickable"
            src={image.urls?.regular}
            alt={image.alt_description || image.description || 'Image'}
            onClick={() => setLightboxOpen(true)}
            title="Click to view full size"
          />
        </div>

        <div className="detail-sidebar">
          <p className="detail-eyebrow">Exhibition</p>
          <h1 className="detail-title">
            {image.description || image.alt_description || 'Untitled'}
          </h1>
          <p className="detail-author">
            Photograph by <strong>{image.user?.name || 'Unknown'}</strong>
          </p>

          {image.tags && image.tags.length > 0 && (
            <div className="detail-tags">
              {image.tags.map((tag: any) => (
                <span key={tag.title} className="detail-tag">#{tag.title}</span>
              ))}
            </div>
          )}

          <CommentSection imageId={id!} />
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox
          src={image.urls?.full || image.urls?.regular}
          alt={image.alt_description || image.description || 'Image'}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
};

export default ImageDetailPage;
