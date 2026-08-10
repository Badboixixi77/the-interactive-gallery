import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';

const Navbar: React.FC = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { count } = useFavorites();

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = query.trim();
      navigate(trimmed ? `/?q=${encodeURIComponent(trimmed)}` : '/');
    },
    [query, navigate]
  );

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
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
      <Link to="/favorites" className="navbar-favorites">
        ♥ Favorites
        {count > 0 && <span className="fav-badge">{count}</span>}
      </Link>
    </nav>
  );
};

export default Navbar;
