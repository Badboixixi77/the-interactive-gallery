import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';

const Navbar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { count } = useFavorites();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : '/');
      setMenuOpen(false);
    },
    [query, navigate]
  );

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand" onClick={closeMenu}>
        <span className="navbar-icon">🖼️</span>
        <span className="navbar-title">The Interactive Gallery</span>
      </Link>

      <form className="navbar-search" onSubmit={handleSubmit}>
        <input
          type="text"
          className="navbar-search-input"
          placeholder="Search photos..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </form>

      <Link to="/favorites" className="navbar-favorites" onClick={closeMenu}>
        ♥ Favorites
        {count > 0 && <span className="fav-badge">{count}</span>}
      </Link>

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
            ♥ Favorites {count > 0 && <span className="fav-badge">{count}</span>}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
