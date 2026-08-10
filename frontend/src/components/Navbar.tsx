import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-icon">🖼️</span>
        <span className="navbar-title">The Interactive Gallery</span>
      </Link>
    </nav>
  );
};

export default Navbar;
