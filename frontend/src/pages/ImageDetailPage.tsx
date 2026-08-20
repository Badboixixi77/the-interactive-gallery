import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchImageDetails } from '../services/unsplashService';
import CommentSection from '../components/CommentSection';
import Lightbox from '../components/Lightbox';
import ShareButtons from '../components/ShareButtons';
import { extractPalette } from '../utils/colorExtractor';

const ImageDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [palette, setPalette] = useState<string[]>([]);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        if (id) {
          const data = await fetchImageDetails(id);
          setImage(data);
          // Extract color palette from the image
          if (data.urls?.small) {
            extractPalette(data.urls.small).then(setPalette);
          }
        }
      } catch (err) {
        setError('Failed to load image details');
      } finally {
        setLoading(false);
      }
    };
    loadImage();
  }, [id]);

  const handleDownload = async () => {
    if (!image?.urls?.full) return;
    try {
      setDownloaded(true);
      const response = await fetch(image.urls.full);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.id || 'image'}-unsplash.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setTimeout(() => setDownloaded(false), 2000);
    } catch {
      window.open(image.urls.full, '_blank');
      setTimeout(() => setDownloaded(false), 2000);
    }
  };

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
            Photograph by{' '}
            <a href={image.user?.links?.html + '?utm_source=the-interactive-gallery&utm_medium=referral'} target="_blank" rel="noopener noreferrer">
              <strong>{image.user?.name || 'Unknown'}</strong>
            </a>{' '}
            on{' '}
            <a href="https://unsplash.com/?utm_source=the-interactive-gallery&utm_medium=referral" target="_blank" rel="noopener noreferrer">Unsplash</a>
          </p>

          {image.tags && image.tags.length > 0 && (
            <div className="detail-tags">
              {image.tags.map((tag: any) => (
                <span key={tag.title} className="detail-tag">#{tag.title}</span>
              ))}
            </div>
          )}

          {/* Color Palette */}
          {palette.length > 0 && (
            <div className="color-palette">
              <span className="color-palette-label">Palette</span>
              <div className="color-palette-swatches">
                {palette.map((color) => (
                  <div key={color} className="color-swatch" style={{ background: color }} title={color} />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="detail-actions">
            <button className="download-btn" onClick={handleDownload}>
              {downloaded ? (
                <><span className="download-icon">✓</span> Downloaded</>
              ) : (
                <><span className="download-icon">↓</span> Download HD</>
              )}
            </button>
            <ShareButtons
              imageUrl={image.urls?.regular || ''}
              imageTitle={image.description || image.alt_description || 'Gallery Image'}
              pageUrl={window.location.href}
            />
          </div>

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
