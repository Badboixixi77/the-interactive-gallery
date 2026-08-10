import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} The Interactive Gallery. All rights reserved.</p>
      <p className="footer-attr">
        Powered by <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>
      </p>
    </footer>
  );
};

export default Footer;
