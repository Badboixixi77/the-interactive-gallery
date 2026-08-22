import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useAuth } from '../contexts/AuthContext';
import { fetchSuggestions } from '../services/unsplashService';
import AuthModal from './AuthModal';

const Navbar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [authMode, setAuthMode] = useState<'login' | 'register' | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const navigate = useNavigate();
  const { count } = useFavorites();
  const { history, addToHistory, clearHistory } = useSearchHistory();
  const { user, isAuthenticated, logout } = useAuth();

  // Keyboard shortcut: press "/" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to close dropdown
      if (e.key === 'Escape') {
        setShowDropdown(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced suggestions fetch
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const results = await fetchSuggestions(query.trim());
      setSuggestions(results.filter(s => s.toLowerCase() !== query.trim().toLowerCase()));
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = query.trim();
      if (trimmed) {
        addToHistory(trimmed);
        navigate(`/?q=${encodeURIComponent(trimmed)}`);
      } else {
        navigate('/');
      }
      setShowDropdown(false);
      setMenuOpen(false);
      setActiveIndex(-1);
    },
    [query, navigate, addToHistory]
  );

  const handleSuggestionClick = (term: string) => {
    setQuery(term);
    addToHistory(term);
    navigate(`/?q=${encodeURIComponent(term)}`);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = query.trim() ? suggestions : history;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSuggestionClick(items[activeIndex]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const handleBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => setShowDropdown(false), 200);
  };

  const closeMenu = () => setMenuOpen(false);

  const dropdownItems = query.trim() ? suggestions : history;
  const isShowingHistory = !query.trim() && history.length > 0;

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <span className="navbar-mark">IG</span>
        <span>
          <span className="navbar-title">The Interactive Gallery</span>
          <span className="navbar-tagline">Fine Photography</span>
        </span>
      </Link>

      <div className="navbar-search">
        <form className="navbar-search-form" onSubmit={handleSubmit}>
          <div className="search-input-wrapper">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="navbar-search-input"
              placeholder="Search photos... ( / )"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setShowDropdown(true);
                setActiveIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                aria-label="Clear search"
              >
                &times;
              </button>
            )}
          </div>
        </form>

        {/* Autocomplete / History Dropdown */}
        {showDropdown && dropdownItems.length > 0 && (
          <div className="search-dropdown">
            {isShowingHistory && (
              <div className="search-dropdown-header">
                <span>Recent Searches</span>
                <button className="search-dropdown-clear" onClick={clearHistory}>Clear</button>
              </div>
            )}
            {!isShowingHistory && suggestions.length > 0 && (
              <div className="search-dropdown-header">
                <span>Suggestions</span>
              </div>
            )}
            {dropdownItems.map((item, index) => (
              <button
                key={item}
                className={`search-dropdown-item ${index === activeIndex ? 'search-dropdown-active' : ''}`}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSuggestionClick(item);
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {isShowingHistory ? (
                    <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>
                  ) : (
                    <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>
                  )}
                </svg>
                {item}
              </button>
            ))}
          </div>
        )}
      </div>

      <Link to="/favorites" className="navbar-favorites" onClick={closeMenu}>
        Favorites
        {count > 0 && <span className="fav-badge">{count}</span>}
      </Link>

      {/* Auth: user menu or sign in */}
      {isAuthenticated && user ? (
        <div className="user-menu">
          <button
            className="user-menu-btn"
            onClick={() => setUserMenuOpen(prev => !prev)}
            title={user.username}
          >
            <span className="user-avatar">{user.username.charAt(0).toUpperCase()}</span>
          </button>
          {userMenuOpen && (
            <div className="user-menu-dropdown">
              <div className="user-menu-info">
                <span className="user-menu-name">{user.username}</span>
                <span className="user-menu-email">{user.email}</span>
              </div>
              <button
                className="user-menu-item"
                onClick={() => {
                  logout();
                  setUserMenuOpen(false);
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <button className="signin-btn" onClick={() => setAuthMode('login')}>
          Sign In
        </button>
      )}

      <button
        className={`hamburger-btn ${menuOpen ? 'hamburger-active' : ''}`}
        onClick={() => setMenuOpen(prev => !prev)}
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

      {menuOpen && (
        <div className="mobile-menu">
          <form className="mobile-menu-search" onSubmit={handleSubmit}>
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search photos..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
          </form>
          <Link to="/favorites" className="mobile-menu-fav" onClick={closeMenu}>
            Favorites {count > 0 && <span className="fav-badge">{count}</span>}
          </Link>
          {!isAuthenticated && (
            <button
              className="mobile-menu-fav"
              onClick={() => { setAuthMode('login'); closeMenu(); }}
            >
              Sign In
            </button>
          )}
        </div>
      )}

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSwitchMode={setAuthMode}
        />
      )}
    </nav>
  );
};

export default Navbar;
