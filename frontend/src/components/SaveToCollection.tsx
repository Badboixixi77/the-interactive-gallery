import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import {
  fetchCollections,
  createCollection,
  addImageToCollection,
  removeImageFromCollection,
  Collection,
} from '../services/apiService';

interface SaveToCollectionProps {
  imageId: string;
  imageUrl: string;
  imageAlt?: string;
  authorName?: string;
}

const SaveToCollection: React.FC<SaveToCollectionProps> = ({
  imageId,
  imageUrl,
  imageAlt,
  authorName,
}) => {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [contains, setContains] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await fetchCollections(imageId);
      setCollections(data.collections);
      setContains(new Set(data.contains));
    } catch {
      // token may be stale — ignore silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && isAuthenticated) {
      loadCollections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isAuthenticated]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2500);
  };

  const handleToggleClick = () => {
    if (!isAuthenticated) {
      setAuthMode('login');
      return;
    }
    setOpen(prev => !prev);
  };

  const handleCollectionClick = async (col: Collection) => {
    try {
      if (contains.has(col.id)) {
        await removeImageFromCollection(col.id, imageId);
        setContains(prev => {
          const next = new Set(prev);
          next.delete(col.id);
          return next;
        });
        setCollections(prev =>
          prev.map(c => (c.id === col.id ? { ...c, image_count: Math.max(0, c.image_count - 1) } : c))
        );
        showMessage(`Removed from "${col.name}"`);
      } else {
        await addImageToCollection(col.id, {
          image_id: imageId,
          image_url: imageUrl,
          image_alt: imageAlt,
          author_name: authorName,
        });
        setContains(prev => new Set(prev).add(col.id));
        setCollections(prev =>
          prev.map(c => (c.id === col.id ? { ...c, image_count: c.image_count + 1 } : c))
        );
        showMessage(`Saved to "${col.name}"`);
      }
    } catch (err: any) {
      showMessage(err?.response?.data?.error || 'Something went wrong.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { collection } = await createCollection(newName.trim());
      await addImageToCollection(collection.id, {
        image_id: imageId,
        image_url: imageUrl,
        image_alt: imageAlt,
        author_name: authorName,
      });
      setCollections(prev => [{ ...collection, image_count: 1 }, ...prev]);
      setContains(prev => new Set(prev).add(collection.id));
      setNewName('');
      showMessage(`Saved to "${collection.name}"`);
    } catch (err: any) {
      showMessage(err?.response?.data?.error || 'Failed to create collection.');
    } finally {
      setCreating(false);
    }
  };

  const savedCount = contains.size;

  return (
    <div className="save-collection-wrapper" ref={dropdownRef}>
      <button
        className={`save-collection-btn ${savedCount > 0 ? 'save-collection-active' : ''}`}
        onClick={handleToggleClick}
        title={isAuthenticated ? 'Save to collection' : 'Sign in to save'}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill={savedCount > 0 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        {savedCount > 0 ? `Saved (${savedCount})` : 'Save'}
      </button>

      {open && isAuthenticated && (
        <div className="save-collection-dropdown">
          <div className="save-collection-header">
            <span>Save to collection</span>
          </div>

          <div className="save-collection-list">
            {loading ? (
              <div className="save-collection-empty">Loading…</div>
            ) : collections.length === 0 ? (
              <div className="save-collection-empty">No collections yet — create one below.</div>
            ) : (
              collections.map(col => (
                <button
                  key={col.id}
                  className="save-collection-item"
                  onClick={() => handleCollectionClick(col)}
                >
                  <span className={`save-collection-check ${contains.has(col.id) ? 'checked' : ''}`}>
                    {contains.has(col.id) && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span className="save-collection-name">{col.name}</span>
                  <span className="save-collection-count">{col.image_count}</span>
                </button>
              ))
            )}
          </div>

          <form className="save-collection-create" onSubmit={handleCreate}>
            <input
              type="text"
              placeholder="New collection name…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              maxLength={100}
            />
            <button type="submit" disabled={creating || !newName.trim()}>
              {creating ? '…' : 'Create'}
            </button>
          </form>

          {message && <div className="save-collection-message">{message}</div>}
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
};

export default SaveToCollection;
