import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Gallery from '../components/Gallery';
import AuthModal from '../components/AuthModal';
import { fetchMultipleImages } from '../services/unsplashService';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchCollections,
  fetchCollection,
  deleteCollection,
  removeImageFromCollection,
  Collection,
  CollectionImage,
} from '../services/apiService';

type Tab = 'favorites' | 'collections';

const FavoritesPage: React.FC = () => {
  const { favorites } = useFavorites();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>('favorites');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);

  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const [activeCollection, setActiveCollection] = useState<Collection | null>(null);
  const [collectionImages, setCollectionImages] = useState<CollectionImage[]>([]);

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

  useEffect(() => {
    if (tab === 'collections' && isAuthenticated) {
      setCollectionsLoading(true);
      fetchCollections()
        .then(data => setCollections(data.collections))
        .catch(() => setCollections([]))
        .finally(() => setCollectionsLoading(false));
    }
  }, [tab, isAuthenticated]);

  const openCollection = async (col: Collection) => {
    try {
      const data = await fetchCollection(col.id);
      setActiveCollection(data.collection);
      setCollectionImages(data.images);
    } catch {
      // ignore
    }
  };

  const handleDeleteCollection = async (col: Collection) => {
    if (!window.confirm(`Delete collection "${col.name}"?`)) return;
    try {
      await deleteCollection(col.id);
      setCollections(prev => prev.filter(c => c.id !== col.id));
      if (activeCollection?.id === col.id) {
        setActiveCollection(null);
        setCollectionImages([]);
      }
    } catch {
      // ignore
    }
  };

  const handleRemoveImage = async (img: CollectionImage) => {
    if (!activeCollection) return;
    try {
      await removeImageFromCollection(activeCollection.id, img.image_id);
      setCollectionImages(prev => prev.filter(i => i.id !== img.id));
      setActiveCollection(prev =>
        prev ? { ...prev, image_count: Math.max(0, prev.image_count - 1) } : prev
      );
      setCollections(prev =>
        prev.map(c =>
          c.id === activeCollection.id
            ? { ...c, image_count: Math.max(0, c.image_count - 1) }
            : c
        )
      );
    } catch {
      // ignore
    }
  };

  // ===== Collections tab =====
  if (tab === 'collections') {
    return (
      <div className="fade-in">
        <div className="fav-tabs">
          <button className={`fav-tab`} onClick={() => setTab('favorites')}>
            Favorites {favorites.length > 0 && <span className="fav-badge">{favorites.length}</span>}
          </button>
          <button className="fav-tab fav-tab-active">Collections</button>
        </div>

        {!isAuthenticated ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#9881;</div>
            <h2>Collections live in your account</h2>
            <p>Sign in to group your favorite photographs into personal collections.</p>
            <button className="download-btn fav-signin-btn" onClick={() => setAuthMode('login')}>
              Sign In
            </button>
          </div>
        ) : activeCollection ? (
          <div>
            <button
              className="detail-back-btn"
              onClick={() => { setActiveCollection(null); setCollectionImages([]); }}
            >
              &larr; All collections
            </button>
            <h2 className="page-title">
              {activeCollection.name} <span>({collectionImages.length})</span>
            </h2>
            {collectionImages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">&#128444;</div>
                <h2>This collection is empty</h2>
                <p>Open any photograph and use the Save button to add it here.</p>
              </div>
            ) : (
              <div className="collection-grid">
                {collectionImages.map(img => (
                  <div key={img.id} className="collection-item">
                    <Link to={`/image/${img.image_id}`}>
                      <img
                        className="collection-item-img"
                        src={img.image_url}
                        alt={img.image_alt || 'Collection image'}
                        loading="lazy"
                      />
                    </Link>
                    <div className="collection-item-bar">
                      <span className="collection-item-author">{img.author_name || 'Unknown'}</span>
                      <button
                        className="collection-remove-btn"
                        onClick={() => handleRemoveImage(img)}
                        title="Remove from collection"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : collectionsLoading ? (
          <div className="skeleton-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton skeleton-card" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#128444;</div>
            <h2>No collections yet</h2>
            <p>Open any photograph and use the Save button to create your first collection.</p>
          </div>
        ) : (
          <div className="collections-list">
            {collections.map(col => (
              <div key={col.id} className="collection-card">
                <button className="collection-card-open" onClick={() => openCollection(col)}>
                  <span className="collection-card-name">{col.name}</span>
                  <span className="collection-card-meta">
                    {col.image_count} {col.image_count === 1 ? 'image' : 'images'}
                  </span>
                </button>
                <button
                  className="collection-card-delete"
                  onClick={() => handleDeleteCollection(col)}
                  title="Delete collection"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        {authMode && (
          <AuthModal
            mode={authMode}
            onClose={() => setAuthMode(null)}
            onSwitchMode={setAuthMode}
          />
        )}
      </div>
    );
  }

  // ===== Favorites tab =====
  if (loading) {
    return (
      <div className="skeleton-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton skeleton-card" />
        ))}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div className="fav-tabs">
        <button className="fav-tab fav-tab-active">
          Favorites {favorites.length > 0 && <span className="fav-badge">{favorites.length}</span>}
        </button>
        <button className="fav-tab" onClick={() => setTab('collections')}>
          Collections
        </button>
      </div>

      {images.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">&#9825;</div>
          <h2>No saved works</h2>
          <p>Select the heart on any photograph to begin your personal collection.</p>
        </div>
      ) : (
        <div>
          <h2 className="page-title">
            Your Collection <span>({images.length})</span>
          </h2>
          <Gallery images={images} />
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
