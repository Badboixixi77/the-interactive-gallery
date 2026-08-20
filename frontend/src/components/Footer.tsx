import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p className="footer-brand">The Interactive Gallery</p>
      <div className="footer-divider" />
      <p>© {new Date().getFullYear()} All rights reserved.</p>
      <p className="footer-attr">
        Imagery courtesy of{' '}
        <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">
          Unsplash
        </a>
      </p>
    </footer>
  );
};

export default Footer;
