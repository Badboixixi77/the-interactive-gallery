import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Gallery from '../components/Gallery';
import { fetchImages, searchImages } from '../services/unsplashService';

const PER_PAGE = 12;

const GalleryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async (pageNum: number, append: boolean) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      if (query) {
        const data = await searchImages(query, pageNum, PER_PAGE);
        setImages(prev => append ? [...prev, ...data.results] : data.results);
        setHasMore(pageNum < data.total_pages);
      } else {
        const data = await fetchImages(pageNum, PER_PAGE);
        setImages(prev => append ? [...prev, ...data] : data);
        setHasMore(data.length === PER_PAGE);
      }
    } catch {
      setError('Failed to load images');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query]);

  useEffect(() => {
    setPage(1);
    setImages([]);
    setHasMore(true);
    loadImages(1, false);
  }, [loadImages]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadImages(next, true);
  };

  if (error) return <div className="error-message">{error}</div>;

  if (loading) {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="fade-in">
      {!query && (
        <header className="gallery-hero">
          <p className="gallery-hero-eyebrow">Curated Photography</p>
          <h1 className="gallery-hero-title">The Interactive Gallery</h1>
          <p className="gallery-hero-subtitle">
            Discover exceptional imagery from the world&apos;s finest photographers
          </p>
        </header>
      )}
      {query && (
        <h2 className="page-title">
          Results for <span>&ldquo;{query}&rdquo;</span>
        </h2>
      )}
      {images.length === 0 ? (
        <div className="empty-state">
          <h2>No images found</h2>
          <p>Try a different search term.</p>
        </div>
      ) : (
        <>
          <Gallery images={images} />
          {hasMore && (
            <div className="load-more-wrapper">
              <button className="load-more-btn" onClick={handleLoadMore} disabled={loadingMore}>
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GalleryPage;
