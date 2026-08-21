import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Gallery from '../components/Gallery';
import FilterBar from '../components/FilterBar';
import { fetchImages, searchImages, fetchTopics } from '../services/unsplashService';
import type { SearchFilters } from '../services/unsplashService';

const PER_PAGE = 12;

const GalleryPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const [images, setImages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [topics, setTopics] = useState<any[]>([]);

  // Fetch trending topics for homepage
  useEffect(() => {
    if (!query) {
      fetchTopics(8)
        .then(setTopics)
        .catch(() => setTopics([]));
    }
  }, [query]);

  const loadImages = useCallback(async (pageNum: number, append: boolean) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      if (query) {
        const data = await searchImages(query, pageNum, PER_PAGE, filters);
        setImages(prev => append ? [...prev, ...data.results] : data.results);
        setHasMore(pageNum < data.total_pages);
        setTotalResults(data.total);
      } else {
        const data = await fetchImages(pageNum, PER_PAGE);
        setImages(prev => append ? [...prev, ...data] : data);
        setHasMore(data.length === PER_PAGE);
        setTotalResults(undefined);
      }
    } catch {
      setError('Failed to load images');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, filters]);

  // Reset and reload when query or filters change
  useEffect(() => {
    setPage(1);
    setImages([]);
    setHasMore(true);
    setTotalResults(undefined);
    loadImages(1, false);
  }, [loadImages]);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    loadImages(next, true);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
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

          {/* Trending Topics */}
          {topics.length > 0 && (
            <div className="trending-chips">
              {topics.map(topic => (
                <a
                  key={topic.id}
                  href={`/?q=${encodeURIComponent(topic.title)}`}
                  className="trending-chip"
                >
                  {topic.title}
                </a>
              ))}
            </div>
          )}
        </header>
      )}

      {query && (
        <h2 className="page-title">
          Results for <span>&ldquo;{query}&rdquo;</span>
        </h2>
      )}

      {/* Filter Bar - shown when searching */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        totalResults={totalResults}
        showFilters={!!query}
      />

      {images.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#128247;</div>
          <h2>No images found</h2>
          <p>Try a different search term or adjust your filters.</p>
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
